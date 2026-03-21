import { GAME_TITLES } from "@/config/games";
import type {
  DeutschlandRoundEntity,
  EventSnapshot,
  GameEntity,
  GameStateEntity,
  GameType,
  MediaItemEntity,
  ScoreEntity,
  SoundItemEntity,
  TeamEntity,
  TeamMemberEntity
} from "@/types/domain";

const NOW = new Date().toISOString();

export const DEMO_EVENT_ID = "event_demo_2026";
export const DEMO_EVENT_SLUG = "demo-event";

const mediaTypeByGameSlug: Partial<Record<string, GameType>> = {
  "laenderumrisse": "media_laenderumrisse",
  "flaggen": "media_flaggen",
  "wer-luegt": "media_wer_luegt",
  "deutschland": "deutschland",
  "sortieren": "media_sortieren",
  "memory": "memory"
};

const gameSlugOverrides: Record<number, string> = {
  1: "laenderumrisse",
  4: "wo-liegt-was",
  5: "flaggen",
  7: "wer-luegt",
  10: "deutschland",
  11: "memory",
  14: "sortieren",
  15: "muenze"
};

const teams: TeamEntity[] = [
  {
    id: "team_1",
    eventId: DEMO_EVENT_ID,
    name: "Team Nord",
    color: "#00C2FF",
    sortOrder: 1,
    createdAt: NOW
  },
  {
    id: "team_2",
    eventId: DEMO_EVENT_ID,
    name: "Team Süd",
    color: "#FF4D6D",
    sortOrder: 2,
    createdAt: NOW
  }
];

