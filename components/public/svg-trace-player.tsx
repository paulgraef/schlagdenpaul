"use client";

import { useEffect, useRef, useState } from "react";

interface SvgTracePlayerProps {
  src: string;
  alt: string;
  traceKey: string;
  durationSeconds?: number;
}

const GEOMETRY_SELECTOR = "path, circle, ellipse, line, polyline, polygon, rect";

export function SvgTracePlayer({ src, alt, traceKey, durationSeconds = 60 }: SvgTracePlayerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSvg() {
      try {
        setError(false);
        const response = await fetch(src, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`SVG konnte nicht geladen werden (${response.status})`);
        }

        const raw = await response.text();
        const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) {
          throw new Error("Keine SVG-Struktur gefunden");
        }

        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", alt);
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.setAttribute("class", "h-full w-full");

        if (!cancelled) {
          setSvgMarkup(svg.outerHTML);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setSvgMarkup(null);
        }
      }
    }

    void loadSvg();

    return () => {
      cancelled = true;
    };
  }, [src, alt]);

  useEffect(() => {
    if (!hostRef.current || !svgMarkup) {
      return;
    }

    const svg = hostRef.current.querySelector("svg");
    if (!svg) {
      return;
    }

    const shapes = Array.from(svg.querySelectorAll<SVGGeometryElement>(GEOMETRY_SELECTOR));
    if (!shapes.length) {
      return;
    }

    const totalDurationMs = Math.max(3000, durationSeconds * 1000);
    const shapeDurationMs = Math.max(280, Math.floor(totalDurationMs / Math.max(1, shapes.length)));

    shapes.forEach((shape, index) => {
      const strokeAttr = (shape.getAttribute("stroke") ?? "").trim().toLowerCase();
      if (!strokeAttr || strokeAttr === "none" || strokeAttr === "transparent") {
        shape.setAttribute("stroke", "#111111");
      }

      const strokeWidthAttr = (shape.getAttribute("stroke-width") ?? "").trim();
      if (!strokeWidthAttr || strokeWidthAttr === "0") {
        shape.setAttribute("stroke-width", "2.5");
      }

      shape.setAttribute("fill", "none");
      shape.setAttribute("stroke-linecap", "round");
      shape.setAttribute("stroke-linejoin", "round");
      shape.setAttribute("vector-effect", "non-scaling-stroke");

      shape.style.stroke = "#111111";
      shape.style.fill = "none";
      shape.style.strokeWidth = shape.getAttribute("stroke-width") ?? "2.5";

      let length = 1200;
      try {
        length = (shape as unknown as SVGPathElement).getTotalLength();
      } catch {
        length = 1200;
      }

      shape.style.strokeDasharray = `${length}`;
      shape.style.strokeDashoffset = `${length}`;
      shape.getBoundingClientRect();

      shape.animate(
        [
          { strokeDashoffset: `${length}` },
          { strokeDashoffset: "0" }
        ],
        {
          duration: shapeDurationMs,
          delay: index * shapeDurationMs,
          easing: "linear",
          fill: "forwards"
        }
      );
    });
  }, [svgMarkup, traceKey, durationSeconds]);

  if (error) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-sm text-muted-foreground md:h-[560px]">
        SVG konnte nicht geladen werden
      </div>
    );
  }

  if (!svgMarkup) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-sm text-muted-foreground md:h-[560px]">
        SVG wird geladen...
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className="h-[420px] w-full rounded-2xl border border-white/10 bg-[#ececec] p-3 md:h-[560px]"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
