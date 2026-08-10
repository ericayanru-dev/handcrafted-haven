export interface SellerProfile {
  storeName: string;
  bio?: string | null;
}

export interface UpdateSellerProfileInput {
  storeName?: string;
  bio?: string | null; // optional
}

export interface SellerProfilesQuerySchema {
  page?: number;
  limit?: number;
  search?: string;
}
