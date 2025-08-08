"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const sigRef = useRef<SignatureCanvas | null>(null);

  async function load() {
    const res = await fetch(`/api/workorders/${id}`);
    const data = await res.json();
    setOrder(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, [id]);

  async function save(changes: any) {
    const res = await fetch(`/api/workorders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    if (res.ok) load();
  }

  async function saveSignature() {
    const imageData = sigRef.current?.getTrimmedCanvas().toDataURL("image/png");
    if (!imageData) return;
    await fetch(`/api/workorders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature: { signer: "CUSTOMER", imageData } }),
    });
    await load();
  }

  if (loading) return <div>Betöltés…</div>;
  if (!order) return <div>Nem található</div>;

  return (
    <div className="space-y-3 max-w-2xl">
      <h1 className="text-xl font-semibold">{order.title}</h1>
      <div className="text-sm text-gray-600">{order.customerName} • {new Date(order.date).toLocaleDateString()}</div>
      <textarea className="border rounded px-3 py-2 w-full" defaultValue={order.description ?? ""} onBlur={(e) => save({ description: e.target.value })} />
      <textarea className="border rounded px-3 py-2 w-full" placeholder="Belső megjegyzés" defaultValue={order.internalNote ?? ""} onBlur={(e) => save({ internalNote: e.target.value })} />

      <div className="flex gap-2 items-center">
        <span>Státusz:</span>
        <select defaultValue={order.status} className="border px-2 py-1 rounded" onChange={(e) => save({ status: e.target.value })}>
          <option value="IN_PROGRESS">Folyamatban</option>
          <option value="DONE">Kész</option>
        </select>
      </div>

      <div>
        <h2 className="font-medium">Ügyfél aláírás</h2>
        <div className="border rounded">
          <SignatureCanvas ref={sigRef as any} penColor="black" canvasProps={{ width: 400, height: 200, className: "sigCanvas" }} />
        </div>
        <div className="flex gap-2 mt-2">
          <button className="border px-3 py-1 rounded" onClick={() => sigRef.current?.clear()}>Törlés</button>
          <button className="bg-black text-white px-3 py-1 rounded" onClick={saveSignature}>Mentés</button>
        </div>
        {order.signatures?.length > 0 && <img src={order.signatures[0].imageData} alt="alairas" className="mt-2 border rounded" width={300} />}
      </div>
    </div>
  );
}