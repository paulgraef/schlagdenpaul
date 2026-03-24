"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEventStore } from "@/hooks/use-event-store";
import { BuzzerButton } from "@/components/game/buzzer-button";
import {
  getLocationTarget,
  getRoundDistances,
  getRoundWinnerTeamId,
  getWoLiegtWasState,
  normalizePoint,
  WO_LIEGT_WAS_LOCATIONS
} from "@/lib/game-engine/wo-liegt-was";
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
  const orderedTeams = useMemo(
    () => snapshot.teams.slice().sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2),
    [snapshot.teams]
  );
  const [mapSelectedTeamId, setMapSelectedTeamId] = useState<string>("");
  const [showLocalResult, setShowLocalResult] = useState(false);
  const woLiegtWasState = useMemo(
    () => getWoLiegtWasState(snapshot.gameStates[gameForView.id]?.metadata ?? {}, snapshot.teams.map((team) => team.id)),
    [snapshot.gameStates, gameForView.id, snapshot.teams]
  );
  useEffect(() => {
    if (!mapOnly || !orderedTeams.length) {
      return;
    }
    if (!mapSelectedTeamId || !orderedTeams.some((team) => team.id === mapSelectedTeamId)) {
      setMapSelectedTeamId(orderedTeams[0].id);
    }
  }, [mapOnly, mapSelectedTeamId, orderedTeams]);

  const activeTeam = mapOnly
    ? orderedTeams.find((team) => team.id === mapSelectedTeamId) ?? null
    : selectedTeam;
  const currentLocation = WO_LIEGT_WAS_LOCATIONS[woLiegtWasState.locationIndex] ?? WO_LIEGT_WAS_LOCATIONS[0];
  const submittedGuess = activeTeam ? woLiegtWasState.guesses[activeTeam.id] : null;
  const hasSubmitted = Boolean(submittedGuess);
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);
  const allPinsSet = orderedTeams.length > 0 && orderedTeams.every((team) => Boolean(woLiegtWasState.guesses[team.id]));
  const localDistances = getRoundDistances(woLiegtWasState);
  const localWinnerTeamId = getRoundWinnerTeamId(woLiegtWasState);
  const targetPoint = getLocationTarget(woLiegtWasState, woLiegtWasState.locationIndex);

  useEffect(() => {
    if (submittedGuess) {
      setDraftPin({ x: submittedGuess.x, y: submittedGuess.y });
      return;
    }
    setDraftPin(null);
  }, [activeTeam?.id, woLiegtWasState.locationIndex, submittedGuess]);

  useEffect(() => {
    setShowLocalResult(false);
  }, [woLiegtWasState.locationIndex]);

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
    if (!activeTeam || !isWoLiegtWas || hasSubmitted) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const point = normalizePoint({ x, y });
    setDraftPin(point);
  }

  function confirmPin() {
    if (!activeTeam || !isWoLiegtWas || !draftPin) {
      return;
    }
    setGameMetadata(gameForView.id, {
      woLiegtWas: {
        ...woLiegtWasState,
        reveal: false,
        roundAwarded: false,
        guesses: {
          ...woLiegtWasState.guesses,
          [activeTeam.id]: {
            ...draftPin,
            placedAt: new Date().toISOString()
          }
        }
      }
    });
    setShowLocalResult(false);
  }

  function revealOnThisDevice() {
    if (!allPinsSet) {
      return;
    }
    setShowLocalResult(true);
  }

  function goToNextLocation() {
    if (!isWoLiegtWas) {
      return;
    }

    setGameMetadata(gameForView.id, {
      woLiegtWas: {
        ...woLiegtWasState,
        locationIndex: (woLiegtWasState.locationIndex + 1) % WO_LIEGT_WAS_LOCATIONS.length,
        reveal: false,
        roundAwarded: false,
        guesses: Object.fromEntries(orderedTeams.map((team) => [team.id, null]))
      }
    });
    setShowLocalResult(false);
  }

  if (!mapOnly && !selectedTeam) {
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
            Team:{" "}
            <span style={{ color: (activeTeam ?? selectedTeam)?.color }}>
              {(activeTeam ?? selectedTeam)?.name ?? "nicht gewählt"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isWoLiegtWas ? (
            <>
              {mapOnly ? (
                <div className="flex flex-wrap gap-2">
                  {orderedTeams.map((team) => (
                    <Button
                      key={team.id}
                      size="sm"
                      variant={team.id === mapSelectedTeamId ? "default" : "outline"}
                      onClick={() => setMapSelectedTeamId(team.id)}
                    >
                      {team.name}
                    </Button>
                  ))}
                </div>
              ) : null}

              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Aktuelle Runde</p>
                <p className="text-lg font-semibold">Setze deinen Pin auf: {currentLocation.name}</p>
                {hasSubmitted ? (
                  <p className="text-xs text-emerald-300">
                    Pin abgegeben.
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

                {showLocalResult ? (
                  <>
                    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {orderedTeams.map((team) => {
                        const teamGuess = woLiegtWasState.guesses[team.id];
                        if (!teamGuess) {
                          return null;
                        }

                        return (
                          <line
                            key={`line-${team.id}`}
                            x1={teamGuess.x}
                            y1={teamGuess.y}
                            x2={targetPoint.x}
                            y2={targetPoint.y}
                            stroke={team.color}
                            strokeWidth="0.8"
                            strokeDasharray="2 1"
                            opacity="0.95"
                          />
                        );
                      })}
                    </svg>
                    {orderedTeams.map((team) => {
                      const teamGuess = woLiegtWasState.guesses[team.id];
                      if (!teamGuess) {
                        return null;
                      }

                      return (
                        <div
                          key={`pin-${team.id}`}
                          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                          style={{
                            left: `${teamGuess.x}%`,
                            top: `${teamGuess.y}%`,
                            backgroundColor: team.color
                          }}
                          title={`Pin ${team.name}`}
                        />
                      );
                    })}
                  </>
                ) : (
                  (() => {
                    const activeTeamGuess = activeTeam ? woLiegtWasState.guesses[activeTeam.id] : null;
                    const point = activeTeam && draftPin && !activeTeamGuess ? draftPin : activeTeamGuess;
                    if (!point || !activeTeam) {
                      return null;
                    }

                    return (
                      <div
                        className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                        style={{
                          left: `${point.x}%`,
                          top: `${point.y}%`,
                          backgroundColor: activeTeam.color
                        }}
                        title={`Pin ${activeTeam.name}`}
                      />
                    );
                  })()
                )}

                {showLocalResult ? (
                  <div
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-yellow-400"
                    style={{
                      left: `${targetPoint.x}%`,
                      top: `${targetPoint.y}%`
                    }}
                    title={`Zielort ${currentLocation.name}`}
                  />
                ) : null}
              </div>

              <Button onClick={confirmPin} disabled={!activeTeam || !draftPin || hasSubmitted}>
                Pin bestätigen
              </Button>

              <Button variant="outline" onClick={revealOnThisDevice} disabled={!allPinsSet}>
                Ergebnis anzeigen
              </Button>

              <Button variant="outline" onClick={goToNextLocation}>
                Nächster Ort
              </Button>

              {showLocalResult ? (
                <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm">
                  {orderedTeams.map((team) => (
                    <p key={team.id} style={{ color: team.color }}>
                      {team.name}: {localDistances[team.id] ? `${localDistances[team.id].toFixed(2)} Einheiten` : "kein Pin"}
                    </p>
                  ))}
                  <p className="mt-1 font-semibold">
                    {localWinnerTeamId
                      ? `Näher dran: ${orderedTeams.find((team) => team.id === localWinnerTeamId)?.name ?? localWinnerTeamId}`
                      : "Gleichstand"}
                  </p>
                </div>
              ) : null}
            </>
          ) : mapOnly ? (
            <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-muted-foreground">
              Spiel „Wo liegt was?“ ist aktuell nicht verfügbar.
            </div>
          ) : (
            <BuzzerButton
              teamColor={activeTeam?.color ?? "#ffffff"}
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
