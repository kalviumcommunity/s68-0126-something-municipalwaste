"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDayName } from "@/lib/utils/date";

interface Schedule {
  id: string;
  zone: string;
  wasteType: string;
  dayOfWeek: number;
  timeSlot: string;
}

export default function SchedulePage() {
  const { status } = useSession();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchSchedules();
    }
  }, [status, router]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/schedule");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedSchedules = schedules.reduce(
    (acc, schedule) => {
      const day = getDayName(schedule.dayOfWeek);
      if (!acc[day]) acc[day] = [];
      acc[day].push(schedule);
      return acc;
    },
    {} as Record<string, Schedule[]>
  );

  const daysOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-8 w-8" />
          Collection Schedule
        </h1>
        <p className="text-muted-foreground mt-2">
          View waste collection schedules for your zone
        </p>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No schedules available
            </h3>
            <p className="text-sm text-muted-foreground">
              Check back later for collection schedules in your zone
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {daysOrder.map((day) => {
            const daySchedules = groupedSchedules[day];
            if (!daySchedules || daySchedules.length === 0) return null;

            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                  <CardDescription>
                    {daySchedules.length} collection
                    {daySchedules.length > 1 ? "s" : ""} scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-4 rounded-lg border bg-muted/30"
                      >
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                              Waste Type
                            </span>
                            <p className="text-sm font-medium capitalize">
                              {schedule.wasteType}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                              Time
                            </span>
                            <p className="text-sm font-medium">
                              {schedule.timeSlot}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                              Zone
                            </span>
                            <p className="text-sm font-medium">
                              {schedule.zone}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
