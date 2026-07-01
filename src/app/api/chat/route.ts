import { connectDB } from "@/lib/db";
import { ChatMessage } from "@/models/ChatMessage";
import { auth } from "@/lib/auth";
import { findFAQAnswer } from "@/lib/faq";

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

function tryStreamingFallback(message: string, chatId: string, userId: string): Response {
  const faqResult = findFAQAnswer(message);
  const answer = faqResult?.answer ?? (
    "I'm sorry, I couldn't find a specific answer to your question. Here are some things I can help with:\n\n" +
    "- Clinic hours and location\n- Booking or cancelling appointments\n- Available services and doctors\n- Emergency procedures\n- Prescriptions and lab tests\n- Mental health services\n\n" +
    "If you need further assistance, please visit the clinic in person or call (123) 456-7890."
  );

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

async function tryOpenRouter(message: string, history: { role: string; content: string }[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (isPlaceholderKey(apiKey)) return null;

  const systemMsg = {
    role: "system",
    content:
      "You are a helpful campus clinic assistant. You help students and staff with " +
      "health-related questions, appointment scheduling, clinic hours, and general campus " +
      "wellness information. Be friendly, concise, and accurate. If you don't know something, " +
      "admit it and suggest the user contact the clinic directly.",
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

    await connectDB();

    await ChatMessage.create({
      userId,
      chatId,
      role: "user",
      content: message,
    });

    const faqResult = findFAQAnswer(message);
    if (faqResult) {
      ChatMessage.create({
        userId, chatId, role: "assistant", content: faqResult.answer,
      }).catch(() => {});

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode("data: " + JSON.stringify({ choices: [{ delta: { content: faqResult.answer } }] }) + "\n\n"));
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

    const openRouterRes = await tryOpenRouter(message, history);
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
          try {
            if (fullContent) {
              await ChatMessage.create({
                userId,
                chatId,
                role: "assistant",
                content: fullContent,
              });
            }
          } catch {
            /* log silently */
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
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      return Response.json({ error: "chatId is required" }, { status: 400 });
    }

    await connectDB();

    const messages = await ChatMessage.find({ chatId })
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

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      return Response.json({ error: "chatId is required" }, { status: 400 });
    }

    await connectDB();
    await ChatMessage.deleteMany({ chatId });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
