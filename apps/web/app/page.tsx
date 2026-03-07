"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { matchService } from "@/lib/match-service";
import type { Match } from "@/lib/match-service";
import { Plus, Trophy, Calendar, TrendingUp, ChevronRight, Star } from "lucide-react";
import { MonthlyPerformanceChart } from "@/components/MonthlyPerformanceChart";
import { getRatingColor, getRatingGlow } from "@/lib/rating-utils";

function getResultBadge(result: string): { label: string; classes: string } {
  switch (result) {
    case "Victoria":
      return {
        label: "Victoria",
        classes: "bg-green-500/15 text-green-400 border border-green-500/25",
      };
    case "Derrota":
      return {
        label: "Derrota",
        classes: "bg-red-500/15 text-red-400 border border-red-500/25",
      };
    case "Empate":
      return {
        label: "Empate",
        classes: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
      };
    default:
      return {
        label: result,
        classes: "bg-muted text-muted-foreground border border-border",
      };
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-background pb-28 sm:pb-0">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllMatches, setShowAllMatches] = useState(false);

  // Redirect unauthenticated users to the landing page
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/landing");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    async function loadMatches() {
      try {
        const loadedMatches = await matchService.getAllMatches();
        setMatches(loadedMatches);
      } catch (error) {
        console.error("Error loading matches:", error);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [isSignedIn]);

  if (!isLoaded || !isSignedIn || loading) return <LoadingSkeleton />;

  const last5Matches = showAllMatches ? matches : matches.slice(0, 5);
  const hasMoreMatches = matches.length > 5;
  const userName =
    isLoaded && user ? user.firstName || user.username || "Usuario" : "Usuario";

  // Stats
  const victories = matches.filter((m) => m.result === "Victoria").length;
  const avgRatingNum =
    matches.length > 0
      ? matches.reduce((sum, m) => sum + m.rating, 0) / matches.length
      : 0;
  const avgRating = matches.length > 0 ? avgRatingNum.toFixed(1) : "—";

  return (
    <main className="min-h-screen bg-background pb-28 sm:pb-0">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase mb-1">
              Bienvenido de vuelta
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {userName}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/match/create" className="hidden sm:block">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-1.5" />
                Nuevo partido
              </Button>
            </Link>
            {isLoaded && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>

        {/* Stats Strip */}
        {matches.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Trophy className="h-4 w-4 text-yellow-400 mx-auto mb-1.5" />
              <p className="text-xl font-bold text-foreground">{victories}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Victorias</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Calendar className="h-4 w-4 text-blue-400 mx-auto mb-1.5" />
              <p className="text-xl font-bold text-foreground">
                {matches.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Partidos</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <TrendingUp className="h-4 w-4 text-green-400 mx-auto mb-1.5" />
              <p className="text-xl font-bold text-foreground">{avgRating}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Promedio</p>
            </div>
          </div>
        )}

        {/* Monthly performance chart */}
        {matches.length >= 1 && (
          <section className="mb-8">
            <MonthlyPerformanceChart
              matches={matches}
              overallAvg={avgRatingNum}
            />
          </section>
        )}

        {/* Matches Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Últimos partidos
            </h2>
            {matches.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {matches.length} total
              </span>
            )}
          </div>

          {last5Matches.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aún no hay partidos
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Crea tu primer partido y empieza a calificar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {last5Matches.map((match) => {
                const resultBadge = getResultBadge(match.result);
                const ratingGlow = getRatingGlow(match.rating);
                const allPlayers = [
                  ...match.team1.players,
                  ...match.team2.players,
                ];
                const maxRating = allPlayers.length > 0
                  ? Math.max(...allPlayers.map((p) => p.rating))
                  : -1;
                const isMvp = allPlayers.length > 0 && match.rating === maxRating;
                return (
                  <Link
                    key={match.id}
                    href={`/match/${match.id}`}
                    className="block group"
                  >
                    <div className="bg-card border border-border rounded-xl px-4 py-4 flex items-center gap-4 transition-all duration-200 hover:border-border hover:bg-muted/50 hover:scale-[1.01] active:scale-[0.99]">
                      {/* Rating badge */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getRatingColor(match.rating)} shadow-lg ${ratingGlow}`}
                      >
                        <span className="text-white font-bold text-sm">
                          {match.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Match info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate leading-tight">
                          {match.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${resultBadge.classes}`}
                          >
                            {resultBadge.label}
                          </span>
                          {isMvp && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400" />
                              MVP
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(match.date)}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {hasMoreMatches && (
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setShowAllMatches(!showAllMatches)}
              >
                {showAllMatches ? "Ver menos" : "Ver más partidos"}
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile FAB */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:hidden">
        <div className="max-w-2xl mx-auto">
          <Link href="/match/create">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nuevo partido
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
