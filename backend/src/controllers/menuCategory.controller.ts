import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getmenuCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.menuCategory.findMany();
    return res.status(200).json({
      message: "succes",
      data: categories,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "internal Server Error",
    });
  }
};

export const createMenuCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const category = await prisma.menuCategory.create({
      data: {
        name,
      },
    });
    return res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateMenuCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.menuCategory.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    });
    return res.status(200).json({
      message: "Category Update succesfully",
      data: category,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "internal Server Error",
    });
  }
};

export const deleteMenuCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.menuCategory.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
