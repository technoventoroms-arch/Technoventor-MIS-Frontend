import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { editUser } from "./scheme";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
export type CreateNewUserFormType = z.infer<typeof editUser>;

type Props = {
  handleSubmit: (data: CreateNewUserFormType) => void;
  defaultValues?: Partial<CreateNewUserFormType>;
  loading?: boolean;
  isEditMode?: boolean;
  disabled?: boolean;
};

const UserForm = ({
  handleSubmit,
  defaultValues,
  loading,
  isEditMode,
  disabled,
}: Props) => {
  const isAdmin = defaultValues && defaultValues?.role == 2;
  const form = useForm<CreateNewUserFormType>({
    defaultValues: defaultValues
      ? { ...defaultValues }
      : ({
          email: "",
          first_name: "",
          lab: null,
          last_name: "",
          role: "3",
        } as any),
    resolver: zodResolver(editUser) as any,
    disabled: disabled || loading || isAdmin,
  });
  const { isDirty } = form.formState;

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 px-4 pb-4 flex-1 overflow-auto"
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <ControlledFormInput
              name={"first_name"}
              label={"First Name"}
              control={form.control}
              disabled={isEditMode}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"last_name"}
              label={"Last Name"}
              control={form.control}
              disabled={isEditMode}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormInput
              name={"email"}
              label={"Email"}
              control={form.control}
              disabled={isEditMode}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormSelect
              name={"role"}
              label={"Role"}
              control={form.control}
              getItemLabel={(e) => e.label}
              getItemValue={(e) => `${e.value}`}
              options={[
                { label: "Manger", value: 3 },
                { label: "User", value: 4 },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end">
          {isAdmin ||
            (!disabled && (
              <>
                {loading ? (
                  <Loader className="animate-spin" />
                ) : (
                  <Button
                    disabled={loading || !isDirty}
                    type="submit"
                    variant={"green"}
                  >
                    Submit
                  </Button>
                )}
              </>
            ))}
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
