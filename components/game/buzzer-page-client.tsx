"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEventStore } from "@/hooks/use-event-store";
import { BuzzerButton } from "@/components/game/buzzer-button";
import { getWoLiegtWasState, normalizePoint, WO_LIEGT_WAS_LOCATIONS } from "@/lib/game-engine/wo-liegt-was";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function playFallbackBeep() {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.25);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.26);
}

async function playFeedback() {
  try {
    const audio = new Audio("/sounds/Buzzer.mp3");
    audio.preload = "auto";
    await audio.play();
  } catch {
    playFallbackBeep();
  }
}

interface BuzzerPageClientProps {
  mapOnly?: boolean;
}

export function BuzzerPageClient({ mapOnly = false }: BuzzerPageClientProps) {
  const searchParams = useSearchParams();
  const teamFromQuery = searchParams.get("teamId");
  const { snapshot, pressBuzzer, setGameMetadata } = useEventStore((state) => state);

  useEffect(() => {
    if (teamFromQuery) {
      localStorage.setItem("sdp_team_id", teamFromQuery);
    }
  }, [teamFromQuery]);

  const selectedTeam = useMemo(() => {
    const fromStorage = typeof window !== "undefined" ? localStorage.getItem("sdp_team_id") : null;
    const teamId = teamFromQuery ?? fromStorage;
    return snapshot.teams.find((team) => team.id === teamId) ?? null;
  }, [snapshot.teams, teamFromQuery]);
  const activeGame = useMemo(
    () => snapshot.games.find((game) => game.status === "active") ?? snapshot.games[0],
    [snapshot.games]
  );
  const woLiegtWasGame = useMemo(
    () => snapshot.games.find((game) => game.slug === "wo-liegt-was") ?? null,
    [snapshot.games]
  );
  const gameForView = mapOnly && woLiegtWasGame ? woLiegtWasGame : activeGame;
  const isWoLiegtWas = gameForView?.slug === "wo-liegt-was";
  const woLiegtWasState = useMemo(
    () => getWoLiegtWasState(snapshot.gameStates[gameForView.id]?.metadata ?? {}, snapshot.teams.map((team) => team.id)),
    [snapshot.gameStates, gameForView.id, snapshot.teams]
  );
  const currentLocation = WO_LIEGT_WAS_LOCATIONS[woLiegtWasState.locationIndex] ?? WO_LIEGT_WAS_LOCATIONS[0];
  const submittedGuess = selectedTeam ? woLiegtWasState.guesses[selectedTeam.id] : null;
  const hasSubmitted = Boolean(submittedGuess);
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (submittedGuess) {
      setDraftPin({ x: submittedGuess.x, y: submittedGuess.y });
      return;
    }
    setDraftPin(null);
  }, [selectedTeam?.id, woLiegtWasState.locationIndex, submittedGuess?.x, submittedGuess?.y]);

  async function handleBuzz() {
    if (!selectedTeam) {
      return;
    }

    const won = await pressBuzzer(selectedTeam.id, null);
    if (won) {
      await playFeedback();
    }
  }

  function setPin(event: MouseEvent<HTMLDivElement>) {
    if (!selectedTeam || !isWoLiegtWas || hasSubmitted) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const point = normalizePoint({ x, y });
    setDraftPin(point);
  }

  function confirmPin() {
    if (!selectedTeam || !isWoLiegtWas || !draftPin) {
      return;
    }
    setGameMetadata(gameForView.id, {
      woLiegtWas: {
        ...woLiegtWasState,
        reveal: false,
        roundAwarded: false,
        guesses: {
          ...woLiegtWasState.guesses,
          [selectedTeam.id]: {
            ...draftPin,
            placedAt: new Date().toISOString()
          }
        }
      }
    });
  }

  if (!selectedTeam) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 md:py-10">
        <Card className="bg-black/40">
          <CardHeader>
            <CardTitle>Team nicht gewählt</CardTitle>
            <CardDescription>Bitte zuerst dein Team auswählen.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/team">Zur Teamauswahl</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 md:py-10">
      <Card className="bg-black/40">
        <CardHeader>
          <CardTitle>{mapOnly ? "Team Karte" : "Team Buzzer"}</CardTitle>
          <CardDescription>
            Team: <span style={{ color: selectedTeam.color }}>{selectedTeam.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isWoLiegtWas ? (
            <>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Aktuelle Runde</p>
                <p className="text-lg font-semibold">Setze deinen Pin auf: {currentLocation.name}</p>
                {hasSubmitted ? (
                  <p className="text-xs text-emerald-300">
                    Pin abgegeben. Warte auf Freigabe im Dashboard.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Klicke auf die Karte und bestätige dann mit „Pin bestätigen“.
                  </p>
                )}
              </div>

              <div className="relative mx-auto aspect-[3/4] w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#ececec]">
                <div className="absolute inset-0 cursor-crosshair" onClick={setPin}>
                  <Image
                    src="/media/laenderumrisse/item-04.svg"
                    alt="Deutschland Karte"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>

                {draftPin ? (
                  <div
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                    style={{
                      left: `${draftPin.x}%`,
                      top: `${draftPin.y}%`,
                      backgroundColor: selectedTeam.color
                    }}
                    title="Dein Pin"
                  />
                ) : null}
              </div>

              <Button onClick={confirmPin} disabled={!draftPin || hasSubmitted}>
                Pin bestätigen
              </Button>
            </>
          ) : mapOnly ? (
            <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-muted-foreground">
              Spiel „Wo liegt was?“ ist aktuell nicht verfügbar.
            </div>
          ) : (
            <BuzzerButton
              teamColor={selectedTeam.color}
              disabled={snapshot.buzzerState.locked}
              onPress={handleBuzz}
              label="BUZZ"
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
