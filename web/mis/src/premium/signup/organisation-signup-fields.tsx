import { Input } from "@mono/shared_ui/components/ui/input";
import { Label } from "@mono/shared_ui/components/ui/label";

type Props = {
  organisationName: string;
  organisationSlug: string;
  organisationDescription: string;
  organisationPhone: string;
  organisationWebsite: string;
  organisationLogoUrl: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };
  onFieldChange: (
    field:
      | "organisationName"
      | "organisationSlug"
      | "organisationDescription"
      | "organisationPhone"
      | "organisationWebsite"
      | "organisationLogoUrl",
    value: string
  ) => void;
  onAddressFieldChange: (
    field: "line1" | "line2" | "city" | "state" | "country" | "zipcode",
    value: string
  ) => void;
  mode?: "all" | "profile" | "address";
};

export function OrganisationSignupFields({
  organisationName,
  organisationSlug,
  organisationDescription,
  organisationPhone,
  organisationWebsite,
  organisationLogoUrl,
  address,
  onFieldChange,
  onAddressFieldChange,
  mode = "all",
}: Props) {
  const showProfile = mode === "all" || mode === "profile";
  const showAddress = mode === "all" || mode === "address";

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
      {showProfile ? (
        <>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Organisation details</p>
          <div className="space-y-2">
            <Label htmlFor="organisationName">Organisation name</Label>
            <Input
              id="organisationName"
              value={organisationName}
              onChange={(event) => onFieldChange("organisationName", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organisationSlug">Organisation slug</Label>
            <Input
              id="organisationSlug"
              value={organisationSlug}
              onChange={(event) => onFieldChange("organisationSlug", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organisationDescription">Description</Label>
            <Input
              id="organisationDescription"
              value={organisationDescription}
              onChange={(event) => onFieldChange("organisationDescription", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organisationPhone">Organisation phone</Label>
            <Input
              id="organisationPhone"
              value={organisationPhone}
              onChange={(event) => onFieldChange("organisationPhone", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organisationWebsite">Organisation website</Label>
            <Input
              id="organisationWebsite"
              value={organisationWebsite}
              onChange={(event) => onFieldChange("organisationWebsite", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organisationLogoUrl">Logo URL</Label>
            <Input
              id="organisationLogoUrl"
              value={organisationLogoUrl}
              onChange={(event) => onFieldChange("organisationLogoUrl", event.target.value)}
            />
          </div>
        </>
      ) : null}
      {showAddress ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="line1">Address line 1</Label>
            <Input
              id="line1"
              value={address.line1}
              onChange={(event) => onAddressFieldChange("line1", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="line2">Address line 2</Label>
            <Input
              id="line2"
              value={address.line2}
              onChange={(event) => onAddressFieldChange("line2", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={address.city}
              onChange={(event) => onAddressFieldChange("city", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={address.state}
              onChange={(event) => onAddressFieldChange("state", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={address.country}
              onChange={(event) => onAddressFieldChange("country", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipcode">Zip code</Label>
            <Input
              id="zipcode"
              value={address.zipcode}
              onChange={(event) => onAddressFieldChange("zipcode", event.target.value)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
