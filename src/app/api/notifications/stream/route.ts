import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { onNotification, onAppointmentEvent } from "@/lib/notificationEmitter";
import { generateAppointmentReminders } from "@/lib/reminders";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let interval: ReturnType<typeof setInterval>;

      const sendCount = async () => {
        if (closed) return;
        const ok = await connectDB();
        if (!ok) return;
        try {
          const count = await Notification.countDocuments({ userId, read: false, deleted: false });
          const data = JSON.stringify({ type: "count", unreadCount: count });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // silent
        }
        generateAppointmentReminders(userId);
      };

      const cleanupNotification = onNotification((event) => {
        if (closed) return;
        if (event.userId === userId) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ kind: "notification", payload: event })}\n\n`)
          );
        }
        sendCount();
      });

      const cleanupAppointment = onAppointmentEvent((event) => {
        if (closed) return;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ kind: "appointment", payload: event })}\n\n`)
        );
      });

      sendCount();
      interval = setInterval(sendCount, 30000);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        cleanupNotification();
        cleanupAppointment();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
