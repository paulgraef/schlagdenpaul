import { createId } from "@/lib/utils";
import type { MemoryCardModel } from "@/types/domain";

const ICON_POOL = ["\u2605", "\u25c6", "\u25cf", "\u25b2", "\u25a0", "\u2665", "\u2666", "\u2663", "\u2660", "\u2726", "\u2731", "\u272a"];

function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array;
}

export function createMemoryBoard(pairCount: number): MemoryCardModel[] {
  const pairs = Array.from({ length: pairCount }).map((_, idx) => {
    const pairId = `pair_${idx + 1}`;
    const icon = ICON_POOL[idx % ICON_POOL.length];
    const label = `Pair ${idx + 1}`;

    const cardA: MemoryCardModel = {
      id: createId("mem"),
      pairId,
      label,
      icon,
      matched: false,
      faceUp: false
    };

    const cardB: MemoryCardModel = {
      id: createId("mem"),
      pairId,
      label,
      icon,
      matched: false,
      faceUp: false
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
        faceUp: true
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
