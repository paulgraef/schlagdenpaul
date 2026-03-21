"use client";

import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { useEventStore } from "@/hooks/use-event-store";
import { PublicStage } from "@/components/public/public-stage";
import { WoLiegtWasStage } from "@/components/public/wo-liegt-was-stage";

export default function PublicCurrentPage() {
  const snapshot = useEventStore((state) => state.snapshot);

  const currentGame = useMemo(
    () => snapshot.games.find((game) => game.id === snapshot.mediaControl.gameId) ?? snapshot.games.find((game) => game.status === "active") ?? snapshot.games[0],
    [snapshot.games, snapshot.mediaControl.gameId]
  );

  const items = snapshot.mediaItems
    .filter((item) => item.gameId === currentGame?.id)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const currentItem = items[snapshot.mediaControl.currentIndex];
  const winnerTeam = snapshot.teams.find((team) => team.id === snapshot.buzzerState.winnerTeamId);


  const isWoLiegtWas = currentGame?.slug === "wo-liegt-was";

  return (
    <main className={`w-full px-3 py-4 md:px-6 md:py-6 ${isWoLiegtWas ? "h-screen overflow-hidden" : "min-h-screen"}`}>
      <div className="w-full space-y-4">
        {isWoLiegtWas ? (
          <WoLiegtWasStage
            gameTitle={`Spiel ${currentGame.gameNumber}: ${currentGame.title}`}
            gameState={snapshot.gameStates[currentGame.id]}
            teams={snapshot.teams.slice().sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2)}
          />
        ) : (
          <PublicStage
            gameTitle={`Spiel ${currentGame?.gameNumber}: ${currentGame?.title}`}
            gameType={currentGame?.type}
            item={currentItem}
            reveal={snapshot.mediaControl.reveal}
            animationKey={snapshot.mediaControl.animationKey ?? 0}
          />
        )}

        {!isWoLiegtWas ? <div className="space-y-4">
          {winnerTeam ? (
            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: `${winnerTeam.color}77`, backgroundColor: `${winnerTeam.color}1f` }}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Schnellstes Team</p>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold" style={{ color: winnerTeam.color }}>
                <Trophy className="h-5 w-5" />
                {winnerTeam.name}
              </p>
            </div>
          ) : null}

        </div> : null}
      </div>
    </main>
  );
}
