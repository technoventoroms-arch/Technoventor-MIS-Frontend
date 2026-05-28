export type ProjectSearchQuery = {
  skip?: number;
  take?: number;
  searchQuery?: string;
  lab_id: number;
};

export interface IProjectMember {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_name: string; // extend as needed
  identity_provider_id: string;
  is_owner: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  image_link: string;
}
