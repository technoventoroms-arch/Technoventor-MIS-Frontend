const FIELD_LABELS: Record<string, string> = {
  slug: "Organisation link",
  logo_url: "Logo",
  image_url: "Image",
  name: "Name",
  address: "Address",
  phone: "Phone number",
  website: "Website",
  description: "Description",
  email: "Email address",
  password: "Password",
  first_name: "First name",
  last_name: "Last name",
  organisation_name: "Organisation name",
  organisation_slug: "Organisation link",
  organisation_phone: "Organisation phone",
  organisation_website: "Organisation website",
  organisation_logo_url: "Organisation logo",
  organisation_description: "Organisation description",
  organisation_address: "Organisation address",
  lab: "Lab",
  role: "Role",
  can_manage_inventory: "Inventory access",
  booking_window_start: "Booking start time",
  booking_window_end: "Booking end time",
  slot_duration_minutes: "Slot duration",
  no_show_grace_minutes: "No-show grace period",
  user_id: "User",
  role_id: "Role",
  lab_id: "Lab",
  rfid_uid: "RFID card",
  ids: "Selected items",
  items: "Items",
};

const MESSAGE_REWRITES: Array<[RegExp, string]> = [
  [/this field is required\.?/i, "Please fill in this field."],
  [/this field may not be blank\.?/i, "Please fill in this field."],
  [/may not be null\.?/i, "Please fill in this field."],
  [/an organisation with this slug already exists\.?/i, "That organisation link is already taken. Please choose a different one."],
  [/address must be a json object\.?/i, "Please enter a valid address."],
  [/must be a json object\.?/i, "Please check this value and try again."],
  [/enter a valid url\.?/i, "Please enter a valid website address."],
  [/enter a valid email address\.?/i, "Please enter a valid email address."],
  [/valid integer is required\.?/i, "Please enter a whole number."],
  [/valid number is required\.?/i, "Please enter a number."],
  [/not a valid (?:string|choice)\.?/i, "Please choose a valid option."],
  [/ensure this (?:field )?has no more than (\d+) characters?\.?/i, "Please use at most $1 characters."],
  [/ensure this (?:field )?has at least (\d+) characters?\.?/i, "Please enter at least $1 characters."],
  [/validation error\.?/i, "Please check the form and try again."],
  [/request failed with status code \d+\.?/i, "Something went wrong. Please try again."],
  [/network error\.?/i, "Could not connect. Please check your internet and try again."],
  [/request failed\.?/i, "Something went wrong. Please try again."],
  [/an unknown api error occurred\.?/i, "Something went wrong. Please try again."],
];

function humanizeFieldLabel(fieldKey: string): string | undefined {
  if (fieldKey === "non_field_errors" || fieldKey === "message" || fieldKey === "detail") {
    return undefined;
  }
  if (FIELD_LABELS[fieldKey]) {
    return FIELD_LABELS[fieldKey];
  }

  const normalized = fieldKey.replace(/_/g, " ").trim();
  if (!normalized) return undefined;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function humanizeErrorMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return "Something went wrong. Please try again.";
  }

  const prefixed = trimmed.match(/^([a-z0-9_]+):\s*(.+)$/i);
  if (prefixed) {
    const [, rawField, rawText] = prefixed;
    const label = humanizeFieldLabel(rawField);
    const friendlyText = humanizeErrorMessage(rawText);
    if (!label) {
      return friendlyText;
    }
    if (friendlyText === "Please fill in this field.") {
      return `Please enter ${label.toLowerCase()}.`;
    }
    return `${label}: ${friendlyText}`;
  }

  for (const [pattern, replacement] of MESSAGE_REWRITES) {
    if (pattern.test(trimmed)) {
      return trimmed.replace(pattern, replacement);
    }
  }

  if (/^[a-z0-9_]+:/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

export function humanizeFieldErrors(fields: Record<string, string[]>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(fields)) {
    result[key] = messages.map((message) => {
      const label = humanizeFieldLabel(key);
      const friendly = humanizeErrorMessage(message);
      if (!label || key === "non_field_errors") {
        return friendly;
      }
      if (friendly === "Please fill in this field.") {
        return `Please enter ${label.toLowerCase()}.`;
      }
      if (friendly.toLowerCase().startsWith(label.toLowerCase())) {
        return friendly;
      }
      return `${label}: ${friendly}`;
    });
  }
  return result;
}

export function formatFieldErrors(fields: Record<string, string[]>): string | undefined {
  const humanized = humanizeFieldErrors(fields);
  const messages = Object.entries(humanized).flatMap(([key, values]) =>
    values.map((message) => (key === "non_field_errors" ? message : message))
  );
  if (!messages.length) {
    return undefined;
  }
  return messages.join(" ");
}
