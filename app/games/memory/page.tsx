"use client";

import { useMemo, useState } from "react";
import { Brain, RotateCcw } from "lucide-react";
import { useEventStore } from "@/hooks/use-event-store";
import { MemoryCard } from "@/components/game/memory-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatDuration(startedAt: string | null, finishedAt: string | null) {
  if (!startedAt) {
    return "00:00";
  }
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  const seconds = Math.floor((end - new Date(startedAt).getTime()) / 1000);
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

export default function MemoryPage() {
  const [pairCount, setPairCount] = useState(8);
  const { memory, flipMemoryCard, initializeMemory, resetMemory } = useEventStore((state) => state);

  const matchedPairs = useMemo(() => {
    const matched = memory.cards.filter((card) => card.matched).length;
    return matched / 2;
  }, [memory.cards]);

  const totalPairs = memory.cards.length / 2;
  const finished = totalPairs > 0 && matchedPairs === totalPairs;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-300" />Memory Modul
          </CardTitle>
          <CardDescription>Animiertes Memory für Teamrunden, inklusive Züge und Zeitmessung.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <select
            className="h-10 rounded-xl border border-input bg-background/80 px-3 text-sm"
            value={pairCount}
            onChange={(event) => setPairCount(Number(event.target.value))}
          >
            {[6, 8, 10, 12].map((value) => (
              <option key={value} value={value}>
                {value} Paare
              </option>
            ))}
          </select>
          <Button onClick={() => initializeMemory(pairCount)}>Neues Board</Button>
          <Button variant="outline" onClick={resetMemory}>
            <RotateCcw className="mr-2 h-4 w-4" />Reset
          </Button>
        </CardContent>
      </Card>

      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Paare</p>
            <p className="text-2xl font-semibold">{matchedPairs}/{totalPairs || pairCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Züge</p>
            <p className="text-2xl font-semibold">{memory.moves}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Zeit</p>
            <p className="text-2xl font-semibold">{formatDuration(memory.startedAt, memory.finishedAt)}</p>
          </CardContent>
        </Card>
      </section>

      {finished ? (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
          Alle Paare gefunden. Runde abgeschlossen.
        </div>
      ) : null}

      <section className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {memory.cards.map((card) => (
          <MemoryCard key={card.id} card={card} onClick={flipMemoryCard} />
        ))}
      </section>
    </main>
  );
}
