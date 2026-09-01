import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getTables = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany();

    res.json(tables);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getTableById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const table = await prisma.table.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!table) {
      return res.status(404).json({
        message: "Table not found",
      });
    }

    return res.status(200).json({
      message: "Success",
      data: table,
    });
  } catch (error) {
    console.error("GET TABLE BY ID ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const { number, capacity, status } = req.body;

    const table = await prisma.table.create({
      data: {
        number,
        capacity,
        status,
      },
    });

    return res.status(201).json({
      message: "Table created successfully",
      data: table,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { number, capacity, status } = req.body;

    const table = await prisma.table.update({
      where: {
        id: Number(id),
      },
      data: {
        number,
        capacity,
        status,
      },
    });

    return res.status(200).json({
      message: "Table updated successfully",
      data: table,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.table.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: "Table deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
