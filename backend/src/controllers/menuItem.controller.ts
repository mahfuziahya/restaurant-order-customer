import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return res.status(200).json({
      message: "Success",
      data: menuItems,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, price, description, image, categoryId } = req.body;

    const MenuItem = await prisma.menuItem.create({
      data: {
        name,
        price,
        description,
        image,
        categoryId: Number(categoryId),
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      message: "Menu item Created successfully",
      data: MenuItem,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      Message: "INternal Servel Error",
    });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { name, price, description, image, categoryId } = req.body;

    const menuItem = await prisma.menuItem.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        price,
        description,
        image,
        categoryId: Number(categoryId),
      },
      include: {
        category: true,
      },
    });

    return res.status(200).json({
      message: "Menu item updated successfully",
      data: menuItem,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.menuItem.update({
      where: {
        id: Number(id),
      },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
