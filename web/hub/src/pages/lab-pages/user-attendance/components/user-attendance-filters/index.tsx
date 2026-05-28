import { zodResolver } from "@hookform/resolvers/zod";
import ControlledDatePicker from "@mono/shared_ui/components/controlled-form-component/c-form-date-picker";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const filterSchema = z.object({
  from: z.date().nullable().optional(),
  to: z.date().nullable().optional(),
  status: z.string().optional(),
});

export type AttendanceFilterSchema = z.infer<typeof filterSchema>;

type Props = {
  handleFilterSubmit: (data: AttendanceFilterSchema) => void;
  handleFilterClear: (isDirty: boolean) => void;
  defaultValue: AttendanceFilterSchema;
};

const AttendanceFilters = ({
  handleFilterClear,
  handleFilterSubmit,
  defaultValue,
}: Props) => {
  const form = useForm<AttendanceFilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: defaultValue || {
      status: "",
      from: null,
      to: null,
    },
  });

  const handleClear = () => {
    form.reset();
    handleFilterClear(form.formState.isDirty);
  };

  const handleSubmit = (data: AttendanceFilterSchema) => {
    form.reset(data, { keepDirty: true });
    const temp = { ...data };
    if (temp.to) {
      const tempTo = new Date(temp.to);
      tempTo.setHours(23, 59, 59);
      temp.to = tempTo;
    }
    handleFilterSubmit(temp);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex md:items-center md:space-x-2 space-y-2 flex-col md:flex-row"
      >
        <ControlledDatePicker
          control={form.control}
          placeholder="From Date"
          name="from"
          datePickerProps={{
            className: "w-full",
          }}
        />
        <ControlledDatePicker
          control={form.control}
          placeholder="To Date"
          name="to"
          datePickerProps={{
            className: "w-full",
            fromDate: form.watch("from") || undefined,
          }}
        />
        <ControlledFormSelect
          className="height-6 w-full"
          name="status"
          placeholder="Status"
          control={form.control}
          options={[
            { value: "all", label: "All" },
            { value: "APPROVED", label: "Approved" },
            { value: "PENDING", label: "Pending" },
            { value: "REJECTED", label: "Rejected" },
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

export default AttendanceFilters;
