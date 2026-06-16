import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
  })
  .strict();

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const supplierProfileSchema = z.object({
  type: z.enum(["INDIVIDUAL", "AGENCY"]),
  businessName: z.string().min(2, "Business name is required"),
  bio: z.string().max(1000).optional().or(z.literal("")),
  location: z.string().min(2, "Location is required"),
});

export const carSchema = z.object({
  title: z.string().min(3, "Title is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  category: z.enum([
    "ECONOMY",
    "COMPACT",
    "SEDAN",
    "SUV",
    "LUXURY",
    "VAN",
    "PICKUP",
  ]),
  transmission: z.enum(["MANUAL", "AUTOMATIC"]),
  fuel: z.enum(["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC"]),
  seats: z.coerce.number().int().min(1).max(15),
  pricePerDay: z.coerce.number().positive("Price must be greater than 0"),
  location: z.string().min(2, "Location is required"),
  description: z.string().max(2000).optional().or(z.literal("")),
  photos: z.array(z.string()).default([]),
  status: z.enum(["ACTIVE", "HIDDEN"]).default("ACTIVE"),
});

export const bookingSchema = z.object({
  carId: z.string().min(1),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().or(z.literal("")),
});

export const messageSchema = z.object({
  conversationId: z.string().optional(),
  carId: z.string().optional(),
  supplierId: z.string().optional(),
  body: z.string().min(1, "Message cannot be empty").max(2000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type CarInput = z.infer<typeof carSchema>;
