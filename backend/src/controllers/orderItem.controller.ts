import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET
export const getOrderItems = async (req: Request, res: Response) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: {
        order: true,
        menuItem: true,
      },
    });

    return res.status(200).json({
      message: "Success",
      data: orderItems,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// POST
export const createOrderItem = async (req: Request, res: Response) => {
  try {
    const { orderId, menuItemId, quantity } = req.body;

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: Number(orderId),
        menuItemId: Number(menuItemId),
        quantity: Number(quantity),
      },
      include: {
        order: true,
        menuItem: true,
      },
    });

    return res.status(201).json({
      message: "Order item created successfully",
      data: orderItem,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// PUT
export const updateOrderItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderId, menuItemId, quantity } = req.body;

    const orderItem = await prisma.orderItem.update({
      where: {
        id: Number(id),
      },
      data: {
        orderId: Number(orderId),
        menuItemId: Number(menuItemId),
        quantity: Number(quantity),
      },
      include: {
        order: true,
        menuItem: true,
      },
    });

    return res.status(200).json({
      message: "Order item updated successfully",
      data: orderItem,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// DELETE
export const deleteOrderItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.orderItem.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: "Order item deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
