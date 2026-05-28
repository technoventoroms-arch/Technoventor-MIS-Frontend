import { IUser } from "@mono/shared_ui/interfaces/user";

export type IAttendanceStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IAttendance {
  id: number;
  user_id: number;
  check_in_at: string; // ISO 8601 timestamp
  check_out_at?: string; // ISO 8601 timestamp
  status: IAttendanceStatus; // extend as needed
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export interface ICheckInRecords extends IAttendance {
  user: IUser;
}
