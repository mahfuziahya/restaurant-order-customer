import { useEffect, useState } from "react";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/home";
import Order from "./pages/order";
import OrderDetail from "./pages/orderDetail";
import CustomerEntry from "./pages/customerEntry";
import Tracking from "./pages/tracking";

import { getTableIdFromUrl } from "./utils/table";
import { getTableById, type Table } from "./services/table";
import { getOrderById } from "./services/order";

function App() {
  const [page, setPage] = useState<"entry" | "home" | "order" | "detail" | "tracking">("entry");
  const [table, setTable] = useState<Table | null>(null);
  const [customerName, setCustomerName] = useState(() => sessionStorage.getItem("customerName") || "");

  const [loadingTable, setLoadingTable] = useState(true);
  const [tableError, setTableError] = useState("");

  useEffect(() => {
    const loadTable = async () => {
      const tableId = getTableIdFromUrl();

      if (!tableId) {
        setTableError("QR meja tidak valid.");
        setLoadingTable(false);
        return;
      }

      try {
        const response = await getTableById(tableId);
        const currentTable = response.data.data;

        setTable(currentTable);

        const savedTableId = sessionStorage.getItem("tableId");

        const savedName = sessionStorage.getItem("customerName");

        const savedOrderId = sessionStorage.getItem("customerOrderId");

        // ========================================
        // 1. CUSTOMER BELUM PUNYA SESSION
        // ========================================

        if (!savedTableId || !savedName) {
          sessionStorage.setItem("tableId", String(currentTable.id));

          setPage("entry");
          return;
        }

        // ========================================
        // 2. SCAN QR MEJA BERBEDA
        // ========================================

        if (Number(savedTableId) !== currentTable.id) {
          console.log("MEJA BERUBAH:", savedTableId, "→", currentTable.id);

          sessionStorage.removeItem("customerName");
          sessionStorage.removeItem("customerOrderId");

          sessionStorage.setItem("tableId", String(currentTable.id));

          setCustomerName("");
          setPage("entry");

          return;
        }

        // ========================================
        // 3. MEJA SAMA
        // ========================================

        sessionStorage.setItem("tableId", String(currentTable.id));

        // Belum ada order
        if (!savedOrderId) {
          setPage("home");
          return;
        }

        // ========================================
        // 4. CEK ORDER TERAKHIR
        // ========================================

        try {
          const orderResponse = await getOrderById(Number(savedOrderId));

          const currentOrder = orderResponse.data.data;

          console.log("CURRENT ORDER:", currentOrder);

          // ========================================
          // ORDER SUDAH DIBAYAR
          // → BOLEH BUAT ORDER BARU
          // ========================================

          if (currentOrder.paymentStatus === "PAID") {
            setPage("home");
            return;
          }

          // ========================================
          // ORDER BELUM DIBAYAR
          // → KEMBALI KE DETAIL ORDER
          // ========================================

          setPage("detail");
        } catch (error) {
          console.error("GET CURRENT ORDER ERROR:", error);

          setPage("home");
        }
      } catch (error) {
        console.error("GET TABLE ERROR:", error);

        setTableError("Meja tidak ditemukan. Silakan scan QR Code kembali.");
      } finally {
        setLoadingTable(false);
      }
    };

    loadTable();
  }, []);

  if (loadingTable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

          <p className="text-sm font-medium text-slate-500">Memeriksa meja...</p>
        </div>
      </div>
    );
  }

  if (tableError || !table) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">⚠️</div>

          <h1 className="text-xl font-extrabold text-slate-900">Meja Tidak Ditemukan</h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">{tableError}</p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      {page === "entry" ? (
        <CustomerEntry
          tableId={table.id}
          tableNumber={table.number}
          onContinue={(name) => {
            setCustomerName(name);
            setPage("home");
          }}
        />
      ) : page === "home" ? (
        <Home
          tableId={table.id}
          tableNumber={table.number}
          customerName={customerName}
          onOrder={() => setPage("order")}
          onViewOrder={(orderId) => {
            sessionStorage.setItem("customerOrderId", String(orderId));

            setPage("detail");
          }}
          onTrackOrder={(orderId) => {
            sessionStorage.setItem("customerOrderId", String(orderId));

            setPage("tracking");
          }}
        />
      ) : page === "order" ? (
        <Order tableId={table.id} customerName={customerName} onOrderCreated={() => setPage("detail")} />
      ) : page === "detail" ? (
        <OrderDetail onTrack={() => setPage("tracking")} onAddOrder={() => setPage("home")} />
      ) : (
        <Tracking onBackToMenu={() => setPage("home")} />
      )}
    </CartProvider>
  );
}

export default App;
