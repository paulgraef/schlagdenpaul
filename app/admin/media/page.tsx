"use client";

import { useMemo } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { MediaControlPanel } from "@/components/game/media-control-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MEDIA_GAME_TYPES = new Set([
  "media_laenderumrisse",
  "media_flaggen",
  "media_wer_luegt",
  "media_sortieren",
  "media_deutschland"
]);

export default function AdminMediaPage() {
  const { snapshot, selectMediaGame, setMediaIndex, nextMediaItem, previousMediaItem, toggleReveal, startMediaAnimation } = useEventStore(
    (state) => state
  );

  const mediaGames = useMemo(
    () => snapshot.games.filter((game) => MEDIA_GAME_TYPES.has(game.type)),
    [snapshot.games]
  );

  const selectedGame = mediaGames.find((game) => game.id === snapshot.mediaControl.gameId) ?? mediaGames[0];
  const items = snapshot.mediaItems
    .filter((item) => item.gameId === selectedGame?.id)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medien</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="h-10 w-full rounded-xl border border-input bg-background/80 px-3 text-sm"
            value={selectedGame?.id ?? ""}
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
        title={selectedGame ? `Spiel ${selectedGame.gameNumber}: ${selectedGame.title}` : "Kein Medien-Spiel"}
        items={items}
        index={snapshot.mediaControl.currentIndex}
        reveal={snapshot.mediaControl.reveal}
        showStartAnimation={selectedGame ? selectedGame.type === "media_laenderumrisse" || selectedGame.slug === "laenderumrisse" || selectedGame.title.toLowerCase() === "länderumrisse" : false}
        onPrev={() => previousMediaItem()}
        onNext={() => nextMediaItem()}
        onStartAnimation={() => startMediaAnimation()}
        onIndexChange={(index) => setMediaIndex(index)}
        onToggleReveal={() => toggleReveal()}
      />
    </div>
  );
}
