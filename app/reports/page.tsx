"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Loader2, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/app/components/StatusBadge";
import { formatDate } from "@/lib/utils/date";

interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  status: string;
  priority: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchReports();
    }
  }, [status, router]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getReportTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      missed_collection:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      damaged_bin:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      illegal_dumping:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Report issues and track their resolution
          </p>
        </div>
        <Link href="/reports/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Report an issue to help us improve our service
            </p>
            <Link href="/reports/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getReportTypeColor(report.type)}`}
                        >
                          {report.type.replace("_", " ")}
                        </span>
                        <StatusBadge status={report.status} />
                      </div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {report.description}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      {formatDate(report.createdAt)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {report.location}
                  </div>
                  {session?.user?.role !== "user" && (
                    <div className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                      Reported by: {report.user?.name || "N/A"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
