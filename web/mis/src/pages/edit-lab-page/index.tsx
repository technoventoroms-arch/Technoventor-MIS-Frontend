import { useUser } from "@/providers/user-info-provider";
import {
  editLab,
  getLabById,
  regenerateLabApiKey,
} from "@/services/labs.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Copy, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { editLabSchema, ILabType } from "./schema";
import { useLabContext } from "@/providers/lab-provider";
import CanIUse, { useCanIUse } from "@/components/shared/can-i-use";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { useOrgContext } from "@/providers/organization-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";

const EditLabPage = () => {
  const { ApiKeyloading, hideApiKeyLoading, showApiKeyLoading } =
    useLoading("ApiKey");

  const [loading, setLoading] = useState(false);
  const { labData, updateLab, labId } = useLabContext();
  const { orgId } = useOrgContext();
  const [changeApiKeyModal, setChangeApiKeyModal] = useState(false);
  const canEditLab = useCanIUse(PERMISSIONS.UPDATE_LABS);
  const { user } = useUser();
  const form = useForm<ILabType>({
    defaultValues: {
      address_1: "",
      address_2: "",
      address_3: "",
      city: "",
      country: "",
      created_at: "",
      lab_id: 0,
      name: "",
      org_name: "",
      state: "",
      updated_at: "",
      zipcode: "",
    },
    resolver: zodResolver(editLabSchema),
    disabled: !canEditLab || loading,
  });
  const { isDirty } = form.formState;
  const getLabInfo = async () => {
    setLoading(true);
    try {
      const res = await getLabById(orgId, labId);
      if (!res.error) {
        form.reset(res.data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getLabInfo();
    }
  }, [user]);
  const handleSubmit = async (data: ILabType) => {
    try {
      const res = await editLab(data.lab_id, data as any);
      if (!res.error) {
        form.reset(res.data);
      }
      toast.success("Lab updated successfully");
      updateLab({ ...labData!, ...res.data });
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };

  const handleRegenerateApiKey = async () => {
    showApiKeyLoading();
    try {
      const res = await regenerateLabApiKey(orgId, labId);
      if (!res.error) {
        updateLab({ ...labData!, api_key: res.data.api_key! });
        toast.success("API Key regenerated successfully");
        setChangeApiKeyModal(false);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideApiKeyLoading();
    }
  };
  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard?.writeText(labData?.api_key || "");
      toast.success("API Key copied to clipboard");
    } catch (error) {
      toast.error(`Unable to copy API Key`);
    }
  };
  return (
    <>
      <SiteHeader title="Lab Info" />
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden max-w-4xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-2 px-4 py-2 overflow-auto"
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
            {canEditLab && (
              <div className="flex justify-end">
                <Button
                  disabled={loading || !isDirty}
                  type="submit"
                  variant={"green"}
                >
                  {loading ? <Loader className="animate-spin" /> : "Submit"}
                </Button>
              </div>
            )}
          </form>
        </Form>
        <CanIUse action={(e) => e.UPDATE_LABS}>
          <div className="space-y-2 px-4 py-2 overflow-auto">
            <div className="">
              <div className="text-xs">Lab API Key</div>
              <div className="text-lg font-semibold">
                {labData?.api_key || "--"}{" "}
                <Button
                  variant={"green"}
                  size={"sm"}
                  rounded={"sm"}
                  onClick={handleCopyApiKey}
                >
                  <Copy />
                </Button>
              </div>
            </div>
            <div className="text-lg font-semibold">
              <Button
                variant={"indigo"}
                size={"sm"}
                onClick={() => setChangeApiKeyModal(true)}
              >
                Regenerate API Key
              </Button>
            </div>
          </div>
        </CanIUse>
      </div>
      <Dialog
        open={!!changeApiKeyModal}
        onOpenChange={() => {
          !ApiKeyloading && setChangeApiKeyModal(false);
        }}
      >
        <DialogContent
          disabled={ApiKeyloading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">Change Lab Api Key</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for changing Lab API Key.
          </DialogDescription>
          <div className="p-4 pt-0 space-y-4">
            This action will invalidate the current API key and all the lab
            devices will stop working.
            <div className="text-lg font-semibold pt-1 space-x-2">
              <Button
                disabled={ApiKeyloading}
                variant={"red"}
                size={"sm"}
                onClick={() => setChangeApiKeyModal(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={ApiKeyloading}
                variant={"indigo"}
                size={"sm"}
                onClick={handleRegenerateApiKey}
              >
                Regenerate New API Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditLabPage;
