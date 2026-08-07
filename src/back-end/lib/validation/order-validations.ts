import { z } from "zod";

export const orderIdParamSchema = z.object({
  id: z.string().cuid("Invalid order ID"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "CANCELLED", "SHIPPED", "COMPLETED"]),
});
