"use client";

import { useState } from "react";
import { revealRating } from "@/lib/api-client";
import type { RevealResult } from "@/lib/api-client";
import type { Match } from "@/lib/match-schemas";
import { getRatingColor } from "@/lib/rating-utils";

interface Props {
  match: Match;
  myPlayerId: string;
  initialReveal: RevealResult | null;
}

export function IndividualRatingViewer({ match, myPlayerId, initialReveal }: Props) {
  const [reveal, setReveal] = useState<RevealResult | null>(initialReveal);
  const [loading, setLoading] = useState(false);

  const submittedSet = new Set(match.playersWhoSubmittedRatings);
  const otherPlayers = [
    ...match.team1.players,
    ...match.team2.players,
  ].filter(
    (p) => String(p.id) !== myPlayerId && submittedSet.has(String(p.id))
  );

  if (otherPlayers.length === 0) return null;

  async function handlePick(ownerPlayerId: string) {
    if (reveal || loading) return;
    setLoading(true);
    const result = await revealRating(match.id, myPlayerId, ownerPlayerId);
    if (result.success) {
      setReveal(result.data);
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Ver como te calificaron
      </h3>

      {!reveal && (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            Elige un jugador para ver qué nota te puso. Solo puedes ver una.
          </p>
          <div className="flex flex-wrap gap-2">
            {otherPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => handlePick(String(player.id))}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {player.name}
              </button>
            ))}
          </div>
          {loading && (
            <div className="h-8 w-16 bg-muted rounded animate-pulse mt-3" />
          )}
        </>
      )}

      {reveal && (
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm text-muted-foreground">
            {reveal.ownerName} te dio:
          </span>
          {reveal.rating !== null ? (
            <span
              className={`text-sm font-bold px-2.5 py-1 rounded-lg text-white ${getRatingColor(reveal.rating)}`}
            >
              {reveal.rating.toFixed(1)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              No te calificó
            </span>
          )}
        </div>
      )}
    </div>
  );
}
