// Lovable Cloud (Supabase) access: audits, leads, benchmark_items, price_index.
// Every call fails soft: the X-ray must work even if the backend is down.
import { createClient } from "@supabase/supabase-js";
import type { AuditInputs, BenchmarkRow, MenuItem, PriceIndexPoint, XrayResult } from "../engine";
import { toCountry } from "../engine";
import { CONFIG } from "./config";

const key = CONFIG.supabaseKey;
// New-style publishable keys are not JWTs: send them as apikey only.
const fetchWithKey: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
  headers.set("apikey", key);
  return fetch(input, { ...init, headers });
};

export const db = createClient(CONFIG.supabaseUrl, key, {
  global: { fetch: fetchWithKey },
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function loadReferenceData(inputs: AuditInputs): Promise<{ benchmark: BenchmarkRow[]; priceIndex: PriceIndexPoint[] }> {
  const country = toCountry(inputs.country);
  const [b, p] = await Promise.allSettled([
    db.from("benchmark_items").select("city,area,dish_key,dish_name,price,currency,channel,source_url,collected_at").ilike("city", inputs.city.trim()).limit(5000),
    db.from("price_index").select("country,month,value,source").eq("country", country).order("month"),
  ]);
  const benchmark = b.status === "fulfilled" && !b.value.error ? (b.value.data as BenchmarkRow[]).map((r) => ({ ...r, price: Number(r.price) })) : [];
  const priceIndex = p.status === "fulfilled" && !p.value.error ? (p.value.data as PriceIndexPoint[]).map((r) => ({ ...r, value: Number(r.value) })) : [];
  return { benchmark, priceIndex };
}

function shareId() {
  const a = new Uint8Array(10);
  crypto.getRandomValues(a);
  return Array.from(a, (x) => "abcdefghjkmnpqrstuvwxyz23456789"[x % 31]).join("");
}

/** Saves menu items + result. Covers and bill are never stored here. */
export async function saveAudit(inputs: AuditInputs, items: MenuItem[], result: XrayResult): Promise<{ id: string; share: string } | null> {
  const id = crypto.randomUUID();
  const share = shareId();
  const { error } = await db.from("audits").insert({
    id, share_id: share,
    restaurant_name: inputs.restaurantName.slice(0, 200) || "Untitled",
    city: inputs.city, country: inputs.country, currency: inputs.currency, concept: inputs.concept, cuisine: inputs.cuisine,
    items: items.map(({ id: _i, flags: _f, ...rest }) => rest),
    result, inputs: null,
  });
  if (error) { console.warn("[xray] audit not saved", error.message); return null; }
  return { id, share };
}

export async function loadShared(share: string) {
  const { data, error } = await db.rpc("get_shared_audit", { _share_id: share });
  if (error || !data || !data.length) return null;
  return data[0] as { restaurant_name: string; city: string; country: string; currency: string; concept: string; cuisine: string; result: XrayResult; created_at: string };
}

export async function saveLead(auditId: string | null, lead: { name: string; email: string; whatsapp: string }) {
  const { error } = await db.from("leads").insert({
    audit_id: auditId, name: lead.name.trim(), email: lead.email.trim(), whatsapp: lead.whatsapp.trim() || null, consent: true,
  });
  if (error) console.warn("[xray] lead not saved to db", error.message);
  return !error;
}

export async function contributeBenchmarks(rows: BenchmarkRow[]) {
  if (!rows.length) return 0;
  const { error } = await db.from("benchmark_items").insert(rows.slice(0, 200).map((r) => ({ ...r, added_by: "price_check" })));
  if (error) { console.warn("[xray] benchmark rows not saved", error.message); return 0; }
  return rows.length;
}
