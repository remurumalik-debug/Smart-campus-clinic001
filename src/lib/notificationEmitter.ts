import { EventEmitter } from "events";

export interface NotificationEvent {
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export const NOTIFICATION_EVENT = "notification";

export function emitNotification(event: NotificationEvent) {
  emitter.emit(NOTIFICATION_EVENT, event);
}

export function onNotification(callback: (event: NotificationEvent) => void): () => void {
  emitter.on(NOTIFICATION_EVENT, callback);
  return () => {
    emitter.off(NOTIFICATION_EVENT, callback);
  };
}

export default emitter;
