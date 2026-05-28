import { IProjectsGetAll } from "@mono/shared_ui/interfaces/projects";
import { IGenericQueryParam } from "@mono/shared_ui/interfaces/utils";
import { MachineStatus } from "./machines";

export type ReservationStatusType =
  | "NEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";
export type IMachineReservationQueryParams = {
  from?: string;
  to?: string;
  searchQuery?: string;
  status?: string;
};
export type AddReservation = {
  booked_from: string; // ISO date string or datetime
  booked_till: string; // ISO date string or datetime
  machine_id: number;
  notes: string;
  project_id: number;
};

export interface IMachineBookingDetails {
  id: number;
  machine: {
    id: number;
    name: string;
    description: string;
    status: MachineStatus;
    created_at: string; // ISO datetime string
    updated_at: string;
  };
  project: IProjectsGetAll;
  booked_from: string;
  booked_till: string;
  notes: string;
  status: ReservationStatusType; // Extend based on system logic
  created_at: string;
  created_by: UserInfo;
  updated_at: string;
  updated_by: UserInfo;
}

interface UserInfo {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_name: string; // consider `"admin" | "staff" | "user"` if fixed
  identity_provider_id: string;
  image_link: string;
}
export interface MachineBookingSummary {
  id: number;
  project_id: number;
  machine_id: number;
  booked_from: string; // ISO datetime string
  booked_till: string;
  notes: string;
  status: ReservationStatusType; // add more statuses if needed
  created_at: string;
  updated_at: string;
  project_title: string;
  project_description: string;
  machine_name: string;
  machine_description: string;
  created_by: UserInfo;
}

export type IUserMacReservationQueryParams = {
  fromDate?: string;
  toDate?: string;
  status?: ReservationStatusType;
} & IGenericQueryParam;
