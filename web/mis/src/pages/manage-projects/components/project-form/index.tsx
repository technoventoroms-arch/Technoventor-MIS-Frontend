import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormTextArea from "@mono/shared_ui/components/controlled-form-component/c-form-textarea";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { IProjectType, newProjectSchema, NewProjectType } from "../../schema";
import { DrawerFooter } from "@mono/shared_ui/components/ui/drawer";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import ControlledDatePicker from "@mono/shared_ui/components/controlled-form-component/c-form-date-picker";

type Props = {
  handleSubmit: (data: NewProjectType) => void;
  defaultValues?: Partial<IProjectType>;
  loading?: boolean;
};

const ProjectForm = ({ handleSubmit, defaultValues, loading }: Props) => {
  const form = useForm<NewProjectType>({
    defaultValues: defaultValues,
    resolver: zodResolver(newProjectSchema),
    disabled: loading,
  });
  const { isDirty } = form.formState;
  return (
    <Form {...form}>
      <form
        id="project-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 px-4 pb-8 flex-1 overflow-auto"
      >
        <div className="space-y-4">
          <ControlledFormInput
            name={"title"}
            label={"Project Name"}
            control={form.control}
          />
          <div className="flex">
            <ControlledFormSelect
              name={"priority"}
              label={"Priority"}
              control={form.control}
              getItemLabel={(e) => e}
              getItemValue={(e) => e}
              options={["low", "medium", "high", "very high"]}
            />
          </div>
          <ControlledDatePicker
            name={"end_date"}
            label={"End date"}
            control={form.control}
            datePickerProps={{
              disabled: (date) => date <= new Date(),
            }}
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
        <Button
          form="project-form"
          disabled={loading || !isDirty}
          type="submit"
          variant={"green"}
        >
          {loading ? <Loader className="animate-spin" /> : "Submit"}
        </Button>
      </DrawerFooter>
    </Form>
  );
};

export default ProjectForm;
