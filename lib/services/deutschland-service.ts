import type { DeutschlandRoundEntity } from "@/types/domain";

export interface DeutschlandGuessPayload {
  roundId: string;
  teamId: string;
  guessedLat: number;
  guessedLng: number;
}

export interface DeutschlandRoundResult {
  distanceKm: number;
  points: number;
}

export async function listDeutschlandRounds(eventId: string): Promise<DeutschlandRoundEntity[]> {
  void eventId;
  return [];
}

export async function submitDeutschlandGuess(
  payload: DeutschlandGuessPayload
): Promise<DeutschlandRoundResult> {
  void payload;
  return {
    distanceKm: 0,
    points: 0
  };
}
