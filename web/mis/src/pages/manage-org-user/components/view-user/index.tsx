import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { Form } from "@mono/shared_ui/components/ui/form";
import { OrgUser } from "@mono/shared_ui/interfaces/user";
import { useForm } from "react-hook-form";

type Props = {
  defaultValues?: Partial<OrgUser>;
  isEditMode?: boolean;
};

const ViewUserForm = ({ defaultValues }: Props) => {
  const form = useForm<OrgUser>({
    defaultValues: defaultValues
      ? { ...defaultValues }
      : ({
          email: "",
          first_name: "",
          lab: null,
          last_name: "",
          role: "3",
        } as any),

    disabled: true,
  });

  return (
    <Form {...form}>
      <form noValidate className="space-y-2 px-4 pb-4 flex-1 overflow-auto">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <ControlledFormInput
              name={"first_name"}
              label={"First Name"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"last_name"}
              label={"Last Name"}
              control={form.control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"email"}
              label={"Email"}
              control={form.control}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ViewUserForm;
