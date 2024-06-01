export interface reviewQuery {
  limit?: number;
  page?: number;
  facultyId: string;
  createdBy?: string;
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
