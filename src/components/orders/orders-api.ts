import type { CreateOrderInput, OrderRecord, OrdersResponse } from "./types";

type ApiOrderItem = {
  productId: string;
  quantity: number;
  price: number | string;
  title: string;
  product?: {
    imageUrl?: string | null;
    price?: number | string;
  };
};

type ApiOrderRecord = {
  id: string;
  createdAt?: string;
  status?: string;
  total?: number | string;
  reference?: string;
  items?: ApiOrderItem[];
  paymentMethod?: OrderRecord["paymentMethod"];
  shipping?: OrderRecord["shipping"];
};

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

function toOrdersErrorMessage(status: number, payload: OrdersResponse) {
  const rawMessage = (payload.message ?? payload.error ?? "").trim().toLowerCase();

  if (status === 401 || status === 403 || rawMessage.includes("unauthorized") || rawMessage.includes("forbidden")) {
    return "Please sign in to view and manage your orders.";
  }

  if (status === 404) {
    return "We could not find that order.";
  }

  if (status >= 500) {
    return "We are having trouble loading your order details right now. Please try again shortly.";
  }

  if (payload.message || payload.error) {
    return payload.message ?? payload.error ?? "We could not complete your request right now.";
  }

  return "We could not complete your request right now.";
}

async function fetchOrdersEndpoint(path: string, init?: RequestInit) {
  const response = await fetch(path, {
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
    throw new Error(toOrdersErrorMessage(response.status, payload));
  }

  return payload;
}

function normalizeApiItems(items: ApiOrderItem[] | undefined) {
  return (items ?? []).map((item) => ({
    productId: item.productId,
    title: item.title,
    price: Number(item.price) || Number(item.product?.price) || 0,
    quantity: Number(item.quantity) || 0,
    imageUrl: item.product?.imageUrl ?? null,
  }));
}

function normalizeApiStatus(status?: string): OrderRecord["status"] {
  switch (status) {
    case "PENDING":
      return "PLACED";
    case "PAID":
      return "PROCESSING";
    case "FAILED":
      return "CANCELLED";
    case "CANCELLED":
      return "CANCELLED";
    case "SHIPPED":
      return "SHIPPED";
    case "COMPLETED":
      return "DELIVERED";
    default:
      return "PLACED";
  }
}

function normalizeApiOrder(order: ApiOrderRecord): OrderRecord {
  const items = normalizeApiItems(order.items);
  const subtotal = clampMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const total = clampMoney(Number(order.total) || subtotal);
  const tax = clampMoney(total - subtotal);

  return normalizeOrder({
    id: order.id,
    createdAt: order.createdAt || new Date().toISOString(),
    status: normalizeApiStatus(order.status),
    paymentMethod: order.paymentMethod,
    shipping: order.shipping,
    items,
    itemCount: items.reduce((sum, item) => sum + Math.max(1, item.quantity), 0),
    subtotal,
    tax,
    total,
    sourceMode: "api",
  });
}

function extractOrder(payload: OrdersResponse): ApiOrderRecord | null {
  if (!payload.data) {
    return null;
  }

  if (Array.isArray(payload.data)) {
    return null;
  }

  if ("order" in payload.data && payload.data.order) {
    return payload.data.order as ApiOrderRecord;
  }

  return payload.data as ApiOrderRecord;
}

function extractOrders(payload: OrdersResponse): ApiOrderRecord[] {
  if (!payload.data) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data as ApiOrderRecord[];
  }

  if ("orders" in payload.data && Array.isArray(payload.data.orders)) {
    return payload.data.orders as ApiOrderRecord[];
  }

  return [];
}

export async function createOrder(input: CreateOrderInput): Promise<{ order: OrderRecord; mode: "api"; message?: string }> {
  const payload = await fetchOrdersEndpoint("/api/orders/checkout", {
    method: "POST",
  });

  const order = extractOrder(payload);
  if (!order) {
    throw new Error("We could not confirm your order details. Please refresh and try again.");
  }

  return {
    order: normalizeApiOrder({
      ...order,
      paymentMethod: input.paymentMethod,
      shipping: input.shipping,
    }),
    mode: "api",
    message: payload.message,
  };
}

export async function loadOrderHistory(): Promise<{ orders: OrderRecord[]; mode: "api" }> {
  const payload = await fetchOrdersEndpoint("/api/orders/history", { method: "GET" });
  return {
    orders: extractOrders(payload).map((order) => normalizeApiOrder(order)),
    mode: "api",
  };
}

export async function loadOrderById(orderId: string): Promise<{ order: OrderRecord | null; mode: "api" }> {
  const payload = await fetchOrdersEndpoint(`/api/orders/get-order/${orderId}`, { method: "GET" });
  const order = extractOrder(payload);
  return {
    order: order ? normalizeApiOrder(order) : null,
    mode: "api",
  };
}
