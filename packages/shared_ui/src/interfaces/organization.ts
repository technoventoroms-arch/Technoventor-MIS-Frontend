import { IUser } from "./user";

export interface Organization {
  name: string;
  description: string;
  is_active: boolean;
  id: number;
  address_1: string;
  address_2: string;
  address_3: string;
  city: string;
  country: string;
  state: string;
  zipcode: string;
  has_active_subscription: boolean;
  admin: IUser;
}
