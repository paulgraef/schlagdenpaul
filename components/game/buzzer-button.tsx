"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BuzzerButtonProps {
  teamColor: string;
  disabled: boolean;
  onPress: () => void;
  label: string;
}

export function BuzzerButton({ teamColor, disabled, onPress, label }: BuzzerButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onPress}
      disabled={disabled}
      className={cn(
        "relative h-64 w-full overflow-hidden rounded-[36px] border text-white shadow-2xl transition-all md:h-80",
        disabled ? "opacity-60" : "animate-pulseGlow"
      )}
      style={{
        borderColor: `${teamColor}99`,
        background: `radial-gradient(circle at 50% 40%, ${teamColor}cc 0%, ${teamColor}44 35%, #020617 100%)`
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),transparent_60%)]" />
      <span className="relative font-display text-5xl font-black uppercase tracking-[0.15em]">{label}</span>
    </motion.button>
  );
}
