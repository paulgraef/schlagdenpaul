import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export function AdminAuthGate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(2,132,199,0.16),transparent_55%),linear-gradient(180deg,#020617,#030712)] p-4">
      <Card className="w-full max-w-md border-white/20 bg-black/55">
        <CardHeader>
          <CardTitle>Admin Zugriff</CardTitle>
          <CardDescription>PIN eingeben, um die Live-Show zu steuern.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
