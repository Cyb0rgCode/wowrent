import "server-only";

/**
 * Thin wrapper around the Konnect (Tunisian) payment gateway API.
 *
 * Konnect amounts are expressed in millimes (1 TND = 1000 millimes).
 * Docs: https://api.sandbox.konnect.network/api/v2
 *
 * When KONNECT_API_KEY / KONNECT_WALLET_ID are not configured, the helpers
 * fall back to a local mock so the booking + payment flow stays runnable in
 * development without real credentials.
 */

const API_URL =
  process.env.KONNECT_API_URL ?? "https://api.sandbox.konnect.network/api/v2";
const API_KEY = process.env.KONNECT_API_KEY ?? "";
const WALLET_ID = process.env.KONNECT_WALLET_ID ?? "";

export function isKonnectConfigured(): boolean {
  return Boolean(API_KEY && WALLET_ID);
}

export function tndToMillimes(amountTnd: number): number {
  return Math.round(amountTnd * 1000);
}

export function millimesToTnd(millimes: number): number {
  return Math.round(millimes) / 1000;
}

export type InitPaymentArgs = {
  amountTnd: number;
  orderId: string;
  description: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  successUrl: string;
  failUrl: string;
  webhookUrl: string;
};

export type InitPaymentResult = {
  payUrl: string;
  paymentRef: string;
  mocked: boolean;
};

export async function initPayment(
  args: InitPaymentArgs,
): Promise<InitPaymentResult> {
  // Mock mode: no credentials -> return a local success URL we can resolve.
  if (!isKonnectConfigured()) {
    const paymentRef = `mock_${args.orderId}`;
    const payUrl = `${args.successUrl}${
      args.successUrl.includes("?") ? "&" : "?"
    }payment_ref=${paymentRef}&mock=1`;
    return { payUrl, paymentRef, mocked: true };
  }

  const res = await fetch(`${API_URL}/payments/init-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      receiverWalletId: WALLET_ID,
      token: "TND",
      amount: tndToMillimes(args.amountTnd),
      type: "immediate",
      description: args.description,
      acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
      lifespan: 30,
      checkoutForm: true,
      addPaymentFeesToAmount: false,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phone,
      orderId: args.orderId,
      webhook: args.webhookUrl,
      successUrl: args.successUrl,
      failUrl: args.failUrl,
      silentWebhook: true,
      theme: "light",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Konnect init-payment failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { payUrl: string; paymentRef: string };
  return { payUrl: data.payUrl, paymentRef: data.paymentRef, mocked: false };
}

export type KonnectPaymentStatus = {
  status: string; // "completed" | "pending" | "failed" | ...
  completed: boolean;
};

export async function getPaymentStatus(
  paymentRef: string,
): Promise<KonnectPaymentStatus> {
  // Mock refs are always treated as completed.
  if (!isKonnectConfigured() || paymentRef.startsWith("mock_")) {
    return { status: "completed", completed: true };
  }

  const res = await fetch(`${API_URL}/payments/${paymentRef}`, {
    headers: { "x-api-key": API_KEY },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Konnect get-payment failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    payment?: { status?: string };
  };
  const status = data.payment?.status ?? "unknown";
  return { status, completed: status === "completed" };
}
