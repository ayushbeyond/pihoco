# PIHOCO Menu Intelligence portal: what we built

*12 November 2026 · Working prototype*

---

## 1. Summary

A working prototype of PIHOCO's Menu Intelligence portal, with two views and no login:

- **Customer:** a free Menu X-ray built in MenuOptimizer's (BarGlance) simple order and PIHOCO's brand.
- **PIHOCO team:** sees every analysis, edits any number and publishes the reviewed report to the client.

It applies the fixes from the *Menu X-ray review* (12 Nov 2026): VAT, delivery-app commission, "Needs costing" and "No sales" labels, loose name matching, monthly figures, and a money-first page with one button.

| Item | Where | Status |
|---|---|---|
| Portal prototype | Claude artifact "PIHOCO Menu Intelligence" | Live, private to the owner |
| Website-ready folder | `PIHOCO_menu-intelligence_for_website.zip` → upload as `/menu-intelligence/` | Ready to upload |
| Test files | `PIHOCO_Menu_Intelligence_test_files.zip` (5 sets) | Ready |

---

## 2. How it flows

**Start screen.** Tap **Customer** or **PIHOCO team**.

### 2.1 Customer: free Menu X-ray

The page follows MenuOptimizer's order but uses PIHOCO's look:

| Section | What it says |
|---|---|
| Hero | "Find the money your menu is *leaving on the table.*" · 60 seconds · no card · no sign-up |
| Upload card | Outlet name, one drop zone for both files, **Analyse my menu**. Under it: "or try it with a sample café's files" |
| Sample result | Money found in the top 3 changes (+AED 2,661 a month on the sample) and the three fixes |
| How it works | 1 Upload two files · 2 We read every dish · 3 Get your three fixes |
| Pricing | Free X-ray → Full Scorecard (~~AED 179~~, free at launch) → Menu Profit Audit (AED 2,750 for the first five clients, then AED 4,400) |
| FAQ | Is it free? · POS login? · Is the money a promise? · Does AI make up numbers? · Not in Dubai? |
| Final call | "Your menu is your best salesperson. Is it doing its job?" (the button sticks to the bottom on phones) |

**Files needed**
1. **Item sales report** from the POS: dish, quantity sold, and price or sales amount. Category is recommended.
2. **Recipe costs**: dish and food cost per portion. Not needed if the sales file already has a cost column.

CSV or Excel. The portal works out which file is which, skips POS title rows and total rows, and adds duplicate rows together.

**More options** (folded away): currency, days the report covers, "Menu prices include VAT" with the VAT %, the share of orders through delivery apps, and the app commission %.

**Flow:** Analyse → short progress screen → results. Column matching only appears when a required column can't be found.

**Results**

| Free Menu X-ray | Full Scorecard (locked; free at launch) |
|---|---|
| Money found in the top 3 changes, a month | Every dish named on the matrix |
| Top 3 fixes: the change, the reason, the money | Full action plan ranked by money |
| Headline figures: sales, what dishes leave, food cost %, per plate | Every-dish table and section table |
| The four classes and their share | Data checks and method |
| Matrix without dish names, 2 findings | Excel model with live formulas |
| PDF download, "Email me the report" | PDF and Excel |

Data problems appear on the results page: "X dishes need costing" with an **Add costs** button, and dishes that cost as much as they sell for.

**Next step:** "Book a Menu Profit Audit" collects an email and a note, and the request lands in the team's list.

### 2.2 PIHOCO team

- **Client analyses list:** every analysis, with plan, status and audit requests flagged. Includes "New analysis for a client".
- **Editing workspace:**
  - Change any dish's name, section, plates, price, food cost, class and recommendation text.
  - Edit headline figures and findings.
  - **Settings:** compare within section or whole menu, popularity line %, contribution line (weighted average or a fixed amount), VAT, delivery share, commission, food-cost target, price-test size, days covered.
- **Change log:** original → new value, who and when. Reset one dish or everything.
- **Client access:** give the Full Scorecard. Add a note to the client.
- **Publish:** the client's view shows the edited numbers and the note, marked "Reviewed by PIHOCO".
- PDF and Excel exports. The Excel includes the change log.

