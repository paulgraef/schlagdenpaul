"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEventStore } from "@/hooks/use-event-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamSelectPage() {
  const router = useRouter();
  const teams = useEventStore((state) => state.snapshot.teams);

  function selectTeam(teamId: string) {
    localStorage.setItem("sdp_team_id", teamId);
    router.push(`/buzzer?teamId=${teamId}`);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 md:py-10">
      <Card className="bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />Team auswählen
          </CardTitle>
          <CardDescription>Wähle dein Team für den Team-Bereich.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {teams.map((team) => (
            <Button
              key={team.id}
              variant="outline"
              className="h-14 justify-start text-base"
              onClick={() => selectTeam(team.id)}
            >
              <span className="mr-3 h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
              {team.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
