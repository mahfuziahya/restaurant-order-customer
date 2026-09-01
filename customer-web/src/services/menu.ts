import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export type MenuCategory = {
  id: number;
  name: string;
};

export type MenuItem = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  categoryId: number;
  isActive: boolean;
  category: MenuCategory;
};

export const getMenuItems = async () => {
  return axios.get<{
    message: string;
    data: MenuItem[];
  }>(`${API_URL}/menu-items`);
};
