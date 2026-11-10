import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Page } from "../components/brand";
import { useXray } from "../lib/store";
import { competitorToBenchmark, findNearby, matchCompetitors, OSM_ATTRIBUTION, type CompetitorMenu, type NearbyPlace, type PriceRow } from "../engine";
import { contributeBenchmarks } from "../lib/db";
import { price } from "../lib/format";

const blank = (): CompetitorMenu => ({ name: "", text: "", url: "" });

export default function PriceCheck() {
  const { s } = useXray();
  const [comps, setComps] = useState<CompetitorMenu[]>([blank()]);
  const [rows, setRows] = useState<PriceRow[] | null>(null);
  const [contribute, setContribute] = useState(true);
  const [saved, setSaved] = useState<number | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[] | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  if (!s.items.length) return <Navigate to="/start" replace />;
  const i = s.inputs;

  async function compare() {
    const filled = comps.filter((c) => c.text.trim()).map((c, k) => ({ ...c, name: c.name.trim() || `Competitor ${k + 1}` }));
    setRows(matchCompetitors(s.items, filled));
    setSaved(null);
    if (contribute) {
      const bench = filled.flatMap((c) => competitorToBenchmark(c, i));
      setSaved(await contributeBenchmarks(bench));
    }
  }
  async function nearby() {
    setLoadingMap(true);
    setPlaces(await findNearby(i.area ? `${i.area}, ${i.city}` : i.city, i.concept, i.cuisine));
    setLoadingMap(false);
  }
  const upd = (k: number, p: Partial<CompetitorMenu>) => setComps(comps.map((c, j) => (j === k ? { ...c, ...p } : c)));
  const fmtGap = (g: number | null) => (g == null ? "—" : `${g > 0 ? "+" : ""}${g.toFixed(1)}%`);

  return (
    <Page step="Price Check">
      <div className="wrap" style={{ paddingBottom: 72 }}>
        <div className="head">
          <span className="label">Price Check · {i.city}</span>
          <h1>Where you sit against <em>rivals</em>.</h1>
          <p>Paste the menus of up to three places your guests also choose: copy the text from their website, PDF or delivery page. We match like-for-like dishes; you check the matches.</p>
        </div>

        {comps.map((c, k) => (
          <div key={k} className="comp">
            <div className="grid2">
              <label className="field" style={{ marginTop: 0 }}><span className="label">Competitor {k + 1}</span><input className="input" value={c.name} onChange={(e) => upd(k, { name: e.target.value })} placeholder="Name" /></label>
              <label className="field" style={{ marginTop: 0 }}><span className="label">Where the menu is from (optional)</span><input className="input" value={c.url} onChange={(e) => upd(k, { url: e.target.value })} placeholder="https://…" /></label>
            </div>
            <textarea className="textarea" style={{ marginTop: 16 }} value={c.text} onChange={(e) => upd(k, { text: e.target.value })} placeholder={"Paste their menu text\nButter Chicken 52\nDal Makhani 36"} aria-label={`Competitor ${k + 1} menu`} />
          </div>
        ))}
        {comps.length < 3 && <button className="link" style={{ marginTop: 12 }} onClick={() => setComps([...comps, blank()])}>+ Add another competitor</button>}

        <label className="check"><input type="checkbox" checked={contribute} onChange={(e) => setContribute(e.target.checked)} /><span>Add these public competitor prices to PIHOCO's local price index (anonymous). It helps every owner in {i.city || "your city"} get a better comparison.</span></label>
        <div className="actions"><button className="btn" disabled={!comps.some((c) => c.text.trim())} onClick={compare}>Compare prices</button></div>

        {rows && (
          <section style={{ marginTop: 40 }}>
            <span className="label">{rows.length ? `${rows.length} dishes matched` : "No matches"}</span>
            {rows.length === 0 ? (
              <p className="muted" style={{ marginTop: 12 }}>We couldn't match any dishes. Check their menu has one dish per line with a price, and that the dishes are comparable.</p>
            ) : (
              <div className="tblwrap">
                <table className="tbl num">
                  <thead><tr><th>Your dish</th><th className="r">You</th><th className="r">Them</th><th className="r">Gap</th></tr></thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.dish}>
                        <td>{r.dish}<small>{r.confidence === "high" ? "Same dish" : r.confidence === "medium" ? "Close match: check it" : "Loose match"}</small></td>
                        <td className="r">{price(r.yours)}</td>
                        <td className="r">{r.theirs.map((t) => <span key={t.name} style={{ display: "block" }}>{price(t.price)}<small>{t.name}{t.dish && t.dish !== r.dish ? ` · ${t.dish}` : ""}</small></span>)}</td>
                        <td className={`r ${r.gapPct != null && r.gapPct < -8 ? "gap-leak" : r.gapPct != null && r.gapPct > 8 ? "gap-gain" : ""}`}>{fmtGap(r.gapPct)}<small>vs median {price(r.median)}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="hint" style={{ marginTop: 14 }}>A dish more than 8% under the median is a candidate for a small test price rise; more than 8% over needs to earn it on the plate. {saved ? `${saved} prices added to the ${i.city} index. Thank you.` : ""}</p>
          </section>
        )}

        <section style={{ marginTop: 56, borderTop: "1px solid var(--line)", paddingTop: 28 }}>
          <span className="label">Don't know whose menus to use?</span>
          <h2 style={{ fontSize: "1.9rem", marginTop: 10 }}>Places near <em>you</em>.</h2>
          <p className="hint">Similar places within 1.5 km of {i.area ? `${i.area}, ` : ""}{i.city}, from OpenStreetMap. Open their websites and paste their menus above.</p>
          <div className="actions" style={{ marginTop: 18 }}><button className="btn btn--ghost" onClick={nearby} disabled={loadingMap}>{loadingMap ? "Looking…" : "Find places nearby"}</button></div>
          {places && (
            places.length ? (
              <>
                <ul className="places">{places.map((p) => (
                  <li key={`${p.name}${p.lat}`}><span><b>{p.name}</b><br /><span className="muted" style={{ fontSize: 13 }}>{[p.type.replace("_", " "), p.cuisine].filter(Boolean).join(" · ")}{p.website ? <> · <a href={p.website} target="_blank" rel="noreferrer noopener">website</a></> : null}</span></span><span className="num muted">{p.distanceM != null ? (p.distanceM >= 1000 ? `${(p.distanceM / 1000).toFixed(1)} km` : `${p.distanceM} m`) : ""}</span></li>
                ))}</ul>
                <p className="hint">{OSM_ATTRIBUTION}</p>
              </>
            ) : <p className="muted" style={{ marginTop: 14 }}>Nothing found. Try adding your area or street on the first step.</p>
          )}
        </section>
      </div>
    </Page>
  );
}
