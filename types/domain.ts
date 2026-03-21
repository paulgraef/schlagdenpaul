export type EventStatus = "draft" | "live" | "finished";
export type GameStatus = "planned" | "active" | "completed";
export type GameType =
  | "standard"
  | "media_laenderumrisse"
  | "media_flaggen"
  | "media_wer_luegt"
  | "media_deutschland"
  | "media_sortieren"
  | "memory"
  | "deutschland";

export interface EventEntity {
  id: string;
  name: string;
  slug: string;
  status: EventStatus;
  createdAt: string;
}

export interface TeamEntity {
  id: string;
  eventId: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
}

export interface TeamMemberEntity {
  id: string;
  teamId: string;
  name: string;
  nickname?: string | null;
  createdAt: string;
}

export interface GameEntity {
  id: string;
  eventId: string;
  title: string;
  slug: string;
  gameNumber: number;
  pointValue: number;
  type: GameType;
  status: GameStatus;
  winnerTeamId?: string | null;
  manualPoints?: Record<string, number> | null;
  createdAt: string;
}

export interface GameStateEntity {
  id: string;
  gameId: string;
  currentStep: number;
  revealState: boolean;
  timerState: {
    running: boolean;
    startedAt: string | null;
    elapsedMs: number;
  };
  metadata: Record<string, unknown>;
  updatedAt: string;
}

export interface ScoreEntity {
  id: string;
  eventId: string;
  teamId: string;
  totalPoints: number;
  updatedAt: string;
}

export interface BuzzerEventEntity {
  id: string;
  eventId: string;
  gameId?: string | null;
  teamId: string;
  teamMemberId?: string | null;
  pressedAt: string;
  isWinner: boolean;
}

export interface MediaItemEntity {
  id: string;
  gameId: string;
  title: string;
  type: "image" | "text" | "mixed";
  assetUrl: string;
  sortOrder: number;
  metadata: Record<string, unknown>;
}

export interface SoundItemEntity {
  id: string;
  eventId?: string | null;
  title: string;
  category:
    | "Intro"
    | "Spannung"
    | "Konzentration"
    | "Buzzer"
    | "Erfolg"
    | "Fehler";
  assetUrl: string;
  sortOrder: number;
}

export interface MemorySessionEntity {
  id: string;
  eventId: string;
  gameId?: string | null;
  status: "idle" | "running" | "finished";
  boardState: Record<string, unknown>;
  turnTeamId?: string | null;
  updatedAt: string;
}

export interface DeutschlandRoundEntity {
  id: string;
  eventId: string;
  title: string;
  cityName: string;
  correctLat?: number | null;
  correctLng?: number | null;
  metadata: Record<string, unknown>;
}

export interface BuzzerState {
  locked: boolean;
  winnerTeamId: string | null;
  winnerTeamMemberId: string | null;
  pressedAt: string | null;
}

export interface MediaControlState {
  gameId: string | null;
  currentIndex: number;
  reveal: boolean;
  animationKey: number;
}

export interface EventSnapshot {
  event: EventEntity;
  teams: TeamEntity[];
  teamMembers: TeamMemberEntity[];
  games: GameEntity[];
  gameStates: Record<string, GameStateEntity>;
  scores: ScoreEntity[];
  mediaItems: MediaItemEntity[];
  soundItems: SoundItemEntity[];
  buzzerEvents: BuzzerEventEntity[];
  memorySession: MemorySessionEntity;
  deutschlandRounds: DeutschlandRoundEntity[];
  buzzerState: BuzzerState;
  mediaControl: MediaControlState;
}

export interface MemoryCardModel {
  id: string;
  pairId: string;
  label: string;
  icon: string;
  matched: boolean;
  faceUp: boolean;
}
