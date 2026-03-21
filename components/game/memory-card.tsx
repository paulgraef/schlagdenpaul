"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MemoryCardModel } from "@/types/domain";

interface MemoryCardProps {
  card: MemoryCardModel;
  onClick: (id: string) => void;
}

export function MemoryCard({ card, onClick }: MemoryCardProps) {
  const flipped = card.faceUp || card.matched;

  return (
    <button className="group [perspective:1000px]" onClick={() => onClick(card.id)} disabled={flipped}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.35 }}
        className="relative h-24 w-full rounded-2xl [transform-style:preserve-3d] md:h-28"
      >
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 to-slate-800 text-xl font-semibold text-white [backface-visibility:hidden]",
            !flipped && "group-hover:border-primary/60"
          )}
        >
          ?
        </div>

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-2xl border bg-gradient-to-br text-3xl [backface-visibility:hidden] [transform:rotateY(180deg)]",
            card.matched
              ? "border-emerald-300/50 from-emerald-500/35 to-emerald-700/20"
              : "border-primary/40 from-cyan-500/25 to-blue-700/10"
          )}
        >
          {card.icon}
        </div>
      </motion.div>
    </button>
  );
}
