import type { Metadata } from "next";
import Image from "next/image";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/components/AuthProvider";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Diosesgrande — Nigeria's Trusted Marketplace",
  description:
    "Shop from thousands of products across Nigeria. Quality, reliability and convenience delivered to you.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-[#f5f7f9] text-gray-800" suppressHydrationWarning>
        <AuthProvider session={session}>
          <CartProvider>
            <Navbar session={session} />
            <CartDrawer />
            {children}
            <footer className="bg-white border-t border-gray-100 mt-12 py-8 px-6">
              <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                    <Image
                      src="/logo.png"
                      alt="Diosesgrande Logo"
                      fill
                      sizes="100px"
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm text-gray-500 max-w-[200px] leading-tight">
                    Nigeria's most trusted marketplace for quality products.
                  </span>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-6 text-[11px] font-black uppercase tracking-widest opacity-40 grayscale">
                  <span className="italic">paga</span>
                  <span className="text-blue-700">paystack</span>
                  <span className="text-yellow-600">flutterwave</span>
                  <span className="text-blue-900">Interswitch</span>
                  <span className="text-orange-500">🟠 Konga</span>
                  <span>JUMIA</span>
                  <span className="text-red-600">DHL</span>
                </div>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
