import { IUnit } from "@/interfaces/inventory";
import { useUnitsProvider } from "@/providers/units-provider";
import { getInvCategories } from "@/services/inventory.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { ICategory } from "@mono/shared_ui/interfaces/category";
import {
  DataWithLoading,
  IGenericQueryParam,
} from "@mono/shared_ui/interfaces/utils";
import { debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { z } from "zod";

export const filterSchema = z.object({
  searchQuery: z.string().optional(),

  type: z.string().optional(),
  unit: z
    .object({
      name: z.string(),
      symbol: z.string(),
      id: z.number(),
    })
    .passthrough()
    .optional()
    .nullable(),
  category: z.object({}).passthrough().optional().nullable(),
});

type zodFormSchema = z.infer<typeof filterSchema>;

export type InventoryFilterSchema = {
  searchQuery?: string;
  category?: string;
  type?: string;
  unit?: string;
};

type Props = {
  handleFilterSubmit: (data: InventoryFilterSchema) => void;
  handleFilterClear: (isDirty: boolean) => void;
};

const InventoryFilters = ({ handleFilterClear, handleFilterSubmit }: Props) => {
  const { units } = useUnitsProvider();
  const form = useForm<zodFormSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      searchQuery: "",
      category: null,
      type: "",
      unit: null,
    },
  });

  const handleClear = () => {
    form.reset();
    handleFilterClear(form.formState.isDirty);
  };

  const handleSubmit = (data: zodFormSchema) => {
    form.reset(data, { keepDirty: true });

    handleFilterSubmit({
      type: data.type == "ALL" ? "" : data.type,
      category: (data?.category as unknown as ICategory)?.name || "",
      unit: (data?.unit as IUnit)?.name || "",
      searchQuery: data.searchQuery || "",
    });
  };
  const [categories, setCategories] = useState<DataWithLoading<ICategory[]>>({
    loading: false,
    data: [],
  });
  const fetchCategoriesList = async (param: IGenericQueryParam) => {
    let res: DataWithLoading<ICategory[]> = { loading: false, data: [] };
    try {
      const data = await getInvCategories(param);
      if (!data.error) {
        res = { loading: false, data: data.data.records || [] } as any;
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getCategories = async (param: string) => {
    setCategories({ loading: true, data: [] });
    const data = await fetchCategoriesList({
      searchQuery: param,
    });
    setCategories({ ...data, loading: false });
  };
  const handleDebounceSearch = useMemo(() => {
    return debounce(getCategories);
  }, []);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex md:items-center md:space-x-2 space-y-2 flex-col md:flex-row"
      >
        <ControlledFormInput
          className="height-6"
          name="searchQuery"
          placeholder="Search Item"
          control={form.control}
        />
        <ControlledFormSelect
          className="height-6 w-full"
          name="type"
          placeholder="Type"
          control={form.control}
          options={[
            { value: "ALL", label: "All" },
            { value: "CONSUMABLE", label: "Consumable" },
            { value: "REUSABLE", label: "Reusable" },
          ]}
          getItemLabel={(e) => e.label}
          getItemValue={(e) => e.value}
        />
        <ControlledAutocomplete
          name={"unit"}
          control={form.control}
          emptyText="Search for unit"
          placeholder="Search for unit"
          loading={units?.loading}
          options={units?.data}
          getItemLabel={(e) => `${e.symbol} - (${e.name})`}
          getItemValue={(e) => `${e.id}`}
          formItemClassName="h-auto"
          comboboxProps={{
            renderOptions: ({ getItemLabel, item }) => (
              <span className="uppercase">{getItemLabel(item)}</span>
            ),
          }}
        />
        <ControlledAutocomplete
          name={"category"}
          control={form.control}
          emptyText="Search for category"
          placeholder="Search for category"
          loading={categories.loading}
          options={categories.data}
          onDebouncedChange={handleDebounceSearch}
          getItemLabel={(e) => e.name}
          getItemValue={(e) => `${e.id}`}
          formItemClassName="h-auto"
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

export default InventoryFilters;
