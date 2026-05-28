import { zodResolver } from "@hookform/resolvers/zod";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createNewUser } from "./scheme";
import { getLabsList } from "@/services/labs.service";
import { toast } from "sonner";
import ControlledFormSelect from "@mono/shared_ui/components/controlled-form-component/c-from-select";
import { ILabType } from "@/interfaces/labs";
export type CreateNewUserFormType = z.infer<typeof createNewUser>;

type Props = {
  handleSubmit: (data: CreateNewUserFormType) => void;
  defaultValues?: Partial<CreateNewUserFormType>;
  loading?: boolean;
};

const UserForm = ({ handleSubmit, defaultValues, loading }: Props) => {
  const [labs, setLabs] = useState<DataWithLoading<ILabType[]>>({
    data: [],
    loading: false,
  });

  const form = useForm<CreateNewUserFormType>({
    defaultValues: defaultValues || {
      email: "",
      first_name: "",
      lab: null,
      role: 4,
    },
    resolver: zodResolver(createNewUser),
    disabled: loading,
  });
  const { isDirty } = form.formState;
  const searchLabs = async (searchText: string) => {
    setLabs({ data: [], loading: true });
    try {
      const res = await getLabsList({
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
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 px-4 pb-4 flex-1 overflow-auto"
      >
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
                { label: "Admin", value: 2 },
              ]}
            />
          </div>
          <div className="col-span-6">
            <ControlledAutocomplete
              name={"lab"}
              label={"Lab"}
              control={form.control}
              emptyText="Search for labs"
              placeholder="Seach for lab"
              loading={labs.loading}
              options={labs.data}
              onDebouncedChange={searchLabs}
              getItemLabel={(e) => e.name}
              getItemValue={(e) => `${e.lab_id}`}
            />
          </div>
        </div>
        <div className="flex justify-end">
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
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
