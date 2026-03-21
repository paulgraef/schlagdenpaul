export type RealtimeAction =
  | "SET_CURRENT_GAME"
  | "SET_GAME_STATUS"
  | "SET_GAME_WINNER"
  | "SET_MANUAL_POINTS"
  | "SET_GAME_METADATA"
  | "SELECT_MEDIA_GAME"
  | "SET_MEDIA_INDEX"
  | "TOGGLE_REVEAL"
  | "START_MEDIA_ANIMATION"
  | "RESET_BUZZER"
  | "PRESS_BUZZER"
  | "SET_TIMER"
  | "SET_MEMORY"
  | "SET_TEAM_NAME"
  | "SET_SNAPSHOT";

export interface RealtimePatch<TPayload = unknown> {
  id: string;
  action: RealtimeAction;
  payload: TPayload;
  at: string;
}
