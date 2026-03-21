"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface ConfirmActionDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  triggerLabel: string;
  onConfirm: () => void;
}

export function ConfirmActionDialog({
  title,
  description,
  confirmText = "Bestätigen",
  triggerLabel,
  onConfirm
}: ConfirmActionDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
