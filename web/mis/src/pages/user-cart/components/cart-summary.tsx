import { useCartContext } from "@/providers/cart-provider";
import { checkoutCart } from "@/services/cart.service";
import { getProjectsList } from "@/services/projects.service";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { IProjectsGetAll } from "@mono/shared_ui/interfaces/projects";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Send } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

const badgeStyle: Record<string, string> = {
  "very high": "red",
  high: "pink",
  medium: "green",
  low: "yellow",
};

const CartSummary = () => {
  const { clearCart } = useCartContext();

  const [projects, setProjects] = useState<DataWithLoading<IProjectsGetAll[]>>({
    data: [],
    loading: false,
  });
  const form = useForm<{ project: IProjectsGetAll | null }>({
    defaultValues: {
      project: null,
    },
  });
  const project = useWatch({ control: form.control, name: "project" });
  const getProjects = async (e: string) => {
    setProjects({ data: [], loading: true });
    try {
      const res = await getProjectsList({
        searchQuery: e,
        isComplete: false,
      });
      if (!res.error) {
        setProjects({ data: res.data?.records || [], loading: false });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setProjects({ data: [], loading: true });
    }
  };
  const handleSubmit = async (data: { project: IProjectsGetAll | null }) => {
    try {
      const res = await checkoutCart({ project_id: data.project!.id });
      if (!res.error) {
        toast.success("Cart checked out successfully.");
        form.reset();
        clearCart();
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="md:min-w-80 h-min shadow p-4 flex flex-col gap-2 lg:sticky top-0 border rounded"
      >
        <div className="text-lg font-semibold mb-4 ">Checkout Summary</div>
        <ControlledAutocomplete
          control={form.control}
          name={"project"}
          label={"Project"}
          loading={projects.loading}
          options={projects.data}
          onDebouncedChange={getProjects}
          getItemLabel={(e) => e.title}
          getItemValue={(e) => `${e.id}`}
          emptyText={"No Projects found."}
          formItemClassName="h-auto"
        />
        {project?.id && (
          <>
            <div>
              <div className="text-xs text-gray-500">Description</div>
              <div className="font-semibold">{project?.description}</div>
            </div>
            <div>
              <div className="text-xs">Priority</div>
              <div className="text-lg font-semibold">
                <Badge
                  className="text-sm "
                  variant={
                    (badgeStyle as any)[project?.priority || ""] || "green"
                  }
                >
                  {project?.priority || "Low"}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs">Owner</div>
              <div className="flex gap-2 items-center w-max">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={project?.owner.image_link}
                    alt={project?.owner.first_name}
                  />
                  <AvatarFallback className="rounded-lg uppercase">
                    {project?.owner.first_name?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xs font-medium">
                    {project?.owner.first_name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {project?.owner.email}
                  </span>
                </div>
              </div>
            </div>

            <Button className="w-full">
              <Send />
              Checkout
            </Button>
          </>
        )}
      </form>
    </FormProvider>
  );
};
export default CartSummary;
