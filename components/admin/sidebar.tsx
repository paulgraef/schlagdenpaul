"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { adminNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <Link href="/" className="mb-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
        <Image src="/logo.png" alt="Schlag den Paul" width={40} height={40} className="rounded-lg" />
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Live Show</p>
          <p className="font-heading text-sm font-semibold">Schlag den Paul</p>
        </div>
      </Link>

      <nav className="space-y-1">
        {adminNavigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors",
                active
                  ? "bg-primary/20 text-primary shadow-[0_0_20px_-10px_rgba(56,189,248,0.8)]"
                  : "hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-muted-foreground">
        <p>Event Mode: Live</p>
        <p>Optimiert für Touch, Keyboard und Beamer-View.</p>
      </div>
    </div>
  );
}
