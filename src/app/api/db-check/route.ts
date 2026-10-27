import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

async function testDNS() {
  const results: Record<string, string> = {};
  const hosts = [
    "cluster0.tb1iw3i.mongodb.net",
    "ac-gqziemu-shard-00-00.tb1iw3i.mongodb.net",
    "ac-gqziemu-shard-00-01.tb1iw3i.mongodb.net",
    "ac-gqziemu-shard-00-02.tb1iw3i.mongodb.net",
  ];

  for (const host of hosts) {
    try {
      const dns = await import("dns");
      const addrs = await dns.promises.resolve4(host);
      results[host] = addrs.join(", ");
    } catch (e: any) {
      results[host] = `FAILED: ${e.message}`;
    }
  }

  try {
    const dns = await import("dns");
    const srvRecords = await dns.promises.resolveSrv("_mongodb._tcp.cluster0.tb1iw3i.mongodb.net");
    results["_mongodb._tcp.cluster0.tb1iw3i.mongodb.net"] = srvRecords.map((r) => `${r.name}:${r.port}`).join(", ");
  } catch (e: any) {
    results["_mongodb._tcp.cluster0.tb1iw3i.mongodb.net"] = `FAILED: ${e.message}`;
  }

  return results;
}

export async function GET() {
  const start = Date.now();

  const [dnsResults] = await Promise.all([testDNS()]);

  let connection: any = {};
  try {
    const connected = await connectDB();
    connection = {
      connected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || "N/A",
      duration: Date.now() - start,
      db: mongoose.connection.db?.databaseName || "N/A",
    };
  } catch (e: any) {
    connection = { connected: false, error: e.message, duration: Date.now() - start };
  }

  return NextResponse.json({
    mongooseState: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
    dns: dnsResults,
    connection,
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasSrvUri: !!process.env.MONGODB_SRV_URI,
      dbName: process.env.MONGODB_NAME,
    },
  });
}
