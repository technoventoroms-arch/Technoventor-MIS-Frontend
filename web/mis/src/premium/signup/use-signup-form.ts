import { useMemo, useState } from "react";
import { normalizeApiError } from "@mono/api_client";
import type { SignupType } from "../profile-to-ui-context";

type OrganisationAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
};

type SignupFormValues = {
  signupType: SignupType;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  organisationName: string;
  organisationSlug: string;
  organisationDescription: string;
  organisationPhone: string;
  organisationWebsite: string;
  organisationLogoUrl: string;
  organisationAddress: OrganisationAddress;
};

export function useSignupForm() {
  const [values, setValues] = useState<SignupFormValues>({
    signupType: "member",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    organisationName: "",
    organisationSlug: "",
    organisationDescription: "",
    organisationPhone: "",
    organisationWebsite: "",
    organisationLogoUrl: "",
    organisationAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
    },
  });
  const [error, setError] = useState<string | null>(null);

  const setSignupType = (signupType: SignupType) => {
    setValues((previous) => ({ ...previous, signupType }));
  };

  const setField = (field: keyof SignupFormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const setAddressField = (field: keyof OrganisationAddress, value: string) => {
    setValues((previous) => ({
      ...previous,
      organisationAddress: {
        ...previous.organisationAddress,
        [field]: value,
      },
    }));
  };

  const validate = () => {
    if (!values.email || !values.firstName || !values.lastName || !values.password) {
      return "Please fill all required fields.";
    }

    if (values.signupType === "organisation") {
      if (!values.organisationName || !values.organisationSlug) {
        return "Organisation name and slug are required.";
      }
    }

    return null;
  };

  const payload = useMemo(() => {
    const basePayload = {
      email: values.email.trim(),
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      phone_number: values.phoneNumber.trim(),
      password: values.password,
      signup_type: values.signupType,
    };

    if (values.signupType === "member") {
      return basePayload;
    }

    return {
      ...basePayload,
      organisation_name: values.organisationName.trim(),
      organisation_slug: values.organisationSlug.trim(),
      organisation_description: values.organisationDescription.trim(),
      organisation_phone: values.organisationPhone.trim(),
      organisation_website: values.organisationWebsite.trim(),
      organisation_address: values.organisationAddress,
      organisation_logo_url: values.organisationLogoUrl.trim(),
    };
  }, [values]);

  const consumeApiError = (errorValue: unknown) => {
    const directDetail =
      errorValue && typeof errorValue === "object"
        ? ((errorValue as { response?: { data?: { detail?: unknown } } }).response?.data?.detail ?? undefined)
        : undefined;
    if (typeof directDetail === "string") {
      if (directDetail.toLowerCase().includes("already has an organisation")) {
        setError("This email already has an organisation account.");
      } else {
        setError(directDetail);
      }
      return;
    }

    const apiError = normalizeApiError(errorValue);
    const detail = apiError.raw && typeof apiError.raw === "object"
      ? (apiError.raw as { detail?: unknown }).detail
      : undefined;
    if (typeof detail === "string") {
      if (detail.toLowerCase().includes("already has an organisation")) {
        setError("This email already has an organisation account.");
        return;
      }
      setError(detail);
      return;
    }
    if (Array.isArray(detail) && detail.length) {
      setError(detail.map(String).join(" "));
      return;
    }
    if (detail && typeof detail === "object") {
      const joined = Object.entries(detail as Record<string, unknown>)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
        .join(" ");
      if (joined) {
        setError(joined);
        return;
      }
    }
    setError(apiError.message || "Unable to register account");
  };

  return {
    values,
    payload,
    error,
    setError,
    setSignupType,
    setField,
    setAddressField,
    validate,
    consumeApiError,
  };
}
