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
  const placements = state.placements.length ? state.placements : [round.fixedItem];
  const currentTeamId = teamIds[state.roundIndex % Math.max(teamIds.length, 1)] ?? null;
  const currentTeam = teams.find((team) => team.id === currentTeamId) ?? null;
  const remaining = round.items.filter((item) => !placements.includes(item));
  const placementButtons = Array.from({ length: placements.length + 1 }, (_, index) => index);

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
    const next = [...placements];
    next.splice(position, 0, state.selectedItem);
    persist({ placements: next, selectedItem: null });
  }

  function removeAt(index: number) {
    if (state.roundResolved || placements[index] === round.fixedItem) {
      return;
    }
    const next = placements.filter((_, position) => position !== index);
    persist({ placements: next });
  }

  function evaluateRound() {
    if (placements.length !== round.items.length || state.roundResolved) {
      return;
    }

    const correct = placements.every((item, index) => item === order[index]);
    const nextPoints = { ...state.points };
    if (correct && currentTeamId) {
      nextPoints[currentTeamId] = (nextPoints[currentTeamId] ?? 0) + 1;
    }

    persist({
      points: nextPoints,
      roundResolved: true,
      roundCorrect: correct,
      revealSolution: false
    });
  }

  function revealSolution() {
    if (!state.roundResolved) {
      return;
    }
    persist({ revealSolution: true });
  }

  function nextRound() {
    const nextRoundIndex = Math.min(state.roundIndex + 1, SORTIEREN_ROUNDS.length - 1);
    const nextRound = SORTIEREN_ROUNDS[nextRoundIndex] ?? SORTIEREN_ROUNDS[0];
    persist({
      roundIndex: nextRoundIndex,
      placements: [nextRound.fixedItem],
      selectedItem: null,
      roundResolved: false,
      roundCorrect: null,
      revealSolution: false
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-4 md:p-6">
      <Card className="mb-4 border-white/10 bg-black/40">
        <CardHeader>
          <CardTitle>Sortieren - Runde {state.roundIndex + 1} / {SORTIEREN_ROUNDS.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-1">Kategorie: {round.category}</span>
            <span className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-1">
              Team am Zug: <strong style={{ color: currentTeam?.color }}>{currentTeam?.name ?? "-"}</strong>
            </span>
            <span className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-1">{round.upperLabel} {"->"} {round.lowerLabel}</span>
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
        <Card className="border-white/10 bg-black/40">
          <CardContent className="p-4">
            <div className="mb-2 text-center text-sm font-semibold text-muted-foreground">{round.upperLabel}</div>
            <div className="space-y-2">
              {placementButtons.map((position) => (
                <div key={`slot-${position}`} className="space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={!state.selectedItem || state.roundResolved}
                    onClick={() => insertAt(position)}
                  >
                    {position + 1}
                  </Button>
                  {placements[position] ? (
                    <button
                      className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-left font-semibold text-slate-100 transition-colors hover:border-cyan-300/50"
                      onClick={() => removeAt(position)}
                      disabled={state.roundResolved || placements[position] === round.fixedItem}
                    >
                      {placements[position]}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-2 text-center text-sm font-semibold text-muted-foreground">{round.lowerLabel}</div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <CardTitle>Elemente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {remaining.map((item) => (
              <button
                key={item}
                className={`w-full rounded-xl border px-3 py-2 text-left font-semibold ${
                  state.selectedItem === item
                    ? "border-cyan-300/80 bg-cyan-400/15 text-cyan-100"
                    : "border-white/15 bg-slate-900/70 text-slate-100 hover:border-cyan-300/40"
                }`}
                onClick={() => selectItem(item)}
                disabled={state.roundResolved}
              >
                {item}
              </button>
            ))}

            <div className="grid grid-cols-1 gap-2 pt-2">
              <Button onClick={evaluateRound} disabled={placements.length !== round.items.length || state.roundResolved}>
                Prüfen
              </Button>
              <Button variant="outline" onClick={revealSolution} disabled={!state.roundResolved}>
                Richtige Reihenfolge aufdecken
              </Button>
              <Button
                variant="outline"
                onClick={nextRound}
                disabled={!state.roundResolved || state.roundIndex >= SORTIEREN_ROUNDS.length - 1}
              >
                Nächste Runde
              </Button>
            </div>

            {state.roundResolved ? (
              <div
                className={`rounded-xl border p-3 text-sm ${
                  state.roundCorrect ? "border-emerald-400/40 bg-emerald-500/10" : "border-red-400/40 bg-red-500/10"
                }`}
              >
                {state.roundCorrect ? "Richtig sortiert." : "Nicht korrekt sortiert."}
              </div>
            ) : null}

            {state.revealSolution ? (
              <div className="rounded-xl border border-cyan-300/40 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                <p className="mb-2 font-semibold">Richtige Reihenfolge</p>
                <ol className="space-y-1">
                  {order.map((item, index) => (
                    <li key={`solution-${item}`} className="rounded border border-white/10 bg-black/25 px-2 py-1">
                      {index + 1}. {item}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
