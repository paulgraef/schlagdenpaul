"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Image from "next/image";
import {
  WO_LIEGT_WAS_LOCATIONS,
  createInitialWoLiegtWasState,
  getLocationTarget,
  getRoundDistances,
  getRoundWinnerTeamId,
  getWoLiegtWasState,
  normalizePoint
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
  const effectiveTarget = getLocationTarget(state, state.locationIndex);

  const [selectedTeamId, setSelectedTeamId] = useState<string>(teamIds[0] ?? "");
  const [targetingMode, setTargetingMode] = useState(false);
  const [cursorPoint, setCursorPoint] = useState<{ x: number; y: number } | null>(null);
  const [calibrationPoint, setCalibrationPoint] = useState<{ x: number; y: number } | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!teamIds.length) {
      return;
    }
    if (!teamIds.includes(selectedTeamId)) {
      setSelectedTeamId(teamIds[0]);
    }
  }, [selectedTeamId, teamIds]);

  const distances = getRoundDistances(state);
  const winnerTeamId = getRoundWinnerTeamId(state);
  const allPinsSet = teamIds.every((teamId) => Boolean(state.guesses[teamId]));

  function persist(nextState: ReturnType<typeof createInitialWoLiegtWasState>) {
    onUpdateMetadata(game.id, {
      woLiegtWas: nextState
    });
  }

  function updatePin(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const point = normalizePoint({ x, y });

    if (targetingMode) {
      setCalibrationPoint(point);
      setCopyStatus(
        `Vorschlag (nicht gespeichert): ${location.id}: { x: ${point.x.toFixed(2)}, y: ${point.y.toFixed(2)} }`
      );
      return;
    }

    if (!selectedTeamId) {
      return;
    }

    persist({
      ...state,
      reveal: false,
      roundAwarded: false,
      guesses: {
        ...state.guesses,
        [selectedTeamId]: {
          ...point,
          placedAt: new Date().toISOString()
        }
      }
    });
  }

  function updateCursor(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const point = normalizePoint({ x, y });
    setCursorPoint(point);
  }

  function leaveCursor() {
    setCursorPoint(null);
  }

  async function copyCurrentPoint() {
    const payload = `${location.id}: { x: ${effectiveTarget.x.toFixed(2)}, y: ${effectiveTarget.y.toFixed(2)} }`;
    await navigator.clipboard.writeText(payload);
    setCopyStatus("Koordinate kopiert");
  }

  async function copyAllTargets() {
    const allTargets = Object.fromEntries(
      WO_LIEGT_WAS_LOCATIONS.map((entry, index) => [entry.id, getLocationTarget(state, index)])
    );
    await navigator.clipboard.writeText(JSON.stringify(allTargets, null, 2));
    setCopyStatus("Alle Zielkoordinaten als JSON kopiert");
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

        <div className="flex flex-wrap gap-2">
          {teams.map((team) => (
            <Button
              key={team.id}
              size="sm"
              variant={!targetingMode && selectedTeamId === team.id ? "default" : "outline"}
              onClick={() => setSelectedTeamId(team.id)}
            >
              Pin setzen: {team.name}
            </Button>
          ))}
          <Button
            size="sm"
            variant={targetingMode ? "default" : "outline"}
            onClick={() => setTargetingMode((prev) => !prev)}
          >
            {targetingMode ? "Zielpunkt-Modus aktiv" : "Zielpunkt kalibrieren"}
          </Button>
        </div>

        <div className="relative mx-auto aspect-[3/4] w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#ececec]">
          <div
            className="absolute inset-0 cursor-crosshair"
            onClick={updatePin}
            onMouseMove={updateCursor}
            onMouseLeave={leaveCursor}
          >
            <Image
              src="/media/laenderumrisse/item-04.svg"
              alt="Deutschland Karte"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {teams.map((team) => {
            const guess = state.guesses[team.id];
            if (!guess) {
              return null;
            }

            return (
              <div
                key={team.id}
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                style={{
                  left: `${guess.x}%`,
                  top: `${guess.y}%`,
                  backgroundColor: team.color
                }}
                title={`${team.name} Pin`}
              />
            );
          })}

          <div
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-yellow-400"
            style={{ left: `${effectiveTarget.x}%`, top: `${effectiveTarget.y}%` }}
            title="Zielort (Admin)"
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-muted-foreground">
          {targetingMode
            ? `Kalibrier-Modus: Klicke auf der Karte genau auf ${location.name}. Es wird nur ein Vorschlag angezeigt, nichts gespeichert.`
            : `Aktueller Zielpunkt für ${location.name}: x=${effectiveTarget.x.toFixed(1)}%, y=${effectiveTarget.y.toFixed(1)}%`}
          {cursorPoint ? (
            <p className="mt-1">Mausposition: x={cursorPoint.x.toFixed(1)}%, y={cursorPoint.y.toFixed(1)}%</p>
          ) : null}
          {calibrationPoint ? (
            <p className="mt-1">
              Letzter Vorschlag: x={calibrationPoint.x.toFixed(1)}%, y={calibrationPoint.y.toFixed(1)}%
            </p>
          ) : null}
          {copyStatus ? <p className="mt-1 text-cyan-300">{copyStatus}</p> : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={() => void copyCurrentPoint()}>
            Aktuelle Ort-Koordinate kopieren
          </Button>
          <Button variant="outline" onClick={() => void copyAllTargets()}>
            Alle Zielkoordinaten kopieren (JSON)
          </Button>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Alle Ort-Koordinaten</p>
          <div className="mt-2 grid gap-1">
            {WO_LIEGT_WAS_LOCATIONS.map((entry, index) => {
              const point = getLocationTarget(state, index);
              return (
                <p key={entry.id} className="font-mono text-xs text-muted-foreground">
                  {entry.id}: x={point.x.toFixed(1)} y={point.y.toFixed(1)}
                </p>
              );
            })}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button onClick={() => persist({ ...state, reveal: true })} disabled={!allPinsSet}>
            Auf Public freigeben
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
