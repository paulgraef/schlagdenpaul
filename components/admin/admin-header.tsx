"use client";

import { useRouter } from "next/navigation";
import { LogOut, RadioTower, Tv } from "lucide-react";
import { ADMIN_AUTH_KEY } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    window.location.href = "/admin";
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Live Control</p>
          <h1 className="font-heading text-xl font-semibold">Schlag den Paul Admin</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/public/current")}>
            <Tv className="mr-2 h-4 w-4" />Public Stage
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/scoreboard")}>
            <RadioTower className="mr-2 h-4 w-4" />Scoreboard
          </Button>
          <Button variant="secondary" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
