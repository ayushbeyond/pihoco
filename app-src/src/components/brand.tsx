import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function Header({ step, dark }: { step?: string; dark?: boolean }) {
  return (
    <header className={`hdr${dark ? " hdr--dark" : ""}`}>
      <Link to="/" className="wordmark" aria-label="PIHOCO Menu X-ray home">PIHOCO</Link>
      {step ? <span className="step num">{step}</span> : <a className="step" href="/" style={{ textDecoration: "none" }}>pihoco.com</a>}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="ftr">
      <span className="label">PIHOCO · Menu engineering &amp; F&amp;B advisory</span>
      <span className="label"><a href="/">pihoco.com</a> · <a href="/privacy.html">Privacy</a></span>
    </footer>
  );
}

export function Page({ step, children }: { step?: string; children: ReactNode }) {
  return (
    <div className="page">
      <Header step={step} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export function Toast({ text }: { text: string | null }) {
  return text ? <div className="toast" role="status">{text}</div> : null;
}
