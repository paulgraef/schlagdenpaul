import { z } from "zod";

export const adminLoginSchema = z.object({
  pin: z
    .string()
    .min(4, "PIN muss mindestens 4 Zeichen haben")
    .max(12, "PIN zu lang")
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const manualPointsSchema = z.object({
  teamId: z.string().min(1),
  points: z.coerce.number().min(0).max(50)
});

export type ManualPointsInput = z.infer<typeof manualPointsSchema>;
