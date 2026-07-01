import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatContainer from "@/components/chatbot/ChatContainer";
import StudentPageLayout from "@/components/layout/StudentPageLayout";

export const metadata = {
  title: "Chat Assistant - Campus Clinic",
};

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <StudentPageLayout>
      <ChatContainer />
    </StudentPageLayout>
  );
}
