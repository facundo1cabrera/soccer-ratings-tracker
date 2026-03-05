"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { matchService } from "@/lib/match-service";
import type { Match } from "@/lib/match-service";
import { ArrowLeft, Eye, LogIn, Star } from "lucide-react";

interface JoinMatchPageProps {
  params: Promise<{ id: string }>;
}

interface PlayerOption {
  id: number | string;
  name: string;
  team: "team1" | "team2";
}

export default function JoinMatchPage({ params }: JoinMatchPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchId, setMatchId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showLoginSheet, setShowLoginSheet] = useState(false);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id, 10);
      if (isNaN(id)) {
        router.push("/");
        return;
      }
      setMatchId(id);
    }
    loadParams();
  }, [params, router]);

  useEffect(() => {
    if (matchId === null) return;
    const currentMatchId = matchId;
    async function loadMatch() {
      try {
        const loadedMatch = await matchService.getMatchById(currentMatchId);
        if (!loadedMatch) {
          router.push("/");
          return;
        }
        setMatch(loadedMatch);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, [matchId, router]);

  useEffect(() => {
    if (isLoaded && !user && !loading && match) {
      setShowLoginSheet(true);
    }
  }, [isLoaded, user, loading, match]);

  const handleContinue = () => {
    if (selectedPlayerId && matchId) {
      router.push(`/match/${matchId}/rate?playerId=${selectedPlayerId}`);
    }
  };

  if (loading || !match) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-3 mt-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const playersWhoSubmittedRatings = new Set(
    match.playersWhoSubmittedRatings || [],
  );

  const team1Players: PlayerOption[] = match.team1.players
    .filter((p) => !playersWhoSubmittedRatings.has(String(p.id)))
    .map((p) => ({ id: p.id, name: p.name, team: "team1" as const }));

  const team2Players: PlayerOption[] = match.team2.players
    .filter((p) => !playersWhoSubmittedRatings.has(String(p.id)))
    .map((p) => ({ id: p.id, name: p.name, team: "team2" as const }));

  const allPlayers = [...team1Players, ...team2Players];

  const allTeam1Players = match.team1.players.map((p) => ({
    id: String(p.id),
    name: p.name,
    rating: p.rating,
  }));
  const allTeam2Players = match.team2.players.map((p) => ({
    id: String(p.id),
    name: p.name,
    rating: p.rating,
  }));
  const allRatedPlayers = [...allTeam1Players, ...allTeam2Players];
  const mvpPlayer = allRatedPlayers.reduce(
    (best, player) => (player.rating > best.rating ? player : best),
    allRatedPlayers[0] || { id: "", name: "", rating: 0 },
  );
  const isSelectedPlayerMVP = selectedPlayerId === mvpPlayer.id;

  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(pathname || "")}`;

  return (
    <>
      <main className="min-h-screen bg-background pb-10">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
          {/* Back */}
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {match.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Selecciona tu jugador para calificar el partido
            </p>
          </div>

          {allPlayers.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">
                Todos los jugadores ya calificaron este partido.
              </p>
              <Link href={`/match/${matchId}`} className="mt-4 inline-block">
                <Button variant="outline" className="mt-4">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver resultados
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Team sections */}
              {team1Players.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Local
                    </p>
                  </div>
                  <div className="space-y-2">
                    {team1Players.map((player) => {
                      const isSelected = selectedPlayerId === String(player.id);
                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => setSelectedPlayerId(String(player.id))}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                            isSelected
                              ? "border-blue-500/60 bg-blue-500/8 shadow-sm"
                              : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-foreground">
                              {player.name}
                            </p>
                            <div
                              className={`w-4 h-4 rounded-full border-2 transition-all ${
                                isSelected
                                  ? "bg-blue-500 border-blue-500 scale-110"
                                  : "border-border"
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {team2Players.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Visitante
                    </p>
                  </div>
                  <div className="space-y-2">
                    {team2Players.map((player) => {
                      const isSelected = selectedPlayerId === String(player.id);
                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => setSelectedPlayerId(String(player.id))}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                            isSelected
                              ? "border-purple-500/60 bg-purple-500/8 shadow-sm"
                              : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-foreground">
                              {player.name}
                            </p>
                            <div
                              className={`w-4 h-4 rounded-full border-2 transition-all ${
                                isSelected
                                  ? "bg-purple-500 border-purple-500 scale-110"
                                  : "border-border"
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                <Link href={`/match/${matchId}`}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver resultados
                  </Button>
                </Link>
                <div className="flex flex-col items-end gap-2">
                  {isSelectedPlayerMVP && selectedPlayerId && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/15 border border-yellow-500/30 rounded-full">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-400">
                        MVP del partido
                      </span>
                    </div>
                  )}
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    disabled={!selectedPlayerId}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 disabled:opacity-40"
                  >
                    Calificar partido
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Login Bottom Sheet */}
      <Sheet open={showLoginSheet} onOpenChange={setShowLoginSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl max-w-2xl mx-auto">
          <SheetHeader className="text-left">
            <SheetTitle className="text-lg">
              Inicia sesión para guardar
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Sin sesión, el partido no se guardará en tu historial personal.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="flex-col gap-2 mt-5">
            <Link href={signInUrl} className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => setShowLoginSheet(false)}
              className="w-full text-muted-foreground"
            >
              Continuar sin sesión
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
