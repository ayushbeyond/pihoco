import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import "./styles.css";
import { XrayProvider } from "./lib/store";
import { Page } from "./components/brand";
import Landing from "./pages/landing";
import Start from "./pages/start";
import Review from "./pages/review";
import Result from "./pages/result";
import PriceCheck from "./pages/price-check";
import SharedResult from "./pages/shared";
import PriceIndex from "./pages/price-index";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function NotFound() {
  return <Page><div className="wrap head"><span className="label">404</span><h1>Nothing on this <em>page</em>.</h1><div className="actions"><Link className="btn" to="/">Back to the X-ray</Link></div></div></Page>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/app">
      <XrayProvider>
        <ScrollTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/start" element={<Start />} />
          <Route path="/review" element={<Review />} />
          <Route path="/result" element={<Result />} />
          <Route path="/price-check" element={<PriceCheck />} />
          <Route path="/x/:id" element={<SharedResult />} />
          <Route path="/price-index" element={<PriceIndex />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </XrayProvider>
    </BrowserRouter>
  </StrictMode>,
);
