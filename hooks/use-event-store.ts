"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createDemoSnapshot } from "@/config/demo-data";
import { claimLocalBuzzer } from "@/lib/game-engine/buzzer";
import { createMemoryBoard } from "@/lib/game-engine/memory";
import { recomputeScores } from "@/lib/game-engine/scoring";
import { makePatch, emitRealtimePatch } from "@/lib/realtime/realtime";
import { getEventSlug } from "@/lib/supabase/env";
import type { EventSnapshot, MemoryCardModel } from "@/types/domain";
import type { RealtimePatch } from "@/types/realtime";

interface MemoryRuntime {
  cards: MemoryCardModel[];
  selectedIds: string[];
  moves: number;
  currentTeamId: string | null;
  teamPairCounts: Record<string, number>;
  finishedAt: string | null;
  winnerTeamId: string | null;
}

interface EventStore {
  snapshot: EventSnapshot;
  eventSlug: string;
  memory: MemoryRuntime;
  replaceSnapshot: (snapshot: EventSnapshot, options?: { broadcast?: boolean }) => void;
  setCurrentGame: (gameId: string, options?: { broadcast?: boolean }) => void;
  setGameStatus: (
    gameId: string,
    status: "planned" | "active" | "completed",
    options?: { broadcast?: boolean }
  ) => void;
  setGameWinner: (gameId: string, winnerTeamId: string | null, options?: { broadcast?: boolean }) => void;
  setManualPoints: (
    gameId: string,
    teamId: string,
    points: number | null,
    options?: { broadcast?: boolean }
  ) => void;
  setGameMetadata: (
    gameId: string,
    metadataPatch: Record<string, unknown>,
    options?: { broadcast?: boolean }
  ) => void;
  setTeamName: (teamId: string, name: string, options?: { broadcast?: boolean }) => void;
  selectMediaGame: (gameId: string, options?: { broadcast?: boolean }) => void;
  setMediaIndex: (index: number, options?: { broadcast?: boolean }) => void;
  nextMediaItem: (options?: { broadcast?: boolean }) => void;
  previousMediaItem: (options?: { broadcast?: boolean }) => void;
  toggleReveal: (value?: boolean, options?: { broadcast?: boolean }) => void;
  startMediaAnimation: (options?: { broadcast?: boolean }) => void;
  startTimer: (options?: { broadcast?: boolean }) => void;
  stopTimer: (options?: { broadcast?: boolean }) => void;
  resetTimer: (options?: { broadcast?: boolean }) => void;
  pressBuzzer: (teamId: string, teamMemberId?: string | null, options?: { broadcast?: boolean }) => Promise<boolean>;
  resetBuzzer: (options?: { broadcast?: boolean }) => void;
  resetAll: () => void;
  initializeMemory: () => void;
  flipMemoryCard: (cardId: string) => void;
  resetMemory: () => void;
  applyRealtimePatch: (patch: RealtimePatch) => void;
}

const initialSnapshot = createDemoSnapshot();
let memoryResolveTimeout: ReturnType<typeof setTimeout> | null = null;

function getMemoryTeamIds(snapshot: EventSnapshot): string[] {
  return snapshot.teams
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 2)
    .map((team) => team.id);
}

function nextMemory(teamIds: string[] = []): MemoryRuntime {
  return {
    cards: createMemoryBoard(),
    selectedIds: [],
    moves: 0,
    currentTeamId: teamIds[0] ?? null,
    teamPairCounts: Object.fromEntries(teamIds.map((teamId) => [teamId, 0])),
    finishedAt: null,
    winnerTeamId: null
  };
}

