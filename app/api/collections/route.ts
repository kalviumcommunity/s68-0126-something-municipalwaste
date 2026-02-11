import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { collectionRequestSchema } from "@/lib/validations/collection";
import { createNotification } from "@/lib/utils/notifications";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const zone = searchParams.get("zone");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (session.user.role === "user") {
      where.userId = session.user.id;
    } else if (session.user.role === "collector") {
      // Look up collector's zone from the database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { zone: true },
      });
      where.OR = [
        { collectorId: session.user.id },
        ...(user?.zone ? [{ zone: user.zone }] : []),
      ];
    }

    // Add filters
    if (status) where.status = status;
    if (zone) where.zone = zone;

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.collection.count({ where }),
    ]);

    return NextResponse.json({
      collections,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
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
    const validated = collectionRequestSchema.parse(body);

    const collection = await prisma.collection.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
    });

    // Create notification
    await createNotification({
      userId: session.user.id,
      type: "collection_reminder",
      title: "Collection Request Submitted",
      message: `Your ${validated.wasteType} collection request has been submitted successfully.`,
      link: `/collections/${collection.id}`,
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection request" },
      { status: 500 }
    );
  }
}