const teamMembers: TeamMemberEntity[] = [
  {
    id: "member_1",
    teamId: "team_1",
    name: "Anna",
    nickname: "Ace",
    createdAt: NOW
  },
  {
    id: "member_2",
    teamId: "team_1",
    name: "Lukas",
    nickname: "Lux",
    createdAt: NOW
  },
  {
    id: "member_3",
    teamId: "team_2",
    name: "Mira",
    nickname: "M",
    createdAt: NOW
  },
  {
    id: "member_4",
    teamId: "team_2",
    name: "Tobias",
    nickname: "Tobi",
    createdAt: NOW
  }
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

const games: GameEntity[] = GAME_TITLES.map((title, index) => {
  const gameNumber = index + 1;
  const fallbackSlug = slugify(title);
  const slug = gameSlugOverrides[gameNumber] ?? fallbackSlug;
  const type = mediaTypeByGameSlug[slug] ?? "standard";

  return {
    id: `game_${gameNumber}`,
    eventId: DEMO_EVENT_ID,
    title,
    slug,
    gameNumber,
    pointValue: gameNumber,
    type,
    status: gameNumber === 1 ? "active" : "planned",
    winnerTeamId: null,
    manualPoints: null,
    createdAt: NOW
  };
});

const gameStates: Record<string, GameStateEntity> = Object.fromEntries(
  games.map((game) => [
    game.id,
    {
      id: `gs_${game.id}`,
      gameId: game.id,
      currentStep: 0,
      revealState: false,
      timerState: {
        running: false,
        startedAt: null,
        elapsedMs: 0
      },
      metadata: {},
      updatedAt: NOW
    }
  ])
);

const scores: ScoreEntity[] = teams.map((team) => ({
  id: `score_${team.id}`,
  eventId: DEMO_EVENT_ID,
  teamId: team.id,
  totalPoints: 0,
  updatedAt: NOW
}));

const LAENDERUMRISSE_ITEMS = [
  { country: "Deutschland", assetIndex: 4 },
  { country: "Brasilien", assetIndex: 1 },
  { country: "Chile", assetIndex: 2 },
  { country: "Dänemark", assetIndex: 3 },
  { country: "Finnland", assetIndex: 5 },
  { country: "Iran", assetIndex: 6 },
  { country: "Island", assetIndex: 7 },
  { country: "Nordkorea", assetIndex: 8 },
  { country: "Norwegen", assetIndex: 9 },
  { country: "Österreich", assetIndex: 10 },
  { country: "Russland", assetIndex: 11 },
  { country: "Schweden", assetIndex: 12 },
  { country: "Spanien", assetIndex: 13 },
  { country: "Türkei", assetIndex: 14 },
  { country: "Ungarn", assetIndex: 15 },
  { country: "Vereinigtes Königreich", assetIndex: 16 },
  { country: "Volksrepublik China", assetIndex: 17 }
] as const;

const FLAGGEN_ITEMS = [
  { country: "Bahrain", fileName: "Flag_of_Bahrain.svg.png" },
  { country: "Kamerun", fileName: "Flag_of_Cameroon.svg.png" },
  { country: "Tschad", fileName: "Flag_of_Chad.svg.png" },
  { country: "Côte d'Ivoire", fileName: "Flag_of_Co%CC%82te_d%27Ivoire.svg.png" },
  { country: "Haiti", fileName: "Flag_of_Haiti.svg.png" },
  { country: "Libanon", fileName: "Flag_of_Lebanon.svg.png" },
  { country: "Liechtenstein", fileName: "Flag_of_Liechtenstein.svg.png" },
  { country: "Nepal", fileName: "Flag_of_Nepal.svg.png" },
  { country: "Singapur", fileName: "Flag_of_Singapore.svg.png" },
  { country: "Thailand", fileName: "Flag_of_Thailand.svg.png" },
  { country: "Vietnam", fileName: "Flag_of_Vietnam.svg.png" },
  { country: "Sahrauische Arabische Demokratische Republik", fileName: "Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg.png" }
] as const;

function buildMediaItems(gameSlug: string, count: number, titlePrefix: string): MediaItemEntity[] {
  const game = games.find((entry) => entry.slug === gameSlug);
  if (!game) {
    return [];
  }

  return Array.from({ length: count }).map((_, index) => {
    const item = index + 1;
    return {
      id: `${game.id}_media_${item}`,
      gameId: game.id,
      title: `${titlePrefix} ${item}`,
      type: "image",
      assetUrl: `/media/${gameSlug}/item-${String(item).padStart(2, "0")}.svg`,
      sortOrder: item,
      metadata: {
        hint: `${titlePrefix} Hinweis ${item}`
      }
    };
  });
}

function buildLaenderumrisseMediaItems(): MediaItemEntity[] {
  const game = games.find((entry) => entry.slug === "laenderumrisse");
  if (!game) {
    return [];
  }

  return LAENDERUMRISSE_ITEMS.map((entry, index) => {
    const item = index + 1;
    return {
      id: `${game.id}_media_${item}`,
      gameId: game.id,
      title: entry.country,
      type: "image",
      assetUrl: `/media/laenderumrisse/item-${String(entry.assetIndex).padStart(2, "0")}.svg`,
      sortOrder: item,
      metadata: {
        country: entry.country,
        hint: `${entry.country} erkennen`
      }
    };
  });
}

function buildFlaggenMediaItems(): MediaItemEntity[] {
  const game = games.find((entry) => entry.slug === "flaggen");
  if (!game) {
    return [];
  }

  return FLAGGEN_ITEMS.map((entry, index) => {
    const item = index + 1;
    return {
      id: `${game.id}_media_${item}`,
      gameId: game.id,
      title: entry.country,
      type: "image",
      assetUrl: `/media/flaggen/${entry.fileName}`,
      sortOrder: item,
      metadata: {
        country: entry.country,
        hint: `${entry.country} Flagge`
      }
    };
  });
}

const mediaItems: MediaItemEntity[] = [
  ...buildLaenderumrisseMediaItems(),
  ...buildFlaggenMediaItems(),
  ...buildMediaItems("wer-luegt", 12, "Aussage"),
  ...buildMediaItems("deutschland", 10, "Stadtkarte"),
  ...buildMediaItems("sortieren", 10, "Sortierkarte")
];

const soundItems: SoundItemEntity[] = [
  {
    id: "sound_intro_1",
    eventId: DEMO_EVENT_ID,
    title: "Intro",
    category: "Intro",
    assetUrl: "/sounds/Intro.mp3",
    sortOrder: 1
  },
  {
    id: "sound_intro_2",
    eventId: DEMO_EVENT_ID,
    title: "Minigame Intro",
    category: "Intro",
    assetUrl: "/sounds/Minigame%20Intro.mp3",
    sortOrder: 2
  },
  {
    id: "sound_tension_1",
    eventId: DEMO_EVENT_ID,
    title: "Tension 01",
    category: "Spannung",
    assetUrl: "/sounds/Tension%2001.mp3",
    sortOrder: 3
  },
  {
    id: "sound_tension_2",
    eventId: DEMO_EVENT_ID,
    title: "Tension 02",
    category: "Spannung",
    assetUrl: "/sounds/Tension%2002.mp3",
    sortOrder: 4
  },
  {
    id: "sound_focus_1",
    eventId: DEMO_EVENT_ID,
    title: "Konzentrationsspiel",
    category: "Konzentration",
    assetUrl: "/sounds/Konzentrationsspiel.mp3",
    sortOrder: 5
  },
  {
    id: "sound_buzzer_1",
    eventId: DEMO_EVENT_ID,
    title: "Buzzer",
    category: "Buzzer",
    assetUrl: "/sounds/Buzzer.mp3",
    sortOrder: 6
  }
];

const deutschlandRounds: DeutschlandRoundEntity[] = [
  {
    id: "de_round_1",
    eventId: DEMO_EVENT_ID,
    title: "Bundesland-Hauptstadt",
    cityName: "Erfurt",
    correctLat: 50.9787,
    correctLng: 11.0328,
    metadata: {
      difficulty: "mittel"
    }
  },
  {
    id: "de_round_2",
    eventId: DEMO_EVENT_ID,
    title: "Nord-Süd Einschätzung",
    cityName: "Flensburg",
    correctLat: 54.7937,
    correctLng: 9.4469,
    metadata: {
      difficulty: "leicht"
    }
  }
];

export function createDemoSnapshot(): EventSnapshot {
  return {
    event: {
      id: DEMO_EVENT_ID,
      name: "Schlag den Paul - Demo Event",
      slug: DEMO_EVENT_SLUG,
      status: "live",
      createdAt: NOW
    },
    teams,
    teamMembers,
    games,
    gameStates,
    scores,
    mediaItems,
    soundItems,
    buzzerEvents: [],
    memorySession: {
      id: "memory_session_1",
      eventId: DEMO_EVENT_ID,
      gameId: games.find((game) => game.slug === "memory")?.id ?? null,
      status: "idle",
      boardState: {
        pairs: 8,
        lastMoveAt: NOW,
        moves: 0
      },
      turnTeamId: teams[0].id,
      updatedAt: NOW
    },
    deutschlandRounds,
    buzzerState: {
      locked: false,
      winnerTeamId: null,
      winnerTeamMemberId: null,
      pressedAt: null
    },
    mediaControl: {
      gameId: games.find((game) => game.slug === "laenderumrisse")?.id ?? null,
      currentIndex: 0,
      reveal: false,
      animationKey: 0
    }
  };
}
