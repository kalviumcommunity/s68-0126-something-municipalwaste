"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CollectionRequestForm } from "@/app/components/CollectionRequestForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewCollectionPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <Link href="/collections">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">New Collection Request</CardTitle>
          <CardDescription>
            Submit a request for waste collection. We&apos;ll schedule a pickup
            based on your zone and waste type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CollectionRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
