import { describe, expect, it } from "vitest";

import { buildResourcePayload, type ResourceField } from "./resource-forms";

describe("buildResourcePayload", () => {
  const fields: ResourceField[] = [
    { name: "name", label: "Name" },
    { name: "image_url", label: "Image", type: "image" },
  ];

  it("sends null when an image field is cleared", () => {
    expect(
      buildResourcePayload(
        {
          name: "Widget",
          image_url: "",
        },
        fields
      )
    ).toEqual({
      name: "Widget",
      image_url: null,
    });
  });

  it("omits empty non-image fields", () => {
    expect(
      buildResourcePayload(
        {
          name: "",
          image_url: "https://cdn.example.com/a.png",
        },
        fields
      )
    ).toEqual({
      image_url: "https://cdn.example.com/a.png",
    });
  });
});
