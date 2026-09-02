const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

let snapLoaded = false;

export const loadMidtransSnap = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (snapLoaded) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src="https://app.sandbox.midtrans.com/snap/snap.js"]');

    if (existingScript) {
      snapLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");

    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    script.async = true;

    script.onload = () => {
      snapLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Gagal memuat Midtrans Snap"));
    };

    document.head.appendChild(script);
  });
};
