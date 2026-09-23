import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  avatarUrl: z.string().url("Enter a valid image URL").or(z.literal("")).optional(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

const budgetField = z
  .number({ invalid_type_error: "Enter a budget amount" })
  .min(1000, "Budget must be at least 1,000")
  .max(100000000, "Budget looks too large");

export const homePlannerSchema = z.object({
  totalBudget: budgetField,
  currency: z.string().min(1),
  flexibility: z.enum(["strict", "moderate", "flexible"]),
  rooms: z
    .array(
      z.object({
        name: z.string().min(1, "Room name is required"),
        quantity: z.number().min(1, "At least 1").max(50),
        notes: z.string().max(300).optional(),
      }),
    )
    .min(1, "Add at least one room"),
  requirements: z
    .array(
      z.object({
        category: z.string().min(1, "Category is required"),
        quantity: z.number().min(1, "At least 1").max(200),
        priority: z.enum(["low", "medium", "high"]),
        preferredStyle: z.string().max(120).optional(),
      }),
    )
    .min(1, "Add at least one requirement"),
  style: z.string().max(120).optional(),
  colorPreference: z.string().max(120).optional(),
  qualityPreference: z.string().max(120).optional(),
  brandPreference: z.string().max(120).optional(),
  otherRequirements: z.string().max(600).optional(),
});
export type HomePlannerValues = z.infer<typeof homePlannerSchema>;

export const partyPlannerSchema = z.object({
  totalBudget: budgetField,
  currency: z.string().min(1),
  guestCount: z
    .number({ invalid_type_error: "Enter the number of guests" })
    .min(1, "At least 1 guest")
    .max(5000, "That is a very large event"),
  eventType: z.string().min(1, "Select an event type"),
  venueType: z.string().min(1, "Select a venue type"),
  eventDate: z.string().min(1, "Select an event date"),
  foodPreference: z.string().max(120).optional(),
  decorationPreference: z.string().max(120).optional(),
  entertainmentPreference: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  additionalRequirements: z.string().max(600).optional(),
});
export type PartyPlannerValues = z.infer<typeof partyPlannerSchema>;

export const jewelryPlannerSchema = z.object({
  totalBudget: budgetField,
  currency: z.string().min(1),
  occasion: z.string().min(1, "Select an occasion"),
  jewelryType: z.string().min(1, "Select a jewelry type"),
  style: z.string().min(1, "Select a style"),
  metalPreference: z.string().max(120).optional(),
  colorPreference: z.string().max(120).optional(),
  additionalRequirements: z.string().max(600).optional(),
  outfitImageName: z.string().optional(),
});
export type JewelryPlannerValues = z.infer<typeof jewelryPlannerSchema>;
