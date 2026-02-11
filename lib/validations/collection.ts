import { z } from "zod";

export const collectionRequestSchema = z.object({
  wasteType: z.enum([
    "general",
    "recycling",
    "organic",
    "hazardous",
    "electronic",
    "bulk",
  ]),
  address: z.string().min(10, "Address must be at least 10 characters"),
  zone: z.string().min(1, "Zone is required"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  notes: z.string().optional(),
  scheduledDate: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateCollectionSchema = z.object({
  status: z
    .enum([
      "pending",
      "scheduled",
      "in_progress",
      "completed",
      "cancelled",
      "missed",
    ])
    .optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  collectorId: z.string().optional(),
  collectorNotes: z.string().optional(),
  proofImageUrl: z.string().optional(),
  completedAt: z.string().optional(),
});

export type CollectionRequest = z.infer<typeof collectionRequestSchema>;
export type UpdateCollection = z.infer<typeof updateCollectionSchema>;
