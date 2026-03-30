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

    // Accept this offer, reject others
    await supabase.from("offers").update({ status: "rejected" }).eq("task_id", taskId);
    await supabase.from("offers").update({ status: "accepted" }).eq("id", offerId);
    await supabase.from("tasks").update({
      status: "assigned",
      knight_id: knightId,
    }).eq("id", taskId);

    router.refresh();
  };

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Принять"}
    </button>
  );
}
