export interface User {
  uid: string;
  name: string;
  email?: string | null;
  photoUrl?: string | null;
  role?: "admin" | "user";
  status?: boolean;
}

export interface UserQuery {
  access_token: string;
  role: string;
}