function normalizeMemoryRuntime(input: unknown, snapshot: EventSnapshot): MemoryRuntime {
  const fallback = nextMemory(getMemoryTeamIds(snapshot));
  if (!input || typeof input !== "object") {
    return fallback;
  }

  const raw = input as Partial<MemoryRuntime>;
  const cards = Array.isArray(raw.cards)
    ? raw.cards.filter((card): card is MemoryCardModel => {
        if (!card || typeof card !== "object") {
          return false;
        }
        const entry = card as Partial<MemoryCardModel>;
        return (
          typeof entry.id === "string" &&
          typeof entry.pairId === "string" &&
          typeof entry.label === "string" &&
          typeof entry.icon === "string" &&
          entry.icon.startsWith("/media/memory/") &&
          typeof entry.matched === "boolean" &&
          typeof entry.faceUp === "boolean" &&
          (typeof entry.matchedByTeamId === "string" || entry.matchedByTeamId === null || typeof entry.matchedByTeamId === "undefined")
        );
      })
    : [];
  const safeCards = (cards.length ? cards : fallback.cards).map((card) => ({
    ...card,
    matchedByTeamId: typeof card.matchedByTeamId === "string" ? card.matchedByTeamId : null
  }));

  const selectedIds = Array.isArray(raw.selectedIds)
    ? raw.selectedIds.filter((value): value is string => typeof value === "string").slice(0, 2)
    : [];

  const moves = typeof raw.moves === "number" && Number.isFinite(raw.moves) ? raw.moves : 0;
  const finishedAt = typeof raw.finishedAt === "string" ? raw.finishedAt : null;
  const winnerTeamId = typeof raw.winnerTeamId === "string" ? raw.winnerTeamId : null;

  const teamIds = getMemoryTeamIds(snapshot);
  const rawTeamPairCounts = (raw.teamPairCounts ?? {}) as Record<string, unknown>;
  const teamPairCounts = Object.fromEntries(
    teamIds.map((teamId) => {
      const value = rawTeamPairCounts[teamId];
      const count = typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      return [teamId, count];
    })
  );

  const currentTeamId =
    typeof raw.currentTeamId === "string" && teamIds.includes(raw.currentTeamId)
      ? raw.currentTeamId
      : (teamIds[0] ?? null);

  return {
    cards: safeCards,
    selectedIds,
    moves,
    currentTeamId,
    teamPairCounts,
    finishedAt,
    winnerTeamId
  };
}

