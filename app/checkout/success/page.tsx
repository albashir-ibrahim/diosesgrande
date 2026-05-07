"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed Successfully!</h1>
      <p className="text-gray-500 mb-8 text-lg">
        Thank you for your purchase. Your payment has been confirmed and our vendors have been notified.
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 text-left">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
          <span className="text-sm text-gray-500">Transaction Reference</span>
          <span className="text-sm font-mono font-bold text-gray-800">{ref || "N/A"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status</span>
          <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-wider">Paid</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/dashboard/orders" 
          className="bg-[#0b8241] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#096b35] transition shadow-sm"
        >
          Track My Orders
        </Link>
        <Link 
          href="/products" 
          className="bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition"
        >
          Continue Shopping
        </Link>
      </div>

      <p className="mt-12 text-sm text-gray-400">
        Need help? Contact our support at <span className="font-bold text-[#0b8241]">support@diosesgrande.com</span>
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading success details...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
