import Link from "next/link";
import Image from "next/image";
import { Radio, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const entryLinks = [
  {
    title: "Admin-Bereich",
    description: "Live-Steuerung für Spiele, Punkte, Medien, Sound und Timer.",
    href: "/admin",
    icon: ShieldCheck,
    cta: "Admin öffnen"
  },
  {
    title: "Team-Bereich",
    description: "Team-Zugang für Buzzer und spätere interaktive Spieloberflächen.",
    href: "/team",
    icon: Radio,
    cta: "Team öffnen"
  }
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-10 md:px-8">
      <section className="grid gap-6 rounded-3xl border border-white/15 bg-black/35 p-6 shadow-[0_20px_70px_-45px_rgba(56,189,248,0.75)] md:grid-cols-[220px_1fr] md:p-10">
        <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-3xl border border-white/20 bg-black/40">
          <Image src="/logo.png" alt="Schlag den Paul" fill className="object-cover" priority />
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.36em] text-cyan-300/80">Live Event Suite</p>
          <h1 className="font-heading text-4xl font-bold md:text-6xl">Schlag den Paul</h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            Zentrale Event-App mit zwei Zugängen: Admin für die Show-Steuerung und Team-Bereich für Buzzer
            sowie interaktive Spielmodule.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {entryLinks.map((item) => (
          <Card key={item.href} className="bg-black/35">
            <CardHeader>
              <item.icon className="h-6 w-6 text-cyan-300" />
              <CardTitle className="mt-2">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={item.href}>{item.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
