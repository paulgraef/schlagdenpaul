"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, TimerReset, Timer, Hand, RotateCcw, ArrowBigRightDash, Music2 } from "lucide-react";
import { useEventStore } from "@/hooks/use-event-store";
import { useAudioBoard } from "@/hooks/use-audio-board";
import { MediaControlPanel } from "@/components/game/media-control-panel";
import { TimerDisplay } from "@/components/game/timer-display";
import { SoundTile } from "@/components/game/sound-tile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MEDIA_GAME_TYPES = new Set([
  "media_laenderumrisse",
  "media_flaggen",
  "media_wer_luegt",
  "media_sortieren",
  "media_deutschland"
]);

function formatBuzzTime(iso: string) {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  return `${time}.${ms}`;
}

export default function AdminDashboardPage() {
  const {
    snapshot,
    setCurrentGame,
    startTimer,
    stopTimer,
    resetTimer,
    resetBuzzer,
    setTeamName,
    selectMediaGame,
    setMediaIndex,
    nextMediaItem,
    previousMediaItem,
    toggleReveal,
    startMediaAnimation
  } = useEventStore((state) => state);
  const { activeSoundId, play, stop } = useAudioBoard();

  const activeGame = snapshot.games.find((game) => game.status === "active") ?? snapshot.games[0];
  const currentState = snapshot.gameStates[activeGame.id];
  const nextGame = snapshot.games.find((game) => game.status === "planned");

  const sortedTeams = useMemo(
    () => snapshot.teams.slice().sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2),
    [snapshot.teams]
  );

  const mediaGames = useMemo(
    () => snapshot.games.filter((game) => MEDIA_GAME_TYPES.has(game.type)),
    [snapshot.games]
  );

  const selectedMediaGame = mediaGames.find((game) => game.id === snapshot.mediaControl.gameId) ?? mediaGames[0];

  const mediaItems = useMemo(
    () =>
      snapshot.mediaItems
        .filter((item) => item.gameId === selectedMediaGame?.id)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [snapshot.mediaItems, selectedMediaGame?.id]
  );

  const [teamNameDrafts, setTeamNameDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const drafts = Object.fromEntries(sortedTeams.map((team) => [team.id, team.name]));
    setTeamNameDrafts(drafts);
  }, [sortedTeams]);

  function handleSaveTeamName(teamId: string) {
    const draft = teamNameDrafts[teamId] ?? "";
    setTeamName(teamId, draft);
  }

  const sounds = useMemo(
    () => snapshot.soundItems.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [snapshot.soundItems]
  );

  const buzzerLog = useMemo(
    () =>
      snapshot.buzzerEvents
        .slice()
        .sort((a, b) => new Date(b.pressedAt).getTime() - new Date(a.pressedAt).getTime())
        .slice(0, 12),
    [snapshot.buzzerEvents]
  );

  return (
    <div className="space-y-4">
      <section>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-300" />Live Status
            </CardTitle>
            <CardDescription>
              Aktuelles Spiel: <span className="font-semibold text-foreground">{activeGame.title}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <TimerDisplay
                running={currentState.timerState.running}
                startedAt={currentState.timerState.startedAt}
                elapsedMs={currentState.timerState.elapsedMs}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Button onClick={() => startTimer()} variant="default">
                <Timer className="mr-2 h-4 w-4" />Timer Start
              </Button>
              <Button onClick={() => stopTimer()} variant="secondary">
                <Hand className="mr-2 h-4 w-4" />Timer Stop
              </Button>
              <Button onClick={() => resetTimer()} variant="outline">
                <TimerReset className="mr-2 h-4 w-4" />Timer Reset
              </Button>
              <Button onClick={() => resetBuzzer()} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />Log leeren
              </Button>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Buzzer-Log (neueste zuerst)</p>
              {buzzerLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Buzzer-Ereignisse.</p>
              ) : (
                <div className="space-y-1.5">
                  {buzzerLog.map((event) => {
                    const team = snapshot.teams.find((entry) => entry.id === event.teamId);
                    return (
                      <div key={event.id} className="flex items-center justify-between rounded-lg border border-white/10 px-2.5 py-1.5 text-xs">
                        <span className="font-medium" style={{ color: team?.color ?? "#e5e7eb" }}>
                          {team?.name ?? event.teamId}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">{formatBuzzTime(event.pressedAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Show Navigation</CardTitle>
            <CardDescription>Schnellaktionen für den Live-Betrieb</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">Teamnamen</p>
              <div className="space-y-1.5">
                {sortedTeams.map((team) => (
                  <div key={team.id} className="flex items-center gap-1.5">
                    <Input
                      value={teamNameDrafts[team.id] ?? ""}
                      onChange={(event) =>
                        setTeamNameDrafts((prev) => ({
                          ...prev,
                          [team.id]: event.target.value
                        }))
                      }
                      className="h-9 text-sm"
                      style={{ borderColor: `${team.color}66` }}
                    />
                    <Button size="sm" variant="outline" onClick={() => handleSaveTeamName(team.id)}>
                      Speichern
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {nextGame ? (
              <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Nächstes Spiel</p>
                <p className="font-semibold">{nextGame.gameNumber}. {nextGame.title}</p>
                <Button size="sm" className="mt-2" onClick={() => setCurrentGame(nextGame.id)}>
                  <ArrowBigRightDash className="mr-2 h-4 w-4" />Als aktuelles Spiel setzen
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Alle Spiele wurden gestartet oder abgeschlossen.</p>
            )}


            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href="/scoreboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-input bg-background/80 px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Scoreboard öffnen
              </Link>
              <Link
                href="/public/current"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-input bg-background/80 px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Public Stage öffnen
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Music2 className="h-5 w-5" />Sounds
            </CardTitle>
            <CardDescription>Direktsteuerung im Dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
              {sounds.map((sound) => (
                <SoundTile
                  key={sound.id}
                  sound={sound}
                  active={activeSoundId === sound.id}
                  onPlay={play}
                  onStop={stop}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Medien</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background/80 px-3 text-sm"
              value={selectedMediaGame?.id ?? ""}
              onChange={(event) => selectMediaGame(event.target.value)}
            >
              {mediaGames.map((game) => (
                <option key={game.id} value={game.id}>
                  Spiel {game.gameNumber}: {game.title}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <MediaControlPanel
          title={selectedMediaGame ? `Spiel ${selectedMediaGame.gameNumber}: ${selectedMediaGame.title}` : "Kein Medien-Spiel"}
          items={mediaItems}
          index={snapshot.mediaControl.currentIndex}
          reveal={snapshot.mediaControl.reveal}
          showStartAnimation={selectedMediaGame ? selectedMediaGame.type === "media_laenderumrisse" || selectedMediaGame.slug === "laenderumrisse" || selectedMediaGame.title.toLowerCase() === "länderumrisse" : false}
          onPrev={() => previousMediaItem()}
          onNext={() => nextMediaItem()}
          onStartAnimation={() => startMediaAnimation()}
          onIndexChange={(index) => setMediaIndex(index)}
          onToggleReveal={() => toggleReveal()}
        />
      </section>
    </div>
  );
}
