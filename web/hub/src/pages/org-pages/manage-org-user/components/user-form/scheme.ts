import { z } from "zod";

export const createUser = z.object({
  email: z.string().email(),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, `First Name can't be more than 100 characters`),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, `Last Name can't be more than 100 characters`),
  role: z.coerce.number(),
  lab: z
    .object(
      {},
      {
        invalid_type_error: "Lab is required",
        required_error: "Lab is required",
      }
    )
    .required()
    .passthrough(),
});
