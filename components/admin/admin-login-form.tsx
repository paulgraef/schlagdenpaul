"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { ADMIN_AUTH_KEY, getConfiguredAdminPin } from "@/lib/admin-auth";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      pin: ""
    }
  });

  async function onSubmit(values: AdminLoginInput) {
    setError(null);

    const configuredPin = getConfiguredAdminPin();
    if (values.pin !== configuredPin) {
      setError("PIN ist ungültig.");
      return;
    }

    localStorage.setItem(ADMIN_AUTH_KEY, "1");
    window.location.href = "/admin";
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="pin">Admin PIN</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="pin" type="password" className="pl-9" placeholder="****" {...register("pin")} />
        </div>
        {errors.pin ? <p className="text-xs text-rose-300">{errors.pin.message}</p> : null}
      </div>

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Prüfe Zugang..." : "Admin Dashboard öffnen"}
      </Button>
    </form>
  );
}
