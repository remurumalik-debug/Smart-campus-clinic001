"use client";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Clock, AlertTriangle, Stethoscope } from "lucide-react";
import { formatSlotTime } from "@/lib/utils";

interface ConflictModalProps {
  open: boolean;
  onClose: () => void;
  suggestedSlots: { time: string; date: string }[];
  doctorAlternatives?: { doctorId: string; doctorName: string; departmentName: string }[];
  message?: string;
  formattedDate?: string;
  formattedTime?: string;
  onSelectSlot: (slot: { time: string; date: string }) => void;
  onSelectDoctor?: (doctor: { doctorId: string; doctorName: string; departmentName: string }) => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function ConflictModal({
  open,
  onClose,
  suggestedSlots,
  doctorAlternatives,
  message,
  formattedDate,
  formattedTime,
  onSelectSlot,
  onSelectDoctor,
}: ConflictModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Time Slot Unavailable">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800 space-y-1">
            {message ? (
              <p>{message}</p>
            ) : (
              <p>
                This appointment slot has already been occupied by another patient.
                Please select another available time.
              </p>
            )}
          </div>
        </div>

        {suggestedSlots.length > 0 && (
          <div>
            <p className="text-sm font-medium text-dark mb-3">
              Here are the nearest available appointment times:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedSlots.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onSelectSlot(slot);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-sm text-primary font-medium hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {formatSlotTime(slot.time)}
                  {slot.date && (
                    <span className="text-xs opacity-75">
                      ({formatDate(slot.date)})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {doctorAlternatives && doctorAlternatives.length > 0 && (
          <div>
            <p className="text-sm font-medium text-dark mb-3">
              Alternatively, you may book with another doctor from the same department:
            </p>
            <div className="flex flex-wrap gap-2">
              {doctorAlternatives.map((doc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onSelectDoctor?.({ doctorId: doc.doctorId, doctorName: doc.doctorName, departmentName: doc.departmentName });
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 text-sm text-blue-700 font-medium hover:bg-blue-100 transition-all duration-200 cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  {doc.doctorName}
                  <span className="text-xs opacity-75">({doc.departmentName})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
