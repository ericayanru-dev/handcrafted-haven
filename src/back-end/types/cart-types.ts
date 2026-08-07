export interface AddToCartInput {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemInput {
  productId: string;
  quantity: number;
}

export interface RemoveCartItemInput {
  productId: string;
}