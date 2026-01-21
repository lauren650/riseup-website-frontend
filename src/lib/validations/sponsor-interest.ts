import { z } from "zod";

export const sponsorInterestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  recaptchaToken: z.string().optional(),
});

export type SponsorInterestFormData = z.infer<typeof sponsorInterestSchema>;
