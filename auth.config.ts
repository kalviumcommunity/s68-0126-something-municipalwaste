import type { NextAuthConfig } from "next-auth";
import routesConfig from "./routes.config.json";

// Emails that should be granted admin role (for OAuth users)
export const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL || "admin@ecowaste.com",
  "settymayurk@gmail.com",
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl;

      // Allow public routes
      const isPublic = routesConfig.publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );
      if (isPublic) return true;

      // Check if route is protected
      const matchedRoute = routesConfig.protectedRoutes.find(
        (route) =>
          pathname === route.path || pathname.startsWith(route.path + "/")
      );

      // If not a defined route, allow through
      if (!matchedRoute) return true;

      // Must be logged in for protected routes
      const isLoggedIn = !!auth?.user;
      if (!isLoggedIn) return false;

      // Check role-based access
      const userRole =
        (auth as { user?: { role?: string } })?.user?.role ||
        routesConfig.defaultRole;
      if (!matchedRoute.allowedRoles.includes(userRole)) {
        // Redirect to unauthorized page instead of login
        return Response.redirect(
          new URL(routesConfig.roleRedirects.unauthorized, nextUrl)
        );
      }

      return true;
    },
    async jwt({
      token,
      user,
    }: {
      token: Record<string, unknown>;
      user?: Record<string, unknown>;
    }) {
      if (user) {
        token.id = user.id;
        const isAdmin = ADMIN_EMAILS.includes(token.email as string);
        token.role = isAdmin
          ? "admin"
          : (user.role as string) || routesConfig.defaultRole;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: { user?: Record<string, unknown> };
      token: Record<string, unknown>;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || routesConfig.defaultRole;
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