function recalc(snapshot: EventSnapshot): EventSnapshot {
  const gameLayoutByNumber: Record<number, { title: string; slug: string }> = {
    2: { title: "Golf", slug: "golf" },
    6: { title: "Spaghetti", slug: "spaghetti" },
    9: { title: "Geoguesser", slug: "geoguesser" },
    10: { title: "Memory", slug: "memory" },
    11: { title: "Wettessen", slug: "wettessen" },
    12: { title: "Münze", slug: "muenze" },
    13: { title: "Sortieren", slug: "sortieren" },
    14: { title: "Luft anhalten", slug: "luft-anhalten" },
    15: { title: "501", slug: "501" }
  };

  const normalizedGames = snapshot.games.map((game) => {
    const override = gameLayoutByNumber[game.gameNumber];
    if (!override) {
      return game;
    }
    return {
      ...game,
      title: override.title,
      slug: override.slug
    };
  });

  return {
    ...snapshot,
    games: normalizedGames,
    scores: recomputeScores(normalizedGames, snapshot.teams, snapshot.event.id, snapshot.scores)
  };
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      snapshot: recalc(initialSnapshot),
      eventSlug: getEventSlug(),
      memory: nextMemory(getMemoryTeamIds(initialSnapshot)),

      replaceSnapshot: (snapshot, options) => {
        const next = recalc(snapshot);
        set({ snapshot: next, eventSlug: snapshot.event.slug });
        if (options?.broadcast ?? true) {
          emitRealtimePatch(
            snapshot.event.slug,
            makePatch("SET_SNAPSHOT", {
              snapshot: next
            })
          );
        }
      },

      setCurrentGame: (gameId, options) => {
        set((state) => {
          const games: EventSnapshot["games"] = state.snapshot.games.map((game): EventSnapshot["games"][number] => {
            if (game.id === gameId) {
              return {
                ...game,
                status: (game.status === "completed" ? "completed" : "active") as EventSnapshot["games"][number]["status"]
              };
            }
            if (game.status === "active") {
              return {
                ...game,
                status: (game.winnerTeamId ? "completed" : "planned") as EventSnapshot["games"][number]["status"]
              };
            }
            return game;
          });

          return {
            snapshot: {
              ...state.snapshot,
              games,
              mediaControl: {
                ...state.snapshot.mediaControl,
                gameId
              }
            }
          };
        });

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SET_CURRENT_GAME", { gameId }));
        }
      },

      setGameStatus: (gameId, status, options) => {
        set((state) => ({
          snapshot: {
            ...state.snapshot,
            games: state.snapshot.games.map((game) => (game.id === gameId ? { ...game, status } : game))
          }
        }));

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SET_GAME_STATUS", { gameId, status }));
        }
      },

      setGameWinner: (gameId, winnerTeamId, options) => {
        set((state) => {
          const games = state.snapshot.games.map((game) =>
            game.id === gameId
              ? {
                  ...game,
                  winnerTeamId,
                  status: winnerTeamId ? "completed" : game.status,
                  manualPoints: null
                }
              : game
          );

          const next = recalc({
            ...state.snapshot,
            games
          });

          return {
            snapshot: next
          };
        });

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SET_GAME_WINNER", { gameId, winnerTeamId }));
        }
      },

      setManualPoints: (gameId, teamId, points, options) => {
        set((state) => {
          const games = state.snapshot.games.map((game) => {
            if (game.id !== gameId) {
              return game;
            }

            const manualPoints = {
              ...(game.manualPoints ?? {})
            };

            if (points === null) {
              delete manualPoints[teamId];
            } else {
              manualPoints[teamId] = points;
            }

            return {
              ...game,
              manualPoints: Object.keys(manualPoints).length ? manualPoints : null
            };
          });

          return {
            snapshot: recalc({
              ...state.snapshot,
              games
            })
          };
        });

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SET_MANUAL_POINTS", { gameId, teamId, points }));
        }
      },

      setGameMetadata: (gameId, metadataPatch, options) => {
        set((state) => {
          const gameState = state.snapshot.gameStates[gameId];
          if (!gameState) {
            return state;
          }

          const now = new Date().toISOString();
          return {
            snapshot: {
              ...state.snapshot,
              gameStates: {
                ...state.snapshot.gameStates,
                [gameId]: {
                  ...gameState,
                  metadata: {
                    ...gameState.metadata,
                    ...metadataPatch
                  },
                  updatedAt: now
                }
              }
            }
          };
        });

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SET_GAME_METADATA", { gameId, metadataPatch }));
        }
      },

      setTeamName: (teamId, name, options) => {
        const nextName = name.trim();
        if (!nextName) {
          return;
        }

        set((state) => ({
          snapshot: {
            ...state.snapshot,
            teams: state.snapshot.teams.map((team) =>
              team.id === teamId
                ? {
                    ...team,
                    name: nextName
                  }
                : team
            )
          }
        }));

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SET_TEAM_NAME", { teamId, name: nextName }));
        }
      },

      selectMediaGame: (gameId, options) => {
        set((state) => ({
          snapshot: {
            ...state.snapshot,
            mediaControl: {
              gameId,
              currentIndex: 0,
              reveal: false,
              animationKey: 0
            }
          }
        }));

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SELECT_MEDIA_GAME", { gameId }));
        }
      },

      setMediaIndex: (index, options) => {
        set((state) => ({
          snapshot: {
            ...state.snapshot,
            mediaControl: {
              ...state.snapshot.mediaControl,
              currentIndex: Math.max(0, index),
              animationKey: 0
            }
          }
        }));

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SET_MEDIA_INDEX", { index }));
        }
      },

      nextMediaItem: (options) => {
        const state = get();
        const gameId = state.snapshot.mediaControl.gameId;
        if (!gameId) {
          return;
        }

        const total = state.snapshot.mediaItems.filter((item) => item.gameId === gameId).length;
        const nextIndex = Math.min(state.snapshot.mediaControl.currentIndex + 1, Math.max(0, total - 1));
        state.setMediaIndex(nextIndex, options);
      },

      previousMediaItem: (options) => {
        const state = get();
        state.setMediaIndex(Math.max(0, state.snapshot.mediaControl.currentIndex - 1), options);
      },

      toggleReveal: (value, options) => {
        set((state) => ({
          snapshot: {
            ...state.snapshot,
            mediaControl: {
              ...state.snapshot.mediaControl,
              reveal: value ?? !state.snapshot.mediaControl.reveal,
              animationKey: (value ?? !state.snapshot.mediaControl.reveal) ? state.snapshot.mediaControl.animationKey : 0
            }
          }
        }));

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("TOGGLE_REVEAL", { value }));
        }
      },

      startMediaAnimation: (options) => {
        set((state) => ({
          snapshot: {
            ...state.snapshot,
            mediaControl: {
              ...state.snapshot.mediaControl,
              reveal: true,
              animationKey: (state.snapshot.mediaControl.animationKey ?? 0) + 1
            }
          }
        }));

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("START_MEDIA_ANIMATION", {}));
        }
      },

      startTimer: (options) => {
        set((state) => {
          const activeGame = state.snapshot.games.find((game) => game.status === "active") ?? state.snapshot.games[0];
          const gameState = state.snapshot.gameStates[activeGame.id];
          const now = new Date().toISOString();

          return {
            snapshot: {
              ...state.snapshot,
              gameStates: {
                ...state.snapshot.gameStates,
                [activeGame.id]: {
                  ...gameState,
                  timerState: {
                    ...gameState.timerState,
                    running: true,
                    startedAt: now
                  },
                  updatedAt: now
                }
              }
            }
          };
        });

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SET_TIMER", { mode: "start" }));
        }
      },

      stopTimer: (options) => {
        set((state) => {
          const activeGame = state.snapshot.games.find((game) => game.status === "active") ?? state.snapshot.games[0];
          const gameState = state.snapshot.gameStates[activeGame.id];
          if (!gameState.timerState.running || !gameState.timerState.startedAt) {
            return state;
          }

          const startedAt = new Date(gameState.timerState.startedAt).getTime();
          const elapsed = Date.now() - startedAt;
          const now = new Date().toISOString();

          return {
            snapshot: {
              ...state.snapshot,
              gameStates: {
                ...state.snapshot.gameStates,
                [activeGame.id]: {
                  ...gameState,
                  timerState: {
                    running: false,
                    startedAt: null,
                    elapsedMs: gameState.timerState.elapsedMs + elapsed
                  },
                  updatedAt: now
                }
              }
            }
          };
        });

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SET_TIMER", { mode: "stop" }));
        }
      },

      resetTimer: (options) => {
        set((state) => {
          const activeGame = state.snapshot.games.find((game) => game.status === "active") ?? state.snapshot.games[0];
          const gameState = state.snapshot.gameStates[activeGame.id];
          const now = new Date().toISOString();

          return {
            snapshot: {
              ...state.snapshot,
              gameStates: {
                ...state.snapshot.gameStates,
                [activeGame.id]: {
                  ...gameState,
                  timerState: {
                    running: false,
                    startedAt: null,
                    elapsedMs: 0
                  },
                  updatedAt: now
                }
              }
            }
          };
        });

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("SET_TIMER", { mode: "reset" }));
        }
      },

      pressBuzzer: async (teamId, teamMemberId, options) => {
        const state = get();
        const activeGame = state.snapshot.games.find((game) => game.status === "active");

        const claim = claimLocalBuzzer(state.snapshot, {
          teamId,
          teamMemberId,
          gameId: activeGame?.id ?? null
        });

        if (!claim.granted || !claim.event) {
          return false;
        }

        set((current) => ({
          snapshot: {
            ...current.snapshot,
            buzzerState: claim.state,
            buzzerEvents: [...current.snapshot.buzzerEvents, claim.event as NonNullable<typeof claim.event>]
          }
        }));

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("PRESS_BUZZER", { teamId, teamMemberId }));
        }

        return true;
      },

      resetBuzzer: (options) => {
        set((state) => ({
          snapshot: {
            ...state.snapshot,
            buzzerEvents: [],
            buzzerState: {
              locked: false,
              winnerTeamId: null,
              winnerTeamMemberId: null,
              pressedAt: null
            }
          }
        }));

        if (options?.broadcast ?? true) {
          emitRealtimePatch(get().eventSlug, makePatch("RESET_BUZZER", {}));
        }
      },

      initializeMemory: () => {
        if (memoryResolveTimeout) {
          clearTimeout(memoryResolveTimeout);
          memoryResolveTimeout = null;
        }
        set((state) => ({
          memory: nextMemory(getMemoryTeamIds(state.snapshot))
        }));
      },

      flipMemoryCard: (cardId) => {
        set((state) => {
          const card = state.memory.cards.find((entry) => entry.id === cardId);
          if (!card || card.matched || card.faceUp) {
            return state;
          }
          if (state.memory.selectedIds.length >= 2) {
            return state;
          }

          const cards = state.memory.cards.map((entry) =>
            entry.id === cardId ? { ...entry, faceUp: true } : entry
          );
          const selectedIds = [...state.memory.selectedIds, cardId];
          const currentTeamId = state.memory.currentTeamId;
          const orderedTeamIds = getMemoryTeamIds(state.snapshot);
          const fallbackTeamId = orderedTeamIds[0] ?? null;
          const activeTeamId = currentTeamId ?? fallbackTeamId;

          if (selectedIds.length === 2) {
            const selectedCards = cards.filter((entry) => selectedIds.includes(entry.id));
            const matched = selectedCards[0].pairId === selectedCards[1].pairId;
            const teamPairCounts = { ...state.memory.teamPairCounts };
            if (matched) {
              const resolvedCards = cards.map((entry) => {
                if (!selectedIds.includes(entry.id)) {
                  return entry;
                }
                return {
                  ...entry,
                  matched: true,
                  faceUp: true,
                  matchedByTeamId: activeTeamId
                };
              });
              const allMatched = resolvedCards.every((entry) => entry.matched);

              if (activeTeamId) {
                teamPairCounts[activeTeamId] = (teamPairCounts[activeTeamId] ?? 0) + 1;
              }

              let winnerTeamId: string | null = null;
              if (allMatched && orderedTeamIds.length > 0) {
                const [firstTeamId, secondTeamId] = orderedTeamIds;
                const firstScore = teamPairCounts[firstTeamId] ?? 0;
                const secondScore = secondTeamId ? (teamPairCounts[secondTeamId] ?? 0) : -1;
                if (firstScore === secondScore) {
                  winnerTeamId = null;
                } else {
                  winnerTeamId = firstScore > secondScore ? firstTeamId : (secondTeamId ?? firstTeamId);
                }
              }

              return {
                memory: {
                  ...state.memory,
                  cards: resolvedCards,
                  selectedIds: [],
                  moves: state.memory.moves + 1,
                  currentTeamId: activeTeamId,
                  teamPairCounts,
                  finishedAt: allMatched ? new Date().toISOString() : state.memory.finishedAt,
                  winnerTeamId
                }
              };
            }

            if (memoryResolveTimeout) {
              clearTimeout(memoryResolveTimeout);
            }
            memoryResolveTimeout = setTimeout(() => {
              set((current) => {
                if (current.memory.selectedIds.length !== 2) {
                  return current;
                }
                const selectedSet = new Set(current.memory.selectedIds);
                const nextCards = current.memory.cards.map((entry) =>
                  selectedSet.has(entry.id) && !entry.matched ? { ...entry, faceUp: false } : entry
                );
                const turnTeamIds = getMemoryTeamIds(current.snapshot);
                const currentTeamIdForTurn = current.memory.currentTeamId ?? turnTeamIds[0] ?? null;
                const nextTeamId = turnTeamIds.find((teamId) => teamId !== currentTeamIdForTurn) ?? currentTeamIdForTurn;
                return {
                  memory: {
                    ...current.memory,
                    cards: nextCards,
                    selectedIds: [],
                    currentTeamId: nextTeamId
                  }
                };
              });
              memoryResolveTimeout = null;
            }, 5000);

            return {
              memory: {
                ...state.memory,
                cards,
                selectedIds,
                moves: state.memory.moves + 1
              }
            };
          }

          return {
            memory: {
              ...state.memory,
              cards,
              selectedIds
            }
          };
        });
      },

      resetMemory: () => {
        if (memoryResolveTimeout) {
          clearTimeout(memoryResolveTimeout);
          memoryResolveTimeout = null;
        }
        set((state) => ({
          memory: nextMemory(getMemoryTeamIds(state.snapshot))
        }));
      },

      resetAll: () => {
        if (memoryResolveTimeout) {
          clearTimeout(memoryResolveTimeout);
          memoryResolveTimeout = null;
        }
        const snapshot = recalc(createDemoSnapshot());
        set({
          snapshot,
          eventSlug: snapshot.event.slug,
          memory: nextMemory(getMemoryTeamIds(snapshot))
        });
      },

      applyRealtimePatch: (patch) => {
        const actions = get();
        switch (patch.action) {
          case "SET_CURRENT_GAME":
            actions.setCurrentGame((patch.payload as { gameId: string }).gameId, { broadcast: false });
            break;
          case "SET_GAME_STATUS": {
            const payload = patch.payload as { gameId: string; status: "planned" | "active" | "completed" };
            actions.setGameStatus(payload.gameId, payload.status, { broadcast: false });
            break;
          }
          case "SET_GAME_WINNER": {
            const payload = patch.payload as { gameId: string; winnerTeamId: string | null };
            actions.setGameWinner(payload.gameId, payload.winnerTeamId, { broadcast: false });
            break;
          }
          case "SET_MANUAL_POINTS": {
            const payload = patch.payload as { gameId: string; teamId: string; points: number | null };
            actions.setManualPoints(payload.gameId, payload.teamId, payload.points, { broadcast: false });
            break;
          }
          case "SET_GAME_METADATA": {
            const payload = patch.payload as { gameId: string; metadataPatch: Record<string, unknown> };
            actions.setGameMetadata(payload.gameId, payload.metadataPatch, { broadcast: false });
            break;
          }
          case "SELECT_MEDIA_GAME":
            actions.selectMediaGame((patch.payload as { gameId: string }).gameId, { broadcast: false });
            break;
          case "SET_MEDIA_INDEX":
            actions.setMediaIndex((patch.payload as { index: number }).index, { broadcast: false });
            break;
          case "TOGGLE_REVEAL":
            actions.toggleReveal((patch.payload as { value?: boolean }).value, { broadcast: false });
            break;
          case "START_MEDIA_ANIMATION":
            actions.startMediaAnimation({ broadcast: false });
            break;
          case "RESET_BUZZER":
            actions.resetBuzzer({ broadcast: false });
            break;
          case "PRESS_BUZZER": {
            const payload = patch.payload as { teamId: string; teamMemberId?: string | null };
            void actions.pressBuzzer(payload.teamId, payload.teamMemberId, { broadcast: false });
            break;
          }
          case "SET_TIMER": {
            const mode = (patch.payload as { mode: "start" | "stop" | "reset" }).mode;
            if (mode === "start") {
              actions.startTimer({ broadcast: false });
            } else if (mode === "stop") {
              actions.stopTimer({ broadcast: false });
            } else {
              actions.resetTimer({ broadcast: false });
            }
            break;
          }
          case "SET_TEAM_NAME": {
            const payload = patch.payload as { teamId: string; name: string };
            actions.setTeamName(payload.teamId, payload.name, { broadcast: false });
            break;
          }
          case "SET_SNAPSHOT":
            actions.replaceSnapshot((patch.payload as { snapshot: EventSnapshot }).snapshot, {
              broadcast: false
            });
            break;
          default:
            break;
        }
      }
    }),
    {
      name: "sdp-event-store",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState) => {
        const raw = persistedState as Partial<EventStore> | undefined;
        const snapshot = raw?.snapshot ? recalc(raw.snapshot) : recalc(initialSnapshot);
        return {
          ...raw,
          snapshot,
          eventSlug: raw?.eventSlug ?? snapshot.event.slug,
          memory: normalizeMemoryRuntime(raw?.memory, snapshot)
        } as EventStore;
      },
      merge: (persistedState, currentState) => {
        const raw = persistedState as Partial<EventStore> | undefined;
        const snapshot = raw?.snapshot ? recalc(raw.snapshot) : currentState.snapshot;
        return {
          ...currentState,
          ...raw,
          snapshot,
          eventSlug: raw?.eventSlug ?? snapshot.event.slug,
          memory: normalizeMemoryRuntime(raw?.memory, snapshot)
        };
      },
      partialize: (state) => ({
        snapshot: state.snapshot,
        eventSlug: state.eventSlug,
        memory: state.memory
      })
    }
  )
);
