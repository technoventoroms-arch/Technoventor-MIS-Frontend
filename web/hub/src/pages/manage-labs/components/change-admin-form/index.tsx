import { zodResolver } from "@hookform/resolvers/zod";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Check, Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ILabType } from "../../schema";
import { IUser } from "@mono/shared_ui/interfaces/user";
import { getUsersListForLab } from "@/services/user.service";

// Base address schema
export const changeAdminSchema = z.object({
  newAdmin: z.object({}).passthrough().required(),
});
export type ChangeAdminType = z.infer<typeof changeAdminSchema>;
type Props = {
  handleSubmit: (data: ChangeAdminType) => void;
  defaultLabInfo?: Partial<ILabType & { admin: IUser }>;
  loading?: boolean;
};

const ChangeLabAdmin = ({ handleSubmit, defaultLabInfo, loading }: Props) => {
  const form = useForm<ChangeAdminType>({
    defaultValues: {},
    resolver: zodResolver(changeAdminSchema),
    disabled: loading,
  });
  const { isDirty } = form.formState;
  const [users, setUsers] = useState<DataWithLoading<any[]>>({
    data: [],
    loading: false,
  });
  const handleSearch = async (search: string) => {
    if (!search) return;
    setUsers({ data: [], loading: true });

    try {
      const res = await getUsersListForLab({
        searchQuery: search,
      });
      if (!res.error) {
        setUsers({
          data: (res.data.records || []).filter(
            (i) =>
              i.identity_provider_id !=
              defaultLabInfo?.admin?.identity_provider_id
          ) as any,
          loading: false,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setUsers({ data: [], loading: false });
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 px-4 pb-4 flex-1 overflow-auto"
      >
        <div>
          <div>
            {defaultLabInfo?.admin?.identity_provider_id ? (
              <>Update Admin For Lab </>
            ) : (
              <>Add Admin For Lab </>
            )}
            <Badge variant={"red"}>{defaultLabInfo?.name} </Badge>{" "}
            {defaultLabInfo?.org_name && (
              <>
                of organization{" "}
                <Badge variant={"red"}>{defaultLabInfo?.org_name} </Badge>.
              </>
            )}
          </div>
          {defaultLabInfo?.admin?.identity_provider_id && (
            <div className="my-2">
              <div>Current Admin</div>
              <div className="flex gap-2 items-center w-max">
                <Avatar className="size-12 rounded-full">
                  <AvatarImage
                    src={defaultLabInfo?.admin?.image_link}
                    alt={defaultLabInfo?.admin?.first_name}
                  />
                  <AvatarFallback className="rounded-lg uppercase">
                    {defaultLabInfo?.admin?.first_name?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-sm font-medium">
                    {defaultLabInfo?.admin?.first_name}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {defaultLabInfo?.admin?.email}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-6">
            <ControlledAutocomplete
              name={"newAdmin"}
              label="New Admin"
              control={form.control}
              loading={false}
              options={users.data}
              getItemLabel={(e) => `${e.first_name} ${e.last_name}`}
              getItemValue={(e) => `${e.user_id}`}
              emptyText={"No users found."}
              onDebouncedChange={handleSearch}
              comboboxProps={{
                renderOptions: ({ getItemValue, item, value }) => (
                  <>
                    <div className="flex gap-2 items-center w-max">
                      <Avatar className="size-12 rounded-full">
                        <AvatarImage
                          src={(item as any)?.image_link}
                          alt={item?.first_name}
                        />
                        <AvatarFallback className="rounded-lg uppercase">
                          {item?.first_name?.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate text-sm font-medium">
                          {item?.first_name}
                        </span>
                        <span className="truncate text-sm text-muted-foreground">
                          {item?.email}
                        </span>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto",
                        value && getItemValue(value) === getItemValue(item)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </>
                ),
              }}
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
export default ChangeLabAdmin;
