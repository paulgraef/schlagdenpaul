import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Schlag den Paul",
  description: "Premium Live-Event Tool für Spielshow, Scoreboard und Realtime-Gameplay"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
