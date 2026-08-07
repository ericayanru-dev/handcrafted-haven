export interface CreateOrderInput {
  // usually empty — order is built from the cart
}

export interface UpdateOrderStatusInput {
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "SHIPPED" | "COMPLETED";
}
