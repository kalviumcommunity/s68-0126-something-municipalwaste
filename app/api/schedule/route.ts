import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    // Look up user's zone from the database if not provided
    let zone = searchParams.get("zone");
    if (!zone) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { zone: true },
      });
      zone = user?.zone || null;
    }
    const wasteType = searchParams.get("wasteType");

    const where: Record<string, unknown> = { isActive: true };
    if (zone) where.zone = zone;
    if (wasteType) where.wasteType = wasteType;

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: [{ dayOfWeek: "asc" }, { timeSlot: "asc" }],
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const schedule = await prisma.schedule.create({
      data: body,
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
