import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Trophy, Brain, MapPinned, LocateFixed } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const adminNavigation: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/games", label: "Spiele", icon: Trophy },
  { href: "/admin/wo-liegt-was", label: "Wo liegt was?", icon: LocateFixed },
  { href: "/games/memory", label: "Memory", icon: Brain },
  { href: "/games/deutschland", label: "Deutschland", icon: MapPinned }
];
