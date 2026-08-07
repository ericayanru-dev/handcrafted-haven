export type CartItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  category?: string;
  storeName?: string;
  stock?: number;
};

export type AddCartItemInput = {
  productId: string;
  title: string;
  price: number;
  imageUrl?: string | null;
  category?: string;
  storeName?: string;
  stock?: number;
  quantity?: number;
};

export type CartSyncMode = "api" | "local";

export type CartSnapshot = {
  items: CartItem[];
  mode: CartSyncMode;
};

export type CartMutationResult = CartSnapshot & {
  message?: string;
};
