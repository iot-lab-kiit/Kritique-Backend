export interface Faculty {
  id?: string;
  name: string;
  experience?: string;
  photoUrl?: string;
  avgRating?: number;
  totalRatings?: number;
  reviewList?: string[];
}

export interface facultyQuery {
  limit?: number;
  page?: number;
  name?: string;
}
