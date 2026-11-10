import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "../components/brand";
import { COUNTRIES, CONCEPTS } from "../lib/config";
import { useXray } from "../lib/store";
import { detectCurrency, newItem, parseMenu } from "../engine";
import { extractText } from "../lib/extract";

type Tab = "paste" | "upload" | "type";

const SAMPLE = `STARTERS
Paneer Tikka 38
Chicken Tikka 42
Veg Samosa 18
Chilli Chicken 39
MAINS
Dal Tadka 32
Butter Chicken 46
Lamb Rogan Josh 54
Mutton Biryani 52
Chicken Biryani 49
Paneer Butter Masala 44
BREADS
Butter Naan 8
Garlic Naan 10
DRINKS
Masala Chai 12
Sweet Lassi 16
Fresh Lime Soda 14 / 18`;

export default function Start() {
  const { s, set } = useXray();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("paste");
  const [text, setText] = useState(s.menuText);
  const [prog, setProg] = useState<{ p: number; label: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const i = s.inputs;
  const upd = (p: Partial<typeof i>) => set({ inputs: { ...i, ...p } });
  const num = (v: string) => (v.trim() === "" ? null : Math.max(0, Number(v)) || null);

  const detected = text.trim() ? detectCurrency(text) : null;
  const currencyClash = detected && detected !== i.currency;

  async function onFile(f: File | undefined) {
    if (!f) return;
    setErr(null);
    if (f.size > 15 * 1024 * 1024) { setErr("That file is over 15 MB. Try a smaller photo or PDF."); return; }
    try {
      const t = await extractText(f, (p, label) => setProg({ p, label }));
      setText(t); setTab("paste");
      setProg(null);
    } catch (e) {
      setProg(null);
      setErr(e instanceof Error ? e.message : "We couldn't read that file. Try pasting the text instead.");
    }
  }

  function next(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!i.city.trim()) { setErr("Add your city so we compare you with the right market."); return; }
    if (tab === "type") { set({ menuText: "", items: s.items.length ? s.items : [newItem("Mains"), newItem("Mains"), newItem("Mains")], result: null, audit: null }); nav("/review"); return; }
    if (text.trim().length < 10) { setErr("Paste your menu (or upload it) first."); return; }
    const items = parseMenu(text);
    if (!items.length) { setErr("We couldn't find any dishes with prices. Check each dish is on its own line with its price at the end."); return; }
    set({ menuText: text, items, result: null, audit: null });
    nav("/review");
  }

  return (
    <Page step="Step 1 of 3">
      <form className="wrap" onSubmit={next} noValidate>
        <div className="head">
          <span className="label">Menu X-ray</span>
          <h1>Tell us about the <em>place</em>.</h1>
        </div>
        <div className="grid2">
          <label className="field"><span className="label">Restaurant name</span><input className="input" value={i.restaurantName} onChange={(e) => upd({ restaurantName: e.target.value })} maxLength={200} autoComplete="organization" /></label>
          <label className="field"><span className="label">Cuisine</span><input className="input" value={i.cuisine} onChange={(e) => upd({ cuisine: e.target.value })} placeholder="e.g. North Indian" /></label>
          <label className="field"><span className="label">Country</span>
            <select className="select" value={i.country} onChange={(e) => { const c = COUNTRIES.find((x) => x.label === e.target.value)!; upd({ country: c.label, currency: c.currency }); }}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.label}>{c.label} · {c.currency}</option>)}
            </select>
          </label>
          <label className="field"><span className="label">Concept</span>
            <select className="select" value={i.concept} onChange={(e) => upd({ concept: e.target.value })}>
              {CONCEPTS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="field"><span className="label">City</span><input className="input" required value={i.city} onChange={(e) => upd({ city: e.target.value })} placeholder="e.g. Dubai" autoComplete="address-level2" /></label>
          <label className="field"><span className="label">Area or street (optional)</span><input className="input" value={i.area ?? ""} onChange={(e) => upd({ area: e.target.value })} placeholder="e.g. Dubai Marina" /></label>
        </div>

        <div className="tabs" role="tablist">
          {([["paste", "Paste text"], ["upload", "Upload PDF or photo"], ["type", "Type it in"]] as [Tab, string][]).map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className="tab" onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "paste" && (
          <div style={{ marginTop: 20 }}>
            <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder={"MAINS\nButter Chicken 46\nTandoor-charred chicken in a tomato and butter gravy\nDal Makhani 34\n…"} aria-label="Menu text" />
            <p className="hint">One dish per line with its price at the end. Section headings on their own line. Descriptions under the dish are fine. <button type="button" className="link" style={{ fontSize: 10 }} onClick={() => setText(SAMPLE)}>Try a sample menu</button></p>
            {currencyClash && <p className="notice">Your menu shows prices in {detected}, but you picked {i.country} ({i.currency}). Change the country if that's wrong.</p>}
          </div>
        )}
        {tab === "upload" && (
          <div style={{ marginTop: 20 }}>
            <div className={`drop${over ? " is-over" : ""}`} role="button" tabIndex={0}
              onClick={() => fileRef.current?.click()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files[0]); }}>
              <span className="label">PDF, JPG or PNG · up to 15 MB</span>
              <span style={{ fontFamily: "var(--serif)", fontSize: "1.4rem" }}>Drop your menu here, or tap to choose</span>
              <span className="hint">Read on this device. The file is never uploaded.</span>
            </div>
            <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            {prog && <><div className="progress"><i style={{ width: `${Math.round(prog.p * 100)}%` }} /></div><p className="hint">{prog.label}…</p></>}
            <p className="hint">Photos work best straight-on, in good light. Text PDFs read perfectly; fancy fonts in photos may need fixing on the next step.</p>
          </div>
        )}
        {tab === "type" && <p className="hint" style={{ marginTop: 20 }}>You'll add dishes one by one on the next step.</p>}

        <div className="optional">
          <span className="label">Optional · unlocks money estimates</span>
          <p className="hint">Used only for maths, in your browser. Never stored unless you choose to share them later.</p>
          <div className="grid2">
            <label className="field"><span className="label">Covers per week</span><input className="input num" inputMode="numeric" value={i.coversPerWeek ?? ""} onChange={(e) => upd({ coversPerWeek: num(e.target.value) })} placeholder="e.g. 600" /></label>
            <label className="field"><span className="label">Average bill per cover ({i.currency})</span><input className="input num" inputMode="decimal" value={i.avgBill ?? ""} onChange={(e) => upd({ avgBill: num(e.target.value) })} placeholder="e.g. 85" /></label>
            <label className="field"><span className="label">Last time you changed prices</span><input className="input num" type="month" value={i.lastPriceChange ?? ""} onChange={(e) => upd({ lastPriceChange: e.target.value || null })} /></label>
          </div>
        </div>

        {err && <p className="notice notice--leak" role="alert">{err}</p>}
        <div className="actions" style={{ marginBottom: 72 }}><button className="btn" disabled={!!prog}>Read my menu</button></div>
      </form>
    </Page>
  );
}
