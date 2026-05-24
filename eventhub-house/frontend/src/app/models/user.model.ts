export type UserRole = 'user' | 'organizer' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_banned?: boolean;
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
