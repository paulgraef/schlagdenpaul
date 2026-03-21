"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SvgTracePlayer } from "@/components/public/svg-trace-player";
import { Card } from "@/components/ui/card";
import type { GameType, MediaItemEntity } from "@/types/domain";

interface PublicStageProps {
  gameTitle: string;
  gameType?: GameType;
  item?: MediaItemEntity;
  reveal: boolean;
  animationKey?: number;
  helperText?: string;
}

export function PublicStage({ gameTitle, gameType, item, reveal, animationKey = 0, helperText }: PublicStageProps) {
  const isLaender = gameType === "media_laenderumrisse" || gameTitle.toLowerCase().includes("länderumrisse");
  const isFlaggen = gameType === "media_flaggen" || gameTitle.toLowerCase().includes("flaggen");
  return (
    <Card className="overflow-hidden border-white/20 bg-black/50">
      <div className="border-b border-white/10 bg-black/40 px-6 py-4">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Aktuelles Spiel</p>
        <h2 className="font-heading text-2xl font-semibold">{gameTitle}</h2>
      </div>

      <div className="relative min-h-[380px] p-6 md:min-h-[520px]">
        <AnimatePresence mode="wait">
          {item ? (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35 }}
              className="h-full"
            >
              {isLaender && item.assetUrl.toLowerCase().endsWith(".svg") ? (
                reveal ? (
                  animationKey > 0 ? (
                    <SvgTracePlayer
                      key={`${item.id}_${animationKey}`}
                      src={item.assetUrl}
                      alt={item.title}
                      traceKey={`${item.id}_${animationKey}`}
                      durationSeconds={60}
                    />
                  ) : (
                    <div className="h-[420px] w-full rounded-2xl border border-white/10 bg-black md:h-[560px]" />
                  )
                ) : (
                  <div className="h-[420px] w-full rounded-2xl border border-white/10 bg-black md:h-[560px]" />
                )
              ) : (
                <Image
                  src={item.assetUrl}
                  alt={item.title}
                  width={1600}
                  height={900}
                  className={`h-[420px] w-full rounded-2xl border border-white/10 md:h-[560px] ${
                    isFlaggen ? "bg-black/50 object-contain p-4" : "object-cover"
                  }`}
                  unoptimized
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed border-white/15 text-muted-foreground md:h-[560px]"
            >
              Medien werden gleich eingeblendet
            </motion.div>
          )}
        </AnimatePresence>

        {!reveal ? (
          <div className="pointer-events-none absolute inset-0 m-6 rounded-2xl bg-black">
            <div className="flex h-full items-center justify-center">
              <p className="text-3xl font-bold uppercase tracking-[0.25em] text-white/80">Noch verdeckt</p>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
