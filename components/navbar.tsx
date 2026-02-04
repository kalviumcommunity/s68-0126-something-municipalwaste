"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Recycle, Menu, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard", protected: true },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoading = status === "loading";

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Recycle className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-semibold sm:inline-block">EcoWaste</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            if (link.protected && !session) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors rounded-md",
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session.user?.image || ""}
                      alt={session.user?.name || ""}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(session.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(session.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 pt-4">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    <Recycle className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-semibold">EcoWaste</span>
                </Link>
                <nav className="flex flex-col gap-1 pt-4">
                  {navLinks.map((link) => {
                    if (link.protected && !session) return null;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                          pathname === link.href
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
                {!session && (
                  <div className="flex flex-col gap-2 pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
