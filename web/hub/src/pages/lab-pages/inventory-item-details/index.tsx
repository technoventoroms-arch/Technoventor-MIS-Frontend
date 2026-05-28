import { useCanIUse } from "@/components/shared/can-i-use";
import { routeConstants } from "@/constants/route.constants";
import { IInvntoryItem, IItemLogs, InvItemSpecs } from "@/interfaces/inventory";
import {
  getInventoryById,
  getInvItemLogs,
  getInvSpecs,
} from "@/services/inventory.service";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { ScrollArea } from "@mono/shared_ui/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@mono/shared_ui/components/ui/tabs";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import {
  DataWithLoading,
  IGenericQueryParam,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  getCoreRowModel,
  PaginationState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import { List, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import ViewItemSpecs from "./components/specifications";
import ViewItemInfo from "./components/view-item-info";
import ViewItemLogsTab from "./components/view-item-logs";
import { useLabContext } from "@/providers/lab-provider";

const tabs = [
  {
    value: "specs",
    label: "Specifications",
    icon: List,
  },
  {
    value: "usageLogs",
    label: "Usage Logs",
    icon: ScrollText,
  },
];

const InventoryItemDetails = () => {
  const { labData, baseUrl } = useLabContext();
  const param = useParams();
  const _itemId = Math.abs(Number.parseInt(param.itemId || ""));
  const { loading, hideLoading, showLoading } = useLoading();
  const [itemDetail, setItemDetail] = useState<IInvntoryItem | null>(null);

  const [logsPagination, setLogsPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [itemLogs, setItemLogs] = useState<PaginatedDataWithLoading<IItemLogs>>(
    {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
      loading,
    }
  );
  const [itemSpecs, setItemSpecs] = useState<DataWithLoading<InvItemSpecs[]>>({
    data: [],
    loading,
  });
  const canEditItem = useCanIUse(PERMISSIONS.UPDATE_INVENTORY);
  const getItemDetails = async (itemId: number) => {
    let invItem: IInvntoryItem | null = null;
    try {
      const res = await getInventoryById(itemId);
      if (!res.error) {
        invItem = res.data;
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
    return invItem;
  };
  const getItemSpecs = async () => {
    setItemSpecs({ data: [], loading: true });
    try {
      const res = await getInvSpecs(_itemId, {});
      if (!res.error) {
        setItemSpecs({ data: res.data || [], loading: false });
      }
    } catch (error) {
      setItemSpecs({ data: [], loading: true });
    }
  };
  const getDetails = async () => {
    showLoading();
    const data = await getItemDetails(_itemId);
    setItemDetail(data);
    hideLoading();
  };
  const getItemLogsList = async (param: IGenericQueryParam) => {
    setItemLogs({ count: 0, records: [], skip: 0, take: 0, loading: true });
    try {
      const res = await getInvItemLogs(_itemId, param);

      if (!res.error) {
        res.data.records = res.data.records || [];
        setItemLogs({ ...res.data, loading: false });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setItemLogs({ count: 0, records: [], skip: 0, take: 0, loading: false });
    }
  };

  const itemLogsTable = useReactTable({
    columns: [],
    data: itemLogs.records,
    state: {
      pagination: logsPagination,
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const newState =
        typeof updater === "function"
          ? updater({ ...logsPagination })
          : updater;
      setLogsPagination(newState);
      getItemLogsList({
        skip: newState.pageIndex * newState.pageSize,
        take: newState.pageSize,
      });
    },
  });
  useEffect(() => {
    if (labData?.lab_id) {
      getDetails();
      getItemSpecs();
      getItemLogsList({ skip: 0, take: 10 });
    }
  }, [labData?.lab_id]);

  return (
    <>
      <SiteHeader
        breadCrumbs={[
          {
            title: "Inventory",
            url: `/${baseUrl}/${routeConstants.INVENTORY}`,
          },
          {
            loading: loading && !itemDetail,
            title: itemDetail?.name,
            url: "#",
          },
        ]}
      />
      <div className="@container/main bg-slate-50 dark:bg-transparent flex flex-1 overflow-hidden ">
        <div className="h-full max-w-7xl static grid grid-cols-10 gap-2 w-full overflow-auto">
          <main className="col-span-10 lg:col-span-10 border border-transparent  ">
            <ViewItemInfo
              itemDetail={itemDetail}
              canEditMachine={canEditItem}
            />

            <div className=" p-4">
              <Tabs defaultValue="specs" className="w-full">
                <ScrollArea className="w-full border-b">
                  <TabsList className="text-foreground h-auto gap-2 rounded-none  bg-transparent px-0 py-1 ">
                    {tabs.map((i) => (
                      <TabsTrigger
                        value={i.value}
                        className="  hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        <i.icon
                          className="-ms-0.5 me-1.5 opacity-60"
                          size={16}
                          aria-hidden="true"
                        />
                        {i.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
                <TabsContent value="specs">
                  <ViewItemSpecs
                    specs={itemSpecs.data}
                    loading={itemSpecs.loading}
                  />
                </TabsContent>
                <TabsContent value="usageLogs">
                  <ViewItemLogsTab
                    logs={itemLogs.records}
                    loading={itemLogs.loading}
                    itemLogsTable={itemLogsTable}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default InventoryItemDetails;
