# Builds cafes.html and privacy.html from the homepage's design system (same CSS, nav, footer).
import re, pathlib
ROOT = pathlib.Path('/home/claude/pihoco-main')
home = (ROOT/'index.html').read_text()
css = home[home.index('<style>')+7:home.index('</style>')]
fonts = '\n'.join(l for l in home.splitlines() if 'rel="preload"' in l and 'font' in l)

TRACK = '''<script>
/* Anonymous click counting: no personal data, no cookies, no IP stored. */
(function(){var U="https://appccwwupxkfzzuawzzr.supabase.co/rest/v1/site_events",K="sb_publishable_QhuV3Qj4cbQpjDWorB84FQ_kY4roZeO";
window.pihocoTrack=function(ev,label){try{fetch(U,{method:"POST",keepalive:true,headers:{apikey:K,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({event:ev,page:location.pathname.slice(0,80),label:String(label||"").slice(0,80)})}).catch(function(){});}catch(e){}};
document.addEventListener("click",function(e){var a=e.target.closest("a,button");if(!a)return;var h=a.getAttribute("href")||"",s=a.closest("section,header,footer,.mcta"),w=s?(s.id||s.className.split(" ")[0]||s.tagName.toLowerCase()):"page",ev=null;
if(/app\\/start/.test(h))ev="cta_free_check";else if(a.dataset.pick||/#contact|#enquire/.test(h))ev="cta_contact";else if(/^mailto:/.test(h))ev="cta_email";else if(/menu-xray/.test(h))ev="cta_xray_page";else if(/\\.pdf$/.test(h))ev="download_pdf";else if(a.dataset.cur)ev="currency_"+a.dataset.cur.toLowerCase();else if(a.id==="xrReplay")ev="xr_replay";
if(ev)pihocoTrack(ev,w);},true);
pihocoTrack("page_view",document.referrer?(new URL(document.referrer)).hostname:"direct");})();
</script>'''

def nav(prefix='index.html'):
    return f'''<header class="nav">
  <div class="wrap">
    <a href="./" aria-label="PIHOCO home"><img src="assets/brand/PIHOCOLOGO.svg" alt="PIHOCO" width="70" height="17"></a>
    <nav aria-label="Main">
      <a href="{prefix}#audit">The audit</a>
      <a href="{prefix}#pricing">Pricing</a>
      <a href="cafes.html">For cafés</a>
      <a href="{prefix}#contact">Contact</a>
      <a class="btn" href="app/start">Free menu check</a>
    </nav>
  </div>
</header>'''

FOOT = '''<footer>
  <div class="wrap">
    <span>© 2026 PIHOCO · Menu engineering &amp; F&amp;B advisory · <a href="mailto:contact@pihoco.com">contact@pihoco.com</a></span>
    <nav aria-label="Footer"><a href="./">Home</a><a href="cafes.html">For cafés</a><a href="menu-xray/">Menu X-ray</a><a href="app/price-index">Dubai price index</a><a href="assets/sample/PIHOCO-January-Menu-Reset.pdf">Free menu-reset guide</a><a href="privacy.html">Privacy</a></nav>
  </div>
</footer>'''

def page(title, desc, canonical, extra_css, body, js=''):
    return f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://pihoco.com/{canonical}">
