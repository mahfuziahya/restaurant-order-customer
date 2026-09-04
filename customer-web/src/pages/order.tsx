import { useState } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/order";

type OrderProps = {
  tableId: number | null;
  customerName: string;
  onOrderCreated: () => void;
};

export default function Order({ tableId, customerName, onOrderCreated }: OrderProps) {
  const { items, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, total } = useCart();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreateOrder = async () => {
    if (!tableId) {
      setError("Nomor meja tidak ditemukan.");
      return;
    }

    if (items.length === 0) {
      setError("Pesanan masih kosong.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        tableId,
        serviceType: "DINE_IN" as const,
        guestName: customerName,
        note: note.trim() || undefined,
        items: items.map((item) => ({
          menuItemId: item.menu.id,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(payload);
      const orderId = response.data.data.id;

      console.log("ORDER ID :", orderId);

      // Simpan semua order customer
      const savedOrders = JSON.parse(sessionStorage.getItem("customerOrderIds") || "[]");

      const orderIds = Array.isArray(savedOrders) ? savedOrders : [];

      if (!orderIds.includes(orderId)) {
        orderIds.push(orderId);
      }

      sessionStorage.setItem("customerOrderIds", JSON.stringify(orderIds));

      // Tetap simpan order terakhir/current order
      sessionStorage.setItem("customerOrderId", String(orderId));

      clearCart();
      onOrderCreated();

      setSuccess("Pesanan berhasil dibuat!");
    } catch (error: any) {
      console.error("CREATE ORDER ERROR:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Gagal membuat pesanan.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-5 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-5xl">🛒</div>

            <h1 className="text-2xl font-extrabold text-slate-900">Pesanan Saya</h1>

            <p className="mt-2 text-sm text-slate-500">Belum ada menu yang dipilih.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8 pb-32">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-green-600">Bahari Nusantara</p>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Pesanan Saya</h1>

              <p className="mt-1 text-sm text-slate-500">Meja {tableId ?? "-"}</p>
            </div>

            <div className="rounded-full bg-green-50 px-4 py-2">
              <span className="text-sm font-bold text-green-700">Dine In</span>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 rounded-2xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-700">{success}</p>
          </div>
        )}

        {/* ORDER ITEMS */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.menu.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                {/* IMAGE */}
                {/* IMAGE */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-green-50">
                  {item.menu.image ? (
                    <img
                      src={item.menu.image}
                      alt={item.menu.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">🍽️</div>
                  )}
                </div>
                {/* INFO */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-slate-900">{item.menu.name}</h2>

                      <p className="mt-1 text-sm text-slate-500">Rp {item.menu.price.toLocaleString("id-ID")}</p>
                    </div>

                    <button onClick={() => removeFromCart(item.menu.id)} className="text-xs font-semibold text-red-500 hover:text-red-600">
                      Hapus
                    </button>
                  </div>

                  {/* QUANTITY */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200">
                      <button onClick={() => decreaseQuantity(item.menu.id)} className="h-9 w-9 text-lg font-bold text-slate-600 transition hover:bg-slate-50">
                        −
                      </button>

                      <span className="flex h-9 min-w-10 items-center justify-center border-x border-slate-200 text-sm font-bold text-slate-900">{item.quantity}</span>

                      <button onClick={() => increaseQuantity(item.menu.id)} className="h-9 w-9 text-lg font-bold text-green-600 transition hover:bg-green-50">
                        +
                      </button>
                    </div>

                    <p className="font-extrabold text-slate-900">Rp {(item.menu.price * item.quantity).toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CATATAN PESANAN */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Catatan Pesanan</h2>

          <p className="mt-1 text-sm text-slate-500">Punya permintaan khusus untuk pesanan Anda?</p>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: tidak pedas, jangan pakai bawang..."
            rows={4}
            className="mt-4 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {/* SUMMARY */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Ringkasan Pesanan</h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total item</span>

              <span className="font-semibold text-slate-900">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Meja</span>

              <span className="font-semibold text-slate-900">{tableId ?? "-"}</span>
            </div>

            <div className="my-4 border-t border-slate-100" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Total</span>

              <span className="text-2xl font-extrabold text-slate-900">Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* CHECKOUT */}
        <div className="mt-6">
          <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="w-full rounded-2xl bg-green-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses Pesanan..." : "Lanjutkan Pesanan →"}
          </button>
        </div>
      </div>
    </div>
  );
}
