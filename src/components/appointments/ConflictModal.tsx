"use client";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Clock, AlertTriangle } from "lucide-react";
import { formatSlotTime } from "@/lib/utils";

interface ConflictModalProps {
  open: boolean;
  onClose: () => void;
  suggestedSlots: { time: string; date: string }[];
  onSelectSlot: (slot: { time: string; date: string }) => void;
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
  onSelectSlot,
}: ConflictModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Time Slot Unavailable">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            This appointment slot has already been occupied by another patient.
            Please select another available time.
          </p>
        </div>

        {suggestedSlots.length > 0 && (
          <div>
            <p className="text-sm font-medium text-dark mb-3">
              Suggested available slots:
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

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
