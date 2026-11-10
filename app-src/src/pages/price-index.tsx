import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Page } from "../components/brand";
import { cityPriceIndex, type DishPrice } from "../lib/stats";
import { price } from "../lib/format";

const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "");

export default function PriceIndex() {
  const [data, setData] = useState<{ rows: DishPrice[]; menus: number; collected: string | null } | null>(null);
  useEffect(() => { cityPriceIndex("Dubai").then(setData); }, []);

  return (
    <Page step="Price index">
      <div className="wrap" style={{ paddingBottom: 80 }}>
        <div className="head">
          <span className="label">PIHOCO Price Index · Dubai{data?.collected ? ` · ${fmtDate(data.collected)}` : ""}</span>
          <h1>What Dubai <em>charges</em> for the classics.</h1>
          <p>Median dine-in prices, in AED, from public menus published on each venue's own website. A dish appears only once we have it from at least five menus. Updated as we add menus.</p>
        </div>

        {!data ? <p style={{ marginTop: 32 }}><span className="spinner" aria-label="Loading" /></p> : data.rows.length === 0 ? (
          <p className="muted" style={{ marginTop: 32 }}>The index is being built. Check back soon.</p>
        ) : (
          <>
            <div className="summary num" style={{ marginTop: 28 }}>
              <span className="label">{data.menus} public menus</span><span className="label">{data.rows.length} dishes with 5+ prices</span>
            </div>
            <div className="tblwrap">
              <table className="tbl num">
                <thead><tr><th>Dish</th><th className="r">Median</th><th className="r">Typical range</th><th className="r">Menus</th></tr></thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.key}>
                      <td>{r.name}</td>
                      <td className="r" style={{ fontFamily: "var(--serif)", fontSize: "1.15rem" }}>{price(Math.round(r.median * 2) / 2)}</td>
                      <td className="r">{price(Math.round(r.p25))}–{price(Math.round(r.p75))}<small>full range {price(r.low)}–{price(r.high)}</small></td>
                      <td className="r">{r.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="fine">Typical range is the middle half of prices (25th to 75th percentile). One price per venue per dish, the regular size. Collected from public menus; venues may have changed prices since. A PIHOCO dataset, not an industry survey.</p>
          </>
        )}

        <section className="cta" style={{ marginTop: 56, padding: "40px 24px" }}>
          <span className="label">Free · 60 seconds</span>
          <h2>Where does <em>your</em> menu sit?</h2>
          <p>Run the Menu X-ray: we compare your dishes with this index and show where the money is.</p>
          <div className="actions"><Link className="btn" to="/start">Start the X-ray</Link></div>
        </section>
      </div>
    </Page>
  );
}
