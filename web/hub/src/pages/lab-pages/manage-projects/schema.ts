import { z } from "zod";

// Base address schema
export const newProjectSchema = z.object({
  title: z.string().max(50, `Title can't be more than 50 characters`),

  description: z
    .string()
    .max(255, `Description can't be more than 255 characters`),

  priority: z.string(),
  end_date: z.coerce.date({
    invalid_type_error: "Please select a valid date",
    message: "Project end Date is needed.",
  }),
});
export type NewProjectType = z.infer<typeof newProjectSchema>;

export const projectSchema = newProjectSchema.extend({
  id: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  owner: z
    .object(
      {
        user_id: z.number(),
        email: z.string().email(),
        first_name: z.string(),
        last_name: z.string(),
        role_name: z.string(), // adjust roles as needed
        image_link: z.string(), // if it's not always a full URL
        identity_provider_id: z.string(),
      },
      { required_error: "Owner is required" }
    )
    .passthrough()
    .required(),
});

export type IProjectType = z.infer<typeof projectSchema>;
