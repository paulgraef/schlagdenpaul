"use client";

import { useMemo } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { cn } from "@/lib/utils";

const TARGET_POINTS = 61;

function progressPercent(points: number) {
  return Math.max(0, Math.min(100, Math.round((points / TARGET_POINTS) * 100)));
}

export default function ScoreboardPage() {
  const snapshot = useEventStore((state) => state.snapshot);

  const games = useMemo(
    () => snapshot.games.slice().sort((a, b) => a.gameNumber - b.gameNumber),
    [snapshot.games]
  );

  const teams = useMemo(
    () => snapshot.teams.slice().sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2),
    [snapshot.teams]
  );

  const scoreByTeam = new Map(snapshot.scores.map((score) => [score.teamId, score.totalPoints]));

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <section className="rounded-3xl border border-white/15 bg-black/35 p-4 shadow-[0_20px_55px_-30px_rgba(0,0,0,0.55)] md:p-6">
        <div className="mb-6 grid grid-cols-5 gap-2 md:grid-cols-[repeat(15,minmax(0,1fr))]">
          {games.map((game) => {
            const won = Boolean(game.winnerTeamId);
            return (
              <div
                key={game.id}
                className={cn(
                  "flex h-10 items-center justify-center rounded border text-sm font-bold md:h-12 md:text-lg",
                  won
                    ? "border-white/20 bg-[#111] text-transparent"
                    : "border-white/20 bg-white/10 text-white"
                )}
              >
                {won ? "" : game.gameNumber}
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => {
            const total = scoreByTeam.get(team.id) ?? 0;
            const percent = progressPercent(total);

            return (
              <section key={team.id} className="space-y-3">
                <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-center">
                  <h2
                    className="text-3xl font-black uppercase tracking-wide md:text-5xl"
                    style={{ color: team.color }}
                  >
                    {team.name}
                  </h2>
                </div>

                <div className="rounded-md border border-white/20 bg-[#111] p-2">
                  <p className="text-center font-display text-7xl font-black leading-none text-[#e8e8e8] md:text-9xl">
                    {total}
                  </p>
                </div>

                <div>
                  <div className="h-5 overflow-hidden rounded-sm border border-white/20 bg-[#111]">
                    <div className="h-full bg-[#d10c0c] transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {games.map((game) => {
                    const wonByTeam = game.winnerTeamId === team.id;
                    return (
                      <div
                        key={`${team.id}_${game.id}`}
                        className={cn(
                          "flex h-12 items-center justify-center rounded border text-xl font-black md:h-14",
                          wonByTeam
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-white/20 bg-[#111] text-transparent"
                        )}
                      >
                        {wonByTeam ? game.gameNumber : ""}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
