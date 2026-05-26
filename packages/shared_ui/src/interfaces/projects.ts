import { IUser } from "./user";

export interface IProjectsGetAll {
  id: number;
  title: string;
  description: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  priority: string;
  end_date: string; // ISO date string
  owner: Partial<IUser>;
}

export interface ProjectEvent {
  project_id: number;
  message: string;
  user_identity_provider_id: string;
  time: string; // ISO 8601 timestamp
  user: IUser;
}
