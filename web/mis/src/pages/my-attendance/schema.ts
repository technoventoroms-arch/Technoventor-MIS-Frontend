import { z } from "zod";

// Base address schema
export const regularizeSchema = z
  .object({
    check_in_at: z.date().nullable(),
    check_out_at: z.date().nullable(),
  })
  .refine(
    ({ check_in_at, check_out_at }) =>
      !!(
        check_in_at &&
        check_out_at &&
        check_in_at?.getTime() <= check_out_at?.getTime()
      ),
    {
      message: `Check-in time should be less than check-out time`,
      path: ["check_in_at"], // Point to the field causing the error
    }
  );
export type RegularizeSchemaType = z.infer<typeof regularizeSchema>;
