import { useState } from "react";

type CustomerEntryProps = {
  tableNumber: number;
  onContinue: (name: string) => void;
};

export default function CustomerEntry({ tableNumber, onContinue }: CustomerEntryProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onContinue(trimmedName);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-green-600">Bahari Nusantara</p>

          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Selamat Datang</h1>

          <div className="mx-auto mt-4 inline-flex rounded-full bg-green-50 px-4 py-2">
            <span className="text-sm font-bold text-green-700">Meja {tableNumber}</span>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">Silakan masukkan nama Anda sebelum mulai memesan.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Anda</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />

          <button type="submit" disabled={!name.trim()} className="mt-5 w-full rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
            Mulai Memesan
          </button>
        </form>
      </div>
    </div>
  );
}
