import { connectDB } from "./db";
import { Department } from "@/models/Department";
import { escapeRegex } from "./utils";

export interface DepartmentSummary {
  name: string;
  description: string;
}

const DEPARTMENT_INFO: Record<string, string> = {
  "general medicine": "Handles everyday health concerns — common illnesses like colds, flu, fever, infections, minor injuries, and routine check-ups. It's the best first stop when you're not sure which department you need.",
  "pediatrics": "Provides medical care for infants, children, and adolescents, including growth and development checks, childhood illnesses, and routine vaccinations.",
  "obstetrics & gynecology (ob/gyn)": "Focuses on women's reproductive health — menstrual problems, period pain, pregnancy care, and gynecological check-ups.",
  "general surgery": "Deals with conditions that may require surgical treatment, including minor procedures, wound care, and pre/post-surgical follow-up.",
  "orthopedics": "Treats bone, joint, and muscle problems — fractures, sprains, back and neck pain, sports injuries, and rehabilitation.",
  "cardiology": "Specializes in heart and blood vessel health — chest pain, palpitations, high blood pressure, and heart-related conditions.",
  "neurology": "Deals with the brain, spinal cord, and nervous system — headaches, migraines, dizziness, seizures, and nerve problems.",
  "dermatology": "Treats skin, hair, and nail conditions — rashes, acne, eczema, allergies, and skin infections.",
  "ophthalmology": "Specializes in eye care — vision problems, eye infections, red or irritated eyes, and routine eye examinations.",
  "ear, nose & throat (ent)": "Treats conditions of the ear, nose, and throat — earaches, sinus issues, sore throats, tonsillitis, and hearing problems.",
  "psychiatry": "Provides mental health care — anxiety, depression, stress management, and confidential counseling.",
  "emergency medicine": "Handles urgent and serious medical situations that need immediate attention during clinic hours.",
};

const DEPARTMENT_SHORT: Record<string, string> = {
  "general medicine": "common illnesses, check-ups & general health",
  "pediatrics": "medical care for children & teens",
  "obstetrics & gynecology (ob/gyn)": "women's reproductive health",
  "general surgery": "surgical procedures & wound care",
  "orthopedics": "bones, joints & muscles",
  "cardiology": "heart & blood pressure",
  "neurology": "brain & nervous system",
  "dermatology": "skin, hair & nails",
  "ophthalmology": "eye care",
  "ear, nose & throat (ent)": "ear, nose & throat conditions",
  "psychiatry": "mental health & counseling",
  "emergency medicine": "urgent care",
};

const DEPARTMENT_ALIASES: Record<string, string[]> = {
  "obstetrics & gynecology": ["ob/gyn", "obgyn", "ob-gyn", "gyn", "gynecology", "obstetrics", "women's health", "womens health"],
  "ear, nose & throat": ["ent", "ear nose throat", "ear nose & throat"],
  "general medicine": ["family medicine", "general practice"],
  "emergency medicine": ["urgent care", "emergency room"],
  "ophthalmology": ["eye care", "eye clinic"],
  "psychiatry": ["mental health", "counseling", "psychology", "psychiatrist"],
  "neurology": ["nervous system"],
  "cardiology": ["heart health"],
  "orthopedics": ["ortho", "orthopaedic"],
  "dermatology": ["skin care"],
  "pediatrics": ["pediatric", "children's health"],
};

const STATIC_DEPARTMENTS: DepartmentSummary[] = [
  { name: "General Medicine", description: DEPARTMENT_INFO["general medicine"] },
  { name: "Pediatrics", description: DEPARTMENT_INFO["pediatrics"] },
  { name: "Obstetrics & Gynecology (OB/GYN)", description: DEPARTMENT_INFO["obstetrics & gynecology (ob/gyn)"] },
  { name: "General Surgery", description: DEPARTMENT_INFO["general surgery"] },
  { name: "Orthopedics", description: DEPARTMENT_INFO["orthopedics"] },
  { name: "Cardiology", description: DEPARTMENT_INFO["cardiology"] },
  { name: "Neurology", description: DEPARTMENT_INFO["neurology"] },
  { name: "Dermatology", description: DEPARTMENT_INFO["dermatology"] },
  { name: "Ophthalmology", description: DEPARTMENT_INFO["ophthalmology"] },
  { name: "Ear, Nose & Throat (ENT)", description: DEPARTMENT_INFO["ear, nose & throat (ent)"] },
  { name: "Psychiatry", description: DEPARTMENT_INFO["psychiatry"] },
  { name: "Emergency Medicine", description: DEPARTMENT_INFO["emergency medicine"] },
];

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function matchNamesFor(name: string): string[] {
  const norm = normalizeName(name);
  const set = new Set<string>([name.toLowerCase(), norm]);
  const aliases = DEPARTMENT_ALIASES[norm] ?? [];
  for (const alias of aliases) {
    set.add(alias.toLowerCase());
  }
  return Array.from(set);
}

function matchesText(text: string, names: string[]): boolean {
  return names.some((n) => new RegExp(`\\b${escapeRegex(n)}\\b`, "i").test(text));
}

export function getDepartmentDescription(name: string, dbDescription?: string): string {
  return DEPARTMENT_INFO[name.toLowerCase()] ?? dbDescription ?? `${name} department`;
}

export function getDepartmentShort(name: string, dbDescription?: string): string {
  return DEPARTMENT_SHORT[name.toLowerCase()] ?? dbDescription ?? name;
}

export async function getDepartments(): Promise<DepartmentSummary[]> {
  const ok = await connectDB();
  if (!ok) return STATIC_DEPARTMENTS;
  try {
    const dbDepts = await Department.find({ isActive: true }).select("name description").lean();
    if (dbDepts.length > 0) {
      return dbDepts.map((d) => ({
        name: d.name,
        description: getDepartmentDescription(d.name, d.description),
      }));
    }
    return STATIC_DEPARTMENTS;
  } catch {
    return STATIC_DEPARTMENTS;
  }
}

export async function getAllDepartmentsInfo(): Promise<string> {
  const depts = await getDepartments();
  if (depts.length === 0) {
    return "No departments are currently listed. Please check back later or contact the clinic for more information.";
  }
  const lines = depts.map((d, i) => `${i + 1}. **${d.name}** — ${d.description}`);
  return (
    "Here are the departments at the campus clinic and what they do:\n\n" +
    lines.join("\n") +
    "\n\nYou can book an appointment in any of these departments right here in the chat. Just say **\"book an appointment\"** and I'll guide you through it."
  );
}

export async function getDepartmentInfoFor(text: string): Promise<string | null> {
  const depts = await getDepartments();
  if (depts.length === 0) return null;
  const matched = depts.find((d) => matchesText(text, matchNamesFor(d.name)));
  if (!matched) return null;
  return (
    `**${matched.name}** — ${matched.description}\n\n` +
    `To book an appointment in this department, just say **\"book an appointment\"** and I'll walk you through it.`
  );
}

export async function tryDepartmentInquiry(text: string): Promise<string | null> {
  const lower = text.toLowerCase().trim();
  if (!lower) return null;
  const specific = await getDepartmentInfoFor(text);
  if (specific) return specific;
  if (/\bdepartment(s)?\b/.test(lower)) {
    return getAllDepartmentsInfo();
  }
  return null;
}
