import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const filter: Record<string, unknown> = { userId, deleted: false };
    if (unreadOnly) filter.read = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ userId, read: false, deleted: false }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error("Failed to fetch notifications", err);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ success: true });

    const userId = (session.user as any).id;
    const { id, markAll } = await req.json();

    if (markAll) {
      await Notification.updateMany({ userId, read: false, deleted: false }, { read: true });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    await Notification.findOneAndUpdate({ _id: id, userId }, { read: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update notifications", err);
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ success: true });

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      await Notification.updateMany({ userId, deleted: false }, { deleted: true });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    await Notification.findOneAndUpdate({ _id: id, userId }, { deleted: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete notification", err);
    return NextResponse.json({ success: true });
  }
}
