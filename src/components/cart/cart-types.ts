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

<<<<<<< HEAD
export type CartSyncMode = "api";
=======
export type CartSyncMode = "api" | "local";
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39

export type CartSnapshot = {
  items: CartItem[];
  mode: CartSyncMode;
};

export type CartMutationResult = CartSnapshot & {
  message?: string;
};
