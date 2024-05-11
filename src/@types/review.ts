export interface reviewQuery {
  start: number;
  count?: number;
  facultyId : string;
}

export interface review {
  id?: string;
  createdBy: string;
  createdFor: string;
  rating: number;
  feedback: string;
  status?: "validated" | "not validated";
  createdAt?: Date;
  updatedAt?: Date;
}
