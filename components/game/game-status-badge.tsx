import { Badge } from "@/components/ui/badge";
import type { GameEntity } from "@/types/domain";

export function GameStatusBadge({ status }: { status: GameEntity["status"] }) {
  if (status === "completed") {
    return <Badge variant="success">Abgeschlossen</Badge>;
  }

  if (status === "active") {
    return <Badge variant="warning">Aktiv</Badge>;
  }

  return <Badge variant="outline">Geplant</Badge>;
}
