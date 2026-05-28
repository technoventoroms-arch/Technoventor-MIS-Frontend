import { IUser } from "@mono/shared_ui/interfaces/user";

export type LabSearchQuery = {
  skip?: number;
  take?: number;
  searchQuery?: string;
};

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
}
