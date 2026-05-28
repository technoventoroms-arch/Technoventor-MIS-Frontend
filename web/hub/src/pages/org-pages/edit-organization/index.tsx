import { useLabContext } from "@/providers/lab-provider";
import { useOrgContext } from "@/providers/organization-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";

import { debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  checkOrgAvailability,
  editOrganization,
  fetchAllOrganizationById,
} from "@/services/organization.service";
import { Form } from "@mono/shared_ui/components/ui/form";
import { Organization } from "@mono/shared_ui/interfaces/organization";
import z from "zod";

const editOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string().min(1, "Organization description is required"),
  address_1: z.string().min(1, "Address Line 1 is required"),
  address_2: z.string().optional(),
  address_3: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  zipcode: z.string().min(1, "Zipcode is required"),
  is_active: z.boolean(),
});
const EditOrganization = () => {
  const [loading, setLoading] = useState(false);
  const { labData, updateLab } = useLabContext();
  const { orgId } = useOrgContext();
  const [checkingName, setCheckingName] = useState(false);

  const form = useForm({
    defaultValues: {
      description: "",
      name: "",
      is_active: true,
      address_1: "",
      address_2: "",
      address_3: "",
      city: "",
      country: "",
      state: "",
      zipcode: "",
    },
    resolver: zodResolver(editOrgSchema),
    disabled: true,
  });
  const { isDirty } = form.formState;
  const handleCheckEmail = async (orgName: any) => {
    setCheckingName(true);
    try {
      const res = await checkOrgAvailability(orgName);
      if (res.data?.exists) {
        form.setError("name", {
          message: "Organization with this name already exists.",
        });
      } else {
        form.clearErrors("name");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setCheckingName(false);
    }
  };
  const getOrgInfo = async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrganizationById(orgId);
      if (!res.error) {
        form.reset(res.data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const orgName = useWatch({ name: "name", control: form.control });

  const dbCheckOrgName = useCallback(debounce(handleCheckEmail, 500), []);

  useEffect(() => {
    if (orgName && isDirty) {
      dbCheckOrgName(orgName);
    }
  }, [orgName, isDirty]);
  useEffect(() => {
    if (orgId) {
      getOrgInfo();
    }
  }, [orgId]);
  const handleSubmit = async (data: Organization) => {
    try {
      const res = await editOrganization(data as any);
      if (!res.error) {
        form.reset(res.data);
      }
      toast.success("Organization updated successfully");
      updateLab({ ...labData!, ...res.data });
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  return (
    <>
      <SiteHeader title="Organization Info" />
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden max-w-4xl">
        {loading ? (
          <div className="min-w-sm max-w-4xl flex  items-center justify-center h-full">
            <Loader className="animate-spin" /> please wait...
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit as any)}
              className="space-y-2 px-4 pb-4 flex-1 overflow-auto max-w-4xl mt-4"
            >
              <div className="grid grid-cols-6 md:grid-cols-12 gap-4">
                <div className="col-span-6">
                  <ControlledFormInput
                    name="name"
                    label="Organization Name"
                    control={form.control}
                    placeholder="Makerspace Lab"
                  />
                  {checkingName && (
                    <div className="text-xs">
                      Checking org availability...{" "}
                      <Loader className="animate-spin inline size-4" />
                    </div>
                  )}
                </div>
                <div className="col-span-6">
                  <ControlledFormInput
                    name="description"
                    label="Organization Description"
                    control={form.control}
                    placeholder="Nagpur's largest makerspace"
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
            </form>
          </Form>
        )}
      </div>
    </>
  );
};

export default EditOrganization;
