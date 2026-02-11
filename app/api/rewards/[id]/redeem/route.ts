import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { redeemReward } from "@/lib/utils/rewards";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await redeemReward(session.user.id, id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to redeem reward" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, code: result.code });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    );
  }
}
