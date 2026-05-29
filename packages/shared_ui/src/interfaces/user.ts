export type IUser = {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role_name: "org_admin" | "super_admin" | "admin" | "lab_manager" | "user"; // extend as needed
  role_id: number;
  lab_id: number;
  lab_name: string;
  identity_provider_id: string;
  last_login: string; // ISO timestamp
  image_link: string;
  is_verified: boolean;
};

export type OrgUser = {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  image_link?: string;
  is_admin: boolean;
  identity_provider_id: string; // UUID format
};

export interface UserInvitation {
  id: number;
  email: string;
  role_name: string;
  status: "PENDING" | "APPROVED" | "REJECTED"; // can be stricter or just string
  lab_name: string;
  organisation_name: string;
  organisation_id?: number;
  lab_id?: number;
}
