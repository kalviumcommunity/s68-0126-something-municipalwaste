import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Base stats query
    const collectionsWhere: Record<string, unknown> = {};
    if (userRole === "user") {
      collectionsWhere.userId = userId;
    }

    const [
      totalCollections,
      completedCollections,
      pendingCollections,
      user,
      recentCollections,
      upcomingCollection,
      recyclingCollections,
    ] = await Promise.all([
      prisma.collection.count({ where: collectionsWhere }),
      prisma.collection.count({
        where: { ...collectionsWhere, status: "completed" },
      }),
      prisma.collection.count({
        where: { ...collectionsWhere, status: "pending" },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { points: true, zone: true },
      }),
      prisma.collection.findMany({
        where: collectionsWhere,
        include: {
          user: {
            select: { name: true, address: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.collection.findFirst({
        where: {
          ...collectionsWhere,
          status: "scheduled",
          scheduledDate: {
            gte: new Date(),
          },
        },
        orderBy: { scheduledDate: "asc" },
      }),
      prisma.collection.count({
        where: {
          ...collectionsWhere,
          wasteType: "recycling",
          status: "completed",
        },
      }),
    ]);

    const recyclingRate =
      completedCollections > 0
        ? Math.round((recyclingCollections / completedCollections) * 100)
        : 0;

    // Calculate CO2 savings from analytics
    const co2Stats = await prisma.analytics.aggregate({
      where: userRole === "user" && user?.zone ? { zone: user.zone } : {},
      _sum: {
        co2Saved: true,
      },
    });

    const stats = {
      totalCollections,
      completedCollections,
      pendingCollections,
      points: user?.points || 0,
      recyclingRate,
      co2Saved: co2Stats._sum.co2Saved || 0,
      recentActivity: recentCollections.map(
        (c: {
          id: string;
          createdAt: Date;
          wasteType: string;
          status: string;
          user: { name: string | null; address: string | null };
        }) => ({
          id: c.id,
          date: c.createdAt,
          type: c.wasteType,
          status: c.status,
          address: c.user.address,
        })
      ),
      upcomingCollection: upcomingCollection
        ? {
            id: upcomingCollection.id,
            date: upcomingCollection.scheduledDate,
            time: upcomingCollection.scheduledTime,
            type: upcomingCollection.wasteType,
          }
        : null,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
