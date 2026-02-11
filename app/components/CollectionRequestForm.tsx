"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  collectionRequestSchema,
  type CollectionRequest,
} from "@/lib/validations/collection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function CollectionRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CollectionRequest>({
    resolver: zodResolver(collectionRequestSchema),
    defaultValues: {
      priority: "normal",
    },
  });

  const wasteType = watch("wasteType");

  const onSubmit = async (data: CollectionRequest) => {
    setLoading(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to create collection request");
      }

      toast({
        title: "Success!",
        description: "Your collection request has been submitted.",
      });

      router.push("/collections");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="wasteType">Waste Type *</Label>
        <Select
          onValueChange={(value) =>
            setValue(
              "wasteType",
              value as
                | "general"
                | "recycling"
                | "organic"
                | "hazardous"
                | "electronic"
                | "bulk"
            )
          }
          value={wasteType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select waste type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Waste</SelectItem>
            <SelectItem value="recycling">Recycling</SelectItem>
            <SelectItem value="organic">Organic</SelectItem>
            <SelectItem value="hazardous">Hazardous</SelectItem>
            <SelectItem value="electronic">Electronic</SelectItem>
            <SelectItem value="bulk">Bulk Items</SelectItem>
          </SelectContent>
        </Select>
        {errors.wasteType && (
          <p className="text-sm text-destructive">{errors.wasteType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Pickup Address *</Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="Enter full pickup address"
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="zone">Zone *</Label>
        <Input
          id="zone"
          {...register("zone")}
          placeholder="e.g., Zone A, Downtown, etc."
        />
        {errors.zone && (
          <p className="text-sm text-destructive">{errors.zone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          onValueChange={(value) =>
            setValue("priority", value as "low" | "normal" | "high" | "urgent")
          }
          defaultValue="normal"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <textarea
          id="notes"
          {...register("notes")}
          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Any special instructions or details..."
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Request
      </Button>
    </form>
  );
}
