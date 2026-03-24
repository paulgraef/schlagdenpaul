"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MemoryCardModel } from "@/types/domain";

interface MemoryCardProps {
  card: MemoryCardModel;
  onClick: (id: string) => void;
  matchedBorderColor?: string;
}

export function MemoryCard({ card, onClick, matchedBorderColor }: MemoryCardProps) {
  const flipped = card.faceUp || card.matched;

  return (
    <button className="group h-full w-full [perspective:1000px]" onClick={() => onClick(card.id)} disabled={flipped}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.35 }}
        className="relative h-full w-full rounded-xl [transform-style:preserve-3d]"
      >
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-slate-900 to-slate-800 text-sm font-semibold text-white [backface-visibility:hidden] md:text-base",
            !flipped && "group-hover:border-primary/60"
          )}
        >
          ?
        </div>

        <div
          className={cn(
            "absolute inset-0 overflow-hidden rounded-xl border bg-gradient-to-br [backface-visibility:hidden] [transform:rotateY(180deg)]",
            card.matched
              ? "border-emerald-300/50 from-emerald-500/35 to-emerald-700/20"
              : "border-primary/40 from-cyan-500/25 to-blue-700/10"
          )}
          style={
            card.matched && matchedBorderColor
              ? {
                  borderColor: matchedBorderColor,
                  boxShadow: `0 0 0 2px ${matchedBorderColor}80 inset`
                }
              : undefined
          }
        >
          <Image src={card.icon} alt={card.label} fill className="object-cover" unoptimized />
        </div>
      </motion.div>
    </button>
  );
}
