"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, X, Minus, Users } from "lucide-react";

interface Player {
  id: string;
  name: string;
}

export default function CreateMatchPage() {
  const router = useRouter();
  const [matchName, setMatchName] = useState("");
  const [team1Goals, setTeam1Goals] = useState<number>(0);
  const [team2Goals, setTeam2Goals] = useState<number>(0);
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addPlayer = (team: "team1" | "team2") => {
    const newPlayer: Player = {
      id: `${team}-${Date.now()}-${Math.random()}`,
      name: "",
    };
    if (team === "team1") {
      setTeam1Players([...team1Players, newPlayer]);
    } else {
      setTeam2Players([...team2Players, newPlayer]);
    }
  };

  const removePlayer = (team: "team1" | "team2", playerId: string) => {
    if (team === "team1") {
      setTeam1Players(team1Players.filter((p) => p.id !== playerId));
    } else {
      setTeam2Players(team2Players.filter((p) => p.id !== playerId));
    }
  };

  const updatePlayerName = (
    team: "team1" | "team2",
    playerId: string,
    name: string,
  ) => {
    if (team === "team1") {
      setTeam1Players(
        team1Players.map((p) => (p.id === playerId ? { ...p, name } : p)),
      );
    } else {
      setTeam2Players(
        team2Players.map((p) => (p.id === playerId ? { ...p, name } : p)),
      );
    }
  };

  const adjustGoals = (team: "team1" | "team2", delta: number) => {
    if (team === "team1") {
      setTeam1Goals((prev) => Math.max(0, prev + delta));
    } else {
      setTeam2Goals((prev) => Math.max(0, prev + delta));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const validTeam1Players = team1Players.filter((p) => p.name.trim() !== "");
    const validTeam2Players = team2Players.filter((p) => p.name.trim() !== "");
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchName,
          team1Goals,
          team2Goals,
          team1Players: validTeam1Players,
          team2Players: validTeam2Players,
        }),
      });
      if (!response.ok) throw new Error("Failed to create match");
      const createdMatch = await response.json();
      router.push(`/match/${createdMatch.id}/share`);
    } catch (error) {
      console.error("Error creating match:", error);
      setSubmitting(false);
    }
  };

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

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Nuevo partido
          </h1>
          <p className="text-muted-foreground mt-1">
            Ingresa los detalles del partido
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Match Name */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <Label
              htmlFor="matchName"
              className="text-sm font-semibold text-foreground"
            >
              Nombre del partido
            </Label>
            <Input
              id="matchName"
              type="text"
              placeholder="Ej: Partido entre amigos"
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              required
              className="bg-input border-border focus-visible:ring-primary/50"
            />
          </div>

          {/* Score Banner */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground mb-4">
              Resultado
            </p>
            <div className="flex items-center justify-center gap-6">
              {/* Team 1 Goals */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                  Local
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustGoals("team1", -1)}
                    className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-muted/70 transition-colors active:scale-95"
                  >
                    <Minus className="h-4 w-4 text-foreground" />
                  </button>
                  <span className="text-4xl font-bold text-foreground w-10 text-center tabular-nums">
                    {team1Goals}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustGoals("team1", 1)}
                    className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-muted/70 transition-colors active:scale-95"
                  >
                    <Plus className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              </div>

              <span className="text-2xl font-bold text-muted-foreground">
                —
              </span>

              {/* Team 2 Goals */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-purple-400 uppercase tracking-wide">
                  Visitante
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustGoals("team2", -1)}
                    className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-muted/70 transition-colors active:scale-95"
                  >
                    <Minus className="h-4 w-4 text-foreground" />
                  </button>
                  <span className="text-4xl font-bold text-foreground w-10 text-center tabular-nums">
                    {team2Goals}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustGoals("team2", 1)}
                    className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-muted/70 transition-colors active:scale-95"
                  >
                    <Plus className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Teams Players */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team 1 */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <h3 className="font-semibold text-foreground">Local</h3>
                <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {team1Players.length}
                </span>
              </div>
              <div className="space-y-2">
                {team1Players.map((player, idx) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <Input
                      type="text"
                      placeholder="Nombre del jugador"
                      value={player.name}
                      onChange={(e) =>
                        updatePlayerName("team1", player.id, e.target.value)
                      }
                      className="flex-1 h-9 text-sm bg-input border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removePlayer("team1", player.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addPlayer("team1")}
                  className="w-full h-9 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary text-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar jugador
                </button>
              </div>
            </div>

            {/* Team 2 */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <h3 className="font-semibold text-foreground">Visitante</h3>
                <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {team2Players.length}
                </span>
              </div>
              <div className="space-y-2">
                {team2Players.map((player, idx) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <Input
                      type="text"
                      placeholder="Nombre del jugador"
                      value={player.name}
                      onChange={(e) =>
                        updatePlayerName("team2", player.id, e.target.value)
                      }
                      className="flex-1 h-9 text-sm bg-input border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removePlayer("team2", player.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addPlayer("team2")}
                  className="w-full h-9 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary text-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar jugador
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-lg shadow-primary/20"
            >
              {submitting ? "Creando..." : "Crear partido"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
