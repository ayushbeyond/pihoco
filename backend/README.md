# Lead inbox: forms → Google Sheet + auto-reply

The site has three forms: the **free Menu Scorecard**, the **enquiry form**, and the **60-second menu check** email capture.
They all post to one free Google Apps Script. It runs on a Google account and:

- adds every lead as a row in a **Leads** sheet, with Status `New` and a reply-due time (48 h for scorecards, 24 h for enquiries),
- saves uploaded menus (PDF or image, up to 8 MB) to a Drive folder and links them in the row,
- emails the visitor an auto-reply and emails the team a "new lead" notice.

Until it's set up, the forms fall back to opening the visitor's email app, as before.

## Set up (about 10 minutes)

1. Sign in to the Google account that should own the leads (ideally the PIHOCO workspace account).
2. Create a new Google Sheet called **PIHOCO Leads**.
3. In the sheet: **Extensions → Apps Script**. Delete the sample code and paste in `apps-script/Code.gs`.
4. At the top of the script, edit `SETTINGS`: `notifyTo`, `replyTo`, and optionally `bookingUrl`.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Approve the permissions (Sheets, Drive, send email).
6. Copy the web-app URL (it ends in `/exec`) into `assets/js/config.js` as `endpoint`.
7. Push. Then test each form once with your own email.

After editing the script later, use **Deploy → Manage deployments → Edit → New version** so the same URL keeps working.

## Using the sheet as a CRM

Change **Status** as leads move: `New → Scorecard sent → Call booked → Proposal → Won / Lost`.
Add a filter on Status and sort by **Reply due** to see what needs answering first.

## Limits

- A free Gmail account can send about 100 emails a day; each lead uses two (auto-reply + notice). A Workspace account allows far more.
- Apps Script can't send from a different address than the account's own unless it's added as a Gmail alias. Once `hello@pihoco.com` exists, run the script from that account or add it as an alias.
