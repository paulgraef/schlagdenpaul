import { createId } from "@/lib/utils";
import type { BuzzerEventEntity, BuzzerState, EventSnapshot } from "@/types/domain";

export interface LocalBuzzerClaimInput {
  teamId: string;
  teamMemberId?: string | null;
  gameId?: string | null;
}

export interface LocalBuzzerClaimResult {
  granted: boolean;
  state: BuzzerState;
  event?: BuzzerEventEntity;
}

export function claimLocalBuzzer(
  snapshot: EventSnapshot,
  input: LocalBuzzerClaimInput
): LocalBuzzerClaimResult {
  const now = new Date().toISOString();
  const event: BuzzerEventEntity = {
    id: createId("buzz"),
    eventId: snapshot.event.id,
    gameId: input.gameId ?? null,
    teamId: input.teamId,
    teamMemberId: input.teamMemberId ?? null,
    pressedAt: now,
    isWinner: false
  };

  return {
    granted: true,
    state: {
      locked: false,
      winnerTeamId: input.teamId,
      winnerTeamMemberId: input.teamMemberId ?? null,
      pressedAt: now
    },
    event
  };
}
