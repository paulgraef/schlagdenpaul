"use client";

import { useEffect, useState } from "react";
import { ADMIN_AUTH_KEY } from "@/lib/admin-auth";
import { AppShell } from "@/components/app-shell";
import { AdminAuthGate } from "@/components/admin/admin-auth-gate";
import { AdminHeader } from "@/components/admin/admin-header";
import { Sidebar } from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAdmin(localStorage.getItem(ADMIN_AUTH_KEY) === "1");
  }, []);

  if (isAdmin === null) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAdmin) {
    return <AdminAuthGate />;
  }

  return <AppShell sidebar={<Sidebar />} header={<AdminHeader />}>{children}</AppShell>;
}
