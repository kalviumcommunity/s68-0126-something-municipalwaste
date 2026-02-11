import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { updateReportSchema } from "@/lib/validations/report";
import { createNotification } from "@/lib/utils/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check access permissions
    if (session.user.role === "user" && report.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and collectors can update reports
    if (!["admin", "collector"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateReportSchema.parse(body);

    const existing = await prisma.report.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        ...validated,
        ...(validated.status === "resolved" && {
          resolvedAt: new Date(),
          resolvedBy: session.user.id,
        }),
      },
    });

    // Notify user if resolved
    if (validated.status === "resolved" && existing.status !== "resolved") {
      await createNotification({
        userId: existing.userId,
        type: "issue_report",
        title: "Issue Resolved",
        message: `Your report "${existing.title}" has been resolved.`,
        link: `/reports/${id}`,
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
