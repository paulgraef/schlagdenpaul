import { Badge } from "@/components/ui/badge";
import type { TeamEntity } from "@/types/domain";

export function TeamBadge({ team, compact = false }: { team: TeamEntity; compact?: boolean }) {
  return (
    <Badge
      variant="outline"
      className={compact ? "gap-2 px-2 py-1" : "gap-2 px-3 py-1.5 text-sm"}
      style={{ borderColor: `${team.color}55`, color: team.color, backgroundColor: `${team.color}1a` }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: team.color }} />
      {team.name}
    </Badge>
  );
}
