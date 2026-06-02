import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSignupForm } from "./use-signup-form";

describe("useSignupForm", () => {
  it("builds member payload correctly", () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
      result.current.setField("email", "member@example.com");
      result.current.setField("firstName", "Member");
      result.current.setField("lastName", "User");
      result.current.setField("phoneNumber", "9999999999");
      result.current.setField("password", "secret");
    });

    expect(result.current.payload).toEqual({
      email: "member@example.com",
      first_name: "Member",
      last_name: "User",
      phone_number: "9999999999",
      password: "secret",
      signup_type: "member",
    });
  });

  it("builds organisation payload correctly", () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
      result.current.setSignupType("organisation");
      result.current.setField("email", "owner@example.com");
      result.current.setField("firstName", "Owner");
      result.current.setField("lastName", "User");
      result.current.setField("phoneNumber", "8888888888");
      result.current.setField("password", "secret");
      result.current.setField("organisationName", "Tech Org");
      result.current.setField("organisationSlug", "tech-org");
      result.current.setAddressField("city", "Pune");
    });

    expect(result.current.payload).toMatchObject({
      email: "owner@example.com",
      first_name: "Owner",
      last_name: "User",
      phone_number: "8888888888",
      password: "secret",
      signup_type: "organisation",
      organisation_name: "Tech Org",
      organisation_slug: "tech-org",
      organisation_address: {
        city: "Pune",
      },
    });
  });

  it("validates required fields and reads response detail errors", () => {
    const { result } = renderHook(() => useSignupForm());

    expect(result.current.validate()).toBe("Please fill all required fields.");

    act(() => {
      result.current.consumeApiError({
        response: {
          data: {
            detail: "This email already has an organisation account.",
          },
          status: 400,
        },
      });
    });

    expect(result.current.error).toBe("This email already has an organisation account.");
  });
});
