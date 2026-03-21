"use client";

import { MapPinned, Construction } from "lucide-react";
import { useEventStore } from "@/hooks/use-event-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeutschlandPage() {
  const rounds = useEventStore((state) => state.snapshot.deutschlandRounds);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <Card className="mb-6 border-amber-400/30 bg-amber-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-100">
            <Construction className="h-5 w-5" />Deutschland Modul - Coming soon
          </CardTitle>
          <CardDescription className="text-amber-50/80">
            Architektur ist vorbereitet: Rundenmodell, Service-Layer und Route sind bereits integriert.
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Vorbereitete Runden</h2>
        <div className="grid gap-3">
          {rounds.map((round) => (
            <Card key={round.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{round.title}</p>
                  <p className="text-sm text-muted-foreground">City: {round.cityName}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPinned className="h-4 w-4" />
                  {round.correctLat?.toFixed(2)}, {round.correctLng?.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
