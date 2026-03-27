import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const nextAuthMiddleware: any = NextAuth(authConfig).auth;
export default nextAuthMiddleware;

export const config = {
  matcher: ["/publicar/:path*", "/favoritos/:path*"],
};
