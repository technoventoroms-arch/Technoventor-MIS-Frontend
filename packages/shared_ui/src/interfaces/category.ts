export interface ICategory {
  id: number;
  name: string;
  parent_id: number | null;
  parent_name: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
