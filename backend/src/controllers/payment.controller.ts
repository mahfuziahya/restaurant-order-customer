import { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../config/prisma";

export const handleMidtransNotification = async (req: Request, res: Response) => {
  try {
    const { order_id, transaction_status, fraud_status, payment_type, status_code, gross_amount, signature_key } = req.body;

    console.log("MIDTRANS NOTIFICATION");
    console.log("ORDER ID:", order_id);
    console.log("TRANSACTION STATUS:", transaction_status);
    console.log("FRAUD STATUS:", fraud_status);
    console.log("PAYMENT TYPE:", payment_type);

    if (!order_id || !transaction_status || !status_code || !gross_amount || !signature_key) {
      return res.status(400).json({
        message: "Invalid notification data",
      });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY is not configured");

      return res.status(500).json({
        message: "Midtrans server key is not configured",
      });
    }

    const signature = crypto.createHash("sha512").update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest("hex");

    if (signature !== signature_key) {
      console.error("INVALID MIDTRANS SIGNATURE");

      return res.status(401).json({
        message: "Invalid signature",
      });
    }

    if (order_id.startsWith("payment_notif_test_")) {
      console.log("MIDTRANS TEST NOTIFICATION RECEIVED");

      return res.status(200).json({
        message: "Midtrans test notification received",
      });
    }

    const orderIdMatch = order_id.match(/^ORDER-(\d+)-\d+$/);

    if (!orderIdMatch) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const databaseOrderId = Number(orderIdMatch[1]);
    const order = await prisma.order.findUnique({
      where: {
        id: databaseOrderId,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // PEMBAYARAN BERHASIL
    if (transaction_status === "settlement" || (transaction_status === "capture" && fraud_status === "accept")) {
      await prisma.order.update({
        where: {
          id: databaseOrderId,
        },
        data: {
          paymentStatus: "PAID",
          paymentMethod: payment_type || null,
          status: "PROCESSING",
        },
      });

      console.log(`PAYMENT SUCCESS - ORDER #${databaseOrderId}`);

      return res.status(200).json({
        message: "Payment successfully processed",
      });
    }

    // PEMBAYARAN PENDING
    if (transaction_status === "pending") {
      await prisma.order.update({
        where: {
          id: databaseOrderId,
        },
        data: {
          paymentStatus: "PENDING",
        },
      });

      return res.status(200).json({
        message: "Payment pending",
      });
    }

    // PEMBAYARAN GAGAL / EXPIRED / DIBATALKAN
    if (transaction_status === "deny" || transaction_status === "cancel" || transaction_status === "expire") {
      await prisma.order.update({
        where: {
          id: databaseOrderId,
        },
        data: {
          paymentStatus: "UNPAID",
        },
      });

      return res.status(200).json({
        message: "Payment failed or expired",
      });
    }

    return res.status(200).json({
      message: "Notification received",
    });
  } catch (error) {
    console.error("MIDTRANS NOTIFICATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to process Midtrans notification",
    });
  }
};
