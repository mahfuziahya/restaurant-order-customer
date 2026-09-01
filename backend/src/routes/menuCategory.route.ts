import { Router } from "express";
import { getmenuCategories, createMenuCategory, updateMenuCategory, deleteMenuCategory } from "../controllers/menuCategory.controller";

const router = Router();

router.get("/", getmenuCategories);
router.post("/", createMenuCategory);
router.put("/:id", updateMenuCategory);
router.delete("/:id", deleteMenuCategory);

export default router;
