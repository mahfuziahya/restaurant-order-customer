import { useEffect, useState } from "react";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/home";
import Order from "./pages/order";
import OrderDetail from "./pages/orderDetail";
import CustomerEntry from "./pages/customerEntry";
import Tracking from "./pages/tracking";

import { getTableIdFromUrl } from "./utils/table";
import { getTableById, type Table } from "./services/table";

function App() {
  const [page, setPage] = useState<"entry" | "home" | "order" | "detail" | "tracking">("entry");

  const [table, setTable] = useState<Table | null>(null);
  const [customerName, setCustomerName] = useState("");

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

        setTable(response.data.data);
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
        <Home tableId={table.id} tableNumber={table.number} customerName={customerName} onOrder={() => setPage("order")} />
      ) : page === "order" ? (
        <Order tableId={table.id} customerName={customerName} onOrderCreated={() => setPage("detail")} />
      ) : page === "detail" ? (
        <OrderDetail onTrack={() => setPage("tracking")} onAddOrder={() => setPage("home")} />
      ) : (
        <Tracking />
      )}
    </CartProvider>
  );
}

export default App;
