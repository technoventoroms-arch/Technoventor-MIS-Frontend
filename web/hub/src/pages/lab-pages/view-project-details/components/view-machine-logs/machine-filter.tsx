import { MachineBookingSummary } from "@/interfaces/reservation";
import ControlledDatePicker from "@mono/shared_ui/components/controlled-form-component/c-form-date-picker";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import { Button } from "@mono/shared_ui/components/ui/button";
import { ColumnFiltersState, Table } from "@tanstack/react-table";
import { Check, Filter, FilterXIcon } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

type Props = {
  table: Table<MachineBookingSummary>;
  filters: ColumnFiltersState;
};

const MachineFilter = ({ table, filters }: Props) => {
  const [filterOpen, setFilterOpen] = useState(!!filters.length);
  const form = useForm<{ status: string; from?: Date; to?: Date }>({
    defaultValues: filters.length
      ? filters.reduce((prev, curr) => {
          prev[curr.id] = curr.value;
          return prev;
        }, {} as { [key: string]: any })
      : ({
          status: "ALL",
          from: null,
          to: null,
        } as any),
  });
  const [from, to] = useWatch({ control: form.control, name: ["from", "to"] });
  const handleFormSubmit = (data: any) => {
    if (data.status == "All") {
      data.status = "";
    }

    table.setColumnFilters([
      { id: "status", value: data.status == "ALL" ? null : data.status },
      {
        id: "from",
        value: data.from ? new Date(data.from).toISOString() : null,
      },
      { id: "to", value: data.to ? new Date(data.to).toISOString() : null },
    ]);
  };
  const resetFilter = () => {
    setFilterOpen(false);
    form.reset();
    table.setColumnFilters([]);
  };
  return filterOpen ? (
    <FormProvider {...form}>
      <form
        noValidate
        className="w-full flex justify-between "
        onSubmit={form.handleSubmit(handleFormSubmit)}
      >
        <span className="flex gap-2 flex-wrap">
          <ControlledDatePicker
            control={form.control}
            name="from"
            datePickerProps={{
              toDate: to,
            }}
            placeholder="From Date"
          />
          <ControlledDatePicker
            control={form.control}
            name="to"
            datePickerProps={{
              fromDate: from,
            }}
            placeholder="To Date"
          />
          <ControlledFormSelect
            control={form.control}
            name="status"
            options={[
              { label: "All", value: "ALL" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
              { label: "New", value: "NEW" },
            ]}
            getItemLabel={(o) => o.label}
            getItemValue={(o) => o.value}
            defaultValue="ALL"
          />
        </span>
        <span className="flex gap-2 ml-auto w-max ">
          <Button variant={"green"}>
            <Check /> Apply
          </Button>
          <Button type="button" variant={"red"} onClick={resetFilter}>
            <FilterXIcon /> Clear & Close
          </Button>
        </span>
      </form>
    </FormProvider>
  ) : (
    <div className="flex items-center justify-between w-full">
      <span>Machine Logs</span>
      <Button
        variant={"gray"}
        title="Open filter"
        onClick={() => setFilterOpen(true)}
      >
        <Filter /> Open Filters
      </Button>
    </div>
  );
};

export default MachineFilter;
