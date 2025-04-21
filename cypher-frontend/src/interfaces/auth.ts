export interface User {
  _id: string;
  github_id: number;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}
