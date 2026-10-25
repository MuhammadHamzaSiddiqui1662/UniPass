import { z } from "zod";

export const leadSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  whatsappNumber: z
    .string()
    .regex(
      /^\+92\s?\d{3}\s?\d{7}$/,
      "Please enter a valid Pakistani WhatsApp number (+92 XXX XXXXXXX)"
    ),
  city: z.string().min(1, "Please select a city"),
  levelOfStudy: z.string().min(1, "Please select a level of study"),
  bestTimeToReach: z.string().optional(),
  university: z.string().optional(),
  program: z.string().optional(),
});

export const eligibilityCheckSchema = z.object({
  level: z.enum(["Bachelor's", "Master's", "PhD"]),
  age: z.number().min(16).max(50),
  marks: z.number().min(0).max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "staff"]).default("staff"),
});

export const updateLeadSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "applied", "enrolled", "lost"]).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  addActivity: z
    .object({
      action: z.string(),
      note: z.string().optional(),
    })
    .optional(),
});

export const universitySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["public", "private"]),
  city: z.string().min(1),
  tuitionFrom: z.number().min(0),
  description: z.string().min(1),
  fields: z.array(z.string()).min(1),
  levels: z.array(z.string()).min(1),
  status: z.enum(["draft", "published"]),
});
