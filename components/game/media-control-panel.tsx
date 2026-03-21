"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MediaItemEntity } from "@/types/domain";

interface MediaControlPanelProps {
  title: string;
  items: MediaItemEntity[];
  index: number;
  reveal: boolean;
  showStartAnimation?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onStartAnimation?: () => void;
  onIndexChange: (index: number) => void;
  onToggleReveal: () => void;
}

export function MediaControlPanel({
  title,
  items,
  index,
  reveal,
  showStartAnimation = false,
  onPrev,
  onNext,
  onStartAnimation,
  onIndexChange,
  onToggleReveal
}: MediaControlPanelProps) {
  const current = items[index];
  const countryName =
    typeof current?.metadata?.country === "string" && current.metadata.country.trim().length
      ? current.metadata.country.trim()
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="text-xs text-muted-foreground">
            Item {Math.min(index + 1, items.length || 1)} von {items.length || 0}
          </p>
          <p className="text-sm font-semibold">{current?.title ?? "Kein Item"}</p>
          {countryName ? <p className="text-xs text-cyan-300">Land: {countryName}</p> : null}
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
          {current ? (
            <Image
              src={current.assetUrl}
              alt={current.title}
              width={1200}
              height={700}
              className="h-[260px] w-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">Keine Medien vorhanden</div>
          )}
        </div>

        <div className={`grid grid-cols-2 gap-2 ${showStartAnimation ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
          <Button variant="outline" onClick={onPrev} disabled={index <= 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />Zurück
          </Button>
          <Button variant="outline" onClick={onNext} disabled={index >= items.length - 1}>
            <ChevronRight className="mr-2 h-4 w-4" />Weiter
          </Button>
          {showStartAnimation ? (
            <Button variant="outline" onClick={onStartAnimation} disabled={!onStartAnimation}>
              <Play className="mr-2 h-4 w-4" />Animation starten
            </Button>
          ) : null}
          <Button variant={reveal ? "secondary" : "default"} onClick={onToggleReveal}>
            {reveal ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {reveal ? "Verdecken" : "Aufdecken"}
          </Button>
          <select
            className="h-10 rounded-xl border border-input bg-background/80 px-3 text-sm"
            value={index}
            onChange={(event) => onIndexChange(Number(event.target.value))}
          >
            {items.map((item, itemIndex) => (
              <option key={item.id} value={itemIndex}>
                {itemIndex + 1}. {item.title}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
