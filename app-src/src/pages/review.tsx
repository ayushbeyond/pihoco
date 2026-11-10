import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Page } from "../components/brand";
import { useXray } from "../lib/store";
import { newItem, reviewItem, runXray, type MenuItem } from "../engine";
import { loadReferenceData, saveAudit } from "../lib/db";

export default function Review() {
  const { s, set } = useXray();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  if (!s.inputs.city) return <Navigate to="/start" replace />;
  const items = s.items;
  const setItems = (next: MenuItem[]) => set({ items: next, result: null, audit: null });
  const patch = (id: string, p: Partial<MenuItem>) => setItems(items.map((it) => (it.id === id ? { ...it, ...p } : it)));
  const check = (id: string) => setItems(items.map((it) => (it.id === id ? reviewItem(it) : it)));
  const low = items.filter((i) => i.confidence === "low").length;
  const priced = items.filter((i) => i.price != null && i.name.trim()).length;
  const cats = new Set(items.map((i) => i.category)).size;

  async function run() {
    setBusy(true);
    const data = await loadReferenceData(s.inputs);
    const clean = items.filter((i) => i.name.trim());
    const result = runXray(clean, s.inputs, data);
    set({ items: clean, result, audit: null });
    nav("/result");
    // save in the background so the result can be shared; never blocks the owner
    saveAudit(s.inputs, clean, result).then((audit) => { if (audit) set({ audit }); });
  }

  return (
    <Page step="Step 2 of 3">
      <div className="wrap">
        <div className="head">
          <span className="label">Check what we read</span>
          <h1>Is this your <em>menu</em>?</h1>
          <p>Fix anything we misread: tap a name, price or section to edit it. Rows tinted red need a look.</p>
          <div className="summary num">
            <span className="label">{items.length} rows</span><span className="label">{priced} priced</span><span className="label">{cats} sections</span>
            {low > 0 && <span className="label" style={{ color: "var(--leak)" }}>{low} to check</span>}
          </div>
          <label className="check"><input type="checkbox" checked={s.showUnits} onChange={(e) => set({ showUnits: e.target.checked })} /><span>I know roughly how many of each dish I sell a week. Optional: it lets us price the under-priced dishes.</span></label>
        </div>

        <div className="rows">
          {items.map((it) => (
            <div key={it.id} className={`row${it.confidence === "low" ? " is-low" : ""}`}>
              <div className="cat">
                <input aria-label="Section" value={it.category} onChange={(e) => patch(it.id, { category: e.target.value })} onBlur={() => check(it.id)} />
                <span className={`chip chip--${it.confidence}`} title={it.flags?.join("; ") || "Looks right"}>{it.confidence === "med" ? "check" : it.confidence === "low" ? "fix" : "ok"}</span>
              </div>
              <div>
                <input className="name" aria-label="Dish name" value={it.name} placeholder="Dish name" onChange={(e) => patch(it.id, { name: e.target.value })} onBlur={() => check(it.id)} />
                <textarea className="desc" rows={1} aria-label="Description" value={it.description} placeholder="Description (optional)" onChange={(e) => patch(it.id, { description: e.target.value })} />
                {it.flags && it.flags.length > 0 && it.confidence !== "high" && <p className="hint" style={{ marginTop: 2, fontSize: 12, color: "var(--leak)" }}>{it.flags.join(" · ")}</p>}
              </div>
              <input className="price num" aria-label="Price" inputMode="decimal" value={it.price ?? ""} placeholder="Price"
                onChange={(e) => { const v = e.target.value.replace(/[^\d.]/g, ""); patch(it.id, { price: v === "" ? null : Number(v) }); }} onBlur={() => check(it.id)} />
              <button className="del" aria-label={`Remove ${it.name || "row"}`} onClick={() => setItems(items.filter((x) => x.id !== it.id))}>×</button>
              {s.showUnits && (
                <label className="units">Sold a week <input className="num" inputMode="numeric" value={it.weeklyUnits ?? ""} onChange={(e) => patch(it.id, { weeklyUnits: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null })} /></label>
              )}
            </div>
          ))}
        </div>
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="link" onClick={() => setItems([...items, newItem(items[items.length - 1]?.category ?? "Mains")])}>+ Add a dish</button>
          <button className="link" onClick={() => nav("/start")}>Back to the menu text</button>
        </div>

        <div className="sticky">
          <button className="btn btn--block" disabled={busy || priced < 3} onClick={run}>{busy ? "Running the X-ray…" : priced < 3 ? "Add at least 3 priced dishes" : `Run the X-ray on ${priced} dishes`}</button>
        </div>
      </div>
    </Page>
  );
}
