"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { useEventStore } from "@/hooks/use-event-store";
import { formatPoints } from "@/lib/utils";
import { GameStatusBadge } from "@/components/game/game-status-badge";
import { TeamBadge } from "@/components/game/team-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminGameDetailClientProps {
  gameId: string;
}

export function AdminGameDetailClient({ gameId }: AdminGameDetailClientProps) {
  const router = useRouter();
  const { snapshot, setCurrentGame, setGameStatus, setGameWinner } = useEventStore((state) => state);

  const game = snapshot.games.find((entry) => entry.id === gameId);

  const winner = useMemo(
    () => snapshot.teams.find((team) => team.id === game?.winnerTeamId),
    [snapshot.teams, game?.winnerTeamId]
  );

  if (!game) {
    return (
      <Card>
        <CardContent className="p-8">Spiel nicht gefunden.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push("/admin/games")}>
        <ArrowLeft className="mr-2 h-4 w-4" />Zurück zu allen Spielen
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            Spiel {game.gameNumber}: {game.title}
          </CardTitle>
          <CardDescription>{formatPoints(game.pointValue)} | Typ: {game.type}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <GameStatusBadge status={game.status} />
            {winner ? <TeamBadge team={winner} /> : <p className="text-sm text-muted-foreground">Noch kein Sieger</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCurrentGame(game.id)}>Als aktuelles Spiel setzen</Button>
            <Button variant="outline" onClick={() => setGameStatus(game.id, "planned")}>Geplant</Button>
            <Button variant="outline" onClick={() => setGameStatus(game.id, "active")}>Aktiv</Button>
            <Button variant="outline" onClick={() => setGameStatus(game.id, "completed")}>Abgeschlossen</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gewinner setzen</CardTitle>
          <CardDescription>
            Standard: Gewinner bekommt automatisch {game.pointValue} Punkte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {snapshot.teams.map((team) => (
            <Button key={team.id} className="w-full justify-start" variant="secondary" onClick={() => setGameWinner(game.id, team.id)}>
              <Trophy className="mr-2 h-4 w-4" />{team.name} als Gewinner
            </Button>
          ))}

          <Button variant="outline" className="w-full" onClick={() => setGameWinner(game.id, null)}>
            Gewinner entfernen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

