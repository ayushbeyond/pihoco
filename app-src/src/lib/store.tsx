// One X-ray session, kept in sessionStorage so a refresh doesn't lose work.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuditInputs, MenuItem, XrayResult } from "../engine";

export interface XrayState {
  inputs: AuditInputs;
  menuText: string;
  items: MenuItem[];
  result: XrayResult | null;
  audit: { id: string; share: string } | null;
  showUnits: boolean;
}

export const EMPTY: XrayState = {
  inputs: { restaurantName: "", city: "", area: "", country: "UAE", currency: "AED", concept: "restaurant", cuisine: "", coversPerWeek: null, avgBill: null, lastPriceChange: null },
  menuText: "", items: [], result: null, audit: null, showUnits: false,
};

const KEY = "pihoco-xray-v1";
function load(): XrayState {
  try { const s = sessionStorage.getItem(KEY); if (s) return { ...EMPTY, ...JSON.parse(s) }; } catch { /* private mode */ }
  return EMPTY;
}

const Ctx = createContext<{ s: XrayState; set: (p: Partial<XrayState>) => void; reset: () => void } | null>(null);

export function XrayProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<XrayState>(load);
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } }, [s]);
  return <Ctx.Provider value={{ s, set: (p) => setS((o) => ({ ...o, ...p })), reset: () => setS(EMPTY) }}>{children}</Ctx.Provider>;
}

export function useXray() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useXray outside provider");
  return c;
}
