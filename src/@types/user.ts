export interface User {
  uid: string;
  name: string;
  email?: string | null;
  anon_name: string;
  photoUrl?: string | null;
  role?: "admin" | "user";
  status?: boolean;
  bookmark: string[];
}

export interface UserQuery {
  token: string;
  role: string;
}
