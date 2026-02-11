import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  zone: z.string().optional(),
  image: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "collector", "user"]),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;
