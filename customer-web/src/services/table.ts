import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export type Table = {
  id: number;
  number: number;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED";
};

export const getTableById = async (id: number) => {
  return axios.get<{
    message: string;
    data: Table;
  }>(`${API_URL}/tables/${id}`);
};
