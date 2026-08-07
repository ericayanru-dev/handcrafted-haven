import type { CreateOrderInput, OrderRecord, OrdersResponse } from "./types";

<<<<<<< HEAD
=======
const ORDERS_STORAGE_KEY = "handcrafted-haven-orders-v1";
const ORDER_METADATA_KEY = "handcrafted-haven-order-metadata-v1";
const ORDERS_API_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ORDERS_API !== "0";

>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39
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
<<<<<<< HEAD
  paymentMethod?: OrderRecord["paymentMethod"];
  shipping?: OrderRecord["shipping"];
};

=======
};

type StoredOrderMetadata = {
  paymentMethod: OrderRecord["paymentMethod"];
  shipping: OrderRecord["shipping"];
  subtotal: number;
  tax: number;
  total: number;
  sourceMode: OrderRecord["sourceMode"];
};

function canUseWindow() {
  return typeof window !== "undefined";
}

>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39
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

<<<<<<< HEAD
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
=======
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

function readOrderMetadata(): Record<string, StoredOrderMetadata> {
  if (!canUseWindow()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(ORDER_METADATA_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, StoredOrderMetadata>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeOrderMetadata(metadata: Record<string, StoredOrderMetadata>) {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(ORDER_METADATA_KEY, JSON.stringify(metadata));
}

function saveOrderMetadata(orderId: string, metadata: StoredOrderMetadata) {
  const current = readOrderMetadata();
  current[orderId] = metadata;
  writeOrderMetadata(current);
}

function getOrderMetadata(orderId: string) {
  return readOrderMetadata()[orderId] ?? null;
}

function createLocalOrderId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `order-${Date.now()}`;
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39
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
<<<<<<< HEAD
    throw new Error(toOrdersErrorMessage(response.status, payload));
=======
    throw new Error(
      payload.message ?? payload.error ?? `Orders request failed (${response.status})`,
    );
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39
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

<<<<<<< HEAD
function normalizeApiOrder(order: ApiOrderRecord): OrderRecord {
  const items = normalizeApiItems(order.items);
  const subtotal = clampMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const total = clampMoney(Number(order.total) || subtotal);
  const tax = clampMoney(total - subtotal);
=======
function normalizeApiOrder(
  order: ApiOrderRecord,
  metadata?: StoredOrderMetadata | null,
): OrderRecord {
  const items = normalizeApiItems(order.items);
  const subtotal =
    metadata?.subtotal ??
    clampMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const total = clampMoney(Number(order.total) || metadata?.total || subtotal);
  const tax = metadata?.tax ?? clampMoney(total - subtotal);
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39

  return normalizeOrder({
    id: order.id,
    createdAt: order.createdAt || new Date().toISOString(),
    status: normalizeApiStatus(order.status),
<<<<<<< HEAD
    paymentMethod: order.paymentMethod,
    shipping: order.shipping,
=======
    paymentMethod: metadata?.paymentMethod ?? "CARD",
    shipping: metadata?.shipping ?? {
      fullName: "Order customer",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39
    items,
    itemCount: items.reduce((sum, item) => sum + Math.max(1, item.quantity), 0),
    subtotal,
    tax,
    total,
<<<<<<< HEAD
    sourceMode: "api",
=======
    sourceMode: metadata?.sourceMode ?? "api",
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39
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

<<<<<<< HEAD
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
=======
export async function createOrder(
  input: CreateOrderInput,
): Promise<{ order: OrderRecord; mode: "api" | "local"; message?: string }> {
  const subtotal = clampMoney(
    input.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const tax = clampMoney(subtotal * 0.07);
  const total = clampMoney(subtotal + tax);

  try {
    if (ORDERS_API_ENABLED && input.sourceMode === "api") {
      const payload = await fetchOrdersEndpoint("/api/orders/checkout", {
        method: "POST",
      });

      const order = extractOrder(payload);
      if (!order) {
        throw new Error("Order response missing order payload");
      }

      const metadata: StoredOrderMetadata = {
        paymentMethod: input.paymentMethod,
        shipping: input.shipping,
        subtotal,
        tax,
        total,
        sourceMode: input.sourceMode,
      };

      saveOrderMetadata(order.id, metadata);

      return {
        order: normalizeApiOrder(order, metadata),
        mode: "api",
        message: payload.message,
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

export async function loadOrderHistory(): Promise<{
  orders: OrderRecord[];
  mode: "api" | "local";
}> {
  if (!ORDERS_API_ENABLED) {
    return {
      orders: readLocalOrders(),
      mode: "local",
    };
  }

  try {
    const payload = await fetchOrdersEndpoint("/api/orders/history", { method: "GET" });
    const metadata = readOrderMetadata();
    return {
      orders: extractOrders(payload).map((order) => normalizeApiOrder(order, metadata[order.id])),
      mode: "api",
    };
  } catch {
    return {
      orders: readLocalOrders(),
      mode: "local",
    };
  }
}

export async function loadOrderById(
  orderId: string,
): Promise<{ order: OrderRecord | null; mode: "api" | "local" }> {
  if (!ORDERS_API_ENABLED) {
    const local = readLocalOrders().find((order) => order.id === orderId) ?? null;
    return {
      order: local,
      mode: "local",
    };
  }

  try {
    const payload = await fetchOrdersEndpoint(`/api/orders/get-order/${orderId}`, {
      method: "GET",
    });
    const order = extractOrder(payload);
    return {
      order: order ? normalizeApiOrder(order, getOrderMetadata(orderId)) : null,
      mode: "api",
    };
  } catch {
    const local = readLocalOrders().find((order) => order.id === orderId) ?? null;
    return {
      order: local,
      mode: "local",
    };
  }
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39
}
