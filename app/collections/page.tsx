"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Filter, Loader2, Calendar, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/app/components/StatusBadge";
import { formatDate } from "@/lib/utils/date";

interface Collection {
  id: string;
  wasteType: string;
  status: string;
  address: string;
  scheduledDate: string | null;
  createdAt: string;
  user: {
    name: string;
    address: string;
  };
}

export default function CollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchCollections();
    }
  }, [status, statusFilter, router]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all")
        params.append("status", statusFilter);

      const res = await fetch(`/api/collections?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections);
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error);
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

  const getWasteTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      recycling:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      organic:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      hazardous: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      electronic:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      bulk: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return colors[type] || colors.general;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            Manage and track waste collection requests
          </p>
        </div>
        <Link href="/collections/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {collections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating a new collection request
            </p>
            <Link href="/collections/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getWasteTypeColor(collection.wasteType)}`}
                      >
                        {collection.wasteType}
                      </span>
                    </div>
                    <StatusBadge status={collection.status} />
                  </div>
                  <CardTitle className="text-lg mt-2">
                    Collection #{collection.id.slice(-6)}
                  </CardTitle>
                  <CardDescription>
                    Created {formatDate(collection.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground line-clamp-2">
                      {collection.address}
                    </span>
                  </div>
                  {collection.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Scheduled: {formatDate(collection.scheduledDate)}
                      </span>
                    </div>
                  )}
                  {session?.user?.role !== "user" && (
                    <div className="text-sm text-muted-foreground pt-2 border-t">
                      Customer: {collection.user?.name || "N/A"}
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
