"use client";

import { useMemo } from "react";
import { SORTIEREN_ROUNDS } from "@/config/sortieren-rounds";
import { useEventStore } from "@/hooks/use-event-store";
import { getSortierenRoundOrder, getSortierenState } from "@/lib/game-engine/sortieren";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SortierenPage() {
  const { snapshot, setGameMetadata } = useEventStore((state) => state);
  const game = snapshot.games.find((entry) => entry.slug === "sortieren") ?? null;
  const teams = useMemo(
    () => snapshot.teams.slice().sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2),
    [snapshot.teams]
  );

  if (!game) {
    return <main className="p-6">Sortieren-Spiel nicht gefunden.</main>;
  }
  const gameId = game.id;

  const gameState = snapshot.gameStates[gameId];
  const teamIds = teams.map((team) => team.id);
  const state = getSortierenState(gameState?.metadata ?? {}, teamIds);
  const round = SORTIEREN_ROUNDS[state.roundIndex] ?? SORTIEREN_ROUNDS[0];
  const order = getSortierenRoundOrder(round.id, state.overrides);
  const currentTeamId = teamIds[state.roundIndex % Math.max(teamIds.length, 1)] ?? null;
  const currentTeam = teams.find((team) => team.id === currentTeamId) ?? null;
  const remaining = round.items.filter((item) => !state.placements.includes(item));

  function persist(next: Partial<typeof state>) {
    setGameMetadata(gameId, {
      sortieren: {
        ...state,
        ...next
      }
    });
  }

  function selectItem(item: string) {
    if (state.roundResolved) {
      return;
    }
    persist({ selectedItem: item });
  }

  function insertAt(position: number) {
    if (!state.selectedItem || state.roundResolved) {
      return;
    }
    const next = [...state.placements];
    next.splice(position, 0, state.selectedItem);
    persist({ placements: next, selectedItem: null });
  }

  function removeAt(index: number) {
    if (state.roundResolved) {
      return;
    }
    const next = state.placements.filter((_, position) => position !== index);
    persist({ placements: next });
  }

  function evaluateRound() {
    if (state.placements.length !== round.items.length || state.roundResolved) {
      return;
    }
    const correct = state.placements.every((item, index) => item === order[index]);
    const nextPoints = { ...state.points };
    if (correct && currentTeamId) {
      nextPoints[currentTeamId] = (nextPoints[currentTeamId] ?? 0) + 1;
    }
    persist({
      points: nextPoints,
      roundResolved: true,
      roundCorrect: correct
    });
  }

  function nextRound() {
    persist({
      roundIndex: Math.min(state.roundIndex + 1, SORTIEREN_ROUNDS.length - 1),
      placements: [],
      selectedItem: null,
      roundResolved: false,
      roundCorrect: null
    });
  }

  const placementButtons = Array.from({ length: state.placements.length + 1 }, (_, index) => index);

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-4 md:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Sortieren - Runde {state.roundIndex + 1} / {SORTIEREN_ROUNDS.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded bg-black/30 px-2 py-1">Kategorie: {round.category}</span>
            <span className="rounded bg-black/30 px-2 py-1">Team am Zug: <strong style={{ color: currentTeam?.color }}>{currentTeam?.name ?? "-"}</strong></span>
            <span className="rounded bg-black/30 px-2 py-1">{round.upperLabel} {"->"} {round.lowerLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <span key={team.id} className="rounded border border-white/10 px-2 py-1 text-sm" style={{ color: team.color }}>
                {team.name}: {state.points[team.id] ?? 0}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 text-center text-sm font-semibold text-muted-foreground">{round.upperLabel}</div>
            <div className="space-y-2">
              {placementButtons.map((position) => (
                <div key={`slot-${position}`} className="space-y-2">
                  <Button className="w-full" variant="outline" disabled={!state.selectedItem || state.roundResolved} onClick={() => insertAt(position)}>
                    {position + 1}
                  </Button>
                  {state.placements[position] ? (
                    <button
                      className="w-full rounded-xl border border-yellow-400/60 bg-yellow-300/90 px-3 py-2 text-left font-semibold text-black"
                      onClick={() => removeAt(position)}
                      disabled={state.roundResolved}
                    >
                      {state.placements[position]}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-2 text-center text-sm font-semibold text-muted-foreground">{round.lowerLabel}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Elemente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {remaining.map((item) => (
              <button
                key={item}
                className={`w-full rounded-xl border px-3 py-2 text-left font-semibold ${
                  state.selectedItem === item
                    ? "border-cyan-300 bg-cyan-400/20"
                    : "border-yellow-400/60 bg-yellow-300/90 text-black"
                }`}
                onClick={() => selectItem(item)}
                disabled={state.roundResolved}
              >
                {item}
              </button>
            ))}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button onClick={evaluateRound} disabled={state.placements.length !== round.items.length || state.roundResolved}>
                Prüfen
              </Button>
              <Button variant="outline" onClick={nextRound} disabled={!state.roundResolved || state.roundIndex >= SORTIEREN_ROUNDS.length - 1}>
                Nächste Runde
              </Button>
            </div>

            {state.roundResolved ? (
              <div className={`rounded-xl border p-3 text-sm ${state.roundCorrect ? "border-emerald-400/40 bg-emerald-500/10" : "border-red-400/40 bg-red-500/10"}`}>
                {state.roundCorrect ? "Richtig sortiert." : "Nicht korrekt sortiert."}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
