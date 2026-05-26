import ControlledDatePicker from "@mono/shared_ui/components/controlled-form-component/c-form-date-picker";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import { Button } from "@mono/shared_ui/components/ui/button";
import { useFormContext, useWatch } from "react-hook-form";
import { zodFilterSchema } from "..";

export type InventoryFilterSchema = {
  searchQuery?: string;
  status?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
};

type Props = {
  handleFilterSubmit: (data: InventoryFilterSchema) => void;
  handleFilterClear: (isDirty: boolean) => void;
};

const OrderFilters = ({ handleFilterClear, handleFilterSubmit }: Props) => {
  const form = useFormContext();
  const [fromDate, toDate] = useWatch({
    control: form.control,
    name: ["fromDate", "toDate"],
  });
  const handleClear = () => {
    form.reset({
      searchQuery: "",
      status: "ALL",
      fromDate: null,
      toDate: null,
    });
    handleFilterClear(form.formState.isDirty);
  };

  const handleSubmit = (data: zodFilterSchema) => {
    form.reset(data, { keepDirty: true });
    handleFilterSubmit({
      fromDate: data.fromDate,
      toDate: data.toDate,
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
          placeholder="Search Item"
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
            { value: "FULFILLED", label: "Fulfilled" },
            { value: "PARTIALLY_FULFILLED", label: "Partially fulfilled" },
            { value: "CANCELLED", label: "Cancelled" },
            { value: "EXPIRED", label: "Expired" },
          ]}
          getItemLabel={(e) => e.label}
          getItemValue={(e) => e.value}
        />
        <ControlledDatePicker
          control={form.control}
          name={"fromDate"}
          placeholder="From Date"
          datePickerProps={{
            toDate: toDate ?? undefined,
          }}
        />
        <ControlledDatePicker
          control={form.control}
          name={"toDate"}
          placeholder="To Date"
          datePickerProps={{
            fromDate: fromDate ?? undefined,
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

export default OrderFilters;
