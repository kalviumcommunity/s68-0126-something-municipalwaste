"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Gift, Loader2, Star, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  imageUrl?: string;
  terms?: string;
}

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchRewards();
      fetchProfile();
    }
  }, [status, router]);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rewards");
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUserPoints(data.points);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleRedeem = async (rewardId: string, rewardName: string) => {
    setRedeeming(rewardId);
    try {
      const res = await fetch(`/api/rewards/${rewardId}/redeem`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Reward Redeemed!",
          description: `Your code: ${data.code}. Keep it safe!`,
        });
        fetchProfile();
      } else {
        const err = await res.json();
        toast({
          variant: "destructive",
          title: "Redemption Failed",
          description: err.error || "Could not redeem reward",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      voucher:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      discount:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      service:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return colors[category] || colors.voucher;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="h-8 w-8" />
            Rewards
          </h1>
          <p className="text-muted-foreground mt-2">
            Redeem your earned points for exciting rewards
          </p>
        </div>
        <Card className="px-6 py-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Your Points:</span>
            <span className="text-2xl font-bold text-primary">
              {userPoints}
            </span>
          </div>
        </Card>
      </div>

      {rewards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Gift className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rewards available</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for new rewards
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const canAfford = userPoints >= reward.pointsCost;
            const isRedeeming = redeeming === reward.id;

            return (
              <Card
                key={reward.id}
                className={`transition-all ${canAfford ? "hover:shadow-md hover:border-primary/50" : "opacity-75"}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {reward.description}
                      </CardDescription>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCategoryColor(reward.category)}`}
                    >
                      {reward.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-lg font-bold">
                        {reward.pointsCost}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        points
                      </span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!canAfford || isRedeeming}
                      onClick={() => handleRedeem(reward.id, reward.name)}
                    >
                      {isRedeeming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : canAfford ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Redeem
                        </>
                      ) : (
                        "Not enough points"
                      )}
                    </Button>
                  </div>
                  {reward.terms && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {reward.terms}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
