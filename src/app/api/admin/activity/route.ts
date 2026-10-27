import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/models/ActivityLog";
import { auth } from "@/lib/auth";
import { escapeRegex } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ activities: [], total: 0 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const role = searchParams.get("role");
    const action = searchParams.get("action");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (role) filter.actorRole = role;
    if (action) filter.action = action;
    if (search) {
      const safe = escapeRegex(search);
      filter.$or = [
        { actorName: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    const total = await ActivityLog.countDocuments(filter);
    const activities = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ activities, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Failed to fetch activity log", err);
    return NextResponse.json({ activities: [], total: 0, page: 1, totalPages: 0 });
  }
}
