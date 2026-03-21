import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { GameStatusBadge } from "@/components/game/game-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatGameLabel } from "@/lib/utils";
import type { GameEntity, TeamEntity } from "@/types/domain";

interface GameTileProps {
  game: GameEntity;
  winner?: TeamEntity;
  highlight?: boolean;
}

export function GameTile({ game, winner, highlight }: GameTileProps) {
  return (
    <motion.div layout whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/admin/games/${game.id}`}>
        <Card className={highlight ? "border-primary/50 bg-primary/10" : "hover:border-white/30"}>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {formatGameLabel(game.gameNumber)}
                </p>
                <h3 className="text-base font-semibold">{game.title}</h3>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between">
              <GameStatusBadge status={game.status} />
              <p className="text-xs text-muted-foreground">{winner ? `Gewinner: ${winner.name}` : "Noch offen"}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
