import { uploadImage } from "@/services/file.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ImageUpload from "@mono/shared_ui/components/shared/image-upload";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createNewMachine } from "./scheme";

export type CreateNewMachineFormType = z.infer<typeof createNewMachine>;

type Props = {
  handleSubmit: (data: CreateNewMachineFormType) => void;
  defaultValues?: Partial<CreateNewMachineFormType>;
  loading?: boolean;
  isEditMode?: boolean;
  disabled?: boolean;
};

const MachineForm = ({
  handleSubmit,
  defaultValues,
  loading,
  disabled,
}: Props) => {
  const form = useForm<CreateNewMachineFormType>({
    defaultValues:
      defaultValues ||
      ({
        image_link: "",
        description: "",
        status: "",
        notes: "",
      } as any),
    resolver: zodResolver(createNewMachine) as any,
    disabled: disabled || loading,
  });
  const { isDirty } = form.formState;
  const handleImageUpload = async (e: File) => {
    try {
      const formData = new FormData();
      formData.append("file", e);
      const res = await uploadImage(formData);
      if (res.data) {
        form.setValue("image_link", res.data.key);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      throw error;
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 px-4 pb-4 flex-1 overflow-auto"
      >
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-6">
            <ImageUpload
              onImageUpload={handleImageUpload}
              name="image_link"
              defaultValue=""
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"name"}
              label={"Name"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"description"}
              label={"Description"}
              control={form.control}
            />
          </div>
        </div>
        <div className="w-full flex flex-col">
          {!disabled && (
            <Button
              disabled={loading || !isDirty}
              type="submit"
              variant={"green"}
            >
              {loading ? <Loader className="animate-spin" /> : "Submit"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default MachineForm;
