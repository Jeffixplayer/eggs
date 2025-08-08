export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard",
    "/workorders/:path*",
    "/calendar",
    "/admin",
  ],
};