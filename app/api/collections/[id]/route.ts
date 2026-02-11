import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { updateCollectionSchema } from "@/lib/validations/collection";
import { createNotification } from "@/lib/utils/notifications";
import {
  awardPoints,
  calculateCollectionPoints,
  calculateCO2Savings,
} from "@/lib/utils/rewards";

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
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            zone: true,
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    if (session.user.role === "user" && collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
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

    // Only collectors and admins can update collections
    if (!["admin", "collector"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateCollectionSchema.parse(body);

    const existing = await prisma.collection.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Update collection
    const collection = await prisma.collection.update({
      where: { id },
      data: {
        ...validated,
        ...(validated.status === "completed" && {
          completedAt: new Date(),
          collectorId: session.user.id,
        }),
      },
    });

    // Award points and notify user if completed
    if (validated.status === "completed" && existing.status !== "completed") {
      const points = calculateCollectionPoints(existing.wasteType);
      const co2saved = calculateCO2Savings(existing.wasteType);

      await Promise.all([
        awardPoints(
          existing.userId,
          points,
          `completing a ${existing.wasteType} collection`
        ),
        createNotification({
          userId: existing.userId,
          type: "collection_completed",
          title: "Collection Completed",
          message: `Your ${existing.wasteType} collection has been completed. You earned ${points} points and saved ${co2saved.toFixed(1)} kg CO₂!`,
          link: `/collections/${id}`,
        }),
        // Update analytics
        prisma.analytics.upsert({
          where: {
            id: `${new Date().toISOString().split("T")[0]}-${existing.zone}`,
          },
          create: {
            date: new Date(),
            zone: existing.zone,
            totalCollections: 1,
            completedCollections: 1,
            recyclingWeight: existing.wasteType === "recycling" ? 5 : 0,
            generalWasteWeight: existing.wasteType === "general" ? 5 : 0,
            co2Saved: co2saved,
          },
          update: {
            completedCollections: { increment: 1 },
            recyclingWeight: {
              increment: existing.wasteType === "recycling" ? 5 : 0,
            },
            generalWasteWeight: {
              increment: existing.wasteType === "general" ? 5 : 0,
            },
            co2Saved: { increment: co2saved },
          },
        }),
      ]);
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Users can only delete their own pending collections
    if (
      session.user.role === "user" &&
      (collection.userId !== session.user.id || collection.status !== "pending")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.collection.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
