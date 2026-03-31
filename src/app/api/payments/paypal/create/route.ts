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
    const { taskId, amount, currency } = await req.json();

    if (!taskId || !amount) {
      return NextResponse.json({ error: "taskId and amount are required" }, { status: 400 });
    }

    // Verify task exists and is open
    const supabase = await createClient();
    const { data: task } = await supabase.from("tasks").select("id, status, budget").eq("id", taskId).single();
    if (!task || task.status !== "open") {
      return NextResponse.json({ error: "Task not found or not open" }, { status: 404 });
    }

    const accessToken = await getAccessToken();
    const paypalCurrency = currency === "GEL" ? "USD" : currency;

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: taskId,
          description: `PilgrimHands task: ${taskId}`,
          amount: {
            currency_code: paypalCurrency,
            value: amount.toFixed(2),
          },
        }],
        application_context: {
          brand_name: "PilgrimHands",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
        },
      }),
    });

    const order = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: order.message ?? "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
