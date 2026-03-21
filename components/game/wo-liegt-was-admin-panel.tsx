"use client";

import { useMemo } from "react";
import {
  WO_LIEGT_WAS_LOCATIONS,
  createInitialWoLiegtWasState,
  getRoundDistances,
  getRoundWinnerTeamId,
  getWoLiegtWasState
} from "@/lib/game-engine/wo-liegt-was";
import type { GameEntity, GameStateEntity, TeamEntity } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WoLiegtWasAdminPanelProps {
  game: GameEntity;
  gameState: GameStateEntity;
  teams: TeamEntity[];
  onUpdateMetadata: (gameId: string, metadataPatch: Record<string, unknown>) => void;
  onSetWinner: (gameId: string, winnerTeamId: string | null) => void;
}

function roundDistanceText(distance: number): string {
  return `${distance.toFixed(2)} Einheiten`;
}

export function WoLiegtWasAdminPanel({
  game,
  gameState,
  teams,
  onUpdateMetadata,
  onSetWinner
}: WoLiegtWasAdminPanelProps) {
  const teamIds = useMemo(() => teams.map((team) => team.id), [teams]);
  const state = getWoLiegtWasState(gameState.metadata, teamIds);
  const location = WO_LIEGT_WAS_LOCATIONS[state.locationIndex] ?? WO_LIEGT_WAS_LOCATIONS[0];

  const distances = getRoundDistances(state);
  const winnerTeamId = getRoundWinnerTeamId(state);
  const allPinsSet = teamIds.every((teamId) => Boolean(state.guesses[teamId]));

  function persist(nextState: ReturnType<typeof createInitialWoLiegtWasState>) {
    onUpdateMetadata(game.id, {
      woLiegtWas: nextState
    });
  }

  function resetPins() {
    persist({
      ...state,
      reveal: false,
      roundAwarded: false,
      guesses: Object.fromEntries(teamIds.map((teamId) => [teamId, null]))
    });
  }

  function nextLocation() {
    persist({
      ...state,
      locationIndex: (state.locationIndex + 1) % WO_LIEGT_WAS_LOCATIONS.length,
      reveal: false,
      roundAwarded: false,
      guesses: Object.fromEntries(teamIds.map((teamId) => [teamId, null]))
    });
  }

  function awardPoint() {
    if (!winnerTeamId || state.roundAwarded) {
      return;
    }

    const nextPoints = {
      ...state.points,
      [winnerTeamId]: (state.points[winnerTeamId] ?? 0) + 1
    };

    persist({
      ...state,
      points: nextPoints,
      roundAwarded: true
    });

    if ((nextPoints[winnerTeamId] ?? 0) >= 4) {
      onSetWinner(game.id, winnerTeamId);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spiel 4: Wo liegt was?</CardTitle>
        <CardDescription>
          Ort wählen, pro Team Pin setzen, dann freigeben. Wer näher liegt, bekommt einen Punkt. Sieger bei 4 Punkten.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Gesuchter Ort</p>
            <p className="mt-1 text-lg font-semibold">{location.name}</p>
            <p className="text-xs text-muted-foreground">Runde {state.locationIndex + 1} von {WO_LIEGT_WAS_LOCATIONS.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Punktestand</p>
            <div className="mt-2 space-y-1">
              {teams.map((team) => (
                <p key={team.id} className="text-sm font-medium" style={{ color: team.color }}>
                  {team.name}: {state.points[team.id] ?? 0}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Pin-Status</p>
          <div className="mt-2 space-y-1">
            {teams.map((team) => (
              <p key={team.id} className="text-sm" style={{ color: team.color }}>
                {team.name}: {state.guesses[team.id] ? "Pin gesetzt" : "wartet auf Pin"}
              </p>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button onClick={() => persist({ ...state, reveal: true })} disabled={!allPinsSet}>
            Ort anzeigen
          </Button>
          <Button variant="outline" onClick={awardPoint} disabled={!winnerTeamId || state.roundAwarded || !state.reveal}>
            Punkt an näheres Team
          </Button>
          <Button variant="outline" onClick={nextLocation}>
            Nächster Ort
          </Button>
          <Button variant="outline" onClick={resetPins}>
            Pins zurücksetzen
          </Button>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Runden-Auswertung</p>
          {!allPinsSet ? (
            <p className="mt-1 text-sm text-muted-foreground">Für die Auswertung müssen beide Teams einen Pin setzen.</p>
          ) : (
            <div className="mt-2 space-y-1">
              {teams.map((team) => (
                <p key={team.id} className="text-sm" style={{ color: team.color }}>
                  {team.name}: {distances[team.id] ? roundDistanceText(distances[team.id]) : "kein Pin"}
                </p>
              ))}
              <p className="text-sm font-semibold">
                {winnerTeamId
                  ? `Näher dran: ${teams.find((team) => team.id === winnerTeamId)?.name ?? winnerTeamId}`
                  : "Gleichstand oder unvollständige Eingabe"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
