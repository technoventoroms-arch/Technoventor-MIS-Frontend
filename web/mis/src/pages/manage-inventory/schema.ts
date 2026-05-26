import { z } from "zod";

// Define ItemType enum
export const ItemTypeEnum = z.enum(["REUSABLE", "CONSUMABLE"]);
export type ItemType = z.infer<typeof ItemTypeEnum>;

// Define Item schema
export const NewItemSchema = z.object({
  category: z
    .object(
      {},
      {
        invalid_type_error: "Category is required",
        required_error: "Category is required",
      }
    )
    .passthrough(),
  description: z
    .string({ required_error: "Description is required" })
    .max(255, `Description can't be more than 255 characters`),

  name: z.string().max(50, `Name can't be more than 50 characters`),

  sku: z.string().max(50, `SKU can't be more than 50 characters`),

  type: ItemTypeEnum,
  unit: z
    .object(
      {},
      {
        invalid_type_error: "Unit is required",
        required_error: "Unit is required",
      }
    )
    .passthrough(),
  quantity: z.coerce.number({
    invalid_type_error: "Quantity is required",
    required_error: "Quantity is required",
  }),
  threshold: z.coerce.number({
    required_error: "Min Threshold is required",
    invalid_type_error: "Min Threshold is required",
  }),
  image_link: z
    .string({ required_error: "Image is required" })
    .min(1, "Image is required"),
});
export type NewInventoryItemType = z.infer<typeof NewItemSchema>;
