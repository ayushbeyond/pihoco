import { useMemo, useState, type ReactNode } from "react";
import { estimateScenario, type AuditInputs, type Finding, type XrayResult } from "../engine";
import { moneyRange, price } from "../lib/format";

export function Cover({ result, name, place, actions, headline }: { result: XrayResult; name: string; place?: string; actions?: ReactNode; headline?: ReactNode }) {
  return (
    <section className="cover">
      <div className="hdr hdr--dark">
        <a href="/" className="wordmark">PIHOCO</a>
        <span className="badge">PIHOCO diagnostic<br />Not an industry rating</span>
      </div>
      <div className="wrap body">
        <span className="label meta">Menu X-ray · {name || "Your menu"}{place ? ` · ${place}` : ""}</span>
        <div className="score" aria-label={`Score ${result.score} out of 100`}>
          <b className="num">{result.score}</b><span className="num">/100</span>
        </div>
        <p className="label meta num" style={{ marginTop: 18 }}>Assessed {result.assessed} of {result.total} parts · {Math.round(result.coverage * 100)}% of the score weight</p>
        <h1>{result.verdict}</h1>
        {headline}
        {actions && <div className="actions noprint">{actions}</div>}
      </div>
    </section>
  );
}

function FindingCard({ f, i, currency, numbered }: { f: Finding; i: number; currency: string; numbered: boolean }) {
  return (
    <article className="finding">
      <span className="n num">{numbered ? String(i + 1).padStart(2, "0") : ""}</span>
      <div>
        <h3>{f.title}</h3>
        <p className="why">{f.evidence}</p>
        <p><strong style={{ fontWeight: 600 }}>Do this: </strong>{f.action}</p>
        {f.perSale && f.perSale.length > 0 && (
          <div className="persale num">
            {f.perSale.map((p) => <div key={p.item}><span>{p.item}</span><span>{price(p.from)} → test {price(p.to)}</span></div>)}
          </div>
        )}
        {f.money && (
          <>
            <p className="money num">+{moneyRange(f.money, currency)} <span className="label">a month</span></p>
            {f.money.assumptions && f.money.assumptions.length > 0 && (
              <details><summary>How we got this</summary><ul>{f.money.assumptions.map((a) => <li key={a}>{a}</li>)}</ul></details>
            )}
          </>
        )}
      </div>
    </article>
  );
}

export function Findings({ result }: { result: XrayResult }) {
  const top = result.findings.slice(0, 3);
  return (
    <section className="sec wrap">
      <span className="label">Priorities</span>
      <h2>Three things to <em>fix first</em>.</h2>
      {top.length === 0 && <p className="muted" style={{ paddingTop: 24 }}>Nothing urgent on this menu. The detail below shows where it's strong.</p>}
      {top.map((f, i) => <FindingCard key={f.lever} f={f} i={i} currency={result.currency} numbered />)}
    </section>
  );
}

export function MoreFindings({ result }: { result: XrayResult }) {
  const rest = result.findings.slice(3);
  if (!rest.length) return null;
  return (
    <section className="sec wrap more">
      <span className="label">Also worth doing</span>
      <h2>More from the <em>X-ray</em>.</h2>
      {rest.map((f, i) => <FindingCard key={f.lever} f={f} i={i} currency={result.currency} numbered={false} />)}
    </section>
  );
}

export function Scenario({ result, inputs, onAddNumbers }: { result: XrayResult; inputs: AuditInputs; onAddNumbers: () => void }) {
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries(result.levers.map((l) => [l.key, l.default])));
  const est = useMemo(() => estimateScenario(result, inputs, vals), [result, inputs, vals]);
  const has = !!(inputs.coversPerWeek && inputs.avgBill);
  return (
    <section className="sec wrap scenario">
      <span className="label">Scenario, not a forecast</span>
      <h2>Money on the <em>table</em>.</h2>
      <div className="total">
        {est ? (
          <>
            <b className="num">+{moneyRange(est, result.currency)}</b>
            <span className="label">a month, if you act on the levers above</span>
            <p className="hint">Move the assumptions to match what you believe. The levers overlap, so the top end is trimmed by 15%.</p>
          </>
        ) : has ? (
          <p className="muted">This menu already covers the levers we can price from the menu alone. The full audit prices the rest from your sales data.</p>
        ) : (
          <>
            <p className="muted">Add covers per week and your average bill to turn these findings into money. They are used only for maths, in your browser.</p>
            <div className="actions" style={{ marginTop: 18 }}><button className="btn btn--ghost" onClick={onAddNumbers}>Add my numbers</button></div>
          </>
        )}
      </div>
      {est && result.levers.map((l) => (
        <label key={l.key} className="slider">
          <span className="top"><span>{l.label}</span><span className="num">{vals[l.key]}{l.unit}</span></span>
          <input type="range" min={l.min} max={l.max} step={l.step} value={vals[l.key]} onChange={(e) => setVals({ ...vals, [l.key]: Number(e.target.value) })} />
        </label>
      ))}
    </section>
  );
}

export function Dimensions({ result }: { result: XrayResult }) {
  return (
    <section className="sec wrap">
      <span className="label">Five parts</span>
      <h2>Where the score <em>comes from</em>.</h2>
      {result.dimensions.map((d) => (
        <div key={d.key} className="dim">
          <div className="top">
            <h3>{d.label}</h3>
            <span className="val num">{d.score == null ? <span className="label">Not assessed</span> : d.score}</span>
          </div>
          <div className="bar"><i style={{ width: `${d.score ?? 0}%` }} /></div>
          <p className="label num" style={{ marginTop: 10 }}>Weight {Math.round(d.weight * 100)}%</p>
          <ul className="ev">
            {(d.evidenceDetail ?? d.evidence.map((t) => ({ text: t, tone: "neutral" as const }))).map((e, i) => <li key={i} className={e.tone}>{e.text}</li>)}
            {d.missing?.map((m) => <li key={m} className="missing">Needs: {m}</li>)}
          </ul>
        </div>
      ))}
    </section>
  );
}

export function Rewrites({ result, onCopy }: { result: XrayResult; onCopy?: (t: string) => void }) {
  if (!result.rewrites.length) return null;
  return (
    <section className="sec wrap">
      <span className="label">Descriptions</span>
      <h2>Words that <em>sell</em>.</h2>
      {result.rewrites.map((r) => (
        <div key={r.name} className="rw">
          <div><span className="label">{r.name} · now</span><p className="before">{r.before}</p></div>
          <div>
            <span className="label" style={{ color: "var(--brass)" }}>Suggested</span>
            <p className="after">{r.after}</p>
            {r.note && <p className="note">{r.note}</p>}
            {onCopy && <button className="link noprint" style={{ marginTop: 10 }} onClick={() => onCopy(r.after)}>Copy</button>}
          </div>
        </div>
      ))}
    </section>
  );
}
