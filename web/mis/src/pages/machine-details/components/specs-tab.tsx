import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@mono/shared_ui/components/ui/popover";

import CanIUse from "@/components/shared/can-i-use";
import { MachineSpecs } from "@/interfaces/machines";
import {
  createMachineSpecs,
  deleteMachineSpecs,
} from "@/services/machine.service";
import { zodResolver } from "@hookform/resolvers/zod";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import { Form } from "@mono/shared_ui/components/ui/form";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import SpecsTableAction from "./specs-table-action";

type Props = {
  loading?: boolean;
  handleRemoveSpecs: (data: MachineSpecs) => void;
  handleAddSpecs: (data: MachineSpecs) => void;
  specs: MachineSpecs[];
  machineId: number;
};

const columns: ColumnDef<MachineSpecs, any>[] = [
  { accessorFn: (i) => i.key, id: "key", header: "Name" },
  { accessorFn: (i) => i.value, id: "values", header: "Value" },
  { id: "action", header: "Actions", cell: (p) => <SpecsTableAction {...p} /> },
];

const schema = z.object({
  key: z
    .string({ required_error: "Name is required" })
    .max(40, `Name can't be more than 100 characters`),
  value: z
    .string({ required_error: "Value is required" })
    .max(255, `Value can't be more than 255 characters`),
});
type ICreateNewSpecs = z.infer<typeof schema>;
const SpecsTab = ({
  loading,
  handleAddSpecs,
  handleRemoveSpecs,
  specs,
  machineId,
}: Props) => {
  const [popOverOpen, setPopOverOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteSpecsModal, setDeleteSpecsModal] = useState<{
    content: MachineSpecs | null;
    open: boolean;
  }>({ content: null, open: false });
  const form = useForm({
    defaultValues: {
      key: "",
      value: "",
    },
    resolver: zodResolver(schema),
  });
  const table = useReactTable({
    data: specs,
    columns: columns,
    rowCount: specs.length,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      deleteSpecs: (data: MachineSpecs) =>
        setDeleteSpecsModal({ content: data, open: true }),
    },
  });
  const handleDeleteSpecs = async () => {
    if (!deleteSpecsModal.content) return;
    setDeleteSubmitting(true);
    try {
      await deleteMachineSpecs(machineId, deleteSpecsModal.content?.id);
      toast.success("Inventory item deleted successfully");
      handleRemoveSpecs(deleteSpecsModal.content);
      setDeleteSpecsModal({ content: null, open: false });
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setDeleteSubmitting(false);
    }
  };
  const handleFormSubmit = async (data: ICreateNewSpecs) => {
    setDeleteSubmitting(true);
    try {
      const res = await createMachineSpecs(machineId, data);
      if (!res.error) {
        handleAddSpecs(res.data);
        toast.success("Successfully added specification.");
        setPopOverOpen(false);
        form.reset({ key: "", value: "" });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setDeleteSubmitting(false);
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        All Specifications{" "}
        <CanIUse action={(e) => e.UPDATE_MACHINES}>
          <Popover open={popOverOpen} onOpenChange={setPopOverOpen}>
            <PopoverTrigger asChild>
              <Button
                className="mr-2"
                variant="indigo"
                size="sm"
                title="Add Specs"
                rounded={"sm"}
              >
                <PlusIcon />
                <span className="inline">Add Specs</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-1 w-72">
              <Form {...form}>
                <form
                  className="space-y-4 p-2"
                  onSubmit={form.handleSubmit(handleFormSubmit)}
                >
                  <ControlledFormInput
                    name="key"
                    control={form.control}
                    label="Name"
                  />
                  <ControlledFormInput
                    name="value"
                    control={form.control}
                    label="Value"
                  />
                  <Button size={"sm"} className="w-full">
                    <PlusIcon />
                    Add Specification
                  </Button>
                </form>
              </Form>
            </PopoverContent>
          </Popover>
        </CanIUse>
      </div>
      <DataTable
        loading={!!loading}
        table={table}
        hideColumnFilter
        hidePagination
      />

      <GenericModal
        open={deleteSpecsModal.open}
        onOpenChange={(e) => setDeleteSpecsModal({ content: null, open: e })}
        onConfirmClick={handleDeleteSpecs}
        loading={deleteSubmitting}
        title={"Delete Specs"}
        confirmButtonText="Delete"
        variant="danger"
        desc={
          <>
            Are you sure you want to delete{" "}
            <Badge variant={"blue"}>{deleteSpecsModal.content?.key}</Badge> -
            <Badge variant={"red"}>{deleteSpecsModal.content?.value}</Badge>?
          </>
        }
      />
    </div>
  );
};

export default SpecsTab;
