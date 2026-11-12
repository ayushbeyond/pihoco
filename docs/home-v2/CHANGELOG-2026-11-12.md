# PIHOCO V2 — Change log

Date: 12 November 2026

## Deployment target
- V2 staging route: https://pihoco.com/home-v2/
- Main homepage, Menu X-ray page and app routes are not modified.
- The V2 page retains `noindex` intentionally; remove it only when the V2 route is approved for public indexing/canonicalisation.

## Hero treatment in this release
- Increased the desktop hero's dark gradient overlay across the full image, especially the right-hand subject area, to reduce facial detail and keep the image atmospheric.
- Slightly reduced image brightness and saturation for a restrained warm editorial finish.
- Increased mobile overlay density so headline and CTA remain legible on a narrow viewport.
- Kept the existing hero asset paths and image markup unchanged in this commit. The newly supplied desktop and portrait photos are included separately in this handoff ZIP for review; they have not been committed to the live repository in this release.

## Previously completed V2 commercial and content revisions
- Repositioned the offer as a chef-led, fixed-scope menu profitability audit for independent restaurants, with Dubai/UAE as the primary market.
- Clarified the difference between popularity, dish-level contribution and net profit after overheads.
- Specified the data required for a full audit: 8–13 weeks of item-level POS sales, recipe quantities/portions/yields, supplier prices, and relevant delivery commissions/packaging.
- Defined analysis and deliverables: sales mix, contribution, recipe cost, channel economics, kitchen complexity, menu matrix, prioritised decisions, report, workbook and founder review.
- Qualified the free Menu X-ray as a preliminary public-menu review, not a verified profitability calculation.
- Limited founding pricing to the first five paid audit engagements with written scope confirmation.
- Described the Menu Engineering Sprint as separately scoped implementation work; removed the undefined retainer upsell.
- Added explicit caveats: no guaranteed profit uplift, no statutory audit, and no net-profit claim from menu photos alone.
- Clarified privacy/data handling and POS-export-only workflow.
- Fixed contact-form name-field access using `form.elements.namedItem("name")`, with email validation and honeypot checking.

## QA status
- Source-level checks from the prior release: form field collision fix, honeypot check, no guaranteed profit claim, contribution-vs-net-profit caveat, first-five pricing qualification, and noindex staging flag.
- Vercel checks on the previous merged release were successful. This overlay release still requires its own deployment check and browser-level review.
- Not yet verified in a real browser: responsive nav, CTA behaviour, currency switcher, and an actual Web3Forms submission.

## Launch checklist
1. Review the desktop and mobile hero crops on real devices.
2. Confirm Vercel deployment succeeds for this commit.
3. Test the form with a real submission and confirm receipt.
4. Test mobile navigation, CTA links, currency switching and fixed mobile CTA.
5. Before public launch, decide whether to remove `noindex`, set canonical metadata and update sitemap as appropriate.

## Image handoff
- `pihoco-hero-desktop.webp`: supplied landscape image, optimised to 1280×720.
- `pihoco-hero-mobile.webp`: supplied portrait image, optimised to 720×900.
- These are review-ready handoff assets, not yet wired into the live HTML. The live hero currently uses the existing repository image paths.
