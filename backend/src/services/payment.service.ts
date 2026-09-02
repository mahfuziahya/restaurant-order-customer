import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});
export type CreatePaymentParams = {
  orderId: number;
  grossAmount: number;
  customerName: string;
};

export async function createPaymentTransaction({ orderId, grossAmount, customerName }: CreatePaymentParams) {
  const parameter = {
    transaction_details: {
      order_id: `ORDER-${orderId}-${Date.now()}`,
      gross_amount: Math.round(grossAmount),
    },

    customer_details: {
      first_name: customerName,
    },
  };

  const transaction = await snap.createTransaction(parameter);

  return transaction;
}
