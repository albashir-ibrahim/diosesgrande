import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import AddToCartLarge from "@/components/AddToCartLarge";
import ReviewForm from "@/components/ReviewForm";
import { auth } from "@/auth";

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, name: true, logo: true, slug: true, description: true } },
      category: { select: { id: true, name: true } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return product;
}

async function getRelated(categoryId: string, excludeId: string) {
  return prisma.product.findMany({
    where: { categoryId, id: { not: excludeId } },
    take: 4,
    include: {
      vendor: { select: { id: true, name: true, logo: true, slug: true } },
      category: { select: { id: true, name: true } },
      reviews: { select: { rating: true } },
    },
  });
}

function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const related = await getRelated(product.categoryId, id);
  const avg = avgRating(product.reviews);

  const session = await auth();
  let canReview = false;

  if (session?.user?.id) {
    const [hasPurchased, hasReviewed] = await Promise.all([
      prisma.order.findFirst({
        where: {
          userId: session.user.id,
          status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
          orderItems: { some: { productId: id } },
        },
      }),
      prisma.review.findFirst({
        where: { productId: id, userId: session.user.id },
      }),
    ]);

    canReview = !!hasPurchased && !hasReviewed;
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link href="/" className="hover:text-[#0b8241]">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#0b8241]">Products</Link>
        <span>/</span>
        <Link href={`/products?categoryId=${product.categoryId}`} className="hover:text-[#0b8241]">{product.category.name}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Main */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Images */}
          <div className="md:w-2/5">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
              {(product.images as string[])[0] ? (
                <img src={(product.images as string[])[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
              )}
            </div>
            {Array.isArray(product.images) && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {(product.images as string[]).map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-[#0b8241] shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <span className="bg-[#e6f4ea] text-[#0b8241] text-xs font-bold px-2 py-0.5 rounded">{product.category.name}</span>
              {product.stock > 0 ? (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">In Stock</span>
              ) : (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">Out of Stock</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

            {/* Rating */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className={`w-5 h-5 ${s <= Math.round(avg) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{avg.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({product.reviews.length} reviews)</span>
              </div>
            )}

            <div className="text-3xl font-black text-gray-900 mb-1">₦{product.price.toLocaleString()}</div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Vendor */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
              <div className="w-10 h-10 bg-[#0b8241] rounded-lg flex items-center justify-center text-white font-bold">
                {product.vendor.logo ? (
                  <img src={product.vendor.logo} alt="" className="w-full h-full object-cover rounded-lg"/>
                ) : product.vendor.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{product.vendor.name}</p>
                <p className="text-xs text-gray-500">Verified Vendor ✅</p>
              </div>
              <Link href={`/products?q=${encodeURIComponent(product.vendor.name)}`}
                className="ml-auto text-xs text-[#0b8241] border border-[#0b8241] px-3 py-1.5 rounded-md hover:bg-[#e6f4ea] transition font-medium">
                View Store
              </Link>
            </div>

            <AddToCartLarge productId={product.id} stock={product.stock} />

            {/* Trust badges */}
            <div className="flex gap-4 mt-4 text-xs text-gray-500">
              <span>🚚 Free delivery on orders over ₦20,000</span>
              <span>🔒 Secure payment</span>
              <span>🛡️ Buyer protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {product.reviews.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 h-full">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Reviews ({product.reviews.length})</h2>
              <div className="space-y-4">
                {product.reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#0b8241] text-white flex items-center justify-center font-bold text-sm">
                        {review.user?.name?.[0] ?? "U"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{review.user?.name ?? "Anonymous"}</p>
                        <div className="flex">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} className={`w-3 h-3 ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600 ml-11">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center flex flex-col items-center justify-center h-full">
               <div className="text-4xl mb-3">⭐</div>
               <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>

        <div>
           {canReview ? (
             <ReviewForm productId={product.id} />
           ) : !session ? (
             <div className="bg-[#f0faf4] border border-[#d1eedd] rounded-2xl p-6 text-center">
               <p className="text-sm text-[#0b8241] font-bold mb-2">Have you bought this?</p>
               <p className="text-xs text-gray-500 mb-4">Log in to share your thoughts with other shoppers.</p>
               <Link href="/login" className="bg-[#0b8241] text-white px-4 py-2 rounded-lg text-xs font-bold inline-block">Log In</Link>
             </div>
           ) : null}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">Related Products</h2>
            <Link href={`/products?categoryId=${product.categoryId}`} className="text-[#0b8241] text-sm hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </main>
  );
}
