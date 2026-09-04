import { useEffect, useMemo, useState } from "react";
import { getMenuItems, type MenuItem } from "../services/menu";
import { getOrderById } from "../services/order";
import { useCart } from "../context/CartContext";

type HomeProps = {
  tableId: number;
  tableNumber: number;
  customerName: string;
  onOrder: () => void;
  onViewOrder: (orderId: number) => void;
  onTrackOrder: (orderId: number) => void;
};

export default function Home({ tableId, tableNumber, customerName, onOrder, onViewOrder, onTrackOrder }: HomeProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const { addToCart, items } = useCart();

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);
  }, [items]);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const response = await getMenuItems();
        setMenus(response.data.data);
      } catch (error) {
        console.error("GET MENU ERROR:", error);
        setError("Gagal mengambil menu.");
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  useEffect(() => {
    const loadActiveOrders = async () => {
      const savedOrderIds = JSON.parse(sessionStorage.getItem("customerOrderIds") || "[]");

      if (!Array.isArray(savedOrderIds) || savedOrderIds.length === 0) {
        setActiveOrders([]);
        setLoadingOrders(false);
        return;
      }

      try {
        const orders = await Promise.all(
          savedOrderIds.map(async (id: number) => {
            try {
              const response = await getOrderById(id);
              return response.data.data;
            } catch (error) {
              console.error(`GET ORDER ${id} ERROR:`, error);

              return null;
            }
          }),
        );

        const validOrders = orders.filter((order) => order && ["PENDING", "PROCESSING", "COOKING", "READY"].includes(order.status));

        setActiveOrders(validOrders);
      } catch (error) {
        console.error("GET ACTIVE ORDERS ERROR:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadActiveOrders();
  }, []);

  // KATEGORI
  const categories = useMemo(() => {
    return Array.from(new Set(menus.map((menu) => menu.category.name)));
  }, [menus]);

  // FILTER MENU
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const matchesSearch = menu.name.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = selectedCategory === "ALL" || menu.category.name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [menus, search, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

          <p className="text-sm font-medium text-slate-500">Memuat menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-red-500">{error}</p>

          <button onClick={() => window.location.reload()} className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-600">Bahari Nusantara</p>

            <h1 className="text-xl font-extrabold text-slate-900">Menu Restoran</h1>
          </div>

          <div className="rounded-full bg-green-50 px-4 py-2">
            <span className="text-sm font-bold text-green-700">Meja {tableNumber}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        {/* WELCOME */}
        <section className="py-8">
          <div className="overflow-hidden rounded-3xl bg-green-700 p-7 text-white shadow-lg">
            <p className="mb-2 text-sm font-medium text-green-100">Selamat datang {customerName} 👋</p>

            <h2 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">Pesan makanan favorit Anda langsung dari meja.</h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-green-100">Pilih menu yang Anda inginkan, masukkan ke pesanan, lalu lakukan pembayaran dengan mudah.</p>
          </div>
        </section>

        {/* PESANAN BERJALAN */}
        {!loadingOrders && activeOrders.length > 0 && (
          <section className="mb-8">
            <div className="mb-4">
              <p className="text-sm font-semibold text-green-600">ORDER ANDA</p>

              <h2 className="text-2xl font-extrabold text-slate-900">Pesanan Berjalan</h2>

              <p className="mt-1 text-sm text-slate-500">Pantau pesanan yang sedang diproses.</p>
            </div>

            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Pesanan #{order.id}</p>

                      <p className="mt-1 text-lg font-extrabold text-slate-900">
                        {order.status === "PENDING" && "Menunggu Diproses"}

                        {order.status === "PROCESSING" && "Pesanan Diproses"}

                        {order.status === "COOKING" && "Sedang Dimasak"}

                        {order.status === "READY" && "Pesanan Siap"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{order.paymentStatus === "PAID" ? "✓ SUDAH DIBAYAR" : "MENUNGGU PEMBAYARAN"}</span>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{order.status}</span>
                      </div>
                    </div>

                    {order.paymentStatus === "PAID" ? (
                      <button onClick={() => onTrackOrder(order.id)} className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700">
                        Lihat Tracking →
                      </button>
                    ) : (
                      <button onClick={() => onViewOrder(order.id)} className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700">
                        Lanjutkan Pembayaran →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SEARCH */}
        <section className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari makanan atau minuman..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 pl-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${selectedCategory === "ALL" ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
            >
              Semua
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${selectedCategory === category ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* MENU HEADER */}
        <section className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-green-600">OUR MENU</p>

            <h2 className="text-2xl font-extrabold text-slate-900">Pilihan Menu</h2>
          </div>
          <p className="text-sm text-slate-500">{filteredMenus.length} menu</p>
        </section>

        {/* MENU GRID */}
        {filteredMenus.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mb-3 text-4xl">🔍</div>

            <p className="font-semibold text-slate-700">Menu tidak ditemukan.</p>

            <p className="mt-1 text-sm text-slate-500">Coba gunakan kata kunci atau kategori lain.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMenus.map((menu) => {
              console.log("IMAGE MENU:", menu.name, menu.image);
              const cartItem = items.find((item) => item.menu.id === menu.id);

              return (
                <article key={menu.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
                  {/* IMAGE PLACEHOLDER */}
                  {/* MENU IMAGE */}
                  <div className="h-44 w-full overflow-hidden bg-green-50">
                    {menu.image ? (
                      <img
                        src={menu.image}
                        alt={menu.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-6xl">🍽️</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{menu.name}</h3>

                        <p className="mt-1 text-xs font-semibold text-green-600">{menu.category.name}</p>
                      </div>
                    </div>

                    <p className="min-h-10 text-sm leading-5 text-slate-500">{menu.description || "Menu pilihan Bahari Nusantara."}</p>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-lg font-extrabold text-slate-900">Rp {menu.price.toLocaleString("id-ID")}</p>

                      <button onClick={() => addToCart(menu)} className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 active:scale-95">
                        {cartItem ? `Tambah (${cartItem.quantity})` : "Tambah"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* CART BAR */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Pesanan Anda</p>

              <p className="text-base font-extrabold text-slate-900">{totalItems} item</p>
            </div>

            <div className="flex items-center gap-4">
              <p className="hidden text-lg font-extrabold text-slate-900 sm:block">Rp {totalPrice.toLocaleString("id-ID")}</p>

              <button onClick={onOrder} className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95">
                Lihat Pesanan →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
