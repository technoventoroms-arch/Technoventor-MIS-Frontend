import { ICreateInvItem, IInvntoryItem } from "@/interfaces/inventory";
import {
  NewInventoryItemType,
  NewItemSchema,
} from "@/pages/manage-inventory/schema";
import { useUnitsProvider } from "@/providers/units-provider";
import { uploadImage } from "@/services/file.service";
import { editInvItem, getInvCategories } from "@/services/inventory.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormTextArea from "@mono/shared_ui/components/controlled-form-component/c-form-textarea";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import ImageUpload from "@mono/shared_ui/components/shared/image-upload";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { ICategory } from "@mono/shared_ui/interfaces/category";
import {
  DataWithLoading,
  IGenericQueryParam,
} from "@mono/shared_ui/interfaces/utils";
import { debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Loader } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  defaultValues: IInvntoryItem | null;
  itemId: number;
  onItemUpdate: (machine: IInvntoryItem) => void;
  handleCancelEdit: () => void;
};

const EditItemInfo = ({
  defaultValues,
  handleCancelEdit,
  itemId,
  onItemUpdate,
}: Props) => {
  const { units } = useUnitsProvider();
  const { loading, hideLoading, showLoading } = useLoading();
  const form = useForm<NewInventoryItemType>({
    defaultValues: defaultValues as any,
    resolver: zodResolver(NewItemSchema),
    disabled: loading,
  });
  const { isDirty, dirtyFields } = form.formState;

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
    const data = await fetchCategoriesList({ searchQuery: param });
    setCategories({ ...data, loading: false });
  };
  const handleDebounceSearch = useMemo(() => {
    return debounce(getCategories);
  }, []);

  const handleImageUpload = async (e: File) => {
    try {
      const formData = new FormData();
      formData.append("file", e);
      const res = await uploadImage(formData);
      if (res.data) {
        form.setValue("image_link", res.data.key, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      throw error;
    }
  };
  const handleEditInv = async (data: NewInventoryItemType) => {
    showLoading();
    try {
      const payload: ICreateInvItem = {
        category_id: data.category.id as any,
        description: data.description,
        name: data.name,
        quantity: data.quantity,
        sku: data.sku,
        threshold: data.threshold,
        type: data.type,
        unit_id: data.unit.id as any,
        image_link: data.image_link,
      };
      if (!dirtyFields.image_link) {
        delete (payload as any).image_link;
      }
      const res = await editInvItem(itemId, payload);
      if (!res.error) {
        onItemUpdate(res.data);
        toast.success("Successfully modified inventory item.");
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleEditInv)}
        className="flex gap-2 flex-col md:flex-row"
      >
        <span className="p-2 max-w-xl flex-1">
          <ImageUpload
            onImageUpload={handleImageUpload}
            name="image_link"
            defaultValue={defaultValues?.image_link || ""}
            key={defaultValues?.image_link}
          />
        </span>
        <div className="p-2 px-4 space-y-3 flex-1">
          <div className="">
            <ControlledFormInput
              name={"name"}
              label={"Item Name"}
              control={form.control}
            />
          </div>
          <div className="">
            <ControlledFormInput
              name={"sku"}
              label={"SKU"}
              control={form.control}
            />
          </div>

          <div className="">
            <ControlledFormSelect
              name={"type"}
              label={"Type"}
              control={form.control}
              getItemLabel={(e) => e}
              getItemValue={(e) => e}
              options={["REUSABLE", "CONSUMABLE"]}
            />
          </div>
          <div className="">
            <ControlledAutocomplete
              name={"unit"}
              label={"Unit"}
              control={form.control}
              emptyText="Search for unit"
              placeholder="Seach for unit"
              loading={units.loading}
              options={units.data}
              getItemLabel={(e) => `${e.symbol} - (${e.name})`}
              getItemValue={(e) => `${e.id}`}
              formItemClassName="h-auto"
              popoverTriggerClassname="uppercase"
              comboboxProps={{
                renderOptions: ({ getItemLabel, item }) => (
                  <span className="uppercase">{getItemLabel(item)}</span>
                ),
              }}
            />
          </div>

          <div className="flex gap-2">
            <ControlledFormInput
              name={"quantity"}
              label={"Qunatity"}
              control={form.control}
            />
            <ControlledFormInput
              name={"threshold"}
              label={"Min Threshold"}
              control={form.control}
            />
          </div>
          <div className="">
            <ControlledAutocomplete
              name={"category"}
              label={"Category"}
              control={form.control}
              emptyText="Search for category"
              placeholder="Seach for category"
              loading={categories.loading}
              options={categories.data}
              onDebouncedChange={handleDebounceSearch}
              getItemLabel={(e) => e.name}
              getItemValue={(e) => `${e.id}`}
              formItemClassName="h-auto"
            />
          </div>
          <div className="">
            <ControlledFormTextArea
              name={"description"}
              label={"Description"}
              control={form.control}
            />
          </div>

          <div className="flex gap-2">
            <Button
              disabled={loading}
              type="button"
              variant={"gray"}
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              disabled={loading || !isDirty}
              type="submit"
              variant={"green"}
            >
              {loading ? <Loader className="animate-spin" /> : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EditItemInfo;
