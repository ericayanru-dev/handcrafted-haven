import type { CartItem } from "@/components/cart/cart-types";

export type OrderStatus =
  | "PLACED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "COMPLETED";

export type ShippingAddress = {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type PaymentMethod = "CARD" | "PAYPAL" | "CASH_ON_DELIVERY";

export type OrderRecord = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  shipping?: ShippingAddress;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  sourceMode: "api";
};

export type CreateOrderInput = {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  shipping: ShippingAddress;
};

export type OrdersResponse = {
  success?: boolean;
  data?:
    | {
        order?: OrderRecord;
        orders?: OrderRecord[];
      }
    | OrderRecord
    | OrderRecord[];
  message?: string;
  error?: string;
};
