export interface User {
  uid: string;
  name: string;
  email?: string | null;
  photoUrl?: string | null;
  role?: "admin" | "user";
  status?: boolean;
}

export interface UserQuery {
  token: string;
  role: string;
}

export interface FirebaseUser {
  name: string;
  picture: string;
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: object;
  uid: string;
}
