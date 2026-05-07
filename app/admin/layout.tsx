"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: "📊" },
  { label: "Users", href: "/admin/users", icon: "👤" },
  { label: "Vendors", href: "/admin/vendors", icon: "🏪" },
  { label: "Products", href: "/admin/products", icon: "📦" },
  { label: "Orders", href: "/admin/orders", icon: "🛒" },
  { label: "Categories", href: "/admin/categories", icon: "📂" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">A</div>
            <span className="text-xl font-black text-slate-900 tracking-tight">ADMIN PANEL</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                {session?.user?.name?.[0] ?? "A"}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{session?.user?.name ?? "Admin"}</p>
                <button 
                  onClick={() => signOut()}
                  className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                >
                  Sign Out
                </button>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">
            {NAV_ITEMS.find(i => i.href === pathname)?.label ?? "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
             <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition">
                View Site ↗
             </Link>
             <div className="w-px h-6 bg-slate-200" />
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Online</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
