import { z } from "zod";

export const userCardInfoSchema = z.object({
  rfid: z
    .string()
    .min(1, "User Card Id is needed")
    .max(40, `User Card Id can't be more than 40 characters`)
    .trim(),
});
