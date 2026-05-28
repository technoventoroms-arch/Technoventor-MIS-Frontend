import { IItemLogs } from "@/interfaces/inventory";
import TablePagination from "@mono/shared_ui/components/shared/table-pagination";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { Table } from "@tanstack/react-table";
import { ListMinus, ListPlus } from "lucide-react";
const listSkeleton = (
  <>
    <li>
      <Skeleton className="w-full h-24 bg-neutral-200 dark:bg-accent " />
    </li>
    <li>
      <Skeleton className="w-full h-24 bg-neutral-200 dark:bg-accent " />
    </li>
    <li>
      <Skeleton className="w-full h-24 bg-neutral-200 dark:bg-accent " />
    </li>
    <li>
      <Skeleton className="w-full h-24 bg-neutral-200 dark:bg-accent " />
    </li>
  </>
);

type Props = {
  loading?: boolean;
  logs: IItemLogs[];
  itemLogsTable: Table<IItemLogs>;
};

const ViewItemLogsTab = ({ loading, logs, itemLogsTable }: Props) => {
  return (
    <div>
      <ul className="flex flex-col gap-2">
        {loading ? listSkeleton : logs?.map((i) => <ItemLogCard log={i} />)}
      </ul>
      <TablePagination table={itemLogsTable} className="ml-auto mt-2" />
    </div>
  );
};

export default ViewItemLogsTab;

type ItemLogCardProp = {
  log: IItemLogs;
};
const ItemLogCard = ({ log }: ItemLogCardProp) => {
  const typeColor = log.type === "IN" ? "bg-green-500" : "bg-red-600";
  const formattedDate = new Date(log.created_at).toLocaleString();

  return (
    <li
      className="bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full grid md:grid-cols-[2fr_1fr_1.5fr] gap-2 grid-cols-[2fr_1fr]
    "
    >
      <span className="flex items-center gap-2">
        <span
          className={`font-semibold rounded-full text-white ${typeColor} size-8 p-1.5`}
        >
          {log.type === "IN" ? (
            <ListPlus className="size-5" />
          ) : (
            <ListMinus className="size-5" />
          )}
        </span>
        <span>
          <div className="font-medium mb-1">{log.note}</div>
          <div className="text-muted-foreground text-xs dark:text-gray-300">
            {log.reference}
          </div>
        </span>
      </span>

      <span>
        <div className="text-xs">Quantity</div>
        <Badge
          className="mt-1"
          fontSize={"small"}
          variant={log.type === "IN" ? "green" : "red"}
        >
          {log.quantity}
        </Badge>
      </span>

      <span className="  md:ml-auto">
        <span className="text-sm text-gray-500 dark:text-gray-300">
          {formattedDate}
        </span>
      </span>
    </li>
  );
};
