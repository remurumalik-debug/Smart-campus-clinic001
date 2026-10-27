import { connectDB } from "@/lib/db";
import { ChatMessage } from "@/models/ChatMessage";
import { auth } from "@/lib/auth";
import { findFAQAnswer } from "@/lib/faq";
import { tryDepartmentInquiry } from "@/lib/departments";
import {
  getBookingSession,
  startBookingSession,
  handleBookingMessage,
  detectBookingIntent,
} from "@/lib/chatBooking";

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";

interface RequestBody {
  message: string;
  chatId: string;
  history?: { role: string; content: string }[];
}

function isPlaceholderKey(key: string | undefined): boolean {
  if (!key) return true;
  const lower = key.toLowerCase();
  return lower.includes("placeholder") || lower.includes("your-") || lower === "your-openrouter-api-key-here";
}

function streamTextReply(answer: string, chatId: string, userId: string): Response {
  ChatMessage.create({ userId, chatId, role: "assistant", content: answer }).catch(() => {});

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("data: " + JSON.stringify({ choices: [{ delta: { content: answer } }] }) + "\n\n"));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Chat-Id": chatId,
    },
  });
}

function tryStreamingFallback(message: string, chatId: string, userId: string): Response {
  const faqResult = findFAQAnswer(message);
  const answer = faqResult?.answer ?? (
    "I can help with clinic hours, appointments, common medical questions, and basic wellness advice. For urgent symptoms or emergencies, please contact the clinic or seek emergency care right away. If you tell me your concern, I can guide you to the right next step."
  );

  return streamTextReply(answer, chatId, userId);
}

async function tryOpenRouter(message: string, history: { role: string; content: string }[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (isPlaceholderKey(apiKey)) return null;

  const systemMsg = {
    role: "system",
    content:
      "You are a helpful campus clinic assistant for a university health clinic. " +
      "Answer general medical, wellness, and clinic FAQ questions in a friendly, non-diagnostic way. " +
      "You can explain appointment booking steps, clinic services, hours, common symptoms, and simple self-care guidance. " +
      "If a question suggests an emergency, advise the user to seek immediate medical help. " +
      "Do not provide dangerous medical instructions; encourage professional care when needed.",
  };

  const response = await fetch(OPENROUTER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "Campus Clinic",
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      stream: true,
      messages: [
        systemMsg,
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
    }),
  });

  if (!response.ok) return null;
  return response;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, chatId, history = [] } = (await req.json()) as RequestBody;
    const userId = (session.user as any).id;

    // Non-blocking DB save — chatbot responds even if Atlas is down
    const saveMessage = async (role: string, content: string) => {
      try {
        const ok = await connectDB();
        if (!ok) return;
        await ChatMessage.create({ userId, chatId, role, content });
      } catch {
        /* DB unavailable — skip saving */
      }
    };

    saveMessage("user", message);

    const activeBooking = getBookingSession(userId, chatId);
    if (activeBooking) {
      const result = await handleBookingMessage(activeBooking, message);
      if (result.handled) {
        return streamTextReply(result.reply, chatId, userId);
      }
    } else if (detectBookingIntent(message)) {
      const bookingSession = startBookingSession(
        {
          userId,
          userName: (session.user as any).name ?? "Student",
          userEmail: (session.user as any).email ?? "",
        },
        chatId
      );
      const result = await handleBookingMessage(bookingSession, message);
      if (result.handled) {
        return streamTextReply(result.reply, chatId, userId);
      }
    }

    const deptInquiry = await tryDepartmentInquiry(message);
    if (deptInquiry) {
      return streamTextReply(deptInquiry, chatId, userId);
    }

    const faqResult = findFAQAnswer(message);
    if (faqResult) {
      return streamTextReply(faqResult.answer, chatId, userId);
    }

    let openRouterRes: Response | null = null;
    try {
      openRouterRes = await tryOpenRouter(message, history);
    } catch {
      openRouterRes = null;
    }
    if (!openRouterRes) {
      return tryStreamingFallback(message, chatId, userId);
    }

    const response = openRouterRes;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));

            const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
            for (const line of lines) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                const delta =
                  parsed.choices?.[0]?.delta?.content ||
                  parsed.choices?.[0]?.text ||
                  "";
                fullContent += delta;
              } catch {
                /* skip */
              }
            }
          }
        } finally {
          if (fullContent) {
            saveMessage("assistant", fullContent);
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Chat-Id": chatId,
      },
    });
  } catch (err) {
    console.error("[chat] POST error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      return Response.json({ error: "chatId is required" }, { status: 400 });
    }

    const ok = await connectDB();
    if (!ok) return Response.json({ messages: [] });

    const messages = await ChatMessage.find({ userId, chatId })
      .sort({ createdAt: 1 })
      .lean();

    return Response.json({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      return Response.json({ error: "chatId is required" }, { status: 400 });
    }

    const ok = await connectDB();
    if (!ok) return Response.json({ success: true });
    await ChatMessage.deleteMany({ userId, chatId });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
