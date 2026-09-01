import { Router } from "express";

import { getOrderItems, createOrderItem, updateOrderItem, deleteOrderItem } from "../controllers/orderItem.controller";

const router = Router();

router.get("/", getOrderItems);
router.post("/", createOrderItem);
router.put("/:id", updateOrderItem);
router.delete("/:id", deleteOrderItem);

export default router;
