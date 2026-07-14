import { describe, expect, it } from "vitest";

import { isNumericOrgId } from "./use-org-admin";

describe("isNumericOrgId", () => {
  it("accepts numeric organisation ids", () => {
    expect(isNumericOrgId("12")).toBe(true);
    expect(isNumericOrgId("1")).toBe(true);
  });

  it("rejects admin path segments and other non-ids", () => {
    expect(isNumericOrgId("admin")).toBe(false);
    expect(isNumericOrgId("settings")).toBe(false);
    expect(isNumericOrgId("12a")).toBe(false);
    expect(isNumericOrgId(undefined)).toBe(false);
    expect(isNumericOrgId("")).toBe(false);
  });
});
