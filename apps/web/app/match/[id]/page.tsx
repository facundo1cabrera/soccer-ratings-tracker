"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { matchService } from "@/lib/match-service";
import type { Match } from "@/lib/match-service";
import { getMatchReveal } from "@/lib/api-client";
import type { RevealResult } from "@/lib/api-client";
import { IndividualRatingViewer } from "@/components/IndividualRatingViewer";
import { ArrowLeft, Copy, Check, Share2, ChevronRight } from "lucide-react";
import { getRatingColor, getRatingTextColor } from "@/lib/rating-utils";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getResultInfo(result: string): {
  label: string;
  color: string;
  bg: string;
} {
  switch (result) {
    case "Victoria":
      return {
        label: "Victoria",
        color: "text-green-400",
        bg: "bg-green-500/10 border border-green-500/20",
      };
    case "Derrota":
      return {
        label: "Derrota",
        color: "text-red-400",
        bg: "bg-red-500/10 border border-red-500/20",
      };
    case "Empate":
      return {
        label: "Empate",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10 border border-yellow-500/20",
      };
    default:
      return {
        label: result,
        color: "text-muted-foreground",
        bg: "bg-muted border border-border",
      };
  }
}

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchId, setMatchId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [initialReveal, setInitialReveal] = useState<RevealResult | null>(null);

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
        const [loadedMatch, myPlayerRes] = await Promise.all([
          matchService.getMatchById(currentMatchId),
          fetch(`/api/matches/${currentMatchId}/my-player`).then((r) => r.json()),
        ]);
        if (!loadedMatch) {
          router.push("/");
          return;
        }
        setMatch(loadedMatch);

        const playerId: string | null = myPlayerRes.playerId ?? null;
        setMyPlayerId(playerId);

        if (playerId) {
          const revealRes = await getMatchReveal(currentMatchId, playerId);
          if (revealRes.success) {
            setInitialReveal(revealRes.data.reveal);
          }
        }
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, [matchId, router]);

  if (loading || !match) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-4 mt-16">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="h-48 bg-muted rounded-xl animate-pulse" />
              <div className="h-48 bg-muted rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const allPlayerIds = new Set<string>();
  match.team1.players.forEach((p) => allPlayerIds.add(String(p.id)));
  match.team2.players.forEach((p) => allPlayerIds.add(String(p.id)));
  const playersWhoSubmittedRatings = new Set(match.playersWhoSubmittedRatings);
  const allPlayersCompleted =
    allPlayerIds.size > 0 &&
    Array.from(allPlayerIds).every((id) => playersWhoSubmittedRatings.has(id));

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/match/${match.id}/join`
      : "";

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  const resultInfo = getResultInfo(match.result);
  const winnerGoals = Math.max(match.team1.goals, match.team2.goals);
  const loserGoals = Math.min(match.team1.goals, match.team2.goals);
  const team1Won = match.team1.goals > match.team2.goals;
  const team2Won = match.team2.goals > match.team1.goals;

  return (
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

        {/* Match Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {match.name}
            </h1>
            <span
              className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${resultInfo.bg} ${resultInfo.color}`}
            >
              {resultInfo.label}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            {formatDate(match.date)}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-center gap-8">
            <div className={`text-center ${team1Won ? "" : "opacity-60"}`}>
              <p className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-2">
                Local
              </p>
              <p
                className={`text-5xl font-black tabular-nums ${team1Won ? "text-foreground" : "text-muted-foreground"}`}
              >
                {match.team1.goals}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">vs</p>
              <p className="text-2xl font-bold text-muted-foreground">—</p>
            </div>
            <div className={`text-center ${team2Won ? "" : "opacity-60"}`}>
              <p className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-2">
                Visitante
              </p>
              <p
                className={`text-5xl font-black tabular-nums ${team2Won ? "text-foreground" : "text-muted-foreground"}`}
              >
                {match.team2.goals}
              </p>
            </div>
          </div>
        </div>

        {/* Share Link */}
        {!allPlayersCompleted && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Calificaciones pendientes
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comparte el enlace para que los jugadores califiquen
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="shrink-0 gap-2 border-primary/30 hover:border-primary/60"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" /> Copiado
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" /> Compartir
                </>
              )}
            </Button>
          </div>
        )}

        {/* Teams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Team 1 */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="font-semibold text-foreground">Local</h2>
              <span className="ml-auto text-lg font-bold text-blue-400">
                {match.team1.goals}
              </span>
            </div>
            <div className="p-4">
              {match.team1.players.length > 0 ? (
                <div className="space-y-1">
                  {match.team1.players.map((player) => (
                    <button
                      key={player.id}
                      className="flex items-center gap-3 w-full text-left rounded-lg px-1 py-1.5 hover:bg-muted/50 transition-colors group"
                      onClick={() => router.push(`/player/${player.id}`)}
                    >
                      <Avatar className="h-9 w-9 shrink-0 text-xs">
                        {player.profileImage && (
                          <AvatarImage
                            src={player.profileImage}
                            alt={player.name}
                          />
                        )}
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm font-medium text-foreground truncate">
                        {player.name}
                      </span>
                      <span
                        className={`text-sm font-bold px-2 py-0.5 rounded-lg shrink-0 text-white ${getRatingColor(player.rating)}`}
                      >
                        {player.rating.toFixed(1)}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin jugadores
                </p>
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <h2 className="font-semibold text-foreground">Visitante</h2>
              <span className="ml-auto text-lg font-bold text-purple-400">
                {match.team2.goals}
              </span>
            </div>
            <div className="p-4">
              {match.team2.players.length > 0 ? (
                <div className="space-y-1">
                  {match.team2.players.map((player) => (
                    <button
                      key={player.id}
                      className="flex items-center gap-3 w-full text-left rounded-lg px-1 py-1.5 hover:bg-muted/50 transition-colors group"
                      onClick={() => router.push(`/player/${player.id}`)}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        {player.profileImage && (
                          <AvatarImage
                            src={player.profileImage}
                            alt={player.name}
                          />
                        )}
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm font-medium text-foreground truncate">
                        {player.name}
                      </span>
                      <span
                        className={`text-sm font-bold px-2 py-0.5 rounded-lg shrink-0 text-white ${getRatingColor(player.rating)}`}
                      >
                        {player.rating.toFixed(1)}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin jugadores
                </p>
              )}
            </div>
          </div>
        </div>

        {myPlayerId && (
          <IndividualRatingViewer
            match={match}
            myPlayerId={myPlayerId}
            initialReveal={initialReveal}
          />
        )}
      </div>

    </main>
  );
}
