import { OrderItem } from "@/interfaces/order";
import { IProjectMember } from "@/interfaces/projects";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import ControlledDatePicker from "@mono/shared_ui/components/controlled-form-component/c-form-date-picker";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import ControlledFormTextArea from "@mono/shared_ui/components/controlled-form-component/c-form-textarea";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@mono/shared_ui/components/ui/avatar";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { IUser } from "@mono/shared_ui/interfaces/user";
import {
  DataWithLoading,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Check, Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export interface ReturnItemType {
  notes: string;
  order_line_id: number;
  returned_at: string; // Consider Date if it's ISO format
  returned_by_user_provider_id: string;
  returned_quantity: string; // Consider number if it's numeric
}

type Props = {
  item: OrderItem;
  handleSubmit: (data: ReturnItemType) => Promise<void>;
  getUsersOnSearch: (data: string) => Promise<ResponseDataType<IUser[], null>>;
  loading?: boolean;
};

const returnInvItemScheme = z
  .object({
    notes: z.string().max(255, `Notes can't be more than 255 characters`),
    returned_at: z.string(), // Use z.coerce.date() if you want to parse it to Date
    returned_by_user: z.object({}).passthrough().required(),
    returned_quantity: z
      .number({ coerce: true })
      .min(1, "Returned quantity should be greater than 0"), // Use z.coerce.number() if it's a numeric string
    default_qtty: z.number({ coerce: true }),
  })
  .refine(
    (data) => {
      return data.returned_quantity <= data.default_qtty;
    },
    (e) => ({
      message: `Returned quantity must be less than or equal to ${e?.default_qtty}`,
      path: ["returned_quantity"], // Point to the field causing the error
    })
  );
type returnInvItemSchemeType = z.infer<typeof returnInvItemScheme>;

const ReturnInvItemForm = ({
  getUsersOnSearch,
  handleSubmit,
  item,

  loading,
}: Props) => {
  const [users, setUsers] = useState<DataWithLoading<IProjectMember[]>>({
    data: [],
    loading: false,
  });
  const form = useForm({
    defaultValues: {
      notes: "",
      returned_at: new Date().toISOString(),
      returned_by_user: null,
      returned_quantity:
        Number.parseInt(`${item.ordered_quantity}`) -
        Number.parseInt(`${item.returned_quantity}`),
      default_qtty:
        Number.parseInt(`${item.ordered_quantity}`) -
        Number.parseInt(`${item.returned_quantity}`),
    } as any,
    resolver: zodResolver(returnInvItemScheme),
    disabled: loading,
  });
  const { isDirty } = form.formState;
  const { control } = form;
  const handleSearch = async (search: string) => {
    setUsers({ data: [], loading: true });
    try {
      const res = await getUsersOnSearch(search);
      if (!res.error) {
        setUsers({ data: (res.data || []) as any, loading: false });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setUsers({ data: [], loading: false });
    }
  };

  const onSubmitHandler = (data: returnInvItemSchemeType) => {
    const returnData: ReturnItemType = {
      notes: data.notes,
      order_line_id: item.id,
      returned_at: new Date().toISOString(),
      returned_by_user_provider_id: data.returned_by_user
        .identity_provider_id as string,
      returned_quantity: data.returned_quantity.toString(),
    };
    handleSubmit(returnData);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitHandler)}
        className="space-y-2 px-4 pb-4 flex-1 overflow-auto"
      >
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-6">
            <ControlledAutocomplete
              control={form.control}
              name={"returned_by_user"}
              label={"Returned By User"}
              loading={users.loading}
              options={users.data}
              onDebouncedChange={handleSearch}
              getItemLabel={(e) => `${e.first_name} ${e.last_name}`}
              getItemValue={(e) => `${e.user_id}`}
              emptyText={"No Users found."}
              formItemClassName="h-auto"
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
          <div className="col-span-6">
            <ControlledDatePicker
              name={"returned_at"}
              label={"Returned At"}
              control={control}
            />
          </div>

          <div className="col-span-6">
            <ControlledFormInput
              name={"returned_quantity"}
              label={"Returned Quantity"}
              control={control}
            />
          </div>
          <div className="col-span-6">
            <ControlledFormTextArea
              name={"notes"}
              label={"Notes"}
              control={form.control}
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

export default ReturnInvItemForm;
