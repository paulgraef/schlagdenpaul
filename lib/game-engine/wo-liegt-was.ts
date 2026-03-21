export interface WoLiegtWasPoint {
  x: number;
  y: number;
}

export interface WoLiegtWasLocation {
  id: string;
  name: string;
  target: WoLiegtWasPoint;
}

export interface WoLiegtWasTeamGuess extends WoLiegtWasPoint {
  placedAt: string;
}

export interface WoLiegtWasState {
  locationIndex: number;
  reveal: boolean;
  guesses: Record<string, WoLiegtWasTeamGuess | null>;
  points: Record<string, number>;
  targets: Record<string, WoLiegtWasPoint>;
  roundAwarded: boolean;
}

export const WO_LIEGT_WAS_LOCATIONS: WoLiegtWasLocation[] = [
  { id: "berlin", name: "Berlin", target: { x: 66, y: 36 } },
  { id: "wuerzburg", name: "Würzburg", target: { x: 53, y: 54 } },
  { id: "muenchen", name: "München", target: { x: 60, y: 77 } },
  { id: "kiel", name: "Kiel", target: { x: 47, y: 12 } },
  { id: "dortmund", name: "Dortmund", target: { x: 34, y: 43 } },
  { id: "stuttgart", name: "Stuttgart", target: { x: 42, y: 66 } },
  { id: "bacharach", name: "Bacharach", target: { x: 33, y: 56 } },
  { id: "cottbus", name: "Cottbus", target: { x: 78, y: 43 } },
  { id: "hannover", name: "Hannover", target: { x: 46, y: 33 } },
  { id: "zwickau", name: "Zwickau", target: { x: 62, y: 58 } }
];

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function normalizePoint(point: WoLiegtWasPoint): WoLiegtWasPoint {
  return {
    x: clampPercent(point.x),
    y: clampPercent(point.y)
  };
}

export function distanceBetweenPoints(a: WoLiegtWasPoint, b: WoLiegtWasPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function createInitialWoLiegtWasState(teamIds: string[]): WoLiegtWasState {
  const guesses = Object.fromEntries(teamIds.map((teamId) => [teamId, null]));
  const points = Object.fromEntries(teamIds.map((teamId) => [teamId, 0]));
  return {
    locationIndex: 0,
    reveal: false,
    guesses,
    points,
    targets: {},
    roundAwarded: false
  };
}

function asRecord(input: unknown): Record<string, unknown> {
  if (typeof input === "object" && input !== null) {
    return input as Record<string, unknown>;
  }
  return {};
}

export function getWoLiegtWasState(
  metadata: Record<string, unknown>,
  teamIds: string[]
): WoLiegtWasState {
  const fallback = createInitialWoLiegtWasState(teamIds);
  const raw = asRecord(metadata.woLiegtWas);

  const rawLocationIndex = raw.locationIndex;
  const locationIndex =
    typeof rawLocationIndex === "number" && Number.isFinite(rawLocationIndex)
      ? Math.max(0, Math.min(WO_LIEGT_WAS_LOCATIONS.length - 1, Math.floor(rawLocationIndex)))
      : fallback.locationIndex;

  const reveal = typeof raw.reveal === "boolean" ? raw.reveal : fallback.reveal;
  const roundAwarded = typeof raw.roundAwarded === "boolean" ? raw.roundAwarded : fallback.roundAwarded;

  const rawGuesses = asRecord(raw.guesses);
  const guesses: WoLiegtWasState["guesses"] = {};
  for (const teamId of teamIds) {
    const entry = asRecord(rawGuesses[teamId]);
    const x = entry.x;
    const y = entry.y;
    if (typeof x === "number" && Number.isFinite(x) && typeof y === "number" && Number.isFinite(y)) {
      guesses[teamId] = {
        ...normalizePoint({ x, y }),
        placedAt: typeof entry.placedAt === "string" ? entry.placedAt : new Date().toISOString()
      };
    } else {
      guesses[teamId] = null;
    }
  }

  const rawPoints = asRecord(raw.points);
  const points: WoLiegtWasState["points"] = {};
  for (const teamId of teamIds) {
    const value = rawPoints[teamId];
    points[teamId] = typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  }

  const rawTargets = asRecord(raw.targets);
  const targets: WoLiegtWasState["targets"] = {};
  for (const location of WO_LIEGT_WAS_LOCATIONS) {
    const entry = asRecord(rawTargets[location.id]);
    const x = entry.x;
    const y = entry.y;
    if (typeof x === "number" && Number.isFinite(x) && typeof y === "number" && Number.isFinite(y)) {
      targets[location.id] = normalizePoint({ x, y });
    }
  }

  return {
    locationIndex,
    reveal,
    guesses,
    points,
    targets,
    roundAwarded
  };
}

export function getLocationTarget(state: WoLiegtWasState, locationIndex: number): WoLiegtWasPoint {
  const location = WO_LIEGT_WAS_LOCATIONS[locationIndex] ?? WO_LIEGT_WAS_LOCATIONS[0];
  return state.targets[location.id] ?? location.target;
}

export function getRoundDistances(
  state: WoLiegtWasState
): Record<string, number> {
  const target = getLocationTarget(state, state.locationIndex);

  const distances: Record<string, number> = {};
  for (const [teamId, guess] of Object.entries(state.guesses)) {
    if (!guess) {
      continue;
    }
    distances[teamId] = distanceBetweenPoints(guess, target);
  }
  return distances;
}

export function getRoundWinnerTeamId(state: WoLiegtWasState): string | null {
  const distances = getRoundDistances(state);
  const entries = Object.entries(distances);
  if (entries.length < 2) {
    return null;
  }

  const sorted = entries.sort((a, b) => a[1] - b[1]);
  if (!sorted[0] || !sorted[1]) {
    return null;
  }

  const [winnerTeamId, winnerDistance] = sorted[0];
  const [, secondDistance] = sorted[1];
  if (Math.abs(winnerDistance - secondDistance) < 1e-9) {
    return null;
  }

  return winnerTeamId;
}
