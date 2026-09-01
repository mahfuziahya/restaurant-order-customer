import { useEffect, useState } from "react";
import { getOrderById, payOrder } from "../services/order";

type OrderDetailProps = {
  onTrack: () => void;
};

type OrderItem = {
  id: number;
  quantity: number;
  menuItem: {
    id: number;
    name: string;
    price: number;
  };
};

type OrderData = {
  id: number;
  tableId: number | null;
  serviceType: string;
  guestName: string | null;
  status: string;
  paymentStatus: string;
  note: string | null;
  table: {
    id: number;
    number: number;
  } | null;
  orderItems: OrderItem[];
};

export default function OrderDetail({ onTrack }: OrderDetailProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "CARD" | "TRANSFER">("QRIS");

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const storedOrderId = sessionStorage.getItem("customerOrderId");

        if (!storedOrderId) {
          setError("Pesanan tidak ditemukan.");
          return;
        }

        const orderId = Number(storedOrderId);

        if (!Number.isInteger(orderId)) {
          setError("ID pesanan tidak valid.");
          return;
        }

        const response = await getOrderById(orderId);

        setOrder(response.data.data);
      } catch (error) {
        console.error("GET ORDER DETAIL ERROR:", error);
        setError("Gagal mengambil detail pesanan.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

          <p className="text-sm font-medium text-slate-500">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-red-500">{error || "Pesanan tidak ditemukan."}</p>
        </div>
      </div>
    );
  }

  const total = order.orderItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Menunggu Diproses";

      case "PROCESSING":
        return "Pesanan Diproses";

      case "COOKING":
        return "Sedang Dimasak";

      case "READY":
        return "Siap Diantar";

      case "COMPLETED":
        return "Selesai";

      default:
        return status;
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    try {
      setPaymentLoading(true);
      setPaymentError("");

      const response = await payOrder(order.id, paymentMethod);

      setOrder(response.data.data);
    } catch (error: any) {
      console.error("PAYMENT ERROR:", error);

      setPaymentError(error.response?.data?.message || "Gagal memproses pembayaran.");
    } finally {
      setPaymentLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8 pb-32">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-widest text-green-600">Bahari Nusantara</p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Detail Pesanan</h1>

          <p className="mt-1 text-sm text-slate-500">Pesanan #{order.id}</p>
          <p className="mt-1 text-sm text-slate-500">
            {order.guestName || "Customer"} • Meja {order.table?.number ?? "-"}
          </p>
        </div>

        {/* STATUS */}
        <div className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status Pesanan</p>

              <p className="mt-2 text-lg font-extrabold text-slate-900">{getOrderStatusLabel(order.status)}</p>
            </div>

            <div className={`rounded-full px-4 py-2 ${order.paymentStatus === "PAID" ? "bg-green-50" : "bg-yellow-50"}`}>
              <span className={`text-sm font-bold ${order.paymentStatus === "PAID" ? "text-green-700" : "text-yellow-700"}`}>{order.paymentStatus === "PAID" ? "Pembayaran Berhasil" : "Menunggu Pembayaran"}</span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Nomor Meja</span>

            <span className="font-bold text-slate-900">Meja {order.table?.number ?? "-"}</span>
          </div>

          <div className="mt-4 flex justify-between">
            <span className="text-sm text-slate-500">Tipe Pesanan</span>

            <span className="font-bold text-slate-900">{order.serviceType}</span>
          </div>
        </div>

        {/* ITEMS */}
        <div className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Pesanan</h2>

          <div className="mt-5 space-y-5">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-900">{item.menuItem.name}</p>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.quantity} × Rp {item.menuItem.price.toLocaleString("id-ID")}
                  </p>
                </div>

                <p className="font-bold text-slate-900">Rp {(item.menuItem.price * item.quantity).toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NOTE */}
        {order.note && (
          <div className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Catatan</h2>

            <div className="mt-4 rounded-2xl bg-green-50 p-4">
              <p className="text-sm leading-6 text-green-800">{order.note}</p>
            </div>
          </div>
        )}

        {/* TOTAL */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Total Pesanan</span>

            <span className="text-2xl font-extrabold text-slate-900">Rp {total.toLocaleString("id-ID")}</span>
          </div>

          {order.paymentStatus !== "PAID" ? (
            <>
              <h2 className="mt-6 text-lg font-extrabold text-slate-900">Pembayaran</h2>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { value: "QRIS", label: "QRIS" },
                  { value: "CASH", label: "Cash" },
                  { value: "CARD", label: "Card" },
                  { value: "TRANSFER", label: "Transfer" },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value as "CASH" | "QRIS" | "CARD" | "TRANSFER")}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${paymentMethod === method.value ? "border-green-600 bg-green-50 text-green-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>

              {paymentError && (
                <div className="mt-4 rounded-xl bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-600">{paymentError}</p>
                </div>
              )}

              <button onClick={handlePayment} disabled={paymentLoading} className="mt-6 w-full rounded-2xl bg-green-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">
                {paymentLoading ? "Memproses Pembayaran..." : "Bayar Sekarang →"}
              </button>
            </>
          ) : (
            <>
              <div className="mt-6 rounded-2xl bg-green-50 p-4">
                <p className="text-sm font-bold text-green-700">✓ Pembayaran berhasil</p>

                <p className="mt-1 text-xs text-green-600">Pesanan Anda sudah dapat diproses.</p>
              </div>

              <button onClick={onTrack} className="mt-4 w-full rounded-2xl bg-green-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-green-700">
                Lacak Pesanan →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
