import type { GameEntity, ScoreEntity, TeamEntity } from "@/types/domain";

export function scoreForTeamInGame(game: GameEntity, teamId: string): number {
  if (game.manualPoints && typeof game.manualPoints[teamId] === "number") {
    return game.manualPoints[teamId] ?? 0;
  }

  if (game.winnerTeamId === teamId) {
    return game.pointValue;
  }

  return 0;
}

export function recomputeScores(
  games: GameEntity[],
  teams: TeamEntity[],
  eventId: string,
  previousScores?: ScoreEntity[]
): ScoreEntity[] {
  const previousByTeam = new Map(previousScores?.map((score) => [score.teamId, score]));
  const updatedAt = new Date().toISOString();

  return teams
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((team) => {
      const totalPoints = games.reduce((acc, game) => acc + scoreForTeamInGame(game, team.id), 0);
      return {
        id: previousByTeam.get(team.id)?.id ?? `score_${team.id}`,
        eventId,
        teamId: team.id,
        totalPoints,
        updatedAt
      };
    });
}
