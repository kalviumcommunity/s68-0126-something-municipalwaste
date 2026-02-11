import { prisma } from "@/lib/db";

const POINTS_PER_COLLECTION = 10;
const POINTS_PER_RECYCLING = 20;
const POINTS_PER_REPORT = 5;

export async function awardPoints(
  userId: string,
  points: number,
  reason: string
) {
  try {
    await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: { points: { increment: points } },
      }),
      prisma.notification.create({
        data: {
          userId,
          type: "reward_earned",
          title: "Points Earned!",
          message: `You earned ${points} points for ${reason}`,
        },
      }),
    ]);

    return true;
  } catch (error) {
    console.error("Error awarding points:", error);
    return false;
  }
}

export function calculateCollectionPoints(wasteType: string): number {
  switch (wasteType) {
    case "recycling":
      return POINTS_PER_RECYCLING;
    case "organic":
      return 15;
    default:
      return POINTS_PER_COLLECTION;
  }
}

export function calculateCO2Savings(
  wasteType: string,
  weight?: number
): number {
  // Simplified calculation - CO2 saved in kg
  const baseWeight = weight || 5; // Default 5kg if not specified

  switch (wasteType) {
    case "recycling":
      return baseWeight * 0.8; // 0.8 kg CO2 per kg recycled
    case "organic":
      return baseWeight * 0.3; // 0.3 kg CO2 per kg composted
    default:
      return baseWeight * 0.1;
  }
}

export async function redeemReward(userId: string, rewardId: string) {
  try {
    const [user, reward] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      }),
      prisma.reward.findUnique({
        where: { id: rewardId },
      }),
    ]);

    if (!user || !reward) {
      throw new Error("User or reward not found");
    }

    if (user.points < reward.pointsCost) {
      throw new Error("Insufficient points");
    }

    // Generate unique redemption code
    const code = `RWD${Date.now().toString(36).toUpperCase()}`;

    // Create redemption and deduct points in a transaction
    await prisma.$transaction([
      prisma.rewardRedemption.create({
        data: {
          userId,
          rewardId,
          points: reward.pointsCost,
          code,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { points: { decrement: reward.pointsCost } },
      }),
      prisma.notification.create({
        data: {
          userId,
          type: "reward_earned",
          title: "Reward Redeemed!",
          message: `You've redeemed ${reward.name}. Your code: ${code}`,
          link: "/profile/rewards",
        },
      }),
    ]);

    return { success: true, code };
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return { success: false, error: (error as Error).message };
  }
}
