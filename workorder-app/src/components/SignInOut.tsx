"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export function SignInOut() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (!session) {
    return (
      <button className="px-3 py-1 rounded border" onClick={() => signIn()}>Belépés</button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{session.user?.email}</span>
      <button className="px-3 py-1 rounded border" onClick={() => signOut()}>Kilépés</button>
    </div>
  );
}