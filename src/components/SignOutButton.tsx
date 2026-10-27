"use client";

import { signOut } from "next-auth/react";

interface SignOutButtonProps {
  className?: string;
  label?: string;
  callbackUrl?: string;
}

export default function SignOutButton({ className, label = "Sign Out", callbackUrl = "/" }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl })}
      className={className}
    >
      {label}
    </button>
  );
}