---

## 3. The maths

| Term | Definition |
|---|---|
| Net price | Menu price ÷ (1 + VAT) when prices include VAT, otherwise the menu price |
| App commission per plate | Net price × delivery share × commission % (spread across all plates) |
| What a dish leaves (contribution) | Net price − food cost − app commission. Labour and overheads excluded |
| Food cost % | Food cost ÷ net price |
| Popularity line | 70% of the average plates sold per dish in the section (Kasavana & Smith) |
| Contribution line | Sales-weighted average contribution per plate in the section |
| Classes | Star (above both), Plowhorse (popular, below the contribution line), Puzzle (above the contribution line, less popular), Dog (below both) |
| Not classified | "Needs costing" (no cost) or "No sales" (zero sales). Left out of the lines |
| Monthly figures | Report-period figures × 30 ÷ days covered |

**Action estimates**

- **Plowhorse:** test a price rise of 5% of the menu price, rounded (AED to 1, INR to 5, USD to 0.25). Gain = rise × (1 ÷ (1 + VAT)) × (1 − delivery share × commission) × plates, a month, *if sales hold*.
- **Puzzle:** the extra orders needed to reach the popularity line × (its contribution − section average), a month, *if those orders switch to it*.
- **Dog:** rework or retire. No money figure.
- **Loses money** (contribution ≤ 0): fix the cost or the price first. No price test.
- **Headline:** the exact sum of the top 3 estimates, so the page never shows two numbers that disagree.

**Checked:** the Dubai sample was recalculated independently (7 Stars, 7 Plowhorses, 5 Puzzles, 1 Dog; AED 179,461 left on AED 284,960 sales), and so was the Indian café set. A browser run covered all five test sets, PDF and Excel exports, adding costs, team edits, publishing, phone width (no sideways scroll) and dark mode.

---

## 4. Test files

| Set | Files | What it tests |
|---|---|---|
| 1 | Indian café, INR, one month | POS export with title rows and a total row |
| 2 | US restaurant, USD | Different column names; price worked out from sales; name spelling differences |
| 3 | Messy data | Missing costs, cost above price, a duplicate row, zero sales, a costed dish not on the sales report |
| 4 | Bar, one combined Excel file | Sales and costs in one sheet (the PIHOCO template layout) |
| 5 | Dubai café, AED, prices include 5% VAT | "Club, chicken" and "Acai bowl" test name matching. Try a delivery share |

Sets 1, 3 and 4 carry no currency symbol, so pick **INR** under "More options" before analysing.

---

## 5. Not connected yet

| Feature | Prototype behaviour | Live version needs |
|---|---|---|
| Logins | A tap picks Customer or PIHOCO team | Accounts and roles (e.g. Supabase Auth) |
| Shared data | Saved in the visitor's own browser only | A database, so customer uploads reach the team on any device |
| Email | Saves the address; says nothing was sent; offers downloads | An email service (e.g. Resend) and a sending domain |
| Payment | Full Scorecard unlocks free | A payment link once the AED 179 price is confirmed |
| Downloads inside Claude | Each file asks for confirmation | Normal downloads on pihoco.com |

---

## 6. Decisions and next steps

1. **Confirm the prices:** AED 179 (Full Scorecard), AED 2,750 founding, then AED 4,400 (Menu Profit Audit). They show on the page now.
2. **Pick one team tool:** this portal's team view, or the existing consultant workspace at `pihoco.vercel.app/workspace`.
3. **Approve the founder line** before adding it. It's left out for now.
4. **Run 10–20 real X-rays** with friendly restaurants to test the full flow, and collect two or three quotes with permission.
5. **Connect logins, the database and email**, then upload the folder to `pihoco.com/menu-intelligence/` and link it from the site menu.

**Rules carried over from the review:** one story in public (free X-ray → paid audit → consultant). Lead with money, backed by evidence. Never show a number we can't defend. Proof only when it's real.
