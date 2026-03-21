import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppShell({ sidebar, header, children, className }: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        {sidebar ? <aside className="hidden w-72 border-r border-white/10 bg-black/20 md:block">{sidebar}</aside> : null}
        <main className="flex-1">
          {header}
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
