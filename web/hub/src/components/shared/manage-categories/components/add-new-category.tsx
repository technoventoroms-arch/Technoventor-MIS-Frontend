import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AddNewCategorySchema = z.object({
  category: z.string().max(75, `Category cant be more than 75 characters`),
});

type Props = {
  onSubmit: (data: z.infer<typeof AddNewCategorySchema>) => void;
  loading?: boolean;
};

const AddNewCategory = ({ onSubmit, loading }: Props) => {
  const form = useForm({
    defaultValues: { category: "" },
    resolver: zodResolver(AddNewCategorySchema),
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <div className="pb-2">Add New Category</div>
        <ControlledFormInput
          control={form.control}
          name="category"
          label="Category Name"
          placeholder="ex: wire"
        />
        <Button variant={"green"} disabled={loading}>
          {loading ? <Loader className="animate-spin" /> : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default AddNewCategory;
