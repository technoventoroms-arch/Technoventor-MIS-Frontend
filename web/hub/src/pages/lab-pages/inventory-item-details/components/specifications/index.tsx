import { InvItemSpecs } from "@/interfaces/inventory";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Props = {
  loading?: boolean;
  specs: InvItemSpecs[];
};

const columns: ColumnDef<InvItemSpecs, any>[] = [
  { accessorFn: (i) => i.key, id: "key", header: "Name" },
  { accessorFn: (i) => i.value, id: "values", header: "Value" },
];

const ViewItemSpecs = ({ loading, specs }: Props) => {
  const table = useReactTable({
    data: specs,
    columns: columns,
    rowCount: specs.length,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        All Specifications{" "}
      </div>
      <DataTable
        loading={!!loading}
        table={table}
        hideColumnFilter
        hidePagination
      />
    </div>
  );
};

export default ViewItemSpecs;
