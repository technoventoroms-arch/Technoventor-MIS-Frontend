import { z } from "zod";

export const UpdateUserProfileSchema = z.object({
  user_id: z.number(),
  email: z.string().email(),
  first_name: z
    .string()
    .max(100, `First name can't be more than 100 characters`),

  last_name: z.string().max(100, `Last name can't be more than 100 characters`),

  image_link: z
    .string({ required_error: "Image is required" })
    .min(1, "Image is required"),
});

export type IUpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;
