import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { ILabType, newlabSchema, NewLabType } from "../../schema";

type Props = {
  handleSubmit: (data: NewLabType) => void;
  defaultValues?: Partial<ILabType>;
  loading?: boolean;
};

const LabForm = ({ handleSubmit, defaultValues, loading }: Props) => {
  const form = useForm<NewLabType>({
    defaultValues: defaultValues,
    resolver: zodResolver(newlabSchema),
    disabled: loading,
  });
  const { isDirty } = form.formState;
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 px-4 pb-4 flex-1 overflow-auto"
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <ControlledFormInput
              name={"name"}
              label={"Lab Name"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"org_name"}
              label={"Organization"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"city"}
              label={"City"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"state"}
              label={"State"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"country"}
              label={"Country"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"address_1"}
              label={"Address Line 1"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"address_2"}
              label={"Address Line 2"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"address_3"}
              label={"Address Line 3"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"zipcode"}
              label={"Zip code"}
              control={form.control}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            disabled={loading || !isDirty}
            type="submit"
            variant={"green"}
          >
            {loading ? <Loader className="animate-spin" /> : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LabForm;
