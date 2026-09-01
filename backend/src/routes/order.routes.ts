import { Router } from "express";

import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, payOrder } from "../controllers/order.controller";

const router = Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", (req, res, next) => {
  console.log("🔥 POST /orders MASUK");
  createOrder(req, res);
});
router.put("/:id", updateOrder);
router.patch("/:id", updateOrder);
router.patch("/:id/pay", payOrder);
router.delete("/:id", deleteOrder);

export default router;
