"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Calendar,
  Recycle,
  Star,
  Truck,
  AlertTriangle,
  BookOpen,
  Loader2,
  TrendingUp,
  Leaf,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const stats = [
  {
    title: "Next Collection",
    value: "Tomorrow",
    description: "8:00 AM - 12:00 PM",
    icon: Calendar,
    trend: null,
  },
  {
    title: "Recycling Rate",
    value: "78%",
    description: "+5% from last month",
    icon: Recycle,
    trend: "up",
  },
  {
    title: "Points Earned",
    value: "1,250",
    description: "Redeem for rewards",
    icon: Star,
    trend: "up",
  },
  {
    title: "CO₂ Saved",
    value: "45 kg",
    description: "This month",
    icon: Leaf,
    trend: "up",
  },
];

const quickActions = [
  {
    title: "Schedule Pickup",
    description: "Request a special waste collection",
    icon: Truck,
  },
  {
    title: "Report Issue",
    description: "Report a missed pickup or problem",
    icon: AlertTriangle,
  },
  {
    title: "View Schedule",
    description: "Check your collection calendar",
    icon: Calendar,
  },
  {
    title: "Recycling Guide",
    description: "Learn what can be recycled",
    icon: BookOpen,
  },
];

const recentActivity = [
  { date: "Feb 1", type: "Recycling", status: "Collected" },
  { date: "Jan 28", type: "General Waste", status: "Collected" },
  { date: "Jan 25", type: "Recycling", status: "Collected" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (status === "loading") {
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

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name?.split(" ")[0] || "User"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Zone A - Downtown</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" && (
                  <TrendingUp className="mr-1 h-3 w-3 text-primary" />
                )}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your waste collection and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-auto justify-start gap-3 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session.user?.image || ""} />
                  <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                    {getInitials(session.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{session.user?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span>January 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="text-primary">Residential</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{activity.type}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {activity.date}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
