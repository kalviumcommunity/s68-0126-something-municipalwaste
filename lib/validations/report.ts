import { z } from "zod";

export const reportSchema = z.object({
  type: z.enum([
    "missed_collection",
    "damaged_bin",
    "illegal_dumping",
    "other",
  ]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(5, "Location is required"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  imageUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateReportSchema = z.object({
  status: z.enum(["pending", "investigating", "resolved"]).optional(),
  resolvedBy: z.string().optional(),
  resolutionNotes: z.string().optional(),
  resolvedAt: z.string().optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
export type UpdateReport = z.infer<typeof updateReportSchema>;
