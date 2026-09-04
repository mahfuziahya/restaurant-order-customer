import { useEffect, useState } from "react";
import { getOrderById } from "../services/order";
import { socket } from "../services/socket";

type OrderItem = {
  id: number;
  quantity: number;
  menuItem: {
    name: string;
    price: number;
  };
};

type OrderData = {
  id: number;
  status: string;
  paymentStatus: string;
  guestName: string | null;
  table: {
    number: number;
  } | null;
  orderItems: OrderItem[];
};

type TrackingProps = {
  onBackToMenu: () => void;
};

const getStatusLabel = (status: string) => {
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

const statuses = ["PENDING", "PROCESSING", "COOKING", "READY", "COMPLETED"];

export default function Tracking({ onBackToMenu }: TrackingProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem("customerOrderId");

    if (!storedOrderId) {
      setError("Pesanan tidak ditemukan.");
      setLoading(false);
      return;
    }

    const orderId = Number(storedOrderId);

    if (!Number.isInteger(orderId)) {
      setError("ID pesanan tidak valid.");
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        const response = await getOrderById(orderId);

        setOrder(response.data.data);
      } catch (error) {
        console.error("GET TRACKING ERROR:", error);
        setError("Gagal mengambil status pesanan.");
      } finally {
        setLoading(false);
      }
    };

    const handleConnect = () => {
      console.log("🟢 SOCKET CONNECTED:", socket.id);

      // BARU JOIN ROOM SETELAH SOCKET CONNECT
      socket.emit("join-order", orderId);

      console.log(`📦 JOIN ORDER ROOM: order-${orderId}`);
    };

    const handleConnectError = (error: Error) => {
      console.error("🔴 SOCKET ERROR:", error);
    };

    const handleOrderUpdated = (updatedOrder: OrderData) => {
      console.log("🔄 ORDER UPDATED:", updatedOrder);

      setOrder(updatedOrder);
    };

    // REST API → ambil data awal
    loadOrder();

    // Listener dipasang SEBELUM connect
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("order:updated", handleOrderUpdated);

    // Connect ke Socket.IO
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("order:updated", handleOrderUpdated);

      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

          <p className="text-sm font-medium text-slate-500">Memuat status pesanan...</p>
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

  const statusSteps = [
    { status: "PENDING", label: "Menunggu Diproses" },
    { status: "PROCESSING", label: "Pesanan Diproses" },
    { status: "COOKING", label: "Sedang Dimasak" },
    { status: "READY", label: "Siap Diantar" },
    { status: "COMPLETED", label: "Selesai" },
  ];

  const currentStatusIndex = statusSteps.findIndex((step) => step.status.toUpperCase() === order.status.toUpperCase());
  console.log("STATUS DB:", order.status);
  console.log("INDEX:", currentStatusIndex);

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-green-600">Bahari Nusantara</p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Lacak Pesanan</h1>

          <p className="mt-1 text-sm text-slate-500">Order #{order.id}</p>
        </div>

        <div className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            {order.guestName || "Customer"} • Meja {order.table?.number ?? "-"}
          </p>

          <div className="mt-5 rounded-2xl bg-green-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">Status Saat Ini</p>

            <p className="mt-2 text-xl font-extrabold text-green-800">{getStatusLabel(order.status)}</p>

            {order.status === "READY" && <p className="mt-1 text-sm text-green-700">Pesanan siap di antar.</p>}
          </div>
        </div>

        <div className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Status Pesanan</h2>

          <div className="mt-6">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={step.status} className="relative flex gap-4">
                  {/* GARIS */}
                  {index !== statusSteps.length - 1 && <div className={`absolute left-[16px] top-8 h-full w-0.5 ${index < currentStatusIndex ? "bg-green-500" : "bg-slate-200"}`} />}

                  {/* CIRCLE */}
                  <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isCurrent || isCompleted ? "bg-green-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {isCompleted || isCurrent ? "✓" : index + 1}
                  </div>

                  {/* LABEL */}
                  <div className="pb-8">
                    <p className={`text-sm font-bold ${isCurrent ? "text-green-700" : isCompleted ? "text-slate-700" : "text-slate-400"}`}>{step.label}</p>

                    {isCurrent && step.status === "READY" && <p className="mt-1 text-xs text-slate-500">Pesanan siap di antar.</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex justify-center">
            <button onClick={onBackToMenu} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
              ← Kembali ke Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
