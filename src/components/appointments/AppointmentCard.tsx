"use client";
import { Card, CardContent } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import { Calendar, Clock, User, Stethoscope, FileText } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: {
    _id?: string;
    doctorName: string;
    departmentName: string;
    appointmentDate: string;
    appointmentTime: string;
    symptoms?: string;
    status: string;
  };
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

export default function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
}: AppointmentCardProps) {
  const isPending = appointment.status === "pending";

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <StatusBadge status={appointment.status} />
      </div>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-dark">
          <User className="w-4 h-4 text-primary" />
          <span className="font-semibold">{appointment.doctorName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Stethoscope className="w-4 h-4" />
          <span>{appointment.departmentName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(appointment.appointmentDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock className="w-4 h-4" />
          <span>{formatTime(appointment.appointmentTime)}</span>
        </div>
        {appointment.symptoms && (
          <div className="flex items-start gap-2 text-sm text-muted">
            <FileText className="w-4 h-4 mt-0.5" />
            <span className="line-clamp-2">{appointment.symptoms}</span>
          </div>
        )}
        {isPending && (onCancel || onReschedule) && (
          <div className="flex gap-2 pt-2">
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(appointment._id!)}
              >
                Cancel
              </Button>
            )}
            {onReschedule && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onReschedule(appointment._id!)}
              >
                Reschedule
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
