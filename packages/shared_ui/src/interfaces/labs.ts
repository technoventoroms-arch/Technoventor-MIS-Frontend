export interface IUserLab {
  lab_id: number;
  name: string;
  address_1: string;
  address_2: string;
  address_3: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  role_name: string; // or more roles if applicable
  is_active: boolean;
  created_at: string; // ISO 8601 datetime with timezone
  updated_at: string; // ISO 8601 datetime with timezone
}
