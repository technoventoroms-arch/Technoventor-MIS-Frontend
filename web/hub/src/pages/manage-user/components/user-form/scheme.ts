import { z } from "zod";

export const createNewUser = z.object({
  email: z.string().email(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  lab: z.object({}).passthrough().nullable(),
  role: z.coerce.number(),
});
