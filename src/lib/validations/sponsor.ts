import { z } from "zod";

export const sponsorSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  websiteUrl: z.string().url("Please enter a valid website URL"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),
});

export type SponsorFormData = z.infer<typeof sponsorSchema>;
