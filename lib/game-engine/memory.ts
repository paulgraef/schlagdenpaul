import { createId } from "@/lib/utils";
import { MEMORY_IMAGE_SOURCES } from "@/config/memory-images";
import type { MemoryCardModel } from "@/types/domain";

function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array;
}

export function createMemoryBoard(imageSources: string[] = MEMORY_IMAGE_SOURCES): MemoryCardModel[] {
  const pairs = imageSources.map((source, idx) => {
    const pairId = `pair_${idx + 1}`;
    const label = `Pair ${idx + 1}`;

    const cardA: MemoryCardModel = {
      id: createId("mem"),
      pairId,
      label,
      icon: source,
      matched: false,
      faceUp: false,
      matchedByTeamId: null
    };

    const cardB: MemoryCardModel = {
      id: createId("mem"),
      pairId,
      label,
      icon: source,
      matched: false,
      faceUp: false,
      matchedByTeamId: null
    };

    return [cardA, cardB];
  });

  return shuffle(pairs.flat());
}

export function resolveMemoryTurn(
  cards: MemoryCardModel[],
  selectedIds: string[]
): { cards: MemoryCardModel[]; matched: boolean } {
  if (selectedIds.length !== 2) {
    return { cards, matched: false };
  }

  const [first, second] = selectedIds
    .map((id) => cards.find((card) => card.id === id))
    .filter((card): card is MemoryCardModel => Boolean(card));

  if (!first || !second) {
    return { cards, matched: false };
  }

  const matched = first.pairId === second.pairId;

  const nextCards = cards.map((card) => {
    if (!selectedIds.includes(card.id)) {
      return card;
    }

    if (matched) {
      return {
        ...card,
        matched: true,
        faceUp: true,
        matchedByTeamId: null
      };
    }

    return {
      ...card,
      faceUp: false
    };
  });

  return {
    cards: nextCards,
    matched
  };
}
