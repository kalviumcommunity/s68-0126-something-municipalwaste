"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Settings,
  Database,
  Bell,
  Shield,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const settingsSections = [
    {
      title: "General Settings",
      description: "Configure general application settings",
      icon: Settings,
      items: ["Application name", "Default timezone", "Date format"],
    },
    {
      title: "Collection Settings",
      description: "Manage waste collection configurations",
      icon: Calendar,
      items: [
        "Default collection times",
        "Zone management",
        "Collection types",
      ],
    },
    {
      title: "Notification Settings",
      description: "Configure notification preferences",
      icon: Bell,
      items: ["Email notifications", "Push notifications", "Reminder timings"],
    },
    {
      title: "Security Settings",
      description: "Manage security and authentication",
      icon: Shield,
      items: ["Password policies", "Session timeout", "2FA settings"],
    },
    {
      title: "Database Management",
      description: "Database backup and maintenance",
      icon: Database,
      items: ["Backup schedule", "Data retention", "Export data"],
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure application settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <section.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {section.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="w-full">
                Configure
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Application version and system details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Version</p>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium">Environment</p>
              <p className="text-sm text-muted-foreground">
                {process.env.NODE_ENV}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Database</p>
              <p className="text-sm text-muted-foreground">PostgreSQL</p>
            </div>
            <div>
              <p className="text-sm font-medium">Cache</p>
              <p className="text-sm text-muted-foreground">Redis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
