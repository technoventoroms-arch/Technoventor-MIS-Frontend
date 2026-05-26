import ControlledDatePicker from "@mono/shared_ui/components/controlled-form-component/c-form-date-picker";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import { Button } from "@mono/shared_ui/components/ui/button";
import { useFormContext, useWatch } from "react-hook-form";
import { zodFilterSchema } from "..";

export type MachineReqFilterSchema = {
  searchQuery?: string;
  status?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
};

type Props = {
  handleFilterSubmit: (data: MachineReqFilterSchema) => void;
  handleFilterClear: (isDirty: boolean) => void;
};

const MachineRequestFilters = ({
  handleFilterClear,
  handleFilterSubmit,
}: Props) => {
  const form = useFormContext();
  const [from, to] = useWatch({ control: form.control, name: ["from", "to"] });
  const handleClear = () => {
    form.reset({
      searchQuery: "",
      status: "",
      from: null,
      to: null,
    });
    handleFilterClear(form.formState.isDirty);
  };

  const handleSubmit = (data: zodFilterSchema) => {
    form.reset(data, { keepDirty: true });
    handleFilterSubmit({
      fromDate: data?.from,
      toDate: data?.to,
      searchQuery: data.searchQuery,
      status: data.status,
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit as any)}
      className="flex md:items-center md:space-x-2 space-y-2 flex-col md:flex-row"
    >
      <div className="flex flex-wrap gap-2">
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
          options={[
            { value: "ALL", label: "All" },
            { value: "NEW", label: "New" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
          getItemLabel={(e) => e.label}
          getItemValue={(e) => e.value}
        />
        <ControlledDatePicker
          control={form.control}
          name={"from"}
          placeholder="From Date"
          datePickerProps={{
            toDate: to ?? undefined,
          }}
        />
        <ControlledDatePicker
          control={form.control}
          name={"to"}
          placeholder="To Date"
          datePickerProps={{
            fromDate: from ?? undefined,
          }}
        />
      </div>

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
  );
};

export default MachineRequestFilters;
