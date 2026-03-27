import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const nextAuthMiddleware: any = NextAuth(authConfig).auth;
export default nextAuthMiddleware;

export const config = {
  // matcher: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
