import type { AddCartItemInput, CartItem, CartMutationResult, CartSnapshot } from "./cart-types";

type CartApiResponse = {
  success?: boolean;
  data?:
    | {
        id?: string;
        items?: Array<{
          id?: string;
          productId: string;
          quantity: number;
          product?: {
            title?: string;
            price?: number | string;
            imageUrl?: string | null;
            category?: string | null;
            seller?: {
              storeName?: string | null;
            };
          };
          lineTotal?: number;
        }>;
        itemCount?: number;
        subtotal?: number;
      }
    | {
        id?: string;
        productId: string;
        quantity: number;
        product?: {
          title?: string;
          price?: number | string;
          imageUrl?: string | null;
          category?: string | null;
          seller?: {
            storeName?: string | null;
          };
        };
      };
  message?: string;
  error?: string;
};

function normalizeItems(items: CartItem[]) {
  return items
    .map((item) => ({
      ...item,
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
    }))
    .filter((item) => item.productId && item.title);
}

function toCartErrorMessage(status: number, payload: CartApiResponse) {
  const rawMessage = (payload.message ?? payload.error ?? "").trim().toLowerCase();

  if (status === 401 || status === 403 || rawMessage.includes("unauthorized") || rawMessage.includes("forbidden")) {
    return "Please sign in to view and manage your cart.";
  }

  if (status >= 500) {
    return "We are having trouble loading your cart right now. Please try again shortly.";
  }

  if (payload.message || payload.error) {
    return payload.message ?? payload.error ?? "We could not update your cart right now.";
  }

  return "We could not update your cart right now.";
}

async function fetchCartEndpoint(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let payload: CartApiResponse = {};
  try {
    payload = (await response.json()) as CartApiResponse;
  } catch {
    payload = {};
  }

  if (!response.ok || !payload.success) {
    throw new Error(toCartErrorMessage(response.status, payload));
  }

  return payload;
}

function fromApiItem(item: {
  productId: string;
  quantity: number;
  product?: {
    title?: string;
    price?: number | string;
    imageUrl?: string | null;
    category?: string | null;
    seller?: {
      storeName?: string | null;
    };
  };
}): CartItem {
  return {
    productId: item.productId,
    title: item.product?.title ?? "Cart item",
    price: Number(item.product?.price) || 0,
    quantity: Math.max(1, Number(item.quantity) || 1),
    imageUrl: item.product?.imageUrl ?? null,
    category: item.product?.category ?? undefined,
    storeName: item.product?.seller?.storeName ?? undefined,
    stock: undefined,
  };
}

function fromApi(payload: CartApiResponse): CartSnapshot {
  const items = payload.data && "items" in payload.data ? payload.data.items ?? [] : [];

  return {
    items: normalizeItems(items.map(fromApiItem)),
    mode: "api",
  };
}

export async function loadCart(): Promise<CartSnapshot> {
  const payload = await fetchCartEndpoint("/api/cart/get");
  return fromApi(payload);
}

export async function addCartItem(input: AddCartItemInput): Promise<CartMutationResult> {
  await fetchCartEndpoint("/api/cart/add", {
    method: "POST",
    body: JSON.stringify({
      productId: input.productId,
      quantity: input.quantity ?? 1,
    }),
  });

  const snapshot = await loadCart();
  return {
    ...snapshot,
    message: "Item added to cart.",
  };
}

export async function setCartItemQuantity(productId: string, quantity: number): Promise<CartMutationResult> {
  await fetchCartEndpoint("/api/cart/update", {
    method: "PATCH",
    body: JSON.stringify({ productId, quantity }),
  });

  const snapshot = await loadCart();
  return {
    ...snapshot,
    message: "Cart updated.",
  };
}

export async function removeCartItem(productId: string): Promise<CartMutationResult> {
  await fetchCartEndpoint("/api/cart/remove", {
    method: "DELETE",
    body: JSON.stringify({ productId }),
  });

  const snapshot = await loadCart();
  return {
    ...snapshot,
    message: "Item removed from cart.",
  };
}

export async function clearCartItems(): Promise<CartMutationResult> {
  await fetchCartEndpoint("/api/cart/clear", {
    method: "DELETE",
  });

  const snapshot = await loadCart();
  return {
    ...snapshot,
    message: "Cart cleared.",
  };
}
