"use client";

import { signOut } from "next-auth/react";

interface SignOutButtonProps {
  className?: string;
  label?: string;
}

export default function SignOutButton({ className, label = "Sign Out" }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className={className}
    >
      {label}
    </button>
  );
}
