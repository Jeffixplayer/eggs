"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit() {
    const res = await fetch("/api/workorders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, customerName, description }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/workorders/${data.id}`);
    }
  }

  return (
    <div className="space-y-3 max-w-2xl">
      <h1 className="text-xl font-semibold">Új munkalap</h1>
      <input className="border rounded px-3 py-2 w-full" placeholder="Cím" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="border rounded px-3 py-2 w-full" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input className="border rounded px-3 py-2 w-full" placeholder="Ügyfél neve" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      <textarea className="border rounded px-3 py-2 w-full" placeholder="Leírás" value={description} onChange={(e) => setDescription(e.target.value)} />
      <button onClick={onSubmit} className="bg-black text-white rounded px-3 py-2">Létrehozás</button>
    </div>
  );
}