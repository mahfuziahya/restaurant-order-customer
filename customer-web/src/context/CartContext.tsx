import { createContext, useContext, useState, type ReactNode } from "react";
import type { MenuItem } from "../services/menu";

export type CartItem = {
  menu: MenuItem;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (menu: MenuItem) => void;
  increaseQuantity: (menuId: number) => void;
  decreaseQuantity: (menuId: number) => void;
  removeFromCart: (menuId: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (menu: MenuItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.menu.id === menu.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.menu.id === menu.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          menu,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (menuId: number) => {
    setItems((currentItems) => currentItems.map((item) => (item.menu.id === menuId ? { ...item, quantity: item.quantity + 1 } : item)));
  };

  const decreaseQuantity = (menuId: number) => {
    setItems((currentItems) => currentItems.map((item) => (item.menu.id === menuId ? { ...item, quantity: item.quantity - 1 } : item)).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (menuId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.menu.id !== menuId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart harus digunakan di dalam CartProvider");
  }

  return context;
}
