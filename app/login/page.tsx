"use client";

import { useActionState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const callbackUrl = searchParams.get("callbackUrl");

  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4">
      <div className="max-w-[450px] w-full">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="relative w-24 h-24">
              <Image
                src="/logo.png"
                alt="Diosesgrande Logo"
                fill
                sizes="100px"
                className="object-contain"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500 font-medium">Access your personal dashboard and orders.</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-xs font-bold text-center">
              {success}
            </div>
          )}

          {state?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-bold text-center">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {callbackUrl && (
              <input type="hidden" name="redirectTo" value={callbackUrl} />
            )}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 placeholder:text-gray-300 focus:border-[#0b8241] focus:bg-white outline-none transition-all duration-200 font-medium"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-[10px] font-bold text-[#0b8241] uppercase tracking-wider hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 placeholder:text-gray-300 focus:border-[#0b8241] focus:bg-white outline-none transition-all duration-200 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#0b8241] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#096b35] transition-all duration-200 shadow-lg shadow-[#0b8241]/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
              <span className="px-4 bg-white text-gray-300">Or continue with</span>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { redirectTo: callbackUrl || "/dashboard/orders" })}
            type="button"
            className="w-full bg-white border border-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 transition-transform group-hover:scale-110">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-10 text-center text-sm text-gray-500 font-medium">
            Don&apos;t have an account?{" "}
            <Link href={`/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-[#0b8241] font-bold hover:underline underline-offset-4">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
