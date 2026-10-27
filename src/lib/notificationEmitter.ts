import { EventEmitter } from "events";

export interface NotificationEvent {
  _id?: string;
  userId: string;
  userRole: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  notificationType: string;
  link?: string;
  relatedAppointmentId?: string;
  createdAt?: string;
}

export interface AppointmentEvent {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  userId: string;
  action: "booked" | "cancelled" | "updated";
}

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export const NOTIFICATION_EVENT = "notification";
export const APPOINTMENT_EVENT = "appointment";

export function emitNotification(event: NotificationEvent) {
  emitter.emit(NOTIFICATION_EVENT, event);
}

export function emitAppointmentEvent(event: AppointmentEvent) {
  emitter.emit(APPOINTMENT_EVENT, event);
}

export function onNotification(callback: (event: NotificationEvent) => void): () => void {
  emitter.on(NOTIFICATION_EVENT, callback);
  return () => {
    emitter.off(NOTIFICATION_EVENT, callback);
  };
}

export function onAppointmentEvent(callback: (event: AppointmentEvent) => void): () => void {
  emitter.on(APPOINTMENT_EVENT, callback);
  return () => {
    emitter.off(APPOINTMENT_EVENT, callback);
  };
}

export default emitter;
