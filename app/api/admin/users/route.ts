import { auth, getUsers } from "@/auth";
import { NextResponse } from "next/server";

// GET /api/admin/users — list all users (admin only)
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = getUsers();
  return NextResponse.json({ users });
}
