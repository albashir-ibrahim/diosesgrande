import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const path = nextUrl.pathname;

      // Always allow API auth routes (NextAuth internals)
      if (path.startsWith('/api/auth')) return true;

      // Public routes — always accessible
      const isLoginPage    = path === '/login';
      const isRegisterPage = path === '/register';

      // ── Logged-in users on login/register → redirect to their dashboard ──
      if (isLoggedIn && (isLoginPage || isRegisterPage)) {
        if (role === 'ADMIN')  return Response.redirect(new URL('/admin',            nextUrl));
        if (role === 'VENDOR') return Response.redirect(new URL('/vendor',           nextUrl));
        return                        Response.redirect(new URL('/dashboard/orders', nextUrl));
      }

      // ── ADMIN routes: /admin/** ──
      if (path.startsWith('/admin')) {
        if (isLoggedIn && role === 'ADMIN') return true;
        if (!isLoggedIn) {
          const url = new URL('/login', nextUrl);
          url.searchParams.set('callbackUrl', path);
          return Response.redirect(url);
        }
        // Logged-in but wrong role → send to their own area
        if (role === 'VENDOR') return Response.redirect(new URL('/vendor',           nextUrl));
        return                        Response.redirect(new URL('/dashboard/orders', nextUrl));
      }

      // ── VENDOR routes: /vendor/** ──
      if (path.startsWith('/vendor')) {
        // Allow /vendor/register for non-vendors (they need to sign up)
        if (path === '/vendor/register') {
          if (!isLoggedIn) {
            const url = new URL('/login', nextUrl);
            url.searchParams.set('callbackUrl', path);
            return Response.redirect(url);
          }
          if (role === 'ADMIN')  return Response.redirect(new URL('/admin',            nextUrl));
          if (role === 'VENDOR') return Response.redirect(new URL('/vendor',           nextUrl));
          return true; // CUSTOMER can access registration page
        }
        // All other /vendor/* routes require VENDOR or ADMIN role
        if (isLoggedIn && (role === 'VENDOR' || role === 'ADMIN')) return true;
        if (!isLoggedIn) {
          const url = new URL('/login', nextUrl);
          url.searchParams.set('callbackUrl', path);
          return Response.redirect(url);
        }
        // CUSTOMER trying to access /vendor → their dashboard
        return Response.redirect(new URL('/dashboard/orders', nextUrl));
      }

      // ── CUSTOMER dashboard: /dashboard/** ──
      if (path.startsWith('/dashboard')) {
        if (isLoggedIn) {
          if (role === 'VENDOR') return Response.redirect(new URL('/vendor', nextUrl));
          if (role === 'ADMIN')  return Response.redirect(new URL('/admin',  nextUrl));
          return true;
        }
        const url = new URL('/login', nextUrl);
        url.searchParams.set('callbackUrl', path);
        return Response.redirect(url);
      }

      // ── Checkout: requires login ──
      if (path.startsWith('/checkout')) {
        if (isLoggedIn) return true;
        const url = new URL('/login', nextUrl);
        url.searchParams.set('callbackUrl', path);
        return Response.redirect(url);
      }

      // Everything else is public
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id   = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as 'ADMIN' | 'VENDOR' | 'CUSTOMER';
        session.user.id   = token.id  as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
