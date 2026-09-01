import { useEffect, useState } from "react";
import { getMenuItems } from "../services/menu";
import type { MenuItem } from "../types";

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await getMenuItems();

        console.log("MENU RESPONSE:", response.data);

        setMenuItems(response.data.data);
      } catch (error) {
        console.error("GET MENU ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  if (loading) {
    return <div>Memuat menu...</div>;
  }

  return (
    <div>
      <h1>Menu</h1>

      {menuItems.map((item) => (
        <div key={item.id}>
          <h2>{item.name}</h2>

          <p>Rp {item.price.toLocaleString("id-ID")}</p>

          <button>Tambah</button>
        </div>
      ))}
    </div>
  );
}
