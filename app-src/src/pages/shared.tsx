import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Footer, Page } from "../components/brand";
import { Cover, Dimensions, Findings, MoreFindings, Rewrites } from "../components/result-view";
import { loadShared } from "../lib/db";

type Shared = Awaited<ReturnType<typeof loadShared>>;

export default function SharedResult() {
  const { id = "" } = useParams();
  const [data, setData] = useState<Shared | undefined>(undefined);
  useEffect(() => { loadShared(id).then(setData); }, [id]);

  if (data === undefined) return <Page><div className="wrap head"><span className="spinner" aria-label="Loading" /></div></Page>;
  if (data === null) return (
    <Page><div className="wrap head"><span className="label">Not found</span><h1>This X-ray <em>isn't here</em>.</h1><p>The link may be mistyped. Run your own in about a minute.</p><div className="actions"><Link className="btn" to="/start">Start the X-ray</Link></div></div></Page>
  );
  const r = data.result;
  return (
    <div className="page">
      <main>
        <Cover result={r} name={data.restaurant_name} place={data.city} actions={<Link className="btn btn--light" to="/start">X-ray your own menu</Link>} />
        <Findings result={r} />
        <Rewrites result={r} />
        <Dimensions result={r} />
        <MoreFindings result={r} />
        <div className="wrap"><p className="fine">{r.disclaimer} Shared {new Date(data.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}.</p></div>
        <section className="cta"><div className="wrap"><span className="label">Free · 60 seconds</span><h2>Find the <em>money</em> on your menu.</h2><div className="actions"><Link className="btn" to="/start">Start the X-ray</Link></div></div></section>
      </main>
      <Footer />
    </div>
  );
}
