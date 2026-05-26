import { getInvCategories } from "@/services/inventory.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormTextArea from "@mono/shared_ui/components/controlled-form-component/c-form-textarea";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import { Button } from "@mono/shared_ui/components/ui/button";
import { DrawerFooter } from "@mono/shared_ui/components/ui/drawer";
import { Form } from "@mono/shared_ui/components/ui/form";
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
import { NewInventoryItemType, NewItemSchema } from "../../schema";
import { useUnitsProvider } from "@/providers/units-provider";
import ImageUpload from "@mono/shared_ui/components/shared/image-upload";
import { uploadImage } from "@/services/file.service";

type Props = {
  handleSubmit: (data: NewInventoryItemType) => void;
  defaultValues?: Partial<NewInventoryItemType>;
  loading?: boolean;
  disabled?: boolean;
};

const InventoryForm = ({
  handleSubmit,
  defaultValues,
  loading,
  disabled,
}: Props) => {
  const { units } = useUnitsProvider();
  const form = useForm<NewInventoryItemType>({
    defaultValues: defaultValues,
    resolver: zodResolver(NewItemSchema),
    disabled: disabled || loading,
  });
  const { isDirty } = form.formState;

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
  return (
    <Form {...form}>
      <form
        id="project-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 px-4 pb-8 flex-1 overflow-auto"
      >
        <div className="space-y-4">
          <ImageUpload
            onImageUpload={handleImageUpload}
            name="image_link"
            defaultValue={defaultValues?.image_link || ""}
            key={defaultValues?.image_link}
          />
          <ControlledFormInput
            name={"name"}
            label={"Item Name"}
            control={form.control}
          />
          <ControlledFormInput
            name={"sku"}
            label={"SKU"}
            control={form.control}
          />

          <ControlledFormSelect
            name={"type"}
            label={"Type"}
            control={form.control}
            getItemLabel={(e) => e}
            getItemValue={(e) => e}
            options={["REUSABLE", "CONSUMABLE"]}
          />

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

          <ControlledFormTextArea
            name={"description"}
            label={"Description"}
            control={form.control}
          />
        </div>

        <div className="flex justify-end"></div>
      </form>
      <DrawerFooter>
        {!disabled && (
          <Button
            form="project-form"
            disabled={loading || !isDirty}
            type="submit"
            variant={"green"}
          >
            {loading ? <Loader className="animate-spin" /> : "Submit"}
          </Button>
        )}
      </DrawerFooter>
    </Form>
  );
};

export default InventoryForm;
