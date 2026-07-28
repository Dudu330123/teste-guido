import { z } from "zod";

export const userProgressSchema = z.object({
  guideId: z.string().min(1),
  currentStep: z.number().int().nonnegative(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  lastAccessedAt: z.string().datetime(),
  guideVersion: z.string().min(1),
  operatingSystem: z.enum(["android", "ios"]),
});
