export type ProductListItem = {
  id: string;
  title: string;
  description: string;
  price: unknown;
  stock: number;
  category: string;
  imageUrl?: string | null;
  seller?: {
    storeName?: string;
  };
};

export type MappedProduct = {
  id: string;
  title: string;
  description: string;
  price: string;
  priceValue: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
  storeName?: string;
};

export type MarketplaceResponse = {
  success: boolean;
  data?: ProductListItem[];
  message?: string;
  error?: string;
};
