import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

const FEATURES = [
  { icon: "🚚", title: "Free Delivery", sub: "On orders over ₦20,000" },
  { icon: "🔒", title: "Secure Payments", sub: "Paystack, Flutterwave & more" },
  { icon: "🛡️", title: "Buyer Protection", sub: "Money back guarantee" },
  { icon: "🎧", title: "24/7 Support", sub: "We are here to help" },
];

const PAGE_SIZE = 12;

async function getData(searchParams: { page?: string; categoryId?: string; q?: string }) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;
  const categoryId = searchParams.categoryId;
  const q = searchParams.q;

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        vendor: { select: { id: true, name: true, logo: true, slug: true } },
        category: { select: { id: true, name: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { products, total, categories, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string; categoryId?: string; q?: string }> }) {
  const sp = await searchParams;
  const { products, total, categories, page, totalPages } = await getData(sp);
  const activeCategory = sp.categoryId;
  const searchQuery = sp.q;

  const buildHref = (overrides: any) => {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    if (merged.page && merged.page !== "1") params.set("page", merged.page);
    if (merged.categoryId) params.set("categoryId", merged.categoryId);
    if (merged.q) params.set("q", merged.q);
    const str = params.toString();
    return `/${str ? "?" + str : ""}`;
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 py-4">
      {/* ── Top Hero & Features (Only show on first page without filters/search) ── */}
      {!activeCategory && !searchQuery && page === 1 && (
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0b5c35] via-[#0b8241] to-[#12a556] h-[320px] flex items-center px-10 mb-6">
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center gap-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-4">
                ⚡ MEGA DEALS
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                Everything You Need,<br/>
                <span className="text-[#7eff9e]">From Trusted Vendors</span>
              </h1>
              <p className="text-white/80 text-sm mb-6">
                Shop from thousands of products across Nigeria. Quality, reliability and convenience delivered to you.
              </p>
              <div className="flex items-center gap-3">
                <Link href="#marketplace" className="bg-white text-[#0b8241] px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition shadow-lg">
                  Shop Now →
                </Link>
                <Link href="/vendor/register" className="border border-white/40 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition">
                  ▶ Sell With Us
                </Link>
              </div>
            </div>
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 space-y-3 hidden md:block">
              {[
                { icon: "🚚", title: "Fast Delivery", sub: "2 – 5 days" },
                { icon: "🔒", title: "Secure Payment", sub: "Multiple options" },
                { icon: "✅", title: "100% Trusted", sub: "Verified vendors" },
              ].map((f) => (
                <div key={f.title} className="bg-white/95 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg w-52">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{f.title}</p>
                    <p className="text-xs text-gray-500">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm border border-gray-50">
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div id="marketplace" className="flex gap-8">
        {/* ── Filter Sidebar ── */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-400">
              Categories
            </div>
            <nav className="py-2">
              <Link
                href="/"
                className={`flex items-center px-6 py-3 text-sm transition-all ${!activeCategory ? "bg-[#e6f4ea] text-[#0b8241] font-bold border-r-4 border-[#0b8241]" : "text-gray-600 hover:bg-gray-50"}`}
              >
                All Products
                <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">{total}</span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={buildHref({ categoryId: cat.id, page: "1" })}
                  className={`flex items-center justify-between px-6 py-3 text-sm transition-all ${activeCategory === cat.id ? "bg-[#e6f4ea] text-[#0b8241] font-bold border-r-4 border-[#0b8241]" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-lg">📦</span>
                    {cat.name}
                  </span>
                  <svg className={`w-3 h-3 transition-transform ${activeCategory === cat.id ? "text-[#0b8241]" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                </Link>
              ))}
              <div className="px-6 py-4 border-t border-gray-50 mt-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Quick Links</p>
                <Link href="/dashboard/orders" className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#0b8241] mb-2 transition-colors">
                  📦 Track My Orders
                </Link>
                <Link href="/vendor/register" className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#0b8241] transition-colors">
                  🏪 Open a Store
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <div className="flex-1 min-w-0">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {searchQuery ? `Results for "${searchQuery}"` : activeCategory ? categories.find(c => c.id === activeCategory)?.name : "Explore Marketplace"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block w-2 h-2 rounded-full bg-[#0b8241]"></span>
                <p className="text-sm font-bold text-gray-500">{total.toLocaleString()} products found</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort:</span>
                <select className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer">
                  <option>Latest Arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
              {/* Mobile View Toggle or Filter Trigger could go here */}
            </div>
          </div>

          {/* Product Listing */}
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-20 text-center border-2 border-dashed border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">🔍</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No matching products</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-10">We couldn't find what you were looking for. Try a different search term or browse our categories.</p>
              <Link href="/" className="inline-flex items-center gap-2 bg-[#0b8241] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-[#096b35] transition shadow-xl shadow-[#0b8241]/20">
                Refresh Marketplace
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-16 pb-12">
                  {page > 1 ? (
                    <Link href={buildHref({ page: String(page - 1) })}
                      className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-600 hover:bg-[#e6f4ea] hover:text-[#0b8241] transition-all shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                    </Link>
                  ) : (
                    <div className="w-10 h-10 rounded-xl border border-gray-50 bg-gray-50/50 flex items-center justify-center text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                    </div>
                  )}
                  
                  <div className="bg-white border border-gray-100 rounded-xl px-6 py-2 shadow-sm">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">Page</span>
                    <span className="text-sm font-black text-[#0b8241]">{page}</span>
                    <span className="text-xs font-bold text-gray-300 mx-2">of</span>
                    <span className="text-sm font-black text-gray-700">{totalPages}</span>
                  </div>

                  {page < totalPages ? (
                    <Link href={buildHref({ page: String(page + 1) })}
                      className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-600 hover:bg-[#e6f4ea] hover:text-[#0b8241] transition-all shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                    </Link>
                  ) : (
                    <div className="w-10 h-10 rounded-xl border border-gray-50 bg-gray-50/50 flex items-center justify-center text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
