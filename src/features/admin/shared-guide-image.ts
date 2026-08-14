import { z } from "zod";

export const guideImageContextSchema = z.object({
  guideSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  applicationSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).nullable(),
  operatingSystem: z.enum(["android", "ios"]),
  stepId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200),
  stepOrder: z.number().int().min(1).max(500),
});

export interface SharedGuideImageDraft {
  id: string;
  stepId: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  byteSize: number;
  width: number;
  height: number;
  updatedAt: string;
  previewUrl: string;
}

export function extensionForGuideImage(mimeType: SharedGuideImageDraft["mimeType"]) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}
