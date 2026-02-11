"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Recycle,
  Star,
  Truck,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Leaf,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/app/components/StatusBadge";
import { getRelativeDate, formatDate } from "@/lib/utils/date";

interface DashboardStats {
  totalCollections: number;
  completedCollections: number;
  pendingCollections: number;
  points: number;
  recyclingRate: number;
  co2Saved: number;
  recentActivity: Array<{
    id: string;
    date: string;
    type: string;
    status: string;
  }>;
  upcomingCollection?: {
    id: string;
    date: string;
    time?: string;
    type: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session || !stats) {
    return null;
  }

  const quickActions = [
    {
      title: "Schedule Pickup",
      description: "Request a special waste collection",
      icon: Truck,
      href: "/collections/new",
    },
    {
      title: "Report Issue",
      description: "Report a missed pickup or problem",
      icon: AlertTriangle,
      href: "/reports/new",
    },
    {
      title: "View Schedule",
      description: "Check your collection calendar",
      icon: Calendar,
      href: "/schedule",
    },
    {
      title: "My Collections",
      description: "View all collection requests",
      icon: Recycle,
      href: "/collections",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name?.split(" ")[0] || "User"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Collection
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.upcomingCollection
                ? getRelativeDate(stats.upcomingCollection.date)
                : "Not Scheduled"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.upcomingCollection?.time || "Check schedule"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recycling Rate
            </CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recyclingRate}%</div>
            <p className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              Great progress!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Points Earned
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.points}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Redeem for rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CO₂ Saved
            </CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.co2Saved.toFixed(1)} kg
            </div>
            <p className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Collections</CardTitle>
              <CardDescription>Your recent waste collections</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/collections/${activity.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium capitalize">
                          {activity.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                      <StatusBadge status={activity.status} />
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/collections" className="block mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  View All
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collection Summary */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Collection Summary</CardTitle>
            <CardDescription>
              Overview of your waste collection statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCollections}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Collections
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Recycle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.completedCollections}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.pendingCollections}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
