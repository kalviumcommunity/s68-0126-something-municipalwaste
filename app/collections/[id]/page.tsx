"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/app/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils/date";
import { toast } from "@/components/ui/use-toast";

interface Collection {
  id: string;
  wasteType: string;
  status: string;
  priority: string;
  address: string;
  zone: string;
  notes?: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  completedAt: string | null;
  collectorNotes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address: string;
  };
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (sessionStatus === "authenticated") {
      fetchCollection();
    }
  }, [sessionStatus, params.id]);

  const fetchCollection = async () => {
    try {
      const res = await fetch(`/api/collections/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setCollection(data);
        setNewStatus(data.status);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Collection not found",
        });
        router.push("/collections");
      }
    } catch (error) {
      console.error("Failed to fetch collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === collection?.status) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/collections/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Collection status updated",
        });
        fetchCollection();
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading || sessionStatus === "loading") {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  const canUpdateStatus = ["admin", "collector"].includes(
    session?.user?.role || ""
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/collections">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Collection #{collection.id.slice(-8)}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Created {formatDateTime(collection.createdAt)}
                </p>
              </div>
              <StatusBadge status={collection.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Waste Type</h3>
                  <p className="text-sm capitalize">{collection.wasteType}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Pickup Location
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {collection.address}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Zone: {collection.zone}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Priority</h3>
                  <p className="text-sm capitalize">{collection.priority}</p>
                </div>
              </div>

              <div className="space-y-4">
                {collection.scheduledDate && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Scheduled
                    </h3>
                    <p className="text-sm">
                      {formatDateTime(collection.scheduledDate)}
                    </p>
                    {collection.scheduledTime && (
                      <p className="text-sm text-muted-foreground">
                        {collection.scheduledTime}
                      </p>
                    )}
                  </div>
                )}
                {collection.completedAt && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Completed
                    </h3>
                    <p className="text-sm">
                      {formatDateTime(collection.completedAt)}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer
                  </h3>
                  <p className="text-sm">{collection.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {collection.user.email}
                  </p>
                  {collection.user.phone && (
                    <p className="text-sm text-muted-foreground">
                      {collection.user.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {collection.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">
                  {collection.notes}
                </p>
              </div>
            )}

            {collection.collectorNotes && (
              <div>
                <h3 className="font-semibold mb-2">Collector Notes</h3>
                <p className="text-sm text-muted-foreground">
                  {collection.collectorNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {canUpdateStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === collection.status}
                >
                  {updating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
