"use client";
import Image from "next/image";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";


export default function Navbar({ session }: { session?: Session | null }) {
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-[#00522c] text-white text-xs py-2 px-6 flex justify-between items-center">
        <span>🚀 Free delivery on orders above ₦20,000 in Lagos</span>
          <div className="flex items-center divide-x divide-white/30 gap-0">
            {session?.user?.role === "VENDOR" ? (
              <Link href="/vendor" className="px-4 hover:underline font-bold text-yellow-400">Seller Dashboard</Link>
            ) : (
              <Link href="/vendor/register" className="px-4 hover:underline">Sell on Diosesgrande</Link>
            )}
            <a href="#" className="px-4 hover:underline">Track Order</a>
            <a href="#" className="px-4 hover:underline">Help Center</a>
            <span className="pl-4 flex items-center gap-1">🇳🇬 EN | NGN</span>
          </div>
      </div>

      {/* Main nav */}
      <div className="bg-white shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-20 h-20">
              <Image
                src="/logo.png"
                alt="Diosesgrande Logo"
                fill
                sizes="100px"
                className="object-contain"
              />
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl">
            <select className="border border-gray-300 border-r-0 rounded-l-md px-3 text-sm text-gray-600 bg-gray-50 outline-none hidden md:block">
              <option>All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="flex-1 border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#0b8241]"
            />
            <button type="submit" className="bg-[#0b8241] text-white px-5 rounded-r-md hover:bg-[#096b35] transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-5 shrink-0 ml-auto">
            {/* Favorites */}
            <Link href="#" className="flex flex-col items-center text-gray-700 hover:text-[#0b8241]">
              <div className="relative">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <span className="text-[11px] mt-0.5">Favorites</span>
            </Link>

            {/* Cart button — opens drawer */}
            <button
              onClick={openCart}
              className="flex flex-col items-center text-gray-700 hover:text-[#0b8241] transition"
              aria-label="Open cart"
            >
              <div className="relative">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#0b8241] text-white text-[9px] min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center font-bold">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5">Cart</span>
            </button>

            {/* Account */}
            {session ? (
              <div ref={accountMenuRef} className="relative flex items-center gap-2 text-gray-700 cursor-pointer" id="account-menu-trigger">
                <button 
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="flex items-center gap-2 hover:text-[#0b8241] transition-all duration-200 group/acc"
                >
                  <div className="text-right hidden md:block">
                    <div className="text-[10px] text-gray-400 font-medium">Hi, {session.user?.name?.split(" ")[0]}</div>
                    <div className="text-[12px] font-bold uppercase tracking-tight flex items-center gap-1.5">
                      My Account 
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isAccountOpen ? 'rotate-180' : ''}`}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#0b8241] text-white flex items-center justify-center font-bold text-sm shadow-md group-hover/acc:scale-105 transition-transform">
                    {session.user?.name?.[0]}
                  </div>
                </button>
                
                {/* Dropdown */}
                {isAccountOpen && (
                  <div className="absolute top-full right-0 mt-3 w-52 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 py-3 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Account Details</div>
                      <div className="text-sm font-semibold truncate text-gray-900">{session.user?.email}</div>
                    </div>
                    <Link 
                      href="/dashboard/orders" 
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#0b8241] font-bold transition-all duration-200"
                    >
                      <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">📦</span> 
                      My Orders
                    </Link>
                    {session.user?.role === "VENDOR" && (
                      <Link 
                        href="/vendor" 
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0b8241] bg-green-50/50 hover:bg-green-50 font-black transition-all duration-200 border-l-4 border-[#0b8241]"
                      >
                        <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">🏪</span> 
                        Seller Dashboard
                      </Link>
                    )}
                    <Link 
                      href="#" 
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed font-bold"
                    >
                      <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center opacity-50">❤️</span> 
                      Favorites (Soon)
                    </Link>
                    <div className="border-t border-gray-50 my-2 mx-2"/>
                    <button 
                      onClick={() => {
                        setIsAccountOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-black transition-all duration-200"
                    >
                      <span className="w-8 h-8 rounded-lg bg-red-50/50 flex items-center justify-center">🚪</span> 
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-gray-700 hover:text-[#0b8241] group transition-all duration-200">
                <div className="text-right hidden md:block">
                  <div className="text-[10px] text-gray-500 font-medium">Hi, Guest</div>
                  <div className="text-[12px] font-bold uppercase tracking-tight">Login</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm border border-gray-200 group-hover:border-[#0b8241] group-hover:bg-green-50 group-hover:text-[#0b8241] transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
