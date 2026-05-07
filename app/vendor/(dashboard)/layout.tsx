import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id }
  });

  return (
    <div className="flex h-screen bg-[#f4f7f6]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col hidden lg:flex">
        <div className="h-24 flex items-center px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="Logo" fill sizes="100px" className="object-contain" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">Dioses<span className="text-[#0b8241]">grande</span></span>
          </Link>
        </div>

        <div className="px-6 mb-8">
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-[#0b8241] flex items-center justify-center text-white font-black text-sm">
              {vendor?.name?.charAt(0) || "V"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-gray-900 truncate">{vendor?.name || "Vendor Name"}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seller Account</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarLink href="/vendor" icon="dashboard" label="Overview" />
          <SidebarLink href="/vendor/products" icon="products" label="My Products" />
          <SidebarLink href="/vendor/orders" icon="orders" label="Orders" />
          <SidebarLink href="/vendor/settings" icon="settings" label="Shop Settings" />
        </nav>

        <div className="p-6 border-t border-gray-50">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Vendor Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <Link href="/" className="px-4 py-2 bg-[#0b8241] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#096b35] transition-all">
              View Shop
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const icons: Record<string, React.ReactNode> = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    products: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    orders: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
  };

  return (
    <Link href={href} className="flex items-center px-4 py-3.5 text-gray-500 hover:text-[#0b8241] hover:bg-[#e6f4ea] rounded-2xl transition-all group">
      <svg className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icons[icon]}
      </svg>
      <span className="text-sm font-black tracking-tight">{label}</span>
    </Link>
  );
}
