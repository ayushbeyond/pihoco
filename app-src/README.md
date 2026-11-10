# PIHOCO Menu X-ray — app

Static React app served at `/app` on the PIHOCO site. No AI, no Lovable.

- Logic: `src/engine` (copy of the tested engine in `../src`). Tests: `../test`.
- Data: PIHOCO's own Supabase project (`appccwwupxkfzzuawzzr`): tables `audits`, `leads`, `benchmark_items`, `price_index`; view `leads_inbox`.
- Lead emails: Web3Forms, same key as the website.

Build: `npm install && npm run build` → writes `../app`. Copy that folder to the `app/` folder on `main` and push; Vercel serves it. `vercel.json` on `main` sends `/app/*` to `app/index.html`.
