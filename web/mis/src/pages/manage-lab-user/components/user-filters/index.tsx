import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mono/shared_ui/components/ui/button";
import { useForm } from "react-hook-form";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import { Form } from "@mono/shared_ui/components/ui/form";

import { z } from "zod";

export const filterSchema = z.object({
  searchQuery: z.string(),
  role: z.string(),
});

export type UserFilterSchema = z.infer<typeof filterSchema>;

type Props = {
  handleFilterSubmit: (data: UserFilterSchema) => void;
  handleFilterClear: (isDirty: boolean) => void;
  defaultValue: UserFilterSchema;
};

const UserFilters = ({
  handleFilterClear,
  handleFilterSubmit,
  defaultValue,
}: Props) => {
  const form = useForm<UserFilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: defaultValue || {
      searchQuery: "",
      role: "",
    },
  });

  const handleClear = () => {
    form.reset();
    handleFilterClear(form.formState.isDirty);
  };

  const handleSubmit = (data: UserFilterSchema) => {
    form.reset(data, { keepDirty: true });
    handleFilterSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex md:items-center md:space-x-2 space-y-2 flex-col md:flex-row"
      >
        <ControlledFormInput
          className="height-6"
          name="searchQuery"
          placeholder="Search user"
          control={form.control}
        />
        <ControlledFormSelect
          className="height-6 w-full"
          name="role"
          placeholder="Role"
          control={form.control}
          options={[
            { value: "all", label: "All" }, 
            { value: "admin", label: "Admin" },
            { value: "manager", label: "Manager" },
            { value: "user", label: "User" },
          ]}
          getItemLabel={(e) => e.label}
          getItemValue={(e) => e.value}
        />

        <div className="flex-1 l-auto flex gap-2 justify-end">
          <Button
            type="button"
            variant="gray"
            size={"sm"}
            onClick={handleClear}
            rounded={"xs"}
          >
            {form.formState.isDirty && "Clear & "} Close
          </Button>
          <Button
            disabled={!form.formState.isDirty}
            rounded={"xs"}
            size={"sm"}
            type="submit"
          >
            Apply
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserFilters;
