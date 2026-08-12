export type PaymentMethod = "CARD" | "PAYPAL" | "CASH_ON_DELIVERY";

export interface InitializePaymentInput {
  orderId: string;
  method: PaymentMethod;
}

export type ServiceResult<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  status: number;
};
