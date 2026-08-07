import type { Product } from "./product-types";
import type { User } from "./auth-types";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number; // 1–5
  comment: string;
  createdAt: Date;
  updatedAt: Date;

  product: Product; // relation to Product
  user: User; // relation to User
}
