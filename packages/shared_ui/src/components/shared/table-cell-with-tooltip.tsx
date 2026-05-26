import { cn } from "@mono/shared_ui/lib/utils";

type Props = {
  data: string;
  className?: string;
};

const TableCellWithTooltip = ({ data, className }: Props) => {
  return (
    <div className={cn("max-w-36 overflow-hidden", className)} title={data}>
      {data}
    </div>
  );
};

export default TableCellWithTooltip;
