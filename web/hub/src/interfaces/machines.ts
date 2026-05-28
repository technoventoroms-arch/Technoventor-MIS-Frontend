export type MachineStatus =
  | "ACTIVE"
  | "OCCUPIED"
  | "OFF"
  | "UNDER_MAINTENANCE"
  | "RETIRED"
  | "FAULTY";
export type IMachine = {
  description: string;
  name: string;
  id?: number;
  created_at?: Date;
  updated_at?: Date;
  status?: MachineStatus;
  image_link: string;
  api_key?: string;
};

interface CreatedBy {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_name: string; // consider `"admin" | "staff" | "user"` if fixed
  identity_provider_id: string;
}
export type MachineLog = {
  id: number;
  machine_reservation_id: number;
  previous_status: MachineStatus;
  new_status: MachineStatus;
  notes: string;
  reference: string;
  created_at: string; // ISO date string
  created_by: CreatedBy;
};
export type MachineQRData = {
  id: number;
  description: string;
  name: string;
};

export type MachineSpecs = {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
};
