import { Router } from "express";
import { handleMidtransNotification } from "../controllers/payment.controller";

const router = Router();

router.post("/notification", handleMidtransNotification);

export default router;
