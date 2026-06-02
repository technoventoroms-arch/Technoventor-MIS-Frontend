import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";

import { toAccessState } from "./machine-device-panel";

describe("toAccessState", () => {
  it("maps 403 responses to explicit forbidden message", () => {
    const forbiddenError = new AxiosError(
      "Request failed with status code 403",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 403,
        statusText: "Forbidden",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: { message: "Only organisation admins can view installer setup codes." },
      }
    );
    const result = toAccessState(forbiddenError);

    expect(result).toEqual({
      isForbidden: true,
      message: "You can access machine status, but installer setup code is organisation-admin only.",
    });
  });

  it("returns normalized message for non-forbidden errors", () => {
    const result = toAccessState(new Error("Network timeout"));

    expect(result.isForbidden).toBe(false);
    expect(result.message).toContain("Network timeout");
  });
});
