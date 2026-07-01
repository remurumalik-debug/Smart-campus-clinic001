import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BookingForm from "@/components/appointments/BookingForm";
import StudentPageLayout from "@/components/layout/StudentPageLayout";

export default async function BookingPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "student") {
    redirect("/login");
  }

  return (
    <StudentPageLayout>
      <div className="max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-dark">Book an Appointment</h1>
          <p className="text-sm text-muted mt-1">Schedule your visit to the campus clinic</p>
        </div>
        <BookingForm />
      </div>
    </StudentPageLayout>
  );
}
