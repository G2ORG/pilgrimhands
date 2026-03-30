import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const taskId = paymentIntent.metadata?.task_id;

      if (taskId) {
        await serviceClient
          .from("transactions")
          .update({ status: "held" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        await serviceClient
          .from("tasks")
          .update({ status: "in_progress" })
          .eq("id", taskId);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      await serviceClient
        .from("transactions")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);
      break;
    }

    case "transfer.created": {
      const transfer = event.data.object;
      await serviceClient
        .from("transactions")
        .update({ status: "released", stripe_transfer_id: transfer.id })
        .eq("stripe_payment_intent_id", transfer.source_transaction as string);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
