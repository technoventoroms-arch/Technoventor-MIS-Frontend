export type ProjectSearchQuery = {
  skip?: number;
  take?: number;
  searchQuery?: string;
  isComplete?: boolean;
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

export interface IProject {
  id: number;
  title: string;
  description: string;
  owner: IProjectMember;
  priority: string; // enum-like
  end_date: string; // ISO datetime string
  is_complete: boolean;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}
