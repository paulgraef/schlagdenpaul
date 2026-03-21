"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  WO_LIEGT_WAS_LOCATIONS,
  getLocationTarget,
  getRoundDistances,
  getRoundWinnerTeamId,
  getWoLiegtWasState
} from "@/lib/game-engine/wo-liegt-was";
import type { GameStateEntity, TeamEntity } from "@/types/domain";

interface WoLiegtWasStageProps {
  gameTitle: string;
  gameState: GameStateEntity;
  teams: TeamEntity[];
}

function roundDistanceText(distance: number): string {
  return `${distance.toFixed(2)} Einheiten`;
}

export function WoLiegtWasStage({ gameTitle, gameState, teams }: WoLiegtWasStageProps) {
  const teamIds = teams.map((team) => team.id);
  const state = getWoLiegtWasState(gameState.metadata, teamIds);
  const location = WO_LIEGT_WAS_LOCATIONS[state.locationIndex] ?? WO_LIEGT_WAS_LOCATIONS[0];
  const effectiveTarget = getLocationTarget(state, state.locationIndex);
  const distances = getRoundDistances(state);
  const winnerTeamId = getRoundWinnerTeamId(state);

  return (
    <Card className="flex h-[calc(100vh-2rem)] flex-col overflow-hidden border-white/20 bg-black/50 md:h-[calc(100vh-3rem)]">
      <div className="border-b border-white/10 bg-black/40 px-6 py-4">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Aktuelles Spiel</p>
        <h2 className="font-heading text-2xl font-semibold">{gameTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Gesucht: {location.name}</p>
      </div>

      <div className="grid flex-1 grid-rows-[minmax(0,1fr)_auto] gap-4 overflow-hidden p-4 md:p-6 lg:grid-cols-[1fr_320px] lg:grid-rows-1">
        <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#ececec]">
          <Image
            src="/media/laenderumrisse/item-04.svg"
            alt="Deutschland Karte"
            fill
            className="object-contain"
            unoptimized
          />

          {state.reveal ? (
            <>
              <svg className="pointer-events-none absolute inset-0 h-full w-full">
                {teams.map((team) => {
                  const guess = state.guesses[team.id];
                  if (!guess) {
                    return null;
                  }
                  return (
                    <line
                      key={team.id}
                      x1={`${guess.x}%`}
                      y1={`${guess.y}%`}
                      x2={`${effectiveTarget.x}%`}
                      y2={`${effectiveTarget.y}%`}
                      stroke={team.color}
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  );
                })}
              </svg>

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
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/90">
                Auswertung noch nicht freigegeben
              </p>
            </div>
          )}

          <div
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-yellow-400"
            style={{ left: `${effectiveTarget.x}%`, top: `${effectiveTarget.y}%` }}
            title="Tatsächlicher Ort"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Rundenstatus</p>
          <div className="mt-3 space-y-2">
            {teams.map((team) => (
              <p key={team.id} className="text-sm font-medium" style={{ color: team.color }}>
                {team.name}: {state.points[team.id] ?? 0} Punkte
              </p>
            ))}
          </div>

          {state.reveal ? (
            <div className="mt-4 space-y-1">
              {teams.map((team) => (
                <p key={team.id} className="text-sm" style={{ color: team.color }}>
                  Distanz {team.name}:{" "}
                  {typeof distances[team.id] === "number" ? roundDistanceText(distances[team.id]) : "kein Pin"}
                </p>
              ))}
              <p className="pt-1 text-sm font-semibold">
                {winnerTeamId
                  ? `Näher dran: ${teams.find((team) => team.id === winnerTeamId)?.name ?? winnerTeamId}`
                  : "Gleichstand"}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Pins und Distanzen erscheinen nach Freigabe im Dashboard.</p>
          )}
        </div>
      </div>
    </Card>
  );
}
