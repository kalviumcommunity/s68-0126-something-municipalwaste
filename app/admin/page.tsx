"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ROLES = ["admin", "collector", "user"] as const;

const roleBadgeColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  collector: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  user: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const roleDescriptions: Record<string, string> = {
  admin: "Full access — can manage users, settings, and all data",
  collector: "Can view collections, reports, and dashboard",
  user: "Basic access — dashboard only",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        if (res.status === 403) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data.users);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      fetchUsers();
    }
  }, [status, session, router, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    setError("");
    setSuccess("");
    setOpenDropdown(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update role");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setSuccess(`${data.user.name}'s role updated to ${newRole}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage user roles and access permissions
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Role legend */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Roles</CardTitle>
          <CardDescription>
            Each role determines what a user can access
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {ROLES.map((role) => (
            <div key={role} className="rounded-lg border p-3">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadgeColors[role]}`}
              >
                {role}
              </span>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {roleDescriptions[role]}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Users list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">
                All Users ({users.length})
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No users found
            </p>
          ) : (
            <div className="space-y-1">
              {users.map((user, idx) => (
                <div key={user.id}>
                  <div className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {user.name}
                          {user.id === session?.user?.id && (
                            <span className="ml-1.5 text-xs text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      {user.id === session?.user?.id ? (
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${roleBadgeColors[user.role]}`}
                        >
                          {user.role}
                        </span>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            disabled={updating === user.id}
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === user.id ? null : user.id
                              )
                            }
                          >
                            {updating === user.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleBadgeColors[user.role]}`}
                                >
                                  {user.role}
                                </span>
                                <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </Button>

                          {openDropdown === user.id && (
                            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md">
                              {ROLES.filter((r) => r !== user.role).map(
                                (role) => (
                                  <button
                                    key={role}
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                    onClick={() =>
                                      handleRoleChange(user.id, role)
                                    }
                                  >
                                    <span
                                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleBadgeColors[role]}`}
                                    >
                                      {role}
                                    </span>
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {idx < users.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
