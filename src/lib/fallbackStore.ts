import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

interface FallbackUserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  matricNo?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

interface FallbackAdminRecord {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "clinic_staff";
  securityKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FallbackStore {
  users: FallbackUserRecord[];
  admins: FallbackAdminRecord[];
}

const storePath = path.join(process.cwd(), ".data", "fallback-store.json");

function buildDefaultStore(): FallbackStore {
  return { users: [], admins: [] };
}

async function ensureStoreFile(): Promise<FallbackStore> {
  try {
    await fs.mkdir(path.dirname(storePath), { recursive: true });
    const raw = await fs.readFile(storePath, "utf8");
    if (!raw.trim()) {
      await fs.writeFile(storePath, JSON.stringify(buildDefaultStore(), null, 2));
      return buildDefaultStore();
    }
    return JSON.parse(raw) as FallbackStore;
  } catch {
    const initial = buildDefaultStore();
    await fs.writeFile(storePath, JSON.stringify(initial, null, 2));
    return initial;
  }
}

async function saveStore(store: FallbackStore) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2));
}

export async function findFallbackUserByEmail(email: string) {
  const store = await ensureStoreFile();
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createFallbackUser(input: {
  name: string;
  email: string;
  password: string;
  role: string;
  matricNo?: string;
  department?: string;
}) {
  const store = await ensureStoreFile();
  const existing = store.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
  if (existing) return existing;

  const record: FallbackUserRecord = {
    id: `fallback-${Date.now()}`,
    name: input.name,
    email: input.email,
    password: await bcrypt.hash(input.password, 12),
    role: input.role,
    matricNo: input.matricNo,
    department: input.department,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.users.push(record);
  await saveStore(store);
  return record;
}

export async function findFallbackAdminByEmail(email: string) {
  const store = await ensureStoreFile();
  return store.admins.find((admin) => admin.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function upsertFallbackAdmin(input: {
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "clinic_staff";
  securityKey: string;
  isActive?: boolean;
}) {
  const store = await ensureStoreFile();
  const existingIndex = store.admins.findIndex((admin) => admin.email.toLowerCase() === input.email.toLowerCase());
  const now = new Date().toISOString();
  const record: FallbackAdminRecord = {
    id: existingIndex >= 0 ? store.admins[existingIndex].id : `fallback-admin-${Date.now()}`,
    fullName: input.fullName,
    email: input.email,
    password: await bcrypt.hash(input.password, 12),
    role: input.role,
    securityKey: await bcrypt.hash(input.securityKey, 12),
    isActive: input.isActive ?? true,
    createdAt: existingIndex >= 0 ? store.admins[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    store.admins[existingIndex] = record;
  } else {
    store.admins.push(record);
  }

  await saveStore(store);
  return record;
}
