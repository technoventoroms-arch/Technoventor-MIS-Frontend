import {
  checkOrgAvailability,
  createOrganization,
} from "@/services/organization.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { Form } from "@mono/shared_ui/components/ui/form";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { Organization } from "@mono/shared_ui/interfaces/organization";
import { debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const orgSchema = z.object({
  orgName: z
    .string()
    .trim()
    .toUpperCase()
    .max(40, "Max characters should be less than 40")
    .min(1, "Organization name is required")
    .transform((value) => value.toUpperCase().trim()),
  orgDesc: z.string().trim().min(1, "Organization description is required"),
  address_1: z.string().trim().min(1, "Address Line 1 is required"),
  address_2: z.string().trim().optional(),
  address_3: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(1, "Country is required"),
  state: z.string().trim().min(1, "State is required"),
  zipcode: z.string().trim().min(1, "Zipcode is required"),
});
type Props = {
  handleSubmit: (data: Organization) => void;
  defaultValues?: Organization;
  passToPayment: () => void;
};

const OrgInfo = ({ handleSubmit, defaultValues, passToPayment }: Props) => {
  const { hideLoading, loading, showLoading } = useLoading();
  const [checkingName, setCheckingName] = useState(false);
  const form = useForm({
    defaultValues: defaultValues
      ? {
          orgDesc: defaultValues.description,
          orgName: defaultValues.name,
          address_1: defaultValues.address_1,
          address_2: defaultValues.address_2,
          address_3: defaultValues.address_3,
          city: defaultValues.city,
          country: defaultValues.country,
          state: defaultValues.state,
          zipcode: defaultValues.zipcode,
        }
      : {
          orgName: "",
          orgDesc: "",
          address_1: "",
          address_2: "",
          address_3: "",
          city: "",
          country: "",
          state: "",
          zipcode: "",
        },
    resolver: zodResolver(orgSchema),
    disabled: !!defaultValues?.id,
    mode: "all",
  });
  const { isDirty, errors } = form.formState;

  const handleCheckOrgName = async (orgName: any) => {
    setCheckingName(true);
    try {
      const res = await checkOrgAvailability(encodeURIComponent(orgName));
      if (res.data) {
        form.setError("orgName", {
          message: "Organization with this name already exists.",
        });
      } else {
        form.clearErrors("orgName");
        form.trigger("orgName");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setCheckingName(false);
    }
  };
  const orgName = useWatch({ name: "orgName", control: form.control });
  const dbCheckOrgName = useCallback(debounce(handleCheckOrgName, 500), []);
  useEffect(() => {
    if (orgName && isDirty && errors["orgName"]?.type != "too_big") {
      dbCheckOrgName(orgName.trim());
    }
  }, [orgName, isDirty]);

  const createNewOrganization = async (data: z.infer<typeof orgSchema>) => {
    if (defaultValues?.id) {
      passToPayment();
      return;
    }
    showLoading();
    try {
      const res = await createOrganization({
        description: data.orgDesc,
        name: data.orgName,
        address_1: data.address_1,
        address_2: data.address_2,
        address_3: data.address_3,
        city: data.city,
        country: data.country,
        state: data.state,
        zipcode: data.zipcode,
      });
      if (!res.error) {
        handleSubmit(res.data);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Organization Details</CardTitle>
        <CardDescription>
          Enter the details below to register your account. You can edit this
          later in organization settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(createNewOrganization)}>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-4">
              <div className="col-span-6">
                <ControlledFormInput
                  name="orgName"
                  label="Organization Name"
                  control={form.control}
                  placeholder="Makerspace Lab"
                  onChange={(e) =>
                    form.setValue("orgName", e.target.value.toUpperCase(), {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
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
                  name="orgDesc"
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
            <div className="flex justify-center">
              <Button variant={"green"} type="submit" className="mt-4">
                {loading ? (
                  <>
                    <Loader className="animate-spin" />{" "}
                    <>Creating Organization...</>
                  </>
                ) : defaultValues?.id ? (
                  "Complete payment"
                ) : (
                  "Create Organization and Select plan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OrgInfo;
