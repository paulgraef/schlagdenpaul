"use client";

import { motion } from "framer-motion";
import { TeamBadge } from "@/components/game/team-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreEntity, TeamEntity } from "@/types/domain";

export function ScoreCard({ team, score, emphasized }: { team: TeamEntity; score: ScoreEntity; emphasized?: boolean }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={emphasized ? "border-primary/50 bg-primary/10" : ""}>
        <CardHeader className="pb-2">
          <TeamBadge team={team} />
        </CardHeader>
        <CardContent>
          <CardTitle className="font-display text-5xl leading-none">{score.totalPoints}</CardTitle>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">Gesamtpunkte</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
