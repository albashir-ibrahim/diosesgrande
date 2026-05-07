"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorStatusToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      router.refresh();
    } catch (error) {
      alert("Error updating vendor status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        isActive 
          ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" 
          : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
      } disabled:opacity-50`}
    >
      {loading ? "..." : isActive ? "Suspend" : "Activate"}
    </button>
  );
}
