import type { FieldOption } from "./resource-forms";

/** Matches backend `MachineMode` TextChoices values. */
export const MACHINE_MODE_MACHINE = "MACHINE";
export const MACHINE_MODE_ATTENDANCE = "ATTENDANCE";

export type MachineModeValue =
  | typeof MACHINE_MODE_MACHINE
  | typeof MACHINE_MODE_ATTENDANCE;

export function getMachineMode(row: { mode?: unknown } | null | undefined): MachineModeValue {
  return row?.mode === MACHINE_MODE_ATTENDANCE
    ? MACHINE_MODE_ATTENDANCE
    : MACHINE_MODE_MACHINE;
}

export function isAttendanceMachine(row: { mode?: unknown } | null | undefined): boolean {
  return getMachineMode(row) === MACHINE_MODE_ATTENDANCE;
}

export function formatMachineModeLabel(mode: unknown): string {
  if (mode === MACHINE_MODE_ATTENDANCE) return "Attendance kiosk";
  return "Equipment";
}

export const machineModeFieldOptions: FieldOption[] = [
  {
    value: MACHINE_MODE_MACHINE,
    label: "Equipment (booking + unlock)",
  },
  {
    value: MACHINE_MODE_ATTENDANCE,
    label: "Attendance kiosk (tap to check in)",
  },
];
