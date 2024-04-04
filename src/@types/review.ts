export interface reviewParams {
  start: number;
  count?: number;
}

export interface review {
  id: string;
  createdBy: string;
  createdFor: string;
  rating?: number;
  feedback?: string;
  status: "validated" | "not validated";
  createdAt: Date;
  updatedAt: Date;
}
