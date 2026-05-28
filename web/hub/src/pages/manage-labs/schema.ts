import { z } from "zod";

// Base address schema
export const newlabSchema = z.object({
  address_1: z.string().min(1, "Address Line 1 is required"),
  address_2: z.string().optional(),
  address_3: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  name: z.string().min(1, "Name is required"),
  state: z.string().min(1, "State is required"),
  zipcode: z.string().min(1, "Zipcode is required"),
  org_name: z.string().min(1, "Organization name is required"),
});
export type NewLabType = z.infer<typeof newlabSchema>;

// Extended schema for lab
export const labSchema = newlabSchema.extend({
  lab_id: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ILabType = z.infer<typeof labSchema>;
