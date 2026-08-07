export interface Product {
  title: string;
  description: string;
  price: number;
  stock?: number;
  category: string;
  imageUrl?: string | null;
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  imageUrl?: string | null;
}

export interface ProductsQuerySchema {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  sortBy?: "newest" | "price-asc" | "price-desc" | "title";
}
