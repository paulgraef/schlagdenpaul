"use client";

import { useMemo } from "react";
import { Brain, RotateCcw } from "lucide-react";
import { useEventStore } from "@/hooks/use-event-store";
import { MemoryCard } from "@/components/game/memory-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MEMORY_PAIR_COUNT } from "@/config/memory-images";

export default function MemoryPage() {
  const { memory, flipMemoryCard, initializeMemory, resetMemory } = useEventStore((state) => state);
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

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-300" />Memory Modul
          </CardTitle>
          <CardDescription>64 Karten (32 Paare). Teams spielen abwechselnd gegeneinander.</CardDescription>
          <CardDescription>Bilder liegen in `/public/media/memory/` als `01.png` bis `32.png`.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-muted-foreground">
            {MEMORY_PAIR_COUNT} Paare fest eingestellt
          </div>
          <Button onClick={initializeMemory}>Neues Spiel</Button>
          <Button variant="outline" onClick={resetMemory}>
            <RotateCcw className="mr-2 h-4 w-4" />Reset
          </Button>
        </CardContent>
      </Card>

      <section className="mb-4 grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Paare</p>
            <p className="text-2xl font-semibold">{matchedPairs}/{totalPairs || MEMORY_PAIR_COUNT}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Am Zug</p>
            <p className="text-xl font-semibold" style={{ color: currentTeam?.color }}>
              {currentTeam?.name ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{teams[0]?.name ?? "Team 1"}</p>
            <p className="text-2xl font-semibold" style={{ color: teams[0]?.color }}>
              {memory.teamPairCounts[teams[0]?.id ?? ""] ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{teams[1]?.name ?? "Team 2"}</p>
            <p className="text-2xl font-semibold" style={{ color: teams[1]?.color }}>
              {memory.teamPairCounts[teams[1]?.id ?? ""] ?? 0}
            </p>
          </CardContent>
        </Card>
      </section>

      {finished ? (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
          {winnerTeam ? `Gewinner: ${winnerTeam.name}` : "Unentschieden"} - alle Paare gefunden.
        </div>
      ) : null}

      <section className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {memory.cards.map((card) => (
          <MemoryCard key={card.id} card={card} onClick={flipMemoryCard} />
        ))}
      </section>
    </main>
  );
}
