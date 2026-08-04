import type { AddCartItemInput, CartItem, CartMutationResult, CartSnapshot } from "./cart-types";

const CART_STORAGE_KEY = "handcrafted-haven-cart-v1";
const CART_API_BASE = "/api/cart";
const CART_API_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CART_API === "1";

type CartApiResponse = {
  success?: boolean;
  data?: {
    items?: CartItem[];
  };
  message?: string;
  error?: string;
};

function canUseWindow() {
  return typeof window !== "undefined";
}

function normalizeItems(items: CartItem[]) {
  return items
    .map((item) => ({
      ...item,
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
    }))
    .filter((item) => item.productId && item.title);
}

function readLocalCart(): CartItem[] {
  if (!canUseWindow()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeItems(parsed);
  } catch {
    return [];
  }
}

function writeLocalCart(items: CartItem[]) {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeItems(items)));
}

function upsertLocalItem(input: AddCartItemInput) {
  const items = readLocalCart();
  const quantityToAdd = Math.max(1, Number(input.quantity) || 1);
  const existing = items.find((item) => item.productId === input.productId);

  if (existing) {
    existing.quantity += quantityToAdd;
  } else {
    items.push({
      productId: input.productId,
      title: input.title,
      price: Number(input.price) || 0,
      quantity: quantityToAdd,
      imageUrl: input.imageUrl,
      category: input.category,
      storeName: input.storeName,
      stock: input.stock,
    });
  }

  writeLocalCart(items);
  return items;
}

function updateLocalQuantity(productId: string, quantity: number) {
  const items = readLocalCart();
  const nextQuantity = Math.max(1, Number(quantity) || 1);
  const nextItems = items.map((item) =>
    item.productId === productId ? { ...item, quantity: nextQuantity } : item
  );
  writeLocalCart(nextItems);
  return nextItems;
}

function removeLocalItem(productId: string) {
  const nextItems = readLocalCart().filter((item) => item.productId !== productId);
  writeLocalCart(nextItems);
  return nextItems;
}

function clearLocalItems() {
  writeLocalCart([]);
  return [];
}

async function fetchCartEndpoint(path: string, init?: RequestInit) {
  const response = await fetch(`${CART_API_BASE}${path}`, {
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
    throw new Error(payload.message ?? payload.error ?? `Cart request failed (${response.status})`);
  }

  return payload;
}

function fromApi(payload: CartApiResponse): CartSnapshot {
  return {
    items: normalizeItems(payload.data?.items ?? []),
    mode: "api",
  };
}

export async function loadCart(): Promise<CartSnapshot> {
  if (!CART_API_ENABLED) {
    return {
      items: readLocalCart(),
      mode: "local",
    };
  }

  try {
    const payload = await fetchCartEndpoint("");
    return fromApi(payload);
  } catch {
    return {
      items: readLocalCart(),
      mode: "local",
    };
  }
}

export async function addCartItem(input: AddCartItemInput): Promise<CartMutationResult> {
  if (!CART_API_ENABLED) {
    return {
      items: upsertLocalItem(input),
      mode: "local",
      message: "Saved to local cart.",
    };
  }

  try {
    const payload = await fetchCartEndpoint("/items", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return fromApi(payload);
  } catch {
    return {
      items: upsertLocalItem(input),
      mode: "local",
      message: "Saved to local cart.",
    };
  }
}

export async function setCartItemQuantity(productId: string, quantity: number): Promise<CartMutationResult> {
  if (!CART_API_ENABLED) {
    return {
      items: updateLocalQuantity(productId, quantity),
      mode: "local",
      message: "Saved to local cart.",
    };
  }

  try {
    const payload = await fetchCartEndpoint(`/items/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
    return fromApi(payload);
  } catch {
    return {
      items: updateLocalQuantity(productId, quantity),
      mode: "local",
      message: "Saved to local cart.",
    };
  }
}

export async function removeCartItem(productId: string): Promise<CartMutationResult> {
  if (!CART_API_ENABLED) {
    return {
      items: removeLocalItem(productId),
      mode: "local",
      message: "Saved to local cart.",
    };
  }

  try {
    const payload = await fetchCartEndpoint(`/items/${productId}`, {
      method: "DELETE",
    });
    return fromApi(payload);
  } catch {
    return {
      items: removeLocalItem(productId),
      mode: "local",
      message: "Saved to local cart.",
    };
  }
}

export async function clearCartItems(): Promise<CartMutationResult> {
  if (!CART_API_ENABLED) {
    return {
      items: clearLocalItems(),
      mode: "local",
      message: "Saved to local cart.",
    };
  }

  try {
    const payload = await fetchCartEndpoint("", {
      method: "DELETE",
    });
    return fromApi(payload);
  } catch {
    return {
      items: clearLocalItems(),
      mode: "local",
      message: "Saved to local cart.",
    };
  }
}
