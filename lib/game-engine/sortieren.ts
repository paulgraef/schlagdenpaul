import { SORTIEREN_ROUNDS } from "@/config/sortieren-rounds";

export interface SortierenState {
  roundIndex: number;
  placements: string[];
  selectedItem: string | null;
  roundResolved: boolean;
  roundCorrect: boolean | null;
  revealSolution: boolean;
  points: Record<string, number>;
  overrides: Record<string, string[]>;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return {};
}

export function getSortierenState(metadata: Record<string, unknown>, teamIds: string[]): SortierenState {
  const raw = asRecord(metadata.sortieren);
  const pointsRaw = asRecord(raw.points);
  const points = Object.fromEntries(
    teamIds.map((teamId) => {
      const value = pointsRaw[teamId];
      const safe = typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      return [teamId, safe];
    })
  );

  const rawRoundIndex = raw.roundIndex;
  const roundIndex =
    typeof rawRoundIndex === "number" && Number.isFinite(rawRoundIndex)
      ? Math.max(0, Math.min(SORTIEREN_ROUNDS.length - 1, Math.floor(rawRoundIndex)))
      : 0;

  const placements = Array.isArray(raw.placements)
    ? raw.placements.filter((entry): entry is string => typeof entry === "string").slice(0, 8)
    : [];

  const selectedItem = typeof raw.selectedItem === "string" ? raw.selectedItem : null;
  const roundResolved = Boolean(raw.roundResolved);
  const roundCorrect = typeof raw.roundCorrect === "boolean" ? raw.roundCorrect : null;
  const revealSolution = Boolean(raw.revealSolution);

  const overridesRaw = asRecord(raw.overrides);
  const overrides = Object.fromEntries(
    Object.entries(overridesRaw).map(([roundId, value]) => {
      const list = Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string").slice(0, 8) : [];
      return [roundId, list];
    })
  ) as Record<string, string[]>;

  return {
    roundIndex,
    placements,
    selectedItem,
    roundResolved,
    roundCorrect,
    revealSolution,
    points,
    overrides
  };
}

export function getSortierenRoundOrder(roundId: string, overrides: Record<string, string[]>): string[] {
  const round = SORTIEREN_ROUNDS.find((entry) => entry.id === roundId);
  if (!round) {
    return [];
  }

  const override = overrides[roundId] ?? [];
  if (override.length !== round.correctOrder.length) {
    return round.correctOrder;
  }

  const sameSet =
    override.every((entry) => round.correctOrder.includes(entry)) &&
    round.correctOrder.every((entry) => override.includes(entry));

  return sameSet ? override : round.correctOrder;
}
