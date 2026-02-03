"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Recycle, Truck, Leaf, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const services = [
  {
    icon: Truck,
    title: "Waste Collection",
    description:
      "Reliable door-to-door waste pickup services with real-time tracking.",
  },
  {
    icon: Recycle,
    title: "Recycling",
    description:
      "Smart segregation and recycling services to minimize landfill waste.",
  },
  {
    icon: Leaf,
    title: "Green Initiatives",
    description:
      "Community composting programs and eco-friendly waste solutions.",
  },
];

const stats = [
  { value: "98%", label: "Collection Rate" },
  { value: "45K+", label: "Households Served" },
  { value: "30%", label: "Waste Recycled" },
];

export default function WasteHome() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Sustainable waste management
              </span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Clean City. <span className="text-primary">Better Future.</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              Efficient, transparent, and eco-friendly municipal waste
              management for a sustainable tomorrow.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {session ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Our Services
            </h2>
            <p className="text-muted-foreground">
              Comprehensive waste management solutions designed for modern
              communities.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.title}
                className="group transition-all hover:shadow-md hover:border-primary/50"
              >
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Ready to make a difference?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of households committed to sustainable waste
              management.
            </p>
            {!session && (
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-primary" />
              <span className="font-semibold">EcoWaste</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EcoWaste. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
