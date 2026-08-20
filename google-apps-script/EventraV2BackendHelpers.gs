/**
 * Eventra V2 backend helpers.
 * Merge these helpers into the ACTUAL live Apps Script that currently powers
 * registration, QR, badge and certificate functions. Do not replace the live
 * script with this file without migrating those existing functions.
 */

function evtJson_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function evtMasterSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('MASTER_SHEET_ID');
  if (!id) throw new Error('MASTER_SHEET_ID is not configured.');
  return SpreadsheetApp.openById(id);
}

function evtRows_(sheetName) {
  const sheet = evtMasterSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error(`Missing master sheet: ${sheetName}`);
  const values = sheet.getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift().map(String);
  return values.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

function evtFindEvent_(eventId) {
  const event = evtRows_('Events').find(r => String(r.eventId).trim() === String(eventId).trim() && String(r.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
  if (!event) throw new Error('Event not found or inactive.');
  return event;
}

function evtHashPassword_(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password), Utilities.Charset.UTF_8);
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function evtCreateSession_(user, event) {
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('EVENTRA_SESSION_' + token, JSON.stringify({
    userId: user.userId,
    email: user.email,
    role: user.role,
    eventId: user.role === 'super_admin' ? null : event.eventId,
  }), 21600);
  return token;
}

function evtAuthorise_(token, eventId) {
  if (!token) throw new Error('Authentication required.');
  const raw = CacheService.getScriptCache().get('EVENTRA_SESSION_' + token);
  if (!raw) throw new Error('Session expired. Please sign in again.');
  const session = JSON.parse(raw);
  if (session.role !== 'super_admin' && String(session.eventId) !== String(eventId)) {
    throw new Error('You are not authorised to access this event.');
  }
  return session;
}

/**
 * Login action example.
 * Call this from doPost(e) in the live backend.
 */
function evtLogin_(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  if (!email || !password) throw new Error('Email and password are required.');

  const user = evtRows_('Users').find(r => String(r.email || '').trim().toLowerCase() === email && String(r.active || 'YES').toUpperCase() === 'YES');
  if (!user || String(user.passwordHash) !== evtHashPassword_(password)) throw new Error('Invalid email or password.');

  const event = user.role === 'super_admin' ? null : evtFindEvent_(user.eventId);
  const token = evtCreateSession_(user, event || { eventId: null });

  return {
    success: true,
    session: {
      token,
      role: user.role,
      email: user.email,
      event: event ? {
        eventId: event.eventId,
        eventName: event.eventName,
        organisation: event.organisation,
        eventDate: event.eventDate,
        logoUrl: event.logoUrl,
        primaryColor: event.primaryColor || '#4B0082',
        secondaryColor: event.secondaryColor || '#7C3AED',
        adminName: event.adminName || 'Event Administrator',
      } : null,
    },
  };
}
