import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getSocketIO } from "../config/socket";
import { createPaymentTransaction } from "../services/payment.service";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Success",
      data: orders,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tableId, serviceType, guestName, guestCount, note, items } = req.body;

    // VALIDASI SERVICE TYPE
    if (!["DINE_IN", "TAKE_AWAY"].includes(serviceType)) {
      return res.status(400).json({
        message: "Invalid service type",
      });
    }

    // VALIDASI DINE IN
    if (serviceType === "DINE_IN") {
      if (!tableId) {
        return res.status(400).json({
          message: "Table is required for dine in",
        });
      }
    }

    // VALIDASI TAKE AWAY
    if (serviceType === "TAKE_AWAY") {
      if (!guestName || !guestName.trim()) {
        return res.status(400).json({
          message: "Guest name is required for take away",
        });
      }

      if (tableId) {
        return res.status(400).json({
          message: "Take away cannot use a table",
        });
      }
    }

    // VALIDASI ITEMS
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    // TRANSACTION
    const order = await prisma.$transaction(async (tx) => {
      // DINE IN
      if (serviceType === "DINE_IN") {
        const table = await tx.table.findUnique({
          where: {
            id: Number(tableId),
          },
        });

        // MEJA TIDAK DITEMUKAN
        if (!table) {
          throw new Error("TABLE_NOT_FOUND");
        }

        // CEK MEJA OCCUPIED
        if (table.status !== "AVAILABLE") {
          const latestOrder = await tx.order.findFirst({
            where: {
              tableId: Number(tableId),
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          // Jika order terakhir belum dibayar,
          // tidak boleh membuat order baru
          if (!latestOrder || latestOrder.paymentStatus !== "PAID") {
            throw new Error("TABLE_OCCUPIED");
          }

          // Jika order terakhir sudah PAID,
          // boleh membuat order baru pada meja yang sama
        }

        // Kalau meja AVAILABLE,
        // ubah menjadi OCCUPIED
        if (table.status === "AVAILABLE") {
          await tx.table.update({
            where: {
              id: Number(tableId),
            },
            data: {
              status: "OCCUPIED",
            },
          });
        }
      }

      // CREATE ORDER
      const newOrder = await tx.order.create({
        data: {
          tableId: serviceType === "DINE_IN" ? Number(tableId) : null,

          serviceType,

          guestName: guestName?.trim() || null,

          guestCount: guestCount ? Number(guestCount) : null,

          note: note?.trim() || null,

          orderItems: {
            create: items.map((item: any) => ({
              menuItemId: Number(item.menuItemId),
              quantity: Number(item.quantity),
            })),
          },
        },

        include: {
          table: true,

          orderItems: {
            include: {
              menuItem: true,
            },
          },
        },
      });

      return newOrder;
    });

    return res.status(201).json({
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "TABLE_NOT_FOUND") {
        return res.status(404).json({
          message: "Table not found",
        });
      }

      if (error.message === "TABLE_OCCUPIED") {
        return res.status(400).json({
          message: "Table is currently occupied",
        });
      }
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
// GET ORDER DETAIL
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Success",
      data: order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// PAYMENT
export const payOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "Order has already been paid",
      });
    }

    const total = order.orderItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

    const transaction = await createPaymentTransaction({
      orderId: order.id,
      grossAmount: total,
      customerName: order.guestName || "Customer",
    });

    return res.status(200).json({
      message: "Payment transaction created",
      data: {
        orderId: order.id,
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
        grossAmount: total,
      },
    });
  } catch (error) {
    console.error("CREATE PAYMENT ERROR:", error);
    if (error instanceof Error) {
      console.error("ERROR MESSAGE:", error.message);
    }
    console.error("FULL ERROR:", error);
    return res.status(500).json({
      message: "Failed to create payment transaction",
    });
  }
};

export const payCashOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cashReceived } = req.body;

    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "Order has already been paid",
      });
    }

    const received = Number(cashReceived);

    if (!Number.isFinite(received) || received <= 0) {
      return res.status(400).json({
        message: "Jumlah uang diterima tidak valid",
      });
    }

    const total = order.orderItems.reduce((sum, item) => {
      return sum + item.menuItem.price * item.quantity;
    }, 0);

    if (received < total) {
      return res.status(400).json({
        message: "Uang yang diterima kurang",
        total,
        cashReceived: received,
        change: 0,
      });
    }

    const change = received - total;

    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "CASH",
        status: "PROCESSING",
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Pembayaran CASH berhasil",
      data: {
        order: updatedOrder,
        total,
        cashReceived: received,
        change,
      },
    });
  } catch (error) {
    console.error("CASH PAYMENT ERROR:", error);

    return res.status(500).json({
      message: "Gagal memproses pembayaran CASH",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  console.log("🔥 UPDATE ORDER MASUK");
  console.log("ORDER ID:", req.params.id);
  console.log("BODY:", req.body);
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
      },
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    const io = getSocketIO();
    console.log(`📡 EMIT ORDER UPDATE: order-${id}`);
    console.log("📦 STATUS:", updatedOrder.status);

    io.to(`order-${id}`).emit("order:updated", updatedOrder);

    // HANYA ketika COMPLETED
    if (status === "COMPLETED" && order.tableId) {
      await prisma.table.update({
        where: {
          id: order.tableId,
        },
        data: {
          status: "AVAILABLE",
        },
      });
    }

    return res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.order.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
