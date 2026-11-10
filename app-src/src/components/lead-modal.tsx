import { useState } from "react";
import { useXray } from "../lib/store";
import { saveAudit, saveLead } from "../lib/db";
import { emailLead } from "../lib/notify";
import { CONFIG } from "../lib/config";

export function LeadModal({ onClose }: { onClose: () => void }) {
  const { s, set } = useXray();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [consent, setConsent] = useState(false);
  const [share, setShare] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const hasNumbers = !!(s.inputs.coversPerWeek && s.inputs.avgBill);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!s.result) return;
    if (!consent) { setErr("Please tick the box so we can email you."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErr("Check your email address."); return; }
    setBusy(true); setErr(null);
    let audit = s.audit;
    if (!audit) { audit = await saveAudit(s.inputs, s.items, s.result); if (audit) set({ audit }); }
    const shareUrl = audit ? `${location.origin}/app/x/${audit.share}` : null;
    const [dbOk, mailOk] = await Promise.all([
      saveLead(audit?.id ?? null, { name, email, whatsapp: wa }),
      emailLead({ name, email, whatsapp: wa, inputs: s.inputs, result: s.result, shareUrl, includeNumbers: share && hasNumbers, menuText: s.menuText }),
    ]);
    setBusy(false);
    if (!dbOk && !mailOk) { setErr(`Something went wrong sending this. Email us at ${CONFIG.contactEmail} and we'll do it by hand.`); return; }
    setDone(true);
  }

  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="lead-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="x" onClick={onClose} aria-label="Close">×</button>
        {done ? (
          <>
            <span className="label">Request received</span>
            <h2 id="lead-title">Your scorecard is <em>on its way</em>.</h2>
            <p style={{ marginTop: 16 }}>Piyush reviews every X-ray himself and sends your full PDF scorecard within 48 hours, with the fixes put in order and priced.</p>
            <p className="hint" style={{ marginTop: 16 }}>Replies come from {CONFIG.contactEmail}. Add it to your contacts so it doesn't land in spam.</p>
            <div className="actions"><button className="btn" onClick={onClose}>Back to my X-ray</button></div>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <span className="label">Full PDF scorecard · free</span>
            <h2 id="lead-title">Get the <em>full</em> scorecard.</h2>
            <p className="muted" style={{ marginTop: 12, fontSize: 15 }}>A 2-page PDF, checked by a menu engineer, with every fix ranked and priced.</p>
            <label className="field"><span className="label">Your name</span><input className="input" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
            <label className="field"><span className="label">Email</span><input className="input" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            <label className="field"><span className="label">WhatsApp (optional)</span><input className="input" type="tel" maxLength={40} value={wa} onChange={(e) => setWa(e.target.value)} autoComplete="tel" placeholder="+971 …" /></label>
            {hasNumbers && (
              <label className="check"><input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} /><span>Share my covers and average bill with PIHOCO so the scorecard can price every fix. Otherwise they stay in this browser.</span></label>
            )}
            <label className="check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Email me my scorecard. PIHOCO may follow up about it; I can opt out any time. <a href="/privacy.html" target="_blank" rel="noreferrer">Privacy</a></span></label>
            {err && <p className="notice notice--leak">{err}</p>}
            <div className="actions"><button className="btn btn--block" disabled={busy}>{busy ? "Sending…" : "Send my scorecard"}</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
