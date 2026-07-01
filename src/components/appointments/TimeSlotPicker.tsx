"use client";
import { cn, formatSlotTime } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimeSlotPickerProps {
  selectedDate: string;
  doctorId: string;
  selectedTime: string;
  onSelect: (time: string) => void;
  occupiedSlots: string[];
}

const SLOTS: string[] = [];
for (let h = 8; h < 17; h++) {
  for (let m = 0; m < 60; m += 30) {
    SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

export default function TimeSlotPicker({
  selectedDate,
  doctorId,
  selectedTime,
  onSelect,
  occupiedSlots,
}: TimeSlotPickerProps) {
  if (!selectedDate || !doctorId) {
    return (
      <div className="flex items-center justify-center h-40 text-muted text-sm">
        <Clock className="w-4 h-4 mr-2" />
        Select a date and doctor to view available slots
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {SLOTS.map((time) => {
        const isOccupied = occupiedSlots.includes(time);
        const isSelected = selectedTime === time;

        return (
          <button
            key={time}
            type="button"
            disabled={isOccupied}
            onClick={() => !isOccupied && onSelect(time)}
            className={cn(
              "relative flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-all duration-200 border",
              isSelected && "bg-primary text-white border-primary shadow-sm",
              !isSelected && !isOccupied && "border-border bg-white text-dark hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer",
              isOccupied && "border-border bg-gray-50 text-gray-300 cursor-not-allowed line-through"
            )}
          >
            {formatSlotTime(time)}
            {isOccupied && (
              <span className="absolute -top-1.5 -right-1.5 bg-gray-200 text-gray-500 text-[10px] px-1 py-0.5 rounded-full leading-none">
                Booked
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
