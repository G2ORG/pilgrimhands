"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

interface PayPalPaymentProps {
  taskId: string;
  amount: number;
  currency: string;
  onSuccess?: (orderId: string) => void;
}

export function PayPalPayment({ taskId, amount, currency, onSuccess }: PayPalPaymentProps) {
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div style={{ color: '#7a6a50', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem', border: '1px solid #3a2f1a', textAlign: 'center' }}>
        PayPal not configured. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to .env.local
      </div>
    );
  }

  if (status === "success") {
    return (
      <div style={{ background: 'rgba(74,124,74,0.2)', border: '1px solid #2a5a2a', color: '#6ab86a', padding: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
        ✅ Payment received. The task is funded and held in escrow.
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId, currency: currency === "GEL" ? "USD" : currency }}>
      <div>
        {status === "processing" && (
          <div style={{ color: '#c9952a', fontSize: '0.85rem', marginBottom: '0.5rem', fontFamily: "'Share Tech Mono', monospace" }}>
            Processing payment...
          </div>
        )}
        {errorMsg && (
          <div style={{ color: '#cc4444', fontSize: '0.85rem', marginBottom: '0.75rem', background: 'rgba(139,26,26,0.2)', padding: '0.5rem 0.75rem', border: '1px solid #8b1a1a' }}>
            {errorMsg}
          </div>
        )}
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
          createOrder={async () => {
            setStatus("processing");
            setErrorMsg(null);
            const res = await fetch("/api/payments/paypal/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ taskId, amount, currency }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to create order");
            return data.orderId;
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/payments/paypal/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID, taskId }),
            });
            const result = await res.json();
            if (!res.ok) {
              setErrorMsg(result.error ?? "Payment capture failed");
              setStatus("error");
              return;
            }
            setStatus("success");
            onSuccess?.(data.orderID);
          }}
          onError={(err) => {
            setErrorMsg("Payment failed. Please try again.");
            setStatus("error");
            console.error("PayPal error:", err);
          }}
          onCancel={() => setStatus("idle")}
        />
      </div>
    </PayPalScriptProvider>
  );
}
