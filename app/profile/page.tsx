"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateUserSchema, type UpdateUser } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2, User, Star, Award } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  zone?: string;
  points: number;
  createdAt: string;
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        reset({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          zone: data.zone || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateUser) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });

      fetchProfile();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
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

  if (!profile) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    <User className="mr-1 h-3 w-3" />
                    {profile.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Points</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {profile.points}
                  </span>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <Award className="h-4 w-4 inline mr-1" />
                  Member since {new Date(profile.createdAt).getFullYear()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="Your phone number"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Your address"
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Input
                    id="zone"
                    {...register("zone")}
                    placeholder="Your zone (e.g., Zone A)"
                  />
                  {errors.zone && (
                    <p className="text-sm text-destructive">
                      {errors.zone.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={updating}>
                  {updating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
