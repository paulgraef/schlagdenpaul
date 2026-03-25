"use client";

import { useMemo, useState } from "react";
import { SORTIEREN_ROUNDS } from "@/config/sortieren-rounds";
import { useEventStore } from "@/hooks/use-event-store";
import { getSortierenRoundOrder, getSortierenState } from "@/lib/game-engine/sortieren";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSortierenPage() {
  const { snapshot, setGameMetadata } = useEventStore((state) => state);
  const game = snapshot.games.find((entry) => entry.slug === "sortieren") ?? null;
  const teams = useMemo(
    () => snapshot.teams.slice().sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2),
    [snapshot.teams]
  );
  const [editorRoundIndex, setEditorRoundIndex] = useState(0);

  if (!game) {
    return <main className="p-6">Sortieren-Spiel nicht gefunden.</main>;
  }
  const gameId = game.id;

  const gameState = snapshot.gameStates[gameId];
  const teamIds = teams.map((team) => team.id);
  const state = getSortierenState(gameState?.metadata ?? {}, teamIds);
  const round = SORTIEREN_ROUNDS[editorRoundIndex] ?? SORTIEREN_ROUNDS[0];
  const currentOverride = getSortierenRoundOrder(round.id, state.overrides);

  function persist(overrides: Record<string, string[]>) {
    setGameMetadata(gameId, {
      sortieren: {
        ...state,
        overrides
      }
    });
  }

  function setPosition(position: number, value: string) {
    const nextOrder = [...currentOverride];
    const existingIndex = nextOrder.indexOf(value);
    if (existingIndex >= 0) {
      const displaced = nextOrder[position];
      nextOrder[existingIndex] = displaced;
    }
    nextOrder[position] = value;
    persist({
      ...state.overrides,
      [round.id]: nextOrder
    });
  }

  function resetRoundOrder() {
    const next = { ...state.overrides };
    delete next[round.id];
    persist(next);
  }

  function applyRoundAsActive() {
    setGameMetadata(gameId, {
      sortieren: {
        ...state,
        roundIndex: editorRoundIndex,
        placements: [],
        selectedItem: null,
        roundResolved: false,
        roundCorrect: null
      }
    });
  }

  return (
    <main className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sortieren - Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
            <select
              className="h-10 rounded-xl border border-input bg-background/80 px-3 text-sm"
              value={editorRoundIndex}
              onChange={(event) => setEditorRoundIndex(Number(event.target.value))}
            >
              {SORTIEREN_ROUNDS.map((entry, index) => (
                <option key={entry.id} value={index}>
                  Runde {index + 1}: {entry.category}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={resetRoundOrder}>Standard-Reihenfolge</Button>
            <Button onClick={applyRoundAsActive}>Als aktive Runde setzen</Button>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
            <p>Kategorie: <strong>{round.category}</strong></p>
            <p>Sortierung: <strong>{round.upperLabel}</strong> {"->"} <strong>{round.lowerLabel}</strong></p>
          </div>

          <div className="space-y-2">
            {currentOverride.map((value, index) => (
              <div key={`${round.id}-${index}`} className="grid items-center gap-2 md:grid-cols-[90px_1fr]">
                <span className="text-sm text-muted-foreground">Position {index + 1}</span>
                <select
                  className="h-10 rounded-xl border border-input bg-background/80 px-3 text-sm"
                  value={value}
                  onChange={(event) => setPosition(index, event.target.value)}
                >
                  {round.items.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
