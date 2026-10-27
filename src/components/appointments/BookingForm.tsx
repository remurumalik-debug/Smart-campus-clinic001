"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button";
import TimeSlotPicker from "./TimeSlotPicker";
import ConflictModal from "./ConflictModal";
import { CalendarDays, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSlotUpdates, SlotEvent } from "@/hooks/useSlotUpdates";

const STEPS = [
  "Department",
  "Doctor",
  "Date",
  "Time",
  "Symptoms",
  "Review",
];

interface Department {
  _id: string;
  name: string;
  description?: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  departmentId: string;
  departmentName: string;
}

interface FormData {
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  symptoms: string;
}

export default function BookingForm() {
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    departmentId: "",
    departmentName: "",
    doctorId: "",
    doctorName: "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
  });
  const [conflictOpen, setConflictOpen] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState<{ time: string; date: string }[]>([]);
  const [doctorAlternatives, setDoctorAlternatives] = useState<{ doctorId: string; doctorName: string; departmentName: string }[]>([]);
  const [conflictMessage, setConflictMessage] = useState("");
  const [conflictFormattedDate, setConflictFormattedDate] = useState("");
  const [conflictFormattedTime, setConflictFormattedTime] = useState("");

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load departments"));
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load doctors"));
  }, []);

  useEffect(() => {
    if (formData.departmentId) {
      setFilteredDoctors(
        doctors.filter((d) => d.departmentId === formData.departmentId)
      );
    } else {
      setFilteredDoctors([]);
    }
  }, [formData.departmentId, doctors]);

  const fetchOccupiedSlots = useCallback(async () => {
    if (!formData.doctorId || !formData.appointmentDate) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/slots?doctorId=${formData.doctorId}&date=${formData.appointmentDate}`
      );
      if (res.ok) {
        const data = await res.json();
        setOccupiedSlots(Array.isArray(data.booked) ? data.booked : []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [formData.doctorId, formData.appointmentDate]);

  useEffect(() => {
    fetchOccupiedSlots();
  }, [fetchOccupiedSlots]);

  const handleSlotEvent = useCallback((event: SlotEvent) => {
    if (event.action === "booked") {
      setOccupiedSlots((prev) => {
        if (prev.includes(event.appointmentTime)) return prev;
        return [...prev, event.appointmentTime];
      });
    } else if (event.action === "cancelled") {
      setOccupiedSlots((prev) => prev.filter((t) => t !== event.appointmentTime));
    }
    if (event.appointmentTime === formData.appointmentTime && event.action === "booked") {
      toast.warning("This time slot has just been booked by another user. Please select another available time.", { duration: 6000 });
      update({ appointmentTime: "" });
    }
    fetchOccupiedSlots();
  }, [formData.appointmentTime, fetchOccupiedSlots]);

  useSlotUpdates(formData.doctorId, formData.appointmentDate, handleSlotEvent);

  const update = (partial: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!formData.departmentId;
      case 1: return !!formData.doctorId;
      case 2: return !!formData.appointmentDate;
      case 3: return !!formData.appointmentTime;
      case 4: return formData.symptoms.trim().length > 0;
      case 5: return true;
      default: return false;
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleSubmit = async () => {
    setSubmitting(true);
    const user = session?.user as any;
    if (!user?.id || !user?.name || !user?.email) {
      toast.error("You must be logged in to book an appointment");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userName: user.name,
          userEmail: user.email,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setSuggestedSlots(data.alternatives || []);
        setDoctorAlternatives(data.doctorAlternatives || []);
        setConflictMessage(data.error || "");
        setConflictFormattedDate(data.formattedDate || "");
        setConflictFormattedTime(data.formattedTime || "");
        setConflictOpen(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to book appointment");
        return;
      }

      toast.success("Appointment booked successfully!");
      setStep(0);
      setFormData({
        departmentId: "",
        departmentName: "",
        doctorId: "",
        doctorName: "",
        appointmentDate: "",
        appointmentTime: "",
        symptoms: "",
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectSuggested = (slot: { time: string; date: string }) => {
    update({ appointmentDate: slot.date, appointmentTime: slot.time });
    setStep(5);
  };

  const handleSelectDoctor = (doctor: { doctorId: string; doctorName: string; departmentName: string }) => {
    update({ doctorId: doctor.doctorId, doctorName: doctor.doctorName, departmentName: doctor.departmentName, appointmentDate: "", appointmentTime: "" });
    setStep(2);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  i < step && "bg-primary text-white",
                  i === step && "bg-primary text-white ring-4 ring-primary/20",
                  i > step && "bg-gray-100 text-gray-400"
                )}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 hidden sm:block",
                  i <= step ? "text-dark font-medium" : "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 rounded",
                  i < step ? "bg-primary" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-card">
        {step === 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-dark">Select Department</h3>
            <div className="grid gap-2">
              {departments
                .filter((d) => d._id)
                .map((dept) => (
                  <button
                    key={dept._id}
                    type="button"
                    onClick={() => {
                      update({
                        departmentId: dept._id,
                        departmentName: dept.name,
                        doctorId: "",
                        doctorName: "",
                        appointmentTime: "",
                      });
                    }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer",
                      formData.departmentId === dept._id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-gray-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        formData.departmentId === dept._id
                          ? "border-primary"
                          : "border-gray-300"
                      )}
                    >
                      {formData.departmentId === dept._id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-dark">{dept.name}</p>
                      {dept.description && (
                        <p className="text-sm text-muted">{dept.description}</p>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-dark">Select Doctor</h3>
            {filteredDoctors.length === 0 ? (
              <p className="text-sm text-muted">
                No doctors available in this department.
              </p>
            ) : (
              <div className="grid gap-2">
                {filteredDoctors.map((doc) => (
                  <button
                    key={doc._id}
                    type="button"
                    onClick={() => {
                      update({
                        doctorId: doc._id,
                        doctorName: doc.name,
                        appointmentTime: "",
                      });
                    }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer",
                      formData.doctorId === doc._id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-gray-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        formData.doctorId === doc._id
                          ? "border-primary"
                          : "border-gray-300"
                      )}
                    >
                      {formData.doctorId === doc._id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-dark">{doc.name}</p>
                      <p className="text-sm text-muted">{doc.specialization}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-dark">Select Date</h3>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
              <input
                type="date"
                min={minDate}
                value={formData.appointmentDate}
                onChange={(e) => {
                  update({ appointmentDate: e.target.value, appointmentTime: "" });
                }}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-border text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <p className="text-xs text-muted">Minimum booking is tomorrow</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-dark">Select Time</h3>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-5 h-5 animate-spin text-muted" />
              </div>
            ) : (
              <TimeSlotPicker
                selectedDate={formData.appointmentDate}
                doctorId={formData.doctorId}
                selectedTime={formData.appointmentTime}
                onSelect={(time) => update({ appointmentTime: time })}
                onOccupiedClick={(time) => toast.error(`This time slot has been booked by another user. Please choose another time slot.`)}
                occupiedSlots={occupiedSlots}
              />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-dark">Describe Symptoms</h3>
            <textarea
              rows={5}
              placeholder="Please describe your symptoms or reason for the visit..."
              value={formData.symptoms}
              onChange={(e) => update({ symptoms: e.target.value })}
              className="w-full rounded-xl border border-border p-4 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dark">Review & Confirm</h3>
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Department</span>
                <span className="font-medium text-dark">{formData.departmentName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Doctor</span>
                <span className="font-medium text-dark">{formData.doctorName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Date</span>
                <span className="font-medium text-dark">
                  {formData.appointmentDate
                    ? new Date(formData.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Time</span>
                <span className="font-medium text-dark">
                  {formData.appointmentTime
                    ? (() => {
                        const [h, m] = formData.appointmentTime.split(":").map(Number);
                        return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
                      })()
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Symptoms</span>
                <span className="font-medium text-dark text-right max-w-[60%]">
                  {formData.symptoms}
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              loading={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (step < STEPS.length - 1) setStep((s) => s + 1);
            }}
            disabled={step >= STEPS.length - 1 || !canProceed()}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ConflictModal
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        suggestedSlots={suggestedSlots}
        doctorAlternatives={doctorAlternatives}
        message={conflictMessage}
        formattedDate={conflictFormattedDate}
        formattedTime={conflictFormattedTime}
        onSelectSlot={handleSelectSuggested}
        onSelectDoctor={handleSelectDoctor}
      />
    </div>
  );
}
