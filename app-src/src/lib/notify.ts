// Emails each lead to PIHOCO through Web3Forms (same inbox as the website forms).
import type { AuditInputs, XrayResult } from "../engine";
import { CONFIG } from "./config";
import { money } from "./format";

export async function emailLead(p: {
  name: string; email: string; whatsapp: string; inputs: AuditInputs; result: XrayResult;
  shareUrl: string | null; includeNumbers: boolean; menuText: string;
}): Promise<boolean> {
  const r = p.result;
  const top = r.findings.slice(0, 5).map((f, i) => `${i + 1}. ${f.title}${f.money ? ` (${money(f.money.low, r.currency)}–${money(f.money.high, r.currency)}/mo)` : ""}`).join("\n");
  const body = {
    access_key: CONFIG.web3formsKey,
    subject: `Menu X-ray lead: ${p.inputs.restaurantName || "Untitled"} (${p.inputs.city}) scored ${r.score}`,
    from_name: "PIHOCO Menu X-ray",
    name: p.name, email: p.email, replyto: p.email,
    whatsapp: p.whatsapp || "—",
    restaurant: p.inputs.restaurantName, city: [p.inputs.area, p.inputs.city].filter(Boolean).join(", "), country: p.inputs.country,
    concept: p.inputs.concept, cuisine: p.inputs.cuisine,
    score: `${r.score}/100 (assessed ${r.assessed} of ${r.total})`,
    verdict: r.verdict,
    top_findings: top || "—",
    covers_and_bill: p.includeNumbers && p.inputs.coversPerWeek && p.inputs.avgBill
      ? `${p.inputs.coversPerWeek} covers/week, average bill ${p.inputs.avgBill} ${r.currency}, last price change ${p.inputs.lastPriceChange || "not given"}`
      : "Not shared",
    shared_result: p.shareUrl || "Not saved",
    menu_text: p.menuText.slice(0, 6000),
    botcheck: "",
  };
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    return res.ok && j.success !== false;
  } catch {
    return false;
  }
}
