import { z } from "zod";

// Extended schema for lab
export const editLabSchema = z.object({
  lab_id: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  address_1: z
    .string()
    .min(1, "Address Line 1 is required")
    .max(100, `Address Line 1 can't be more than 100 characters`),
  address_2: z
    .string()
    .max(100, `Address Line 3 can't be more than 100 characters`)
    .optional(),
  address_3: z
    .string()
    .max(100, `Address Line 3 can't be more than 100 characters`)
    .optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, `City name can't be more than 100 characters`),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, `Country name can't be more than 100 characters`),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, `Name can't be more than 100 characters`),
  state: z
    .string()
    .min(1, "State is required")
    .max(40, `State can't be more than 40 characters`),
  zipcode: z
    .string()
    .min(1, "Zipcode is required")
    .max(40, `Zip can't be more than 40 characters`),
  org_name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, `Organization name can't be more than 100 characters`),
});

export type ILabType = z.infer<typeof editLabSchema>;
