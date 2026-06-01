/** Organisation invite & lab membership types (inventory access flag). */

export interface OrganisationInviteCreate {
  email: string;
  lab?: number | null;
  role?: number | null;
  can_manage_inventory?: boolean;
}

export interface OrganisationInvite extends OrganisationInviteCreate {
  id: number;
  status: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface UserInvitation {
  id: number;
  organisation_name: string;
  organisation_id?: number;
  lab_name: string;
  lab_id?: number;
  role_name: string;
  can_manage_inventory: boolean;
  status: string;
  expires_at: string;
  created_at: string;
}

export interface LabMemberAdd {
  user_id: number;
  role_id: number;
  can_manage_inventory?: boolean;
}
