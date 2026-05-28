import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mono/shared_ui/components/ui/button";
import { useForm } from "react-hook-form";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import { Form } from "@mono/shared_ui/components/ui/form";

import { z } from "zod";

export const filterSchema = z.object({
  searchQuery: z.string(),
  status: z.string(),
});

export type MachineFilterSchema = z.infer<typeof filterSchema>;

const statusOptions = [
  { label: "All", value: "ALL" },
  { label: "OFF", value: "OFF" },
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "OCCUPIED", value: "OCCUPIED" },
  { label: "UNDER_MAINTENANCE", value: "UNDER_MAINTENANCE" },
  { label: "RETIRED", value: "RETIRED" },
  { label: "FAULTY", value: "FAULTY" },
];

type Props = {
  handleFilterSubmit: (data: MachineFilterSchema) => void;
  handleFilterClear: (isDirty: boolean) => void;
  defaultValue: MachineFilterSchema;
};

const MachineFilters = ({
  handleFilterClear,
  handleFilterSubmit,
  defaultValue,
}: Props) => {
  const form = useForm<MachineFilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: defaultValue || {
      searchQuery: "",
      role: "",
      status: "all",
    },
  });

  const handleClear = () => {
    form.reset();
    handleFilterClear(form.formState.isDirty);
  };

  const handleSubmit = (data: MachineFilterSchema) => {
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
          placeholder="Search machine"
          control={form.control}
        />
        <ControlledFormSelect
          className="height-6 w-full"
          name="status"
          placeholder="Status"
          control={form.control}
          options={statusOptions}
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

export default MachineFilters;
