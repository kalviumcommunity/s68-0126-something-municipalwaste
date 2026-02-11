import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { reportSchema } from "@/lib/validations/report";
import { createNotification } from "@/lib/utils/notifications";
import { awardPoints } from "@/lib/utils/rewards";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const where: Record<string, unknown> = {};

    // Users can only see their own reports
    if (session.user.role === "user") {
      where.userId = session.user.id;
    }

    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = reportSchema.parse(body);

    const report = await prisma.report.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
    });

    // Award points and fetch admins in parallel
    const [, admins] = await Promise.all([
      awardPoints(session.user.id, 5, "reporting an issue"),
      prisma.user.findMany({
        where: { role: "admin" },
        select: { id: true },
      }),
    ]);

    // Notify all admins in parallel
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: "issue_report",
          title: "New Issue Reported",
          message: `${session.user.name} reported: ${validated.title}`,
          link: `/reports/${report.id}`,
        })
      )
    );

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
