import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAYPAL_BASE = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? "PayPal auth failed");
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, taskId } = await req.json();
    if (!orderId || !taskId) {
      return NextResponse.json({ error: "orderId and taskId are required" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    // Capture the PayPal order
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const capture = await res.json();
    if (!res.ok || capture.status !== "COMPLETED") {
      return NextResponse.json({ error: capture.message ?? "Capture failed" }, { status: 500 });
    }

    const purchaseUnit = capture.purchase_units?.[0];
    const captureDetail = purchaseUnit?.payments?.captures?.[0];
    const capturedAmount = parseFloat(captureDetail?.amount?.value ?? "0");
    const platformFee = capturedAmount * (parseFloat(process.env.PLATFORM_FEE_PERCENT ?? "15") / 100);

    // Record transaction in Supabase
    const supabase = await createClient();
    await supabase.from("transactions").insert({
      task_id: taskId,
      amount: capturedAmount,
      currency: captureDetail?.amount?.currency_code ?? "USD",
      platform_fee: platformFee,
      status: "completed",
      payment_provider: "paypal",
      provider_payment_id: orderId,
    });

    return NextResponse.json({ success: true, orderId, amount: capturedAmount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
