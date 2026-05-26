import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AddNewUnitSchema = z.object({
  name: z
    .string({
      required_error: "Unit name is required",
      invalid_type_error: "Unit name must be a string",
    })
    .min(1, "Unit name is required")
    .max(50, `Unit can't be more than 50 characters`),
  symbol: z
    .string({
      required_error: "Symbol name is required",
      invalid_type_error: "Symbol name must be a string",
    })
    .min(1, "Symbol name is required")
    .max(25, `Symbol name can't be more than 25 characters`),
});

type Props = {
  onSubmit: (data: z.infer<typeof AddNewUnitSchema>) => void;
  loading?: boolean;
};

const AddNewUnit = ({ onSubmit, loading }: Props) => {
  const form = useForm({
    defaultValues: { name: "", symbol: "" },
    resolver: zodResolver(AddNewUnitSchema),
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <div className="pb-2">Add New Unit</div>
        <ControlledFormInput
          control={form.control}
          name="name"
          label="Unit Name"
          placeholder="ex: kilogram"
        />
        <ControlledFormInput
          control={form.control}
          name="symbol"
          label="Unit Symbol"
          placeholder="ex: kg"
        />
        <Button variant={"green"} disabled={loading}>
          {loading ? <Loader className="animate-spin" /> : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default AddNewUnit;
