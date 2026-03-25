"use client";

import { useEffect, useMemo } from "react";
import { SORTIEREN_ROUNDS } from "@/config/sortieren-rounds";
import { useEventStore } from "@/hooks/use-event-store";
import { getSortierenRoundOrder, getSortierenState, shuffleStrings } from "@/lib/game-engine/sortieren";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SortierenPage() {
  const { snapshot, setGameMetadata } = useEventStore((state) => state);
  const game = snapshot.games.find((entry) => entry.slug === "sortieren") ?? null;
  const teams = useMemo(
    () => snapshot.teams.slice().sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2),
    [snapshot.teams]
  );
  const gameId = game?.id ?? "";
  const gameState = game ? snapshot.gameStates[gameId] : undefined;
  const teamIds = teams.map((team) => team.id);
  const state = getSortierenState(gameState?.metadata ?? {}, teamIds);
  const round = SORTIEREN_ROUNDS[state.roundIndex] ?? SORTIEREN_ROUNDS[0];
  const order = getSortierenRoundOrder(round.id, state.overrides);

  const starterValid = Boolean(state.starterItem && round.items.includes(state.starterItem));
  const starterItem = starterValid ? state.starterItem : null;
  const placements = starterItem
    ? (state.placements.length ? state.placements : [starterItem])
    : [];

  const currentTeamId = teamIds[state.roundIndex % Math.max(teamIds.length, 1)] ?? null;
  const currentTeam = teams.find((team) => team.id === currentTeamId) ?? null;
  const remaining = round.items.filter((item) => !placements.includes(item));
  const pool = (state.poolOrder.length ? state.poolOrder : remaining).filter((item) => remaining.includes(item));
  const placementButtons = Array.from({ length: placements.length + 1 }, (_, index) => index);

  function persist(next: Partial<typeof state>) {
    setGameMetadata(gameId, {
      sortieren: {
        ...state,
        ...next
      }
    });
  }

  useEffect(() => {
    if (!game) {
      return;
    }
    if (starterValid) {
      return;
    }
    const randomStarter = round.items[Math.floor(Math.random() * round.items.length)];
    const shuffledPool = shuffleStrings(round.items.filter((item) => item !== randomStarter));
    setGameMetadata(gameId, {
      sortieren: {
        ...state,
        starterItem: randomStarter,
        placements: [randomStarter],
        poolOrder: shuffledPool,
        selectedItem: null,
        roundResolved: false,
        roundCorrect: null,
        revealSolution: false
      }
    });
  }, [game, gameId, round.items, setGameMetadata, starterValid, state]);

  if (!game) {
    return <main className="p-6">Sortieren-Spiel nicht gefunden.</main>;
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
    const complete = next.length === round.items.length;
    const allCorrect = complete ? next.every((item, index) => item === order[index]) : false;
    const nextPoints = { ...state.points };
    if (complete && allCorrect && currentTeamId) {
      nextPoints[currentTeamId] = (nextPoints[currentTeamId] ?? 0) + 1;
    }

    persist({
      placements: next,
      selectedItem: null,
      points: nextPoints,
      roundResolved: complete,
      roundCorrect: complete ? allCorrect : null,
      revealSolution: false
    });
  }

  function removeAt(index: number) {
    if (state.roundResolved || placements[index] === starterItem) {
      return;
    }
    const next = placements.filter((_, position) => position !== index);
    persist({
      placements: next,
      roundResolved: false,
      roundCorrect: null,
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
    persist({
      roundIndex: nextRoundIndex,
      placements: [],
      selectedItem: null,
      starterItem: null,
      poolOrder: [],
      roundResolved: false,
      roundCorrect: null,
      revealSolution: false
    });
  }

  function resetCurrentRound() {
    const randomStarter = round.items[Math.floor(Math.random() * round.items.length)];
    const shuffledPool = shuffleStrings(round.items.filter((item) => item !== randomStarter));
    persist({
      placements: [randomStarter],
      selectedItem: null,
      starterItem: randomStarter,
      poolOrder: shuffledPool,
      roundResolved: false,
      roundCorrect: null,
      revealSolution: false
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-4 md:p-6">
      <Card className="mb-4 border-white/10 bg-black/40">
        <CardHeader>
          <CardTitle>
            Sortieren - Runde {state.roundIndex + 1} / {SORTIEREN_ROUNDS.length}: {round.category}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-1">
              Team am Zug: <strong style={{ color: currentTeam?.color }}>{currentTeam?.name ?? "-"}</strong>
            </span>
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
                <div key={`slot-row-${position}`} className="grid grid-cols-[1fr_46px] items-center gap-2">
                  <div>
                    {position < placements.length ? (
                      (() => {
                        const item = placements[position];
                        const correct = item === order[position];
                        return (
                          <button
                            className={`w-full rounded-xl border px-3 py-2 text-left font-semibold transition-colors ${
                              correct
                                ? "border-emerald-400/70 bg-emerald-500/10 text-emerald-100"
                                : "border-red-400/70 bg-red-500/10 text-red-100"
                            }`}
                            onClick={() => removeAt(position)}
                            disabled={state.roundResolved || item === starterItem}
                          >
                            {item}
                          </button>
                        );
                      })()
                    ) : (
                      <div className="h-[44px]" />
                    )}
                  </div>
                  <button
                    className="h-[44px] w-[44px] p-0 disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={!state.selectedItem || state.roundResolved}
                    onClick={() => insertAt(position)}
                    aria-label={`Einfügen an Position ${position + 1}`}
                  >
                    <svg viewBox="0 0 44 44" className="h-[44px] w-[44px]" aria-hidden="true">
                      <polygon
                        points="6,22 30,4 30,16 40,16 40,28 30,28 30,40"
                        fill="rgba(15,23,42,0.88)"
                        stroke="rgba(148,163,184,0.8)"
                        strokeWidth="1.2"
                      />
                      <text
                        x="22"
                        y="24"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                        fontWeight="700"
                        fill="#f8fafc"
                      >
                        {position + 1}
                      </text>
                    </svg>
                  </button>
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
            {pool.map((item) => (
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
              <Button variant="outline" onClick={resetCurrentRound}>
                Zurücksetzen
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
