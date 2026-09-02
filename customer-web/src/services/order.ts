import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export type CreateOrderPayload = {
  tableId: number;
  serviceType: "DINE_IN";
  guestName: string;
  note?: string;
  items: {
    menuItemId: number;
    quantity: number;
  }[];
};

export const createOrder = async (payload: CreateOrderPayload) => {
  console.log("CREATE ORDER URL:", `${API_URL}/orders`);
  console.log("CREATE ORDER PAYLOAD:", payload);

  return axios.post(`${API_URL}/orders`, payload);
};

export const getOrderById = async (id: number) => {
  return axios.get(`${API_URL}/orders/${id}`);
};
export const createPayment = async (id: number) => {
  return axios.patch(`${API_URL}/orders/${id}/pay`);
};
