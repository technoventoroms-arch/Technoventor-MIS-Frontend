import {
  getPendingUserInvite,
  revokeInvitation,
} from "@/services/user.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Input } from "@mono/shared_ui/components/ui/input";
import { useIsMobile } from "@mono/shared_ui/hooks/use-mobile";

import { UserInvitation } from "@mono/shared_ui/interfaces/user";
import {
  IGenericQueryParam,
  PaginatedData,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import { cn, debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  CellContext,
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  PaginationState,
  Updater,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Trash, XIcon } from "lucide-react";
import { BaseSyntheticEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const InvitationTableAction = ({
  table,
  row,
}: CellContext<UserInvitation, any>) => {
  const handleRevokeInvitation = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.revokeInvitation?.(row.original);
  };
  return (
    <>
      <Button
        onClick={handleRevokeInvitation}
        variant={"red"}
        className="rounded size-6"
        size={"icon"}
        title="Revoke invitation"
      >
        <Trash className="size-3" />
      </Button>
    </>
  );
};
const columns: ColumnDef<UserInvitation, any>[] = [
  {
    accessorKey: "email",
    header: "email",
  },
  {
    accessorKey: "role_name",
    header: "Role",
  },
  {
    header: "Actions",
    size: 10,
    cell: (info) => <InvitationTableAction {...info} />,
  },
];

type Props = { labId: number; orgId: number };

const PendingInvites = ({ labId, orgId }: Props) => {
  const isMobile = useIsMobile();
  const [revokeSubmitting, setRevokeSubmitting] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [filters, setFilters] = useState<{ searchQuery: string }>({
    searchQuery: "",
  });
  const [revokeInvitationModal, setRevokeInvitationModal] = useState<{
    content: UserInvitation | null;
    open: boolean;
  }>({ content: null, open: false });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [invitations, setInvitations] = useState<
    PaginatedDataWithLoading<UserInvitation>
  >({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const fetchInvitationsList = async (param: IGenericQueryParam) => {
    let res: PaginatedData<UserInvitation> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getPendingUserInvite(labId, orgId, param);
      if (!data.error) {
        res = data.data as any;
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;

    getInvitations({
      searchQuery: filters.searchQuery,
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
    });
  };

  const getInvitations = async (param: IGenericQueryParam) => {
    setInvitations({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchInvitationsList(param);
    setInvitations({ ...data, records: data.records || [], loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };

  const table = useReactTable({
    data: invitations.records,
    columns: columns,
    state: {
      columnVisibility,
      pagination,
    },
    rowCount: invitations.count,
    getRowId: (row) => row!.id!.toString(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: handlePaginationChange,
    manualPagination: true,
    meta: {
      revokeInvitation: (data: UserInvitation) =>
        setRevokeInvitationModal({ content: data, open: true }),
    },
  });

  const searchHandle = (search: string) => {
    getInvitations({
      searchQuery: search,
      skip: 0,
      take: pagination.pageSize,
    });
  };
  const handleDebounceSearch = useMemo(() => {
    return debounce(searchHandle, 500);
  }, []);
  useEffect(() => {
    getInvitations({
      searchQuery: "",
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });
  }, []);

  const handleRevokeInvitation = async () => {
    if (!revokeInvitationModal.content) return;
    setRevokeSubmitting(true);
    try {
      await revokeInvitation(labId, orgId, revokeInvitationModal.content?.id);
      toast.success("Invitation revoked successfully.");
      getInvitations({
        searchQuery: "",
        skip: 0,
        take: pagination.pageSize,
      });
      setRevokeInvitationModal({ content: null, open: false });
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setRevokeSubmitting(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-2">
      <DataTable
        table={table}
        hideColumnFilter
        loading={invitations.loading}
        tableContainerClassname={cn(isMobile && "max-h-full overflow-auto")}
        tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
        extraTableContent={
          <>
            <div className="flex gap-2">
              <Input
                onChange={(e) => {
                  const search = e.target.value;
                  setFilters({ searchQuery: search });
                  handleDebounceSearch(search);
                }}
                className="h-8 w-auto ml-2"
                placeholder="Search email"
                value={filters.searchQuery}
              />
              {filters.searchQuery && (
                <Button
                  onClick={() => {
                    setFilters({ searchQuery: "" });
                    handleDebounceSearch("");
                  }}
                  size={"sm"}
                  variant={"red"}
                >
                  <XIcon />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </>
        }
      />

      <GenericModal
        open={revokeInvitationModal.open}
        onOpenChange={(e) =>
          setRevokeInvitationModal({ content: null, open: e })
        }
        onConfirmClick={handleRevokeInvitation}
        loading={revokeSubmitting}
        title={"Revoke Invitation"}
        confirmButtonText="Revoke"
        variant="danger"
        desc={
          <>
            Are you sure you want to revoke Invitation of
            <Badge variant={"blue"}>
              {revokeInvitationModal.content?.email}
            </Badge>{" "}
            for role{" "}
            <Badge variant={"blue"}>
              {revokeInvitationModal.content?.role_name}
            </Badge>
            ?
          </>
        }
      />
    </div>
  );
};

export default PendingInvites;
