import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { onNotification, type NotificationEvent } from "@/lib/notificationEmitter";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (data: string) => {
        if (!closed) {
          try {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch {
            /* connection closed */
          }
        }
      };

      const sendUnreadCount = async () => {
        try {
          await connectDB();
          const count = await Notification.countDocuments({ userId, read: false });
          send(JSON.stringify({ type: "count", unreadCount: count }));
        } catch {
          /* silent */
        }
      };

      send(JSON.stringify({ type: "connected", userId }));

      (async () => {
        await connectDB();
        const count = await Notification.countDocuments({ userId, read: false });
        send(JSON.stringify({ type: "count", unreadCount: count }));
      })();

      const unsubscribe = onNotification((event: NotificationEvent) => {
        if (event.userId === userId) {
          sendUnreadCount();
        }
      });

      const heartbeat = setInterval(() => {
        send(JSON.stringify({ type: "heartbeat" }));
      }, 30000);

      req.signal.addEventListener("abort", () => {
        closed = true;
        unsubscribe();
        clearInterval(heartbeat);
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
