import { useEffect, useState } from "react";
import { getOrderById, createPayment } from "../services/order";
import { loadMidtransSnap } from "../services/midtrans";

type OrderDetailProps = {
  onTrack: () => void;
  onAddOrder: () => void;
};

type OrderItem = {
  id: number;
  quantity: number;
  menuItem: {
    id: number;
    name: string;
    price: number;
    image?: string | null;
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

export default function OrderDetail({ onTrack, onAddOrder }: OrderDetailProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      await loadMidtransSnap();

      const response = await createPayment(order.id);

      const token = response.data.data.token;

      if (!token) {
        throw new Error("Snap token tidak ditemukan.");
      }

      window.snap.pay(token, {
        onSuccess: async () => {
          console.log("PAYMENT SUCCESS");

          // Tunggu webhook Midtrans memproses pembayaran
          for (let i = 0; i < 10; i++) {
            try {
              const updatedOrder = await getOrderById(order.id);
              const latestOrder = updatedOrder.data.data;

              console.log("PAYMENT STATUS:", latestOrder.paymentStatus);
              console.log("ORDER STATUS:", latestOrder.status);

              setOrder(latestOrder);

              if (latestOrder.paymentStatus === "PAID") {
                console.log("DATABASE PAYMENT SUCCESS");
                setPaymentLoading(false);
                return;
              }

              // Tunggu 2 detik sebelum cek lagi
              await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (error) {
              console.error("CHECK PAYMENT STATUS ERROR:", error);
            }
          }

          setPaymentLoading(false);
        },

        onPending: async () => {
          console.log("PAYMENT PENDING");
          setPaymentLoading(false);

          // Ambil status terbaru dari backend
          try {
            const updatedOrder = await getOrderById(order.id);
            setOrder(updatedOrder.data.data);
          } catch (error) {
            console.error("GET UPDATED ORDER ERROR:", error);
          }
        },

        onError: () => {
          console.log("PAYMENT ERROR");

          setPaymentLoading(false);
          setPaymentError("Pembayaran gagal. Silakan coba lagi.");
        },

        onClose: () => {
          console.log("PAYMENT POPUP CLOSED");
          setPaymentLoading(false);
        },
      });
    } catch (error: any) {
      console.error("PAYMENT ERROR:", error);

      setPaymentError(error.response?.data?.message || error.message || "Gagal memproses pembayaran.");

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
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600">ORDER ITEMS</p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-900">Pesanan Anda</h2>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">{order.orderItems.length} item</span>
          </div>

          <div className="mt-6 space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                {/* IMAGE */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-green-50">
                  {item.menuItem.image ? (
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
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
                      <h3 className="font-bold text-slate-900">{item.menuItem.name}</h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.quantity} × Rp {item.menuItem.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <p className="shrink-0 font-extrabold text-slate-900">Rp {(item.menuItem.price * item.quantity).toLocaleString("id-ID")}</p>
                  </div>
                </div>
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Total Pesanan</span>

            <span className="text-2xl font-extrabold text-slate-900">Rp {total.toLocaleString("id-ID")}</span>
          </div>

          {order.paymentStatus !== "PAID" ? (
            <>
              <h2 className="mt-6 text-lg font-extrabold text-slate-900">Pembayaran</h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">Pilih metode pembayaran yang tersedia melalui Midtrans.</p>

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

              <button onClick={onAddOrder} className="mt-3 w-full rounded-2xl border border-green-600 bg-white px-6 py-4 text-sm font-bold text-green-700 transition hover:bg-green-50">
                + Tambah Pesanan
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
