import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Page } from "../components/brand";
import { loadStats, type PublicStats } from "../lib/stats";

const steps = [
  ["01", "Paste, upload or type your menu."],
  ["02", "We read every dish and price, in your browser."],
  ["03", "See your score, three fixes, and the money behind them."],
];

const SOURCES: Record<string, string> = { GB: "UK ONS", US: "US BLS", AE: "Dubai Statistics Center", IN: "India MoSPI", SG: "Singapore SingStat" };
const month = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "");

function DataLine() {
  const [s, setS] = useState<PublicStats | null>(null);
  useEffect(() => { loadStats().then(setS); }, []);
  if (!s || !s.prices) return null;
  const official = s.index_countries.map((c) => SOURCES[c] ?? c).join(" and ");
  return (
    <section className="dataline">
      <div><b className="num">{s.prices.toLocaleString("en-GB")}</b><span className="label">menu prices</span></div>
      <div><b className="num">{s.menus}</b><span className="label">public menus · {s.cities.join(", ")}</span></div>
      <div><b className="num">{s.comparable_dishes}</b><span className="label">dishes with 5+ local prices</span></div>
      {s.xrays >= 25 && <div><b className="num">{s.xrays.toLocaleString("en-GB")}</b><span className="label">menus X-rayed</span></div>}
      <p className="hint">Collected from venues' own websites{s.collected_to ? `, ${month(s.collected_to)}` : ""}{official ? `. Inflation data from the ${official}.` : "."} <Link to="/price-index" className="link" style={{ fontSize: 10 }}>See the Dubai price index</Link></p>
    </section>
  );
}

export default function Landing() {
  return (
    <Page>
      <div className="wrap">
        <section className="hero">
          <span className="label">Menu X-ray · Free · 60 seconds</span>
          <h1>Find the <em>money</em> on your menu.</h1>
          <p className="lede">A menu X-ray from PIHOCO. Free. Your sales numbers never leave your browser.</p>
          <div className="actions"><Link to="/start" className="btn">Start the X-ray</Link></div>
        </section>
        <DataLine />
        <section className="steps"><ol>{steps.map(([n, t]) => <li key={n}><span className="n num">{n}</span><span>{t}</span></li>)}</ol></section>
        <section className="promise">
          <div><span className="label">What it checks</span><h3>Five parts of a menu</h3><p>Structure, price ladders, descriptions, upsell paths and, where the data exists, your local market.</p></div>
          <div><span className="label">How it works</span><h3>Rules, not guesswork</h3><p>Every point comes with the evidence behind it. No AI reads your menu and nothing is invented.</p></div>
          <div><span className="label">What it costs</span><h3>Nothing</h3><p>The X-ray is free. Want it checked and priced by a menu engineer? Ask for the full scorecard at the end.</p></div>
        </section>
      </div>
    </Page>
  );
}
