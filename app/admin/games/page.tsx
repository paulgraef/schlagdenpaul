"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useEventStore } from "@/hooks/use-event-store";
import { GameTile } from "@/components/game/game-tile";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminGamesPage() {
  const snapshot = useEventStore((state) => state.snapshot);

  const completedGames = useMemo(
    () => snapshot.games.filter((game) => game.status === "completed").length,
    [snapshot.games]
  );
  const progress = Math.round((completedGames / snapshot.games.length) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>15-Spiele-Matrix</CardTitle>
          <CardDescription>
            Punkte steigen automatisch mit der Spielnummer. Fortschritt: {completedGames}/{snapshot.games.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} />
        </CardContent>
      </Card>

      <motion.div layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {snapshot.games
          .slice()
          .sort((a, b) => a.gameNumber - b.gameNumber)
          .map((game) => (
            <GameTile
              key={game.id}
              game={game}
              winner={snapshot.teams.find((team) => team.id === game.winnerTeamId)}
              highlight={game.status === "active"}
            />
          ))}
      </motion.div>
    </div>
  );
}
