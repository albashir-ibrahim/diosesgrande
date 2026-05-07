import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

interface SearchParams {
  page?: string;
  categoryId?: string;
  q?: string;
}

const PAGE_SIZE = 12;

async function getData(searchParams: SearchParams) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;
  const categoryId = searchParams.categoryId;
  const q = searchParams.q;

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
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

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const { products, total, categories, page, totalPages } = await getData(sp);
  const activeCategory = sp.categoryId;
  const searchQuery = sp.q;

  const buildHref = (overrides: Partial<SearchParams>) => {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    if (merged.page && merged.page !== "1") params.set("page", merged.page);
    if (merged.categoryId) params.set("categoryId", merged.categoryId);
    if (merged.q) params.set("q", merged.q);
    const str = params.toString();
    return `/products${str ? "?" + str : ""}`;
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-20">
            <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-700">
              Categories
            </div>
            <nav className="py-1">
              <Link
                href="/products"
                className={`flex items-center px-4 py-2.5 text-sm transition-colors ${!activeCategory ? "bg-[#e6f4ea] text-[#0b8241] font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              >
                All Products
                <span className="ml-auto text-xs text-gray-400">({total})</span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={buildHref({ categoryId: cat.id, page: "1" })}
                  className={`flex items-center px-4 py-2.5 text-sm transition-colors ${activeCategory === cat.id ? "bg-[#e6f4ea] text-[#0b8241] font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {searchQuery ? `Results for "${searchQuery}"` : activeCategory ? categories.find(c => c.id === activeCategory)?.name : "All Products"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} products found</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#0b8241] bg-white">
                <option>Latest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Mobile category scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 md:hidden">
            <Link href="/products" className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${!activeCategory ? "bg-[#0b8241] text-white border-[#0b8241]" : "border-gray-300 text-gray-600"}`}>
              All
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={buildHref({ categoryId: cat.id, page: "1" })}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${activeCategory === cat.id ? "bg-[#0b8241] text-white border-[#0b8241]" : "border-gray-300 text-gray-600"}`}>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-20 text-center">
              <p className="text-4xl mb-4">📦</p>
              <h2 className="text-lg font-bold text-gray-800 mb-2">No products found</h2>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search term.</p>
              <Link href="/products" className="mt-4 inline-block bg-[#0b8241] text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-[#096b35] transition">
                Clear Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {page > 1 && (
                    <Link href={buildHref({ page: String(page - 1) })}
                      className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition">
                      ← Prev
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={buildHref({ page: String(p) })}
                      className={`px-4 py-2 rounded-md text-sm transition ${p === page ? "bg-[#0b8241] text-white" : "border border-gray-300 hover:bg-gray-50"}`}>
                      {p}
                    </Link>
                  ))}
                  {page < totalPages && (
                    <Link href={buildHref({ page: String(page + 1) })}
                      className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition">
                      Next →
                    </Link>
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
