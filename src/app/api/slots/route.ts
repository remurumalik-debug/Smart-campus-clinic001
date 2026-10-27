import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/booking";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");

    if (!doctorId || !date) {
      return NextResponse.json({ error: "doctorId and date are required" }, { status: 400 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ slots: [] });

    const result = await getAvailableSlots(doctorId, date);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to fetch slots", err);
    return NextResponse.json({ slots: [] });
  }
}
