/**
 * PIHOCO — lead inbox (Google Apps Script web app)
 *
 * Receives the website forms, then:
 *   1. adds a row to the "Leads" sheet (your CRM),
 *   2. saves any uploaded menu to a Drive folder,
 *   3. sends the visitor an auto-reply and notifies the team.
 *
 * Setup: see backend/README.md. Runs free on a Google account.
 */

var SETTINGS = {
  sheetName: 'Leads',
  driveFolderName: 'PIHOCO — Scorecard menus',
  notifyTo: 'contact@pihoco.com',      // who gets the "new lead" email
  replyTo: 'contact@pihoco.com',
  senderName: 'Piyush Raikwar · PIHOCO',
  site: 'https://pihoco.com',
  bookingUrl: ''                              // optional: added to the enquiry auto-reply
};

var COLUMNS = ['Received', 'Type', 'Status', 'Reply due', 'Name', 'Email', 'Business', 'Venue', 'City',
  'Interest', 'Menu link', 'Menu file', 'Message', 'Check score', 'Check fixes', 'Currency', 'Page', 'Referrer', 'UTM'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse(e.postData.contents || '{}');
    if (d.website) return json({ ok: true }); // honeypot
    var type = String(d.type || 'enquiry');
    if (['scorecard', 'enquiry', 'check'].indexOf(type) < 0) return json({ ok: false, error: 'type' });
    if (!isEmail(d.email)) return json({ ok: false, error: 'email' });

    var fileUrl = '';
    if (d.file && d.file.data) fileUrl = saveFile(d.file, d.business || d.email);

    var now = new Date();
    var due = new Date(now.getTime() + (type === 'scorecard' ? 48 : 24) * 3600 * 1000);
    sheet().appendRow([
      now, type, 'New', due, clean(d.name), clean(d.email), clean(d.business), clean(d.venue), clean(d.city),
      clean(d.interest), clean(d.menuLink), fileUrl, clean(d.message),
      d.score === undefined ? '' : d.score, (d.fixes || []).join('\n'), clean(d.currency),
      clean(d.page), clean(d.referrer), d.utm ? JSON.stringify(d.utm) : ''
    ]);

    autoReply(type, d);
    notify(type, d, fileUrl);
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return json({ ok: true, service: 'PIHOCO leads' }); }

/* ---------- Emails ---------- */

function autoReply(type, d) {
  var first = String(d.name || '').split(' ')[0] || 'there';
  var subject, body;
  if (type === 'scorecard') {
    subject = 'We have your menu — scorecard within 2 working days';
    body = [
      'Hi ' + first + ',',
      '',
      'Thank you for sending the menu for ' + (d.business || 'your venue') + '. I will review it myself and send your one-page Menu Scorecard within two working days.',
      '',
      'It covers layout and where the eye lands, price anchoring, dish descriptions, item count, and three fixes you can make this week.',
      '',
      'Your menu is used only to prepare the scorecard. It is never published or shared.',
      '',
      'Piyush Raikwar',
      'Founder, PIHOCO — menu engineering & F&B advisory',
      SETTINGS.site
    ];
  } else if (type === 'check') {
    var fixes = d.fixes || [];
    subject = 'Your 60-second menu check: ' + (d.score || 0) + ' of 5 signs';
    body = ['Hi,', '', 'Here is your result from the 60-second menu check on ' + SETTINGS.site + ': ' + (d.score || 0) + ' of 5 signs.', ''];
    if (fixes.length) {
      body.push('One practical step for each sign:', '');
      fixes.forEach(function (f, i) { body.push((i + 1) + '. ' + f); });
    } else {
      body.push('No warning signs, which is rare. An audit would give you a baseline to measure future changes against.');
    }
    body.push('', 'Want a proper read? Reply with your menu (PDF, photo or link) and I will send a free one-page Menu Scorecard within two working days.', '', 'Piyush Raikwar', 'Founder, PIHOCO', SETTINGS.site);
  } else {
    subject = 'Thanks for your enquiry — PIHOCO';
    body = [
      'Hi ' + first + ',',
      '',
      'Thank you for getting in touch about ' + (d.interest || 'menu engineering') + (d.business ? ' for ' + d.business : '') + '. I will reply within one working day, usually with two times for a short call.',
      SETTINGS.bookingUrl ? '\nIf you would rather pick a time now: ' + SETTINGS.bookingUrl : '',
      '',
      'Piyush Raikwar',
      'Founder, PIHOCO — menu engineering & F&B advisory',
      SETTINGS.site
    ];
  }
  MailApp.sendEmail({ to: d.email, subject: subject, body: body.join('\n'), name: SETTINGS.senderName, replyTo: SETTINGS.replyTo });
}

function notify(type, d, fileUrl) {
  var label = { scorecard: 'Scorecard request', enquiry: 'Enquiry', check: 'Menu check' }[type];
  var lines = [
    label + ' from ' + (d.name || d.email) + (d.business ? ' — ' + d.business : ''),
    '',
    'Email: ' + d.email,
    d.city ? 'City: ' + d.city : '',
    d.venue ? 'Venue: ' + d.venue : '',
    d.interest ? 'Interest: ' + d.interest : '',
    d.menuLink ? 'Menu link: ' + d.menuLink : '',
    fileUrl ? 'Menu file: ' + fileUrl : '',
    d.score !== undefined ? 'Check score: ' + d.score + ' of 5' : '',
    d.message ? '\n' + d.message : '',
    '',
    'All leads: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ].filter(function (l) { return l !== ''; });
  MailApp.sendEmail({ to: SETTINGS.notifyTo, subject: '[PIHOCO] ' + label + (d.business ? ' — ' + d.business : ''), body: lines.join('\n'), replyTo: d.email });
}

/* ---------- Helpers ---------- */

function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SETTINGS.sheetName) || ss.insertSheet(SETTINGS.sheetName);
  if (sh.getLastRow() === 0) { sh.appendRow(COLUMNS); sh.setFrozenRows(1); sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold'); }
  return sh;
}

function saveFile(f, label) {
  var bytes = Utilities.base64Decode(f.data);
  if (bytes.length > 8 * 1024 * 1024) return '(file over 8 MB, not saved)';
  var ok = /^(application\/pdf|image\/)/.test(f.type);
  if (!ok) return '(file type not accepted)';
  var it = DriveApp.getFoldersByName(SETTINGS.driveFolderName);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(SETTINGS.driveFolderName);
  var name = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd') + ' — ' + clean(label).slice(0, 60) + ' — ' + clean(f.name).slice(0, 80);
  return folder.createFile(Utilities.newBlob(bytes, f.type, name)).getUrl();
}

function clean(v) {
  var s = v === undefined || v === null ? '' : String(v).trim().slice(0, 4000);
  return /^[=+\-@]/.test(s) ? "'" + s : s; // stop spreadsheet formula injection
}
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '')); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
