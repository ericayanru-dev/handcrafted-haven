import type { CreateOrderInput, OrderRecord, OrdersResponse } from "./types";

const ORDERS_STORAGE_KEY = "handcrafted-haven-orders-v1";
const ORDERS_API_BASE = "/api/orders";
const ORDERS_API_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ORDERS_API === "1";

function canUseWindow() {
  return typeof window !== "undefined";
}

function clampMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeOrder(order: OrderRecord): OrderRecord {
  return {
    ...order,
    createdAt: order.createdAt || new Date().toISOString(),
    itemCount: Number(order.itemCount) || order.items.length,
    subtotal: clampMoney(Number(order.subtotal) || 0),
    tax: clampMoney(Number(order.tax) || 0),
    total: clampMoney(Number(order.total) || 0),
  };
}

function readLocalOrders(): OrderRecord[] {
  if (!canUseWindow()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as OrderRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeOrder);
  } catch {
    return [];
  }
}

function writeLocalOrders(orders: OrderRecord[]) {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders.map(normalizeOrder)));
}

function createLocalOrderId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `order-${Date.now()}`;
}

async function fetchOrdersEndpoint(path: string, init?: RequestInit) {
  const response = await fetch(`${ORDERS_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let payload: OrdersResponse = {};
  try {
    payload = (await response.json()) as OrdersResponse;
  } catch {
    payload = {};
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? payload.error ?? `Orders request failed (${response.status})`);
  }

  return payload;
}

export async function createOrder(input: CreateOrderInput): Promise<{ order: OrderRecord; mode: "api" | "local"; message?: string }> {
  const subtotal = clampMoney(input.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const tax = clampMoney(subtotal * 0.07);
  const total = clampMoney(subtotal + tax);

  try {
    if (ORDERS_API_ENABLED) {
      const payload = await fetchOrdersEndpoint("", {
        method: "POST",
        body: JSON.stringify(input),
      });

      const order = payload.data?.order;
      if (!order) {
        throw new Error("Order response missing order payload");
      }

      return {
        order: normalizeOrder(order),
        mode: "api",
      };
    }
  } catch {
    // Falls back to local storage below.
  }

  {
    const localOrder: OrderRecord = normalizeOrder({
      id: createLocalOrderId(),
      createdAt: new Date().toISOString(),
      status: "PLACED",
      paymentMethod: input.paymentMethod,
      shipping: input.shipping,
      items: input.items,
      itemCount: input.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      tax,
      total,
      sourceMode: input.sourceMode,
    });

    const existing = readLocalOrders();
    writeLocalOrders([localOrder, ...existing]);

    return {
      order: localOrder,
      mode: "local",
      message: "Order saved locally until backend order APIs are available.",
    };
  }
}

export async function loadOrderHistory(): Promise<{ orders: OrderRecord[]; mode: "api" | "local" }> {
  if (!ORDERS_API_ENABLED) {
    return {
      orders: readLocalOrders(),
      mode: "local",
    };
  }

  try {
    const payload = await fetchOrdersEndpoint("", { method: "GET" });
    return {
      orders: (payload.data?.orders ?? []).map(normalizeOrder),
      mode: "api",
    };
  } catch {
    return {
      orders: readLocalOrders(),
      mode: "local",
    };
  }
}

export async function loadOrderById(orderId: string): Promise<{ order: OrderRecord | null; mode: "api" | "local" }> {
  if (!ORDERS_API_ENABLED) {
    const local = readLocalOrders().find((order) => order.id === orderId) ?? null;
    return {
      order: local,
      mode: "local",
    };
  }

  try {
    const payload = await fetchOrdersEndpoint(`/${orderId}`, { method: "GET" });
    return {
      order: payload.data?.order ? normalizeOrder(payload.data.order) : null,
      mode: "api",
    };
  } catch {
    const local = readLocalOrders().find((order) => order.id === orderId) ?? null;
    return {
      order: local,
      mode: "local",
    };
  }
}
