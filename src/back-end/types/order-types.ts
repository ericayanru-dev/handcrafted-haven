export interface UpdateOrderStatusInput {
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "SHIPPED" | "COMPLETED";
}
