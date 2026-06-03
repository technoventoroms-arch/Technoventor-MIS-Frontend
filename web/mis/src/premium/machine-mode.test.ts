import { describe, expect, it } from "vitest";

import {
  formatMachineModeLabel,
  getMachineMode,
  isAttendanceMachine,
  MACHINE_MODE_ATTENDANCE,
  MACHINE_MODE_MACHINE,
} from "./machine-mode";

describe("machine-mode", () => {
  it("defaults missing mode to equipment", () => {
    expect(getMachineMode({})).toBe(MACHINE_MODE_MACHINE);
    expect(isAttendanceMachine(null)).toBe(false);
  });

  it("detects attendance kiosks", () => {
    expect(getMachineMode({ mode: MACHINE_MODE_ATTENDANCE })).toBe(MACHINE_MODE_ATTENDANCE);
    expect(isAttendanceMachine({ mode: MACHINE_MODE_ATTENDANCE })).toBe(true);
    expect(formatMachineModeLabel(MACHINE_MODE_ATTENDANCE)).toBe("Attendance kiosk");
    expect(formatMachineModeLabel(MACHINE_MODE_MACHINE)).toBe("Equipment");
  });
});
