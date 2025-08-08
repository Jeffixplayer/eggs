"use client";
import { Suspense, FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: true, callbackUrl });
    if (!res?.ok) setError("Hibás bejelentkezés");
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-semibold mb-4">Bejelentkezés</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="border rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="border rounded px-3 py-2" type="password" placeholder="Jelszó" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white rounded px-3 py-2">Belépés</button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}> 
      <LoginForm />
    </Suspense>
  );
}