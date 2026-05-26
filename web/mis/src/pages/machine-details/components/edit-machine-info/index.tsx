import { IMachine } from "@/interfaces/machines";
import { editMachineSchema } from "@/pages/manage-machine/components/machine-form/scheme";
import { uploadImage } from "@/services/file.service";
import { editMachine } from "@/services/machine.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormTextArea from "@mono/shared_ui/components/controlled-form-component/c-form-textarea";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import ImageUpload from "@mono/shared_ui/components/shared/image-upload";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { SelectItem } from "@mono/shared_ui/components/ui/select";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Loader } from "lucide-react";
import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
  defaultValues: IMachine;
  machineId: number;
  onMachineUpdate: (machine: IMachine) => void;
  handleCancelEdit: () => void;
};
export type EditMachineFormType = z.infer<typeof editMachineSchema>;

const EditMachine = ({
  defaultValues,
  machineId,
  onMachineUpdate,
  handleCancelEdit,
}: Props) => {
  const { loading, hideLoading, showLoading } = useLoading();
  const form = useForm<EditMachineFormType>({
    defaultValues: {
      description: "",
      image_link: "",
      name: "",
      notes: "",
      status: "OFF",
    },
    resolver: zodResolver(editMachineSchema) as any,
    disabled: loading,
  });
  const { isDirty, dirtyFields } = form.formState;
  const handleEditMachine = async (data: EditMachineFormType) => {
    showLoading();
    try {
      const payload: any = { ...data };
      if (!dirtyFields.image_link) {
        delete payload.image_link;
      }
      const res = await editMachine(machineId, payload);
      if (!res.error) {
        onMachineUpdate(res.data);
        toast.success("Successfully updated machine.");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };

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
  useEffect(() => {
    form.reset(defaultValues, { keepDirty: false });
  }, []);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleEditMachine)}
        className="flex gap-2 flex-col md:flex-row "
      >
        <span className="p-2 flex-1 max-w-lg">
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
              label={"Name"}
              control={form.control}
            />
          </div>

          <div className="">
            <ControlledFormTextArea
              name={"description"}
              label={"Description"}
              control={form.control}
              className="min-h-20 max-h-40"
            />
          </div>
          <div className="">
            <ControlledFormSelect
              name={"status"}
              label={"Status"}
              options={[
                "ACTIVE",
                "OFF",
                "UNDER_MAINTENANCE",
                "RETIRED",
                "FAULTY",
              ]}
              getItemLabel={(e) => e}
              getItemValue={(e) => e}
              control={form.control}
              renderSelectOption={({ getItemLabel, getItemValue, option }) => (
                <SelectItem
                  className="capitalize"
                  value={getItemValue(option)}
                  key={getItemValue(option)}
                  disabled={
                    (defaultValues as any)?.status == "ACTIVE"
                      ? false
                      : getItemValue(option) == "ACTIVE"
                  }
                >
                  {getItemLabel(option)}
                </SelectItem>
              )}
            />
          </div>
          <div className="">
            <ControlledFormTextArea
              name={"notes"}
              label={"Notes"}
              control={form.control}
              className="min-h-20 max-h-40"
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

export default EditMachine;
