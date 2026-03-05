"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save } from "lucide-react";
import { matchService } from "@/lib/match-service";
import type { Match } from "@/lib/match-service";

interface Player {
  id: string;
  name: string;
  rating: number;
  team: "team1" | "team2";
}

interface RateMatchPageProps {
  params: Promise<{ id: string }>;
}

function getRatingColor(rating: number): string {
  if (rating >= 9.0) return "bg-purple-500";
  if (rating >= 8.6) return "bg-blue-600";
  if (rating >= 8.1) return "bg-blue-400";
  if (rating >= 7.6) return "bg-green-600";
  if (rating >= 7.1) return "bg-green-400";
  if (rating >= 6.6) return "bg-yellow-500";
  if (rating >= 6.1) return "bg-orange-500";
  return "bg-red-500";
}

function getRatingLabel(rating: number): string {
  if (rating >= 9.0) return "Extraordinario";
  if (rating >= 8.6) return "Excelente";
  if (rating >= 8.1) return "Muy bueno";
  if (rating >= 7.6) return "Bueno";
  if (rating >= 7.1) return "Bien";
  if (rating >= 6.6) return "Regular";
  if (rating >= 6.1) return "Por debajo";
  return "Malo";
}

export default function RateMatchPage({ params }: RateMatchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchId, setMatchId] = useState<number | null>(null);
  const [ownerPlayerId, setOwnerPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id, 10);
      if (isNaN(id)) {
        router.push("/");
        return;
      }
      setMatchId(id);
      const playerId = searchParams.get("playerId");
      if (!playerId) {
        router.push(`/match/${id}/join`);
        return;
      }
      setOwnerPlayerId(playerId);
    }
    loadParams();
  }, [params, router, searchParams]);

  useEffect(() => {
    if (matchId === null || ownerPlayerId === null) return;
    const currentMatchId = matchId;
    const currentOwnerPlayerId = ownerPlayerId;
    async function loadMatch() {
      try {
        const loadedMatch = await matchService.getMatchById(currentMatchId);
        if (!loadedMatch) {
          router.push("/");
          return;
        }
        setMatch(loadedMatch);
        const allPlayers: Player[] = [
          ...loadedMatch.team1.players
            .filter((p) => String(p.id) !== currentOwnerPlayerId)
            .map((p) => ({
              id: String(p.id),
              name: p.name,
              rating: 5.0,
              team: "team1" as const,
            })),
          ...loadedMatch.team2.players
            .filter((p) => String(p.id) !== currentOwnerPlayerId)
            .map((p) => ({
              id: String(p.id),
              name: p.name,
              rating: 5.0,
              team: "team2" as const,
            })),
        ];
        setPlayers(allPlayers);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, [matchId, ownerPlayerId, router]);

  const updatePlayerRating = (playerId: string, rating: number) => {
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, rating } : p)));
  };

  const handleSave = async () => {
    if (!match || !matchId || !ownerPlayerId) return;
    setSaving(true);
    try {
      const playerRatings = players.map((p) => ({
        id: p.id,
        name: p.name,
        rating: p.rating,
        team: p.team,
        ownerPlayerId,
      }));
      const updatedMatch = await matchService.updateMatchRatings(
        matchId,
        playerRatings,
      );
      if (!updatedMatch) throw new Error("Failed to update match ratings");
      router.push(`/match/${matchId}`);
    } catch {
      router.push("/");
    }
  };

  if (loading || !match || !ownerPlayerId) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (players.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Link href={`/match/${matchId}/join`}>
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">
              No hay otros jugadores para calificar.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const team1Players = players.filter((p) => p.team === "team1");
  const team2Players = players.filter((p) => p.team === "team2");

  return (
    <main className="min-h-screen bg-background pb-28 sm:pb-10">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        {/* Back */}
        <Link href={`/match/${matchId}/join`}>
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
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {match.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Califica el rendimiento de cada jugador del 0 al 10
          </p>
        </div>

        {/* Players */}
        <div className="space-y-6 mb-8">
          {/* Team 1 */}
          {team1Players.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Local
                </p>
              </div>
              <div className="space-y-3">
                {team1Players.map((player) => (
                  <PlayerRatingCard
                    key={player.id}
                    player={player}
                    onRatingChange={updatePlayerRating}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Team 2 */}
          {team2Players.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Visitante
                </p>
              </div>
              <div className="space-y-3">
                {team2Players.map((player) => (
                  <PlayerRatingCard
                    key={player.id}
                    player={player}
                    onRatingChange={updatePlayerRating}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save – desktop */}
        <div className="hidden sm:block">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Guardando..." : "Guardar calificaciones"}
          </Button>
        </div>
      </div>

      {/* Save – mobile fixed */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border sm:hidden">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Guardando..." : "Guardar calificaciones"}
          </Button>
        </div>
      </div>
    </main>
  );
}

function PlayerRatingCard({
  player,
  onRatingChange,
}: {
  player: Player;
  onRatingChange: (id: string, rating: number) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 transition-all duration-150 hover:border-border/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-foreground">{player.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {player.team === "team1" ? "Local" : "Visitante"}
          </p>
        </div>
        <div className="text-right">
          <div
            className={`inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-xl text-white font-bold text-xl tabular-nums shadow-sm ${getRatingColor(player.rating)}`}
          >
            {player.rating.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {getRatingLabel(player.rating)}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Slider
          value={[player.rating]}
          min={0}
          max={10}
          step={0.1}
          onValueChange={(value) => onRatingChange(player.id, value[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}
