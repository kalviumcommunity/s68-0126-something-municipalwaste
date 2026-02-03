import { auth } from "@/auth";

export default auth((req) => {
  // req.auth contains the session
  return;
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
