import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_SRV_URI = process.env.MONGODB_SRV_URI || "";

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<boolean> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

let lastFailureTime = 0;
let lastConnectError = "";
const RETRY_COOLDOWN_MS = 30000;
const CONNECT_TIMEOUT_MS = 8000;

const SRV_ECONNREFUSED = "querySrv ECONNREFUSED";

async function tryConnect(uri: string, label: string): Promise<boolean> {
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return true;
  }

  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once("connected", resolve);
      mongoose.connection.once("error", reject);
      setTimeout(() => reject(new Error("Timed out waiting for existing connection")), CONNECT_TIMEOUT_MS);
    });
    cached.conn = mongoose.connection;
    return true;
  }

  try {
    await mongoose.connect(uri, {
      bufferCommands: true,
      serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      heartbeatFrequencyMS: 10000,
    });

    if ((mongoose.connection.readyState as number) !== 1) {
      await new Promise<void>((resolve, reject) => {
        mongoose.connection.once("connected", resolve);
        mongoose.connection.once("error", reject);
        setTimeout(() => reject(new Error("Connection readyState timeout")), CONNECT_TIMEOUT_MS);
      });
    }

    cached.conn = mongoose.connection;
    console.log(`MongoDB connected via ${label}`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${label} failed:`, msg);
    lastConnectError = msg;
    return false;
  }
}

export async function connectDB() {
  if (cached.conn) {
    if (mongoose.connection.readyState === 1) return true;
    cached.conn = null;
    cached.promise = null;
  }

  if (lastFailureTime > 0 && Date.now() - lastFailureTime < RETRY_COOLDOWN_MS) {
    return false;
  }

  if (cached.promise) return cached.promise;

  lastFailureTime = 0;
  cached.promise = (async () => {
    const uris: { uri: string; label: string }[] = [];

    if (MONGODB_URI) uris.push({ uri: MONGODB_URI, label: "URI" });
    if (MONGODB_SRV_URI) uris.push({ uri: MONGODB_SRV_URI, label: "SRV_URI" });

    if (uris.length === 0) {
      console.error("No MongoDB connection string provided");
      lastFailureTime = Date.now();
      cached.promise = null;
      return false;
    }

    for (const { uri, label } of uris) {
      if (cached.conn || mongoose.connection.readyState !== 0) {
        try { await mongoose.disconnect(); } catch { /* ignore */ }
        cached.conn = null;
      }
      const ok = await tryConnect(uri, label);
      if (ok) {
        lastFailureTime = 0;
        return true;
      }
      if (label === "SRV_URI" && lastConnectError.includes(SRV_ECONNREFUSED)) {
        console.warn("SRV DNS blocked on this network, skipping SRV fallback entirely until next cooldown");
        break;
      }
    }

    lastFailureTime = Date.now();
    cached.promise = null;
    return false;
  })();

  return cached.promise;
}

export function getLastConnectError() {
  return lastConnectError;
}

export default connectDB;
