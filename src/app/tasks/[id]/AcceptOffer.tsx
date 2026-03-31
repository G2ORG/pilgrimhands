"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AcceptOffer({
  offerId,
  taskId,
  knightId,
}: {
  offerId: string;
  taskId: string;
  knightId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    const supabase = createClient();

    await supabase.from("offers").update({ status: "rejected" }).eq("task_id", taskId);
    await supabase.from("offers").update({ status: "accepted" }).eq("id", offerId);
    await supabase.from("tasks").update({ status: "assigned", knight_id: knightId }).eq("id", taskId);

    router.refresh();
  };

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="btn-primary"
      style={{ marginTop: '0.5rem', fontSize: '0.7rem', padding: '0.3rem 0.75rem', opacity: loading ? 0.5 : 1 }}
    >
      {loading ? "..." : "Accept"}
    </button>
  );
}
