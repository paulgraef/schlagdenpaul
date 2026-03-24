export const MEMORY_IMAGE_SOURCES: string[] = Array.from({ length: 32 }, (_, index) => {
  const id = String(index + 1).padStart(2, "0");
  return `/media/memory/${id}.png`;
});

export const MEMORY_PAIR_COUNT = MEMORY_IMAGE_SOURCES.length;
