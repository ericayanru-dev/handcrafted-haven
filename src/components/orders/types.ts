<<<<<<< HEAD
import type { CartItem } from "@/components/cart/cart-types";
=======
import type { CartItem, CartSyncMode } from "@/components/cart/cart-types";
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39

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
<<<<<<< HEAD
  paymentMethod?: PaymentMethod;
  shipping?: ShippingAddress;
=======
  paymentMethod: PaymentMethod;
  shipping: ShippingAddress;
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
<<<<<<< HEAD
  sourceMode: "api";
=======
  sourceMode: CartSyncMode;
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39
};

export type CreateOrderInput = {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  shipping: ShippingAddress;
<<<<<<< HEAD
=======
  sourceMode: CartSyncMode;
>>>>>>> 55e8a1f8f8803c88267f0fb0cea65746fada3d39
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
