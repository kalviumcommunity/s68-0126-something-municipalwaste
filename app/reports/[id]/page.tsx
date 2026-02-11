"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/app/components/StatusBadge";
import { formatDateTime } from "@/lib/utils/date";
import { toast } from "@/components/ui/use-toast";

interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  status: string;
  priority: string;
  imageUrl?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export default function ReportDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated" && params.id) {
      fetchReport();
    }
  }, [authStatus, params.id, router]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setNewStatus(data.status);
        setResolutionNotes(data.resolutionNotes || "");
      } else {
        router.push("/reports");
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      router.push("/reports");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!report || newStatus === report.status) return;

    setUpdating(true);
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (newStatus === "resolved" && resolutionNotes) {
        body.resolutionNotes = resolutionNotes;
      }

      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast({
          title: "Report Updated",
          description: `Status changed to ${newStatus}`,
        });
        fetchReport();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update report",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const isAdminOrCollector =
    session?.user?.role === "admin" || session?.user?.role === "collector";

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

  const formatType = (type: string) => type.replace(/_/g, " ");

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href="/reports"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Reports
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{report.title}</h1>
              <StatusBadge status={report.status} />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getReportTypeColor(report.type)}`}
              >
                {formatType(report.type)}
              </span>
              <Badge variant="outline" className="capitalize">
                {report.priority} priority
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            ID: {report.id.slice(-8)}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Report Details */}
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm">{report.description}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Location
                  </p>
                  <p className="text-sm">{report.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Reported
                  </p>
                  <p className="text-sm">{formatDateTime(report.createdAt)}</p>
                </div>
              </div>
              {report.resolvedAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Resolved
                    </p>
                    <p className="text-sm">
                      {formatDateTime(report.resolvedAt)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reporter Info */}
          <Card>
            <CardHeader>
              <CardTitle>Reporter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {report.user.name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {report.user.email}
                  </p>
                  {report.user.phone && (
                    <p className="text-xs text-muted-foreground">
                      {report.user.phone}
                    </p>
                  )}
                </div>
              </div>

              {report.resolutionNotes && (
                <div className="mt-4 p-3 rounded-lg border bg-muted/30">
                  <p className="text-sm font-medium mb-1">Resolution Notes</p>
                  <p className="text-sm text-muted-foreground">
                    {report.resolutionNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin/Collector Actions */}
        {isAdminOrCollector && report.status !== "resolved" && (
          <Card>
            <CardHeader>
              <CardTitle>Update Report</CardTitle>
              <CardDescription>
                Change the status or add resolution notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="investigating">
                        Investigating
                      </SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newStatus === "resolved" && (
                  <div>
                    <Label htmlFor="notes">Resolution Notes</Label>
                    <Input
                      id="notes"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe how the issue was resolved"
                    />
                  </div>
                )}
              </div>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === report.status}
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
