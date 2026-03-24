"use client";

import { useMemo } from "react";
import { Brain, RotateCcw } from "lucide-react";
import { useEventStore } from "@/hooks/use-event-store";
import { MemoryCard } from "@/components/game/memory-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemoryPage() {
  const { memory, flipMemoryCard, resetMemory } = useEventStore((state) => state);
  const allTeams = useEventStore((state) => state.snapshot.teams);
  const teams = useMemo(
    () => allTeams.slice().sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2),
    [allTeams]
  );

  const matchedPairs = useMemo(() => {
    const matched = memory.cards.filter((card) => card.matched).length;
    return matched / 2;
  }, [memory.cards]);

  const totalPairs = memory.cards.length / 2;
  const finished = totalPairs > 0 && matchedPairs === totalPairs;
  const currentTeam = teams.find((team) => team.id === memory.currentTeamId) ?? null;
  const winnerTeam = teams.find((team) => team.id === memory.winnerTeamId) ?? null;
  const teamColorById = useMemo(
    () => Object.fromEntries(teams.map((team) => [team.id, team.color])),
    [teams]
  );

  return (
    <main className="h-[100dvh] overflow-hidden p-2 md:p-3">
      <div className="grid h-full min-h-0 grid-cols-[176px_1fr] gap-2 md:grid-cols-[260px_1fr]">
        <aside className="min-h-0">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Brain className="h-5 w-5 text-cyan-300" />
                Memory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Paare</p>
                <p className="text-xl font-semibold">{matchedPairs}/{totalPairs || 32}</p>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Am Zug</p>
                <p className="text-lg font-semibold" style={{ color: currentTeam?.color }}>
                  {currentTeam?.name ?? "—"}
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{teams[0]?.name ?? "Team 1"}</p>
                <p className="text-xl font-semibold" style={{ color: teams[0]?.color }}>
                  {memory.teamPairCounts[teams[0]?.id ?? ""] ?? 0}
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{teams[1]?.name ?? "Team 2"}</p>
                <p className="text-xl font-semibold" style={{ color: teams[1]?.color }}>
                  {memory.teamPairCounts[teams[1]?.id ?? ""] ?? 0}
                </p>
              </div>

              {finished ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-sm text-emerald-100">
                  {winnerTeam ? `Gewinner: ${winnerTeam.name}` : "Unentschieden"}
                </div>
              ) : null}

              <Button variant="outline" className="w-full" onClick={resetMemory}>
                <RotateCcw className="mr-2 h-4 w-4" />Reset
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="min-h-0 overflow-hidden">
          <div className="mx-auto h-full w-full max-w-[min(92dvh,1100px)]">
            <div className="grid h-full grid-cols-8 gap-1 md:gap-1.5">
              {memory.cards.map((card) => (
                <MemoryCard
                  key={card.id}
                  card={card}
                  onClick={flipMemoryCard}
                  matchedBorderColor={card.matchedByTeamId ? teamColorById[card.matchedByTeamId] : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
