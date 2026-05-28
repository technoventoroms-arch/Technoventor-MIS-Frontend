import { z } from "zod";

export const createNewMachine = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description can't be more than 255 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name can't be more than 50 characters"),
  image_link: z
    .string({ required_error: "Image is required" })
    .min(1, "Name is required"),
});

export const editMachineSchema = createNewMachine.extend({
  status: z.string(),
  notes: z.string(),
});
