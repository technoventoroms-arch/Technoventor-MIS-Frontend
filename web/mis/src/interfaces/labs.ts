import { IUser } from "@mono/shared_ui/interfaces/user";

export interface ILabType {
  lab_id: number;
  name: string;
  organisation_name: string;
  address_1: string;
  address_2: string;
  address_3: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  is_active?: boolean;
  admin?: IUser;
  api_key?: string;
}

export interface IAvailableLab extends ILabType {
  organisation_id: number;
}

export interface ILabJoinRequest {
  request_id: number;
  status: string;
  created_at: string; // ISO date string
  lab_id: number;
  lab_name: string;
  user: {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    identity_provider_id: string;
  };
}
