import { z } from "zod";

export const editUser = z.object({
  email: z.string().email(),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, `First Name can't be more than 100 characters`),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, `Last Name can't be more than 100 characters`),
  role_name: z
    .string()
    .min(1, "Role is required")
    .max(100, `Role can't be more than 100 characters`),
});
