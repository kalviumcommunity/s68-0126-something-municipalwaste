import { auth, updateUserRole } from "@/auth";
import { NextResponse } from "next/server";
import routesConfig from "@/routes.config.json";

// PATCH /api/admin/users/:id/role — assign role to a user (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent admins from changing their own role
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { role } = body;

    if (!role || !routesConfig.roles.includes(role)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${routesConfig.roles.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updatedUser = updateUserRole(id, role);
    return NextResponse.json({
      message: "Role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
