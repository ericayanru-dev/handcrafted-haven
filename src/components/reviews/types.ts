export type ReviewUser = {
  id: string;
  name: string;
};

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewFormInput = {
  rating: number;
  comment: string;
};