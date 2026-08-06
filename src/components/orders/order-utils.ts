import type { OrderStatus, PaymentMethod } from "./types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function orderNumberFromId(orderId: string) {
  return `ORD-${orderId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()}`;
}

export function paymentLabel(method: PaymentMethod) {
  if (method === "PAYPAL") {
    return "PayPal";
  }
  if (method === "CASH_ON_DELIVERY") {
    return "Cash on delivery";
  }
  return "Card";
}

export function statusLabel(status: OrderStatus) {
  if (status === "PLACED") {
    return "Placed";
  }
  if (status === "PROCESSING") {
    return "Processing";
  }
  if (status === "SHIPPED") {
    return "Shipped";
  }
  if (status === "DELIVERED") {
    return "Delivered";
  }
  if (status === "PENDING") {
    return "Pending";
  }
  if (status === "PAID") {
    return "Paid";
  }
  if (status === "FAILED") {
    return "Failed";
  }
  if (status === "CANCELLED") {
    return "Cancelled";
  }
  if (status === "COMPLETED") {
    return "Completed";
  }
  return "Placed";
}
