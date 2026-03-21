"use client";

import { useMemo } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { WoLiegtWasAdminPanel } from "@/components/game/wo-liegt-was-admin-panel";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminWoLiegtWasPage() {
  const { snapshot, setGameMetadata, setGameWinner } = useEventStore((state) => state);

  const teams = useMemo(
    () => snapshot.teams.slice().sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2),
    [snapshot.teams]
  );

  const game = snapshot.games.find((entry) => entry.slug === "wo-liegt-was") ?? null;
  const gameState = game ? snapshot.gameStates[game.id] : null;

  if (!game || !gameState) {
    return (
      <Card>
        <CardContent className="p-6">Spiel „Wo liegt was?“ wurde nicht gefunden.</CardContent>
      </Card>
    );
  }

  return (
    <WoLiegtWasAdminPanel
      game={game}
      gameState={gameState}
      teams={teams}
      onUpdateMetadata={setGameMetadata}
      onSetWinner={setGameWinner}
    />
  );
}

