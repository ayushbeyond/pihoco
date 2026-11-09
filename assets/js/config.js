/* =========================================================
   PIHOCO — site settings. Edit this file, not the pages.
   ========================================================= */
window.PIHOCO = {
  /* Where enquiries go and the address shown on the site. */
  email: 'contact@pihoco.com',

  /* Google Apps Script web-app URL (see backend/README.md).
     Empty = forms fall back to opening the visitor's email app. */
  endpoint: '',

  /* Booking link (Cal.com / Calendly / Google appointment page).
     Empty = the "Book a call" links stay hidden. */
  bookingUrl: '',

  /* Founding prices for the first five clients, and list prices after.
     Rounded per currency; confirm with the founder before changing. */
  prices: {
    USD: { sym: 'USD ', audit: [750, 1200],  sprint: [2500, 3800],   retainer: [700, 900] },
    AED: { sym: 'AED ', audit: [2750, 4400], sprint: [9200, 13950],  retainer: [2600, 3300] },
    GBP: { sym: '£',    audit: [590, 950],   sprint: [1950, 2950],   retainer: [550, 700] },
    SGD: { sym: 'SGD ', audit: [990, 1600],  sprint: [3300, 5000],   retainer: [920, 1190] }
  }
};