<meta name="theme-color" content="#f3eee6">
<meta property="og:type" content="website">
<meta property="og:url" content="https://pihoco.com/{canonical}">
<meta property="og:site_name" content="PIHOCO">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://pihoco.com/assets/img/og-share.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/brand/favicon.svg" type="image/svg+xml">
{fonts}
<style>{css}
{extra_css}
</style>
</head>
<body>
<script>document.documentElement.classList.add("js")</script>
{body}
{TRACK}
{js}
</body>
</html>
'''

# ---------------------------------------------------------------- CAFÉS
cafe_css = '''
.phero{padding:96px 0 88px;border-bottom:1px solid var(--line)}
.phero h1{font-size:clamp(44px,6vw,84px);line-height:1;margin:20px 0 0;max-width:14ch}
.phero p.lede{font-size:19px}
.phero .ctas{display:flex;gap:14px;flex-wrap:wrap;margin-top:34px}
.levers{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:32px;margin-top:56px}
.lever{border-top:1px solid var(--ink);padding-top:18px}
.lever .n{font:600 10.5px/1 var(--sans);letter-spacing:.18em;color:var(--brass);text-transform:uppercase}
.lever h3{font-size:24px;margin:10px 0 10px;line-height:1.2}
.lever p{color:var(--muted);font-size:14.5px;margin:0}
.cup{background:var(--night);color:var(--bg)}
.cup .label{color:var(--brass-l)}.cup .lede{color:#b3a898}
.cup .grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:56px;margin-top:44px;align-items:start}
.cf{display:grid;grid-template-columns:1fr 1fr;gap:20px 24px}
.cf label{display:block}
.cf span{display:block;font:600 10px/1.4 var(--sans);letter-spacing:.18em;text-transform:uppercase;color:#b3a898;margin-bottom:6px}
.cf input{width:100%;background:transparent;border:0;border-bottom:1px solid rgba(243,238,230,.3);color:var(--bg);font:400 20px/1.2 var(--serif);padding:6px 0;outline:none;border-radius:0}
.cf input:focus{border-bottom-color:var(--brass-l)}
.res{border:1px solid rgba(243,238,230,.18)}
.res div{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:18px 22px;border-bottom:1px solid rgba(243,238,230,.12)}
.res div:last-child{border-bottom:0;background:rgba(210,180,135,.08)}
.res span{font-size:13px;color:#b3a898}
.res b{font:300 28px/1 var(--serif);color:var(--bg);font-variant-numeric:tabular-nums}
.res div:last-child b{color:var(--brass-l)}
.cup .note2{font-size:12.5px;color:#8f857a;margin-top:14px}
.caudit .head{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:56px;align-items:end}
.cprice{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-top:56px;padding:26px 30px;background:var(--night);color:var(--bg)}
.cprice .price{margin:0;color:var(--bg)}
.cprice .label{color:var(--brass-l)}
.cprice p{margin:4px 0 0;color:#b3a898;font-size:13px}
.final2{background:var(--bg2);text-align:center;border-top:1px solid var(--line)}
.final2 h2{font-size:clamp(34px,4.4vw,56px);line-height:1.05}
.final2 .lede{margin-left:auto;margin-right:auto}
@media (max-width:960px){.levers{grid-template-columns:1fr 1fr}.cup .grid,.caudit .head{grid-template-columns:1fr;gap:40px}}
@media (max-width:600px){.levers{grid-template-columns:1fr}.cf{grid-template-columns:1fr 1fr;gap:18px}.phero{padding:56px 0 64px}.phero .btn{width:100%}.cprice{padding:24px 20px}.cprice .btn{width:100%}}
'''
cafe_body = nav() + '''
<main>
  <section class="phero">
    <div class="wrap">
      <span class="label">For cafés, bakeries &amp; dessert brands</span>
      <h1>In a café, the margin is in <em>the extras.</em></h1>
      <p class="lede">Sizes, milks, syrups, the bakery counter and the second item at the till decide what a café earns. We read your sales item by item, extras included, and tell you what to change.</p>
      <div class="ctas"><a class="btn" href="app/start">Get a free menu check <span aria-hidden="true">→</span></a><a class="btn ghost" href="#cafe-audit">See the café audit</a></div>
    </div>
  </section>

  <section id="levers">
    <div class="wrap">
      <span class="label">Where café margin hides</span>
      <h2 class="h2">Small gaps, repeated <em>hundreds of times a week.</em></h2>
      <div class="levers rv">
        <div class="lever"><span class="n">01 · Drinks</span><h3>The size ladder and the milk fridge</h3><p>Does the large earn more than the regular, or just cost more? Do oat milk, extra shots and syrups cover what they cost?</p></div>
        <div class="lever"><span class="n">02 · Bakery</span><h3>What sells out, and what gets binned</h3><p>Bakes look profitable until you count what is left at close. Sell-through by item and day sets how many to bake.</p></div>
        <div class="lever"><span class="n">03 · Add-ons</span><h3>The second item</h3><p>How often a coffee leaves with something to eat is one of a café's biggest levers. Bundles lift the bill without cutting margin.</p></div>
        <div class="lever"><span class="n">04 · Delivery</span><h3>Same drink, different cost</h3><p>Commission, cups and bags turn a good dine-in price into a thin delivery one. Some items should come off the app.</p></div>
      </div>
    </div>
  </section>

  <section class="cup" id="cup-check">
    <div class="wrap">
      <span class="label">Cup check</span>
      <h2 class="h2">What does one latte <em>actually leave?</em></h2>
      <p class="lede">Put in your own numbers. Nothing you type here leaves your browser.</p>
      <div class="grid">
        <div class="cf">
          <label><span>Menu price</span><input id="c-price" type="number" inputmode="decimal" value="25" min="0" step="0.5"></label>
          <label><span>VAT in price %</span><input id="c-vat" type="number" inputmode="decimal" value="5" min="0" step="0.5"></label>
          <label><span>Coffee per drink</span><input id="c-coffee" type="number" inputmode="decimal" value="2.2" min="0" step="0.1"></label>
          <label><span>Milk per drink</span><input id="c-milk" type="number" inputmode="decimal" value="1.4" min="0" step="0.1"></label>
          <label><span>Cup, lid &amp; sleeve</span><input id="c-cup" type="number" inputmode="decimal" value="0" min="0" step="0.1"></label>
          <label><span>Sold per week</span><input id="c-qty" type="number" inputmode="numeric" value="400" min="0" step="10"></label>
        </div>
        <div>
          <div class="res">
            <div><span>Left per cup</span><b id="r-left">—</b></div>
            <div><span>Direct cost, % of net price</span><b id="r-pct">—</b></div>
            <div><span>Left per week</span><b id="r-week">—</b></div>
            <div><span>A 1.00 price rise, per week</span><b id="r-up">—</b></div>
          </div>
          <p class="note2">Net price excludes VAT. Direct costs only: no labour, rent or waste. Same currency as your menu.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="audit caudit" id="cafe-audit">
    <div class="wrap">
      <div class="head">
        <div><span class="label">The Menu Profit Boost Audit, for cafés</span><h2 class="h2">Drinks, bakes and add-ons, <em>read separately.</em></h2></div>
        <p class="lede" style="margin:0">The same fixed-scope audit, set up for how a café sells. About 10 working days once we have the data.</p>
      </div>
      <div class="flow rv">
        <div><span class="n">01</span><h3>You share</h3><ul><li>Your menu and price board</li><li>8–13 weeks of item sales, with extras</li><li>Cup and recipe costs, or invoices</li><li>Bakery production and waste, if you keep it</li></ul></div>
        <div><span class="n">02</span><h3>We analyse</h3><ul><li>Drinks and food on separate matrices</li><li>Sizes, milks and extras</li><li>Bakery sell-through and waste</li><li>Add-on rate by time of day</li></ul></div>
        <div><span class="n">03</span><h3>You receive</h3><ul><li>A decision for every item and extra</li><li>Bakery par levels</li><li>Bundles and pairings to test</li><li>A delivery price list, report and review call</li></ul></div>
      </div>
      <div class="cprice">
        <div><span class="label">Founding rate · first five audits</span><div class="price num"><span data-p="audit0">USD 750</span><s data-p="audit1">USD 1,200</s></div><p>Scope agreed in writing before payment. Exports only, no POS login. NDA available.</p></div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><div class="cur" role="group" aria-label="Currency"><button data-cur="USD" aria-pressed="true">USD</button><button data-cur="AED" aria-pressed="false">AED</button><button data-cur="GBP" aria-pressed="false">GBP</button><button data-cur="SGD" aria-pressed="false">SGD</button></div><a class="btn light" href="index.html#contact">Request a café audit</a></div>
      </div>
    </div>
  </section>

  <section class="final2">
    <div class="wrap">
      <h2>Start with a free <em>menu check.</em></h2>
      <p class="lede">Score, three opportunities and your prices against Dubai cafés, in about a minute.</p>
      <div style="margin-top:30px"><a class="btn" href="app/start">Check my menu <span aria-hidden="true">→</span></a></div>
    </div>
  </section>
</main>
''' + FOOT + '''
<div class="mcta" id="mcta"><a class="btn light" href="app/start">Get a free menu check →</a></div>'''

cafe_js = '''<style>.cur button{color:#b3a898;border-color:rgba(243,238,230,.2)}.cprice .cur{border-color:rgba(243,238,230,.25)}.cprice .cur button[aria-pressed="true"]{background:var(--bg);color:var(--ink)}.cprice .price s{color:#8f857a}</style>
<script>
(function(){
  var P={USD:{s:"USD ",audit:[750,1200]},AED:{s:"AED ",audit:[2750,4400]},GBP:{s:"£",audit:[590,950]},SGD:{s:"SGD ",audit:[990,1600]}};
  function setCur(c){var p=P[c];document.querySelectorAll("[data-p]").forEach(function(el){var k=el.dataset.p;el.textContent=p.s+p[k.slice(0,-1)][+k.slice(-1)].toLocaleString("en-GB");});document.querySelectorAll(".cur button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.cur===c);});try{localStorage.setItem("pihoco-cur",c);}catch(e){}}
  document.querySelectorAll(".cur button").forEach(function(b){b.addEventListener("click",function(){setCur(b.dataset.cur);});});
  var saved=null;try{saved=localStorage.getItem("pihoco-cur");}catch(e){}
  if(!saved){var tz="";try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";}catch(e){}saved=/Dubai|Muscat|Qatar|Riyadh|Bahrain|Kuwait/.test(tz)?"AED":/London|Europe\\/(Dublin|Belfast)/.test(tz)?"GBP":/Singapore/.test(tz)?"SGD":"USD";}
  setCur(P[saved]?saved:"USD");
  var $=function(i){return document.getElementById(i)},n=function(i){var v=parseFloat($(i).value);return isFinite(v)?v:0};
  var f2=function(v){return v.toLocaleString("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2})},f0=function(v){return Math.round(v).toLocaleString("en-GB")};
  function calc(){var net=n("c-price")/(1+n("c-vat")/100),cost=n("c-coffee")+n("c-milk")+n("c-cup"),left=net-cost,q=n("c-qty");
    $("r-left").textContent=net>0?f2(left):"—";$("r-pct").textContent=net>0?(cost/net*100).toFixed(1)+"%":"—";$("r-week").textContent=net>0?f0(left*q):"—";$("r-up").textContent="+"+f0(q/(1+n("c-vat")/100));}
  ["c-price","c-vat","c-coffee","c-milk","c-cup","c-qty"].forEach(function(i){$(i).addEventListener("input",calc);});calc();
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches,rv=document.querySelectorAll(".rv");
  if("IntersectionObserver" in window&&!reduce){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});},{rootMargin:"0px 0px -12% 0px"});rv.forEach(function(el){io.observe(el);});}else rv.forEach(function(el){el.classList.add("in");});
  var hero=document.querySelector(".phero .btn"),m=$("mcta");if("IntersectionObserver" in window&&hero)new IntersectionObserver(function(e){m.classList.toggle("on",!e[0].isIntersecting&&e[0].boundingClientRect.top<0);}).observe(hero);
  window.addEventListener("load",function(){if(reduce||!window.Lenis)return;try{window.lenis=new Lenis({autoRaf:true,lerp:0.12,smoothWheel:true,syncTouch:false,anchors:true});}catch(e){}});
})();
</script>
<script src="assets/js/vendor/lenis-1.3.27.min.js" defer></script>'''

(ROOT/'cafes.html').write_text(page('PIHOCO for cafés — the margin is in the extras',
  'Menu engineering for cafés, bakeries and dessert brands: drink sizes, milks and extras, bakery sell-through, add-ons and delivery pricing. Start with a free menu check.',
  'cafes.html', cafe_css, cafe_body, cafe_js))

# ---------------------------------------------------------------- PRIVACY
priv_css = '''
.doc{max-width:760px;margin:0 auto;padding:88px 0 112px}
.doc h1{font-size:clamp(40px,5vw,64px);line-height:1.02;margin:18px 0 0}
.doc .lede{margin-bottom:48px}
.doc h2{font-size:28px;margin:44px 0 14px;padding-top:28px;border-top:1px solid var(--line)}
.doc p,.doc li{color:#3b352e;font-size:16px}
.doc ul{padding-left:20px;margin:0 0 12px}.doc li{margin:6px 0}
.doc table{width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 12px}
.doc th{text-align:left;font:600 10px/1.4 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--ink);padding:10px 12px 10px 0}
.doc td{border-bottom:1px solid var(--line);padding:12px 12px 12px 0;vertical-align:top;color:#3b352e}
.doc .upd{font-size:13px;color:var(--muted);margin-top:48px}
@media (max-width:600px){.doc{padding:56px 0 80px}.doc table{font-size:13px}}
'''
priv_body = nav() + '''
<main>
  <article class="wrap"><div class="doc">
    <span class="label">Privacy &amp; data</span>
    <h1>Your menu and numbers <em>stay yours.</em></h1>
    <p class="lede">What we collect, why, where it is kept and when we delete it, in plain words.</p>

    <h2>On this website</h2>
    <ul>
      <li><b>Contact form.</b> Your name, email, restaurant and message are emailed to us through Web3Forms so we can reply. We use them only to answer you and follow up about our services.</li>
      <li><b>Anonymous click counts.</b> We count page visits and which buttons are clicked (for example "free menu check"), with the page and the referring website. We do not record names, emails, IP addresses or device IDs, and we set no cookies.</li>
      <li><b>Your currency choice</b> is remembered in your own browser only.</li>
      <li>No advertising trackers, and we never sell or share your details.</li>
    </ul>

    <h2>In the free Menu X-ray</h2>
    <ul>
      <li><b>Your menu and result.</b> The dishes, prices, restaurant name, city and score are saved so your share link works.</li>
      <li><b>Covers and average bill</b> are used only for the maths in your browser. They are not stored unless you choose to include them when you contact us.</li>
      <li><b>If you leave your details</b> (name, email and optionally WhatsApp), they are saved and emailed to us so Piyush can follow up.</li>
      <li><b>Price Check.</b> When you compare competitors' public menu prices, those public prices are added anonymously to our local price index unless you untick the box. Your own sales and costs are never added.</li>
    </ul>

    <h2>During a paid engagement</h2>
    <ul>
      <li>We ask only for standard exports: item-level sales, recipe cards, supplier prices. We never need POS logins, guest data or card data.</li>
      <li>Your data is used only for your engagement, under the agreed confidentiality terms and any NDA we sign.</li>
      <li>It is deleted 90 days after the engagement ends, unless you ask us in writing to keep it for follow-up work.</li>
      <li>We never publish your name, results or figures without your written approval. Case studies are anonymised unless you agree otherwise.</li>
      <li>We do not combine one client's data with another's, and we do not sell data.</li>
    </ul>

    <h2>Where it is kept</h2>
    <table>
      <thead><tr><th>Service</th><th>What it holds</th></tr></thead>
      <tbody>
        <tr><td>Supabase (database)</td><td>Menu X-ray menus and results, X-ray contact details, the public price index, anonymous click counts</td></tr>
        <tr><td>Web3Forms (email delivery)</td><td>Passes contact-form and X-ray enquiries to our inbox</td></tr>
        <tr><td>Our email inbox</td><td>Enquiries and engagement correspondence</td></tr>
        <tr><td>Vercel (hosting)</td><td>Serves this website</td></tr>
      </tbody>
    </table>

    <h2>Your choices</h2>
    <p>Ask us at any time to see, correct or delete what we hold about you, including a saved X-ray: <a href="mailto:contact@pihoco.com">contact@pihoco.com</a>. We reply within five working days.</p>
    <p class="upd">Last updated 12 November 2026.</p>
  </div></article>
</main>
''' + FOOT
priv_js = '''<script src="assets/js/vendor/lenis-1.3.27.min.js" defer></script>
<script>window.addEventListener("load",function(){if((window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)||!window.Lenis)return;try{window.lenis=new Lenis({autoRaf:true,lerp:0.12,smoothWheel:true,syncTouch:false,anchors:true});}catch(e){}});</script>'''
(ROOT/'privacy.html').write_text(page('Privacy & data — PIHOCO',
  'What PIHOCO collects on its website, in the free Menu X-ray and during paid engagements, where it is kept and when it is deleted.',
  'privacy.html', priv_css, priv_body, priv_js))
print('built')

# ---------------------------------------------------------------- PIYUSH QUESTIONNAIRE (team only, noindex)
Q = [
 ("Prices & offers", [
  ("price_audit","Menu Profit Boost Audit: founding price for the first five, then list price","radio",["AED 2,750 → AED 4,400 (current)","Lower founding price","Higher founding price","Other"],0),
  ("founding_count","How many founding-rate audits?","radio",["5 (current)","3","10","Other"],0),
  ("price_sprint","Menu Engineering Sprint price","radio",["From AED 9,200 (current)","Quote each time","Other"],0),
  ("scorecard","Full Scorecard (every dish named, full action plan, Excel)","radio",["Free during launch, decide later (current)","Free forever","Paid later at AED 179","Paid later, different price"],0),
  ("retainer","Monthly retainer","radio",["Not offered for now (current)","Offer it from AED 2,600/month","Other"],0)]),
 ("How the numbers work", [
  ("commission_base","Delivery-app commission is charged on…","radio",["The menu price without VAT (current)","The actual delivery sales the app reports","Menu price including VAT","Not sure, check per client"],0),
  ("commission_rate","Typical commission in Dubai to use as the default","radio",["25% (current)","20%","30%","Varies a lot, always ask the client"],0),
  ("delivery_share","Default share of orders through apps, when the owner doesn't say","radio",["0%: ask the owner (current)","20%","35%","50%"],0),
  ("target_food_cost","Target food-cost % shown as the benchmark","radio",["30% (current)","28%","32%","35%"],0),
  ("price_test","Size of the price test suggested for popular, low-earning dishes","radio",["5% of the price, rounded (current)","3%","Fixed small step, e.g. AED 1–3"],0),
  ("popularity_line","Popularity line","radio",["70% of the section average (classic method, current)","Section average (100%)","Other"],0),
  ("weighting","Contribution line is averaged by…","radio",["Plates sold (current)","Sales value"],0),
  ("overheads","Overheads (rent, salaried staff) in the audit","radio",["Leave out: dish contribution only (current)","Include, shared by sales","Include, shared by plates sold","Include, shared equally per dish"],0),
  ("compare_within","Compare dishes within…","radio",["Each menu section (current)","The whole menu"],0)]),
 ("Delivery & capacity", [
  ("turnaround_report","Free report reviewed by you: how fast can you reply?","radio",["Within 1 working day (current promise)","Within 2 working days","Within a week"],0),
  ("turnaround_audit","Audit delivery once data is complete","radio",["About 10 working days (current)","7 working days","15 working days"],0),
  ("capacity","Audits you can take on per month","radio",["2–3","4–6","7+"],1),
  ("markets","Markets to accept now","checks",["Dubai","Rest of UAE","Saudi / Qatar / GCC","UK","Singapore","India"],[0,1])]),
 ("Contact & sign-in", [
  ("whatsapp","Business WhatsApp number for the site (with country code)","text","+971…",None),
  ("booking","Booking link for a 20-minute call (Cal.com or Calendly), if you have one","text","https://cal.com/…",None),
  ("team_emails","Google emails of everyone who should sign in to the team view","text","piyush@…, mitanshu@…, ayush@…",None)]),
 ("Proof & story", [
  ("proof","Any past results we can show, with the client's permission?","textarea","e.g. 'Café in JLT, reworked 6 dishes, food cost 34% → 29% in 2 months'",None),
  ("story_ok","The founder story on the homepage (8 years, 'great guest experience starts behind the menu')","radio",["Approved as is","Needs edits (note below)"],0),
  ("photo","Photos on the site","radio",["Happy to do a real 30-minute photo shoot","Keep the current images for now","Use only the blazer portrait everywhere"],0),
  ("anything","Anything else we should know or change?","textarea","",None)]),
]
def field(k,label,typ,opts,default):
    if typ=="radio":
        o="".join(f'<label class="opt"><input type="radio" name="{k}" value="{x}"{" checked" if i==default else ""}><span>{x}</span></label>' for i,x in enumerate(opts))
        return f'<fieldset class="q"><legend>{label}</legend><div class="opts">{o}</div><input class="other" name="{k}_note" placeholder="Note (optional)"></fieldset>'
    if typ=="checks":
        o="".join(f'<label class="opt"><input type="checkbox" name="{k}" value="{x}"{" checked" if i in default else ""}><span>{x}</span></label>' for i,x in enumerate(opts))
        return f'<fieldset class="q"><legend>{label}</legend><div class="opts">{o}</div></fieldset>'
    if typ=="text":
        return f'<label class="q"><span class="legend">{label}</span><input name="{k}" placeholder="{opts}"></label>'
    return f'<label class="q"><span class="legend">{label}</span><textarea name="{k}" rows="3" placeholder="{opts}"></textarea></label>'
qbody = "".join(f'<section class="grp"><span class="label">{i+1:02d}</span><h2>{t}</h2>'+"".join(field(*f) for f in fs)+'</section>' for i,(t,fs) in enumerate(Q))
q_css = '''
.qwrap{max-width:820px;margin:0 auto;padding:72px 0 120px}
.qwrap h1{font-size:clamp(38px,5vw,60px);line-height:1.02;margin:16px 0 0}
.now{background:var(--bg2);border-left:2px solid var(--brass);padding:16px 20px;margin:30px 0 10px;font-size:14px}
.now b{font-weight:600}
.grp{padding:0;margin-top:56px}
.grp h2{font-size:30px;margin:6px 0 20px}
.q{display:block;border:0;padding:22px 0 20px;margin:0;background:linear-gradient(var(--line),var(--line)) top/100% 1px no-repeat}
.q legend{float:left;width:100%}.q .opts{clear:both}
.q legend,.q .legend{font:400 19px/1.35 var(--serif);padding:0;margin-bottom:12px;display:block}
.opts{display:flex;flex-wrap:wrap;gap:8px}
.opt{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);padding:9px 12px;font-size:14px;cursor:pointer;background:var(--paper)}
.opt input{accent-color:var(--ink);margin:0}
.opt:has(input:checked){border-color:var(--ink);background:#fff}
.q input:not([type]),.q input.other,.q textarea{width:100%;border:0;border-bottom:1px solid var(--line);background:transparent;font:inherit;padding:8px 0;outline:none;border-radius:0}
.q input.other{margin-top:10px;font-size:13.5px}
.q textarea{border:1px solid var(--line);padding:10px;resize:vertical}
.q input:focus,.q textarea:focus{border-color:var(--brass)}
.send{margin-top:48px;display:flex;gap:14px;flex-wrap:wrap;align-items:center}
.status{font-size:14px;margin-top:14px}
'''
q_body = '''<header class="nav"><div class="wrap"><a href="../../" aria-label="PIHOCO home"><img src="../../assets/brand/PIHOCOLOGO.svg" alt="PIHOCO" width="70" height="17"></a><nav aria-label="Main"><span class="label">Team · for Piyush</span></nav></div></header>
<main><div class="wrap"><form class="qwrap" id="qf" novalidate>
  <span class="label">Decisions for PIHOCO · about 10 minutes</span>
  <h1>A few answers, and the site <em>runs on your numbers.</em></h1>
  <p class="lede">Each question is pre-filled with what the website and tools use today. Change anything that's wrong, add notes, then send.</p>
  <div class="now"><b>Until we hear back</b>, the site uses the pre-filled answers: audit AED 2,750 for the first five, then AED 4,400; Full Scorecard free during launch; app commission 25% on the menu price without VAT, only when the owner gives a delivery share; target food cost 30%; 5% price tests; 70% popularity line; dishes compared within each section; no overheads.</div>
  <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px">
  ''' + qbody + '''
  <label class="q"><span class="legend">Your name</span><input name="answered_by" value="Piyush Raikwar"></label>
  <div class="send"><button class="btn" type="submit">Send my answers</button><button class="btn ghost" type="button" id="dl">Download a copy</button></div>
  <p class="status" id="st" role="status"></p>
</form></div></main>'''
q_js = '''<script>
(function(){var f=document.getElementById("qf"),st=document.getElementById("st");
function collect(){var o={},fd=new FormData(f);fd.forEach(function(v,k){if(k==="botcheck")return;if(o[k]){o[k]+=", "+v}else{o[k]=v}});return o;}
function asText(o){var t="PIHOCO decisions — "+new Date().toLocaleString("en-GB")+"\\n\\n";document.querySelectorAll(".q").forEach(function(q){var l=(q.querySelector("legend,.legend")||{}).textContent||"";var n=(q.querySelector("[name]")||{}).name;if(!n)return;t+=l+"\\n→ "+(o[n]||"—")+(o[n+"_note"]?"  ("+o[n+"_note"]+")":"")+"\\n\\n";});return t;}
try{var saved=JSON.parse(localStorage.getItem("pihoco-q")||"null");if(saved)Object.keys(saved).forEach(function(k){f.querySelectorAll("[name=\\""+k+"\\"]").forEach(function(el){if(el.type==="radio"||el.type==="checkbox")el.checked=String(saved[k]).split(", ").indexOf(el.value)>-1;else el.value=saved[k];});});}catch(e){}
f.addEventListener("input",function(){try{localStorage.setItem("pihoco-q",JSON.stringify(collect()))}catch(e){}});
document.getElementById("dl").addEventListener("click",function(){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([asText(collect())],{type:"text/plain"}));a.download="PIHOCO-decisions.txt";a.click();});
f.addEventListener("submit",function(e){e.preventDefault();if(f.botcheck.checked)return;var o=collect(),fd=new FormData();fd.append("access_key","7b083011-54a9-4b02-805a-05c1f4c111e7");fd.append("subject","PIHOCO decisions from "+(o.answered_by||"Piyush"));fd.append("from_name","PIHOCO questionnaire");fd.append("message",asText(o));Object.keys(o).forEach(function(k){fd.append(k,o[k])});
var b=f.querySelector("button[type=submit]");b.disabled=true;b.textContent="Sending…";
fetch("https://api.web3forms.com/submit",{method:"POST",headers:{Accept:"application/json"},body:fd}).then(function(r){return r.json()}).then(function(j){st.textContent=j.success?"Sent. Thank you — Ayush has your answers.":"Didn't send. Use “Download a copy” and share it on WhatsApp.";}).catch(function(){st.textContent="Didn't send. Use “Download a copy” and share it on WhatsApp.";}).finally(function(){b.disabled=false;b.textContent="Send my answers";});});})();
</script>'''
qhtml = page('Decisions for Piyush — PIHOCO','Internal questionnaire.','team/decisions/',q_css,q_body,q_js)
qhtml = qhtml.replace('<meta name="viewport" content="width=device-width, initial-scale=1">','<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex, nofollow">')
qhtml = qhtml.replace('href="assets/','href="../../assets/').replace('src="assets/','src="../../assets/').replace('url("assets/','url("../../assets/')
qhtml = qhtml[:qhtml.index('<script>\n/* Anonymous click counting')] + qhtml[qhtml.index('</script>',qhtml.index('/* Anonymous click counting'))+9:]
(ROOT/'team'/'decisions').mkdir(parents=True,exist_ok=True)
(ROOT/'team'/'decisions'/'index.html').write_text(qhtml)
print('questionnaire built')
