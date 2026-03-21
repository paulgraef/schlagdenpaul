import { Suspense } from "react";
import { BuzzerPageClient } from "@/components/game/buzzer-page-client";

export default function BuzzerPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <BuzzerPageClient />
    </Suspense>
  );
}

