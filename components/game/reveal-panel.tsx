import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RevealPanel({ reveal, onToggle }: { reveal: boolean; onToggle: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reveal</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant={reveal ? "secondary" : "default"} className="w-full" onClick={onToggle}>
          {reveal ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {reveal ? "Reveal deaktivieren" : "Reveal aktivieren"}
        </Button>
      </CardContent>
    </Card>
  );
}
