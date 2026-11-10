import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Footer, Toast } from "../components/brand";
import { Cover, Dimensions, Findings, MoreFindings, Rewrites, Scenario } from "../components/result-view";
import { LeadModal } from "../components/lead-modal";
import { useXray } from "../lib/store";
import { estimateScenario } from "../engine";
import { moneyRange } from "../lib/format";
import { saveAudit } from "../lib/db";
import { CONFIG } from "../lib/config";

export default function Result() {
  const { s, set } = useXray();
  const nav = useNavigate();
  const [lead, setLead] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  if (!s.result) return <Navigate to={s.items.length ? "/review" : "/start"} replace />;
  const r = s.result;
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2400); };
  const est = estimateScenario(r, s.inputs, {});

  async function share() {
    let audit = s.audit;
    if (!audit) { audit = await saveAudit(s.inputs, s.items, r); if (audit) set({ audit }); }
    if (!audit) { flash("Couldn't create a link right now. Try again in a moment."); return; }
    const url = `${location.origin}/app/x/${audit.share}`;
    try {
      if (navigator.share) await navigator.share({ title: `Menu X-ray: ${s.inputs.restaurantName || "my menu"} scored ${r.score}/100`, url });
      else { await navigator.clipboard.writeText(url); flash("Link copied"); }
    } catch { /* cancelled */ }
  }
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); flash("Copied"); } catch { flash("Couldn't copy"); } };

  return (
    <div className="page">
      <main>
        <Cover result={r} name={s.inputs.restaurantName} place={[s.inputs.area, s.inputs.city].filter(Boolean).join(", ")}
          headline={est ? <div className="bigmoney"><span className="label meta">Money on the table · scenario</span><b className="num">+{moneyRange(est, r.currency)} a month</b></div> : null}
          actions={<>
            <button className="btn btn--light" onClick={() => setLead(true)}>Get the full PDF scorecard</button>
            <button className="btn btn--ghost btn--plain" onClick={share}>Share result</button>
          </>} />
        <Findings result={r} />
        <Scenario result={r} inputs={s.inputs} onAddNumbers={() => nav("/start")} />
        <Rewrites result={r} onCopy={copy} />
        <Dimensions result={r} />
        <MoreFindings result={r} />

        <section className="sec wrap noprint">
          <span className="label">Next</span>
          <h2>Check your prices against <em>rivals</em>.</h2>
          <p style={{ marginTop: 18, maxWidth: "52ch" }}>Paste the menus of 1–3 places you compete with. We match like-for-like dishes and show where you sit.</p>
          <div className="actions"><Link className="btn btn--ghost" to="/price-check">Open Price Check</Link><button className="link" onClick={() => window.print()}>Print or save as PDF</button></div>
        </section>

        <section className="cta">
          <div className="wrap">
            <span className="label">From X-ray to action</span>
            <h2>Want this <em>checked and priced</em> by a menu engineer?</h2>
            <p>The free scorecard is a 2-page PDF reviewed by Piyush. The Menu Profit Boost Audit ({CONFIG.auditPrice}, founding rate) adds your recipe costs and sales mix, so every recommendation comes with its real margin.</p>
            <div className="actions"><button className="btn" onClick={() => setLead(true)}>Get the free scorecard</button><a className="link" href="/#enquire">Ask about the audit</a></div>
          </div>
        </section>
        <div className="wrap"><p className="fine">{r.disclaimer} <span className="num">Engine {r.engineVersion}.</span></p>
          <div className="actions noprint" style={{ marginBottom: 48 }}><button className="link" onClick={() => nav("/review")}>Edit the menu</button><button className="link" onClick={() => nav("/start")}>Change details</button></div>
        </div>
      </main>
      <Footer />
      {lead && <LeadModal onClose={() => setLead(false)} />}
      <Toast text={toast} />
    </div>
  );
}
