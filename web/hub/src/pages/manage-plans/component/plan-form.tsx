import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { Loader } from "lucide-react";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const newPlanSchema = z.object({
  amount: z
    .number({ coerce: true, invalid_type_error: "Amount should be a number" })
    .nonnegative("Amount cannot be negative"),
  currency: z
    .string({ required_error: "Currency is required" })
    .min(1, "Currency is required"),
  default_notify_customer: z
    .boolean({
      invalid_type_error: "Notify customer must be true or false",
    })
    .optional(),
  default_quantity: z
    .number({
      coerce: true,
      invalid_type_error: "Default quantity must be a number",
    })
    .nonnegative("Default quantity cannot be negative"),
  default_total_count: z
    .number({
      coerce: true,
      invalid_type_error: "Total count must be a number",
    })
    .nonnegative("Total count cannot be negative"),
  description: z
    .string({ invalid_type_error: "Description must be a string" })
    .optional(),
  entitlements: z.object({
    LAB: z
      .number({ coerce: true, invalid_type_error: "Lab must be a number" })
      .nonnegative()
      .optional(),
    MACHINE: z
      .number({ coerce: true, invalid_type_error: "Machine must be a number" })
      .nonnegative()
      .optional(),
    PROJECT: z
      .number({ coerce: true, invalid_type_error: "Project must be a number" })
      .nonnegative()
      .optional(),
    USER: z
      .number({ coerce: true, invalid_type_error: "Users must be a number" })
      .nonnegative()
      .optional(),
  }),
  interval: z
    .number({ coerce: true, invalid_type_error: "Interval must be a number" })
    .nonnegative("Interval cannot be negative"),
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty"),
  period: z.enum(["daily", "weekly", "monthly", "yearly"], {
    invalid_type_error: "Period must be one of: daily, weekly, monthly, yearly",
  }),
});

export type NewPlanType = z.infer<typeof newPlanSchema>;

type Props = {
  handleSubmit: (data: NewPlanType) => void;
  defaultValues?: Partial<NewPlanType>;
  loading?: boolean;
  editMode?: boolean;
  deleteButton?: ReactNode;
};

const PlanForm = ({
  handleSubmit,
  defaultValues,
  loading,
  editMode,
  deleteButton = null,
}: Props) => {
  const form = useForm<NewPlanType>({
    defaultValues: defaultValues
      ? { ...defaultValues, currency: "INR" }
      : { currency: "INR", period: "monthly" },
    resolver: zodResolver(newPlanSchema),
    disabled: loading,
  });

  const { isDirty } = form.formState;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 px-4 pb-4 flex-1 overflow-auto"
      >
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-6">
            <ControlledFormInput
              name="name"
              label="Name"
              control={form.control}
              disabled={editMode}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name="description"
              label="Description"
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name="currency"
              label="Currency"
              control={form.control}
              disabled
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name="amount"
              label="Amount"
              type="number"
              control={form.control}
              disabled={editMode}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormSelect
              className="height-6 w-full"
              name="period"
              placeholder="Period"
              control={form.control}
              label="Period"
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
              getItemLabel={(e) => e.label}
              getItemValue={(e) => e.value}
              disabled={editMode}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name="interval"
              label="Plan Payment Interval"
              type="number"
              control={form.control}
              disabled={editMode}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name="default_quantity"
              label="Subscription Quantity"
              type="number"
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name="default_total_count"
              label="Subscription Total Count"
              type="number"
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              className="h-8 w-8"
              name="default_notify_customer"
              label="Notify Customer?"
              type="checkbox"
              control={form.control}
            />
          </div>
          <div className="col-span-6">Entitlements</div>
          <div className="col-span-6 space-y-2">
            <ControlledFormInput
              name="entitlements.LAB"
              label="Lab quantity"
              type="number"
              control={form.control}
            />
            <ControlledFormInput
              name="entitlements.USER"
              label="User quantity"
              type="number"
              control={form.control}
            />
            <ControlledFormInput
              name="entitlements.MACHINE"
              label="Machine quantity"
              type="number"
              control={form.control}
            />
            <ControlledFormInput
              name="entitlements.PROJECT"
              label="Project quantity"
              type="number"
              control={form.control}
            />
          </div>
        </div>

        <div className="flex justify-end">
          {deleteButton}
          <Button disabled={loading || !isDirty} type="submit" variant="green">
            {loading ? <Loader className="animate-spin" /> : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PlanForm;
