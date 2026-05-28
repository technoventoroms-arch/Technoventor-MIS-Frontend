import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createUser } from "./scheme";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import { ILabType } from "@/interfaces/labs";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { useState } from "react";
import { getAllLabs } from "@/services/labs.service";
import { toast } from "sonner";

export type CreateNewUserFormType = z.infer<typeof createUser>;

type Props = {
  handleSubmit: (data: CreateNewUserFormType) => void;
  defaultValues?: Partial<CreateNewUserFormType>;
  loading?: boolean;
  isEditMode?: boolean;
  disabled?: boolean;
  orgId: number;
};

const UserForm = ({
  handleSubmit,
  defaultValues,
  loading,
  isEditMode,
  disabled,
  orgId,
}: Props) => {
  const [labs, setLabs] = useState<DataWithLoading<ILabType[]>>({
    data: [],
    loading: false,
  });
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
    resolver: zodResolver(createUser) as any,
    disabled: !!(disabled || loading || isAdmin),
  });

  const { isDirty } = form.formState;

  const searchLabs = async (searchText: string) => {
    setLabs({ data: [], loading: true });
    try {
      const res = await getAllLabs(orgId, {
        searchQuery: searchText,
        skip: 0,
        take: 50,
      });
      setLabs({
        data: !res.error ? res.data?.records || [] : [],
        loading: false,
      });
    } catch (e) {
      setLabs({ data: [], loading: false });
      toast.error("Unable to search labs");
    }
  };
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
                { label: "Admin", value: 3 },
                { label: "Manger", value: 4 },
                { label: "User", value: 5 },
              ]}
            />
          </div>
          <div className="col-span-6">
            <ControlledAutocomplete
              name={"lab"}
              label={"Lab"}
              control={form.control}
              emptyText="Search for labs"
              placeholder="Search for lab"
              loading={labs.loading}
              options={labs.data}
              onDebouncedChange={searchLabs}
              getItemLabel={(e) => e.name}
              getItemValue={(e) => `${e.lab_id}`}
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
