import ControlledDatePicker from "@mono/shared_ui/components/controlled-form-component/c-form-date-picker";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { useFormContext } from "react-hook-form";
import { AttendanceFilterSchema } from "../..";

type Props = {
  handleFilterSubmit: (data: AttendanceFilterSchema) => void;
  handleFilterClear: (isDirty: boolean) => void;
};

const AttendanceFilters = ({
  handleFilterClear,
  handleFilterSubmit,
}: Props) => {
  const form = useFormContext();
  const handleClear = () => {
    form.reset({
      from: null,
      to: null,
    });
    handleFilterClear(form.formState.isDirty);
  };

  const handleSubmit = (data: AttendanceFilterSchema) => {
    form.reset(data, { keepDirty: true });
    handleFilterSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex md:items-center md:space-x-2 space-y-2 gap-2 flex-wrap"
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
