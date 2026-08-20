/**
 * EVENTRA - Multi-event conference backend
 *
 * Master spreadsheet contains:
 *   Events: eventId, eventName, organisation, eventDate, logoUrl, primaryColor, secondaryColor, adminName, spreadsheetId, status, createdAt
 *   Users: userId, email, passwordHash, role, eventId, active, createdAt
 *
 * Each event gets its own Google Spreadsheet with tabs:
 * Participants, Payments, Submissions, Reviewers, ReviewerAssignments,
 * Reviews, Notifications, Programme, Attendance, Certificates
 *
 * IMPORTANT: keep this Apps Script private to the organiser/admin team.
 */

function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const action = String(p.action || '').trim();
    if (!action) return evtJson_({ success: true, service: 'Eventra API', version: '3.0.0' });

    const token = getBearerToken_(e);
    const eventId = String(p.eventId || '').trim();

    switch (action) {
      case 'eventGet':
        return evtJson_({ success: true, event: evtGetForSession_(token, eventId) });
      case 'stats':
        evtAuthorise_(token, eventId);
        return evtJson_(evtStats_(eventId));
      case 'list':
        evtAuthorise_(token, eventId);
        return evtJson_({ success: true, participants: evtEventRows_(eventId, 'Participants') });
      case 'participant':
        evtAuthorise_(token, eventId);
        return evtJson_({ success: true, participant: evtFindEventRow_(eventId, 'Participants', 'id', p.id) });
      case 'checkin':
        evtAuthorise_(token, eventId);
        return evtJson_(evtCheckin_(eventId, p.id));
      case 'sendBadgeEmail':
        evtAuthorise_(token, eventId);
        return evtJson_({ success: false, message: 'Connect your existing badge-email function here.' });
      case 'sendAllCertificateEmails':
        evtAuthorise_(token, eventId);
        return evtJson_({ success: false, message: 'Connect your existing certificate-email function here.' });
      case 'adminEvents':
        evtRequireRole_(token, 'super_admin');
        return evtJson_({ success: true, events: evtRows_('Events') });
      default:
        return evtJson_({ success: false, message: 'Unknown action: ' + action });
    }
  } catch (err) {
    return evtJson_({ success: false, message: err.message || String(err) });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = String(payload.action || '').trim();

    switch (action) {
      case 'login':
        return evtJson_(evtLogin_(payload));
      case 'createEvent':
        evtRequireRole_(payload.token, 'super_admin');
        return evtJson_(evtCreateEvent_(payload));
      case 'createOrganiser':
        evtRequireRole_(payload.token, 'super_admin');
        return evtCreateOrganiserResponse_(payload);
      case 'logout':
        evtDestroySession_(payload.token);
        return evtJson_({ success: true });
      default:
        return evtJson_({ success: false, message: 'Unknown POST action.' });
    }
  } catch (err) {
    return evtJson_({ success: false, message: err.message || String(err) });
  }
}

function evtJson_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function evtMasterSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('MASTER_SHEET_ID');
  if (!id) throw new Error('MASTER_SHEET_ID is not configured. Run setupEventraMaster() first.');
  return SpreadsheetApp.openById(id);
}

function evtRows_(sheetName) {
  const sheet = evtMasterSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Missing master sheet: ' + sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values.shift().map(String);
  return values.filter(row => row.some(v => v !== '')).map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

function evtFindEvent_(eventId) {
  const event = evtRows_('Events').find(r => String(r.eventId).trim() === String(eventId).trim() && String(r.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
  if (!event) throw new Error('Event not found or inactive.');
  return event;
}

function evtFindUser_(email) {
  const e = String(email || '').trim().toLowerCase();
  return evtRows_('Users').find(r => String(r.email || '').trim().toLowerCase() === e && String(r.active || 'YES').toUpperCase() === 'YES');
}

function evtHashPassword_(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password), Utilities.Charset.UTF_8);
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function evtCreateSession_(user, event) {
  const token = Utilities.getUuid() + '-' + Utilities.getUuid();
  CacheService.getScriptCache().put('EVENTRA_SESSION_' + token, JSON.stringify({
    userId: user.userId,
    email: user.email,
    role: user.role,
    eventId: user.role === 'super_admin' ? null : event.eventId,
  }), 21600);
  return token;
}

function evtGetSession_(token) {
  if (!token) throw new Error('Authentication required.');
  const raw = CacheService.getScriptCache().get('EVENTRA_SESSION_' + token);
  if (!raw) throw new Error('Session expired. Please sign in again.');
  return JSON.parse(raw);
}

function evtAuthorise_(token, eventId) {
  const session = evtGetSession_(token);
  if (session.role !== 'super_admin' && String(session.eventId) !== String(eventId)) {
    throw new Error('You are not authorised to access this event.');
  }
  return session;
}

function evtRequireRole_(token, role) {
  const session = evtGetSession_(token);
  if (session.role !== role) throw new Error('Authorisation denied.');
  return session;
}

function evtDestroySession_(token) {
  if (token) CacheService.getScriptCache().remove('EVENTRA_SESSION_' + token);
}

function getBearerToken_(e) {
  // Apps Script Web Apps do not reliably expose custom Authorization headers.
  // Frontend therefore also sends ?token=... for GET requests.
  return String((e && e.parameter && e.parameter.token) || '');
}

function evtLogin_(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  if (!email || !password) throw new Error('Email and password are required.');

  const user = evtFindUser_(email);
  if (!user || String(user.passwordHash) !== evtHashPassword_(password)) {
    throw new Error('Invalid email or password.');
  }

  const event = user.role === 'super_admin' ? null : evtFindEvent_(user.eventId);
  const token = evtCreateSession_(user, event || { eventId: null });

  return {
    success: true,
    session: {
      token,
      role: user.role,
      email: user.email,
      userId: user.userId,
      event: event ? evtPublicEvent_(event) : null,
    },
  };
}

function evtPublicEvent_(event) {
  return {
    eventId: event.eventId,
    eventName: event.eventName,
    organisation: event.organisation,
    eventDate: event.eventDate,
    logoUrl: event.logoUrl || '',
    primaryColor: event.primaryColor || '#4B0082',
    secondaryColor: event.secondaryColor || '#7C3AED',
    adminName: event.adminName || 'Event Administrator',
    spreadsheetId: event.spreadsheetId || '',
  };
}

function evtGetForSession_(token, eventId) {
  const session = evtAuthorise_(token, eventId);
  return evtPublicEvent_(evtFindEvent_(session.role === 'super_admin' && !eventId ? session.eventId : eventId));
}

function evtEventSpreadsheet_(eventId) {
  const event = evtFindEvent_(eventId);
  if (!event.spreadsheetId) throw new Error('Event spreadsheet is not configured.');
  return SpreadsheetApp.openById(String(event.spreadsheetId));
}

function evtEventRows_(eventId, sheetName) {
  const sheet = evtEventSpreadsheet_(eventId).getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values.shift().map(String);
  return values.filter(row => row.some(v => v !== '')).map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

function evtFindEventRow_(eventId, sheetName, key, value) {
  const row = evtEventRows_(eventId, sheetName).find(r => String(r[key]).trim() === String(value).trim());
  return row || null;
}

function evtStats_(eventId) {
  const participants = evtEventRows_(eventId, 'Participants');
  const payments = evtEventRows_(eventId, 'Payments');
  const submissions = evtEventRows_(eventId, 'Submissions');
  const attendance = evtEventRows_(eventId, 'Attendance');
  const certificates = evtEventRows_(eventId, 'Certificates');
  const paid = payments.filter(r => String(r.status).toLowerCase() === 'paid').length;
  const checkedIn = attendance.filter(r => String(r.status || 'Checked In').toLowerCase() !== 'cancelled').length;
  const accepted = submissions.filter(r => String(r.status).toLowerCase() === 'accepted').length;
  const underReview = submissions.filter(r => String(r.status).toLowerCase() === 'under review').length;
  return { success: true, stats: {
    participants: participants.length,
    paid,
    submissions: submissions.length,
    accepted,
    underReview,
    checkedIn,
    certificates: certificates.length,
    attendancePercent: participants.length ? Math.round(checkedIn / participants.length * 100) : 0,
  }};
}

function evtCheckin_(eventId, id) {
  const participant = evtFindEventRow_(eventId, 'Participants', 'id', id);
  if (!participant) throw new Error('Participant not found.');
  const ss = evtEventSpreadsheet_(eventId);
  let sheet = ss.getSheetByName('Attendance');
  if (!sheet) sheet = ss.insertSheet('Attendance').appendRow(['participantId','name','checkInTime','status']);
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift().map(String);
  const idx = headers.indexOf('participantId');
  const existing = rows.findIndex(r => String(r[idx]) === String(id));
  const now = new Date();
  if (existing >= 0) {
    sheet.getRange(existing + 2, headers.indexOf('checkInTime') + 1).setValue(now);
    sheet.getRange(existing + 2, headers.indexOf('status') + 1).setValue('Checked In');
  } else {
    sheet.appendRow([id, participant.name || '', now, 'Checked In']);
  }
  return { success: true, message: 'Checked in', participant };
}

function evtCreateEvent_(payload) {
  const eventId = String(payload.eventId || '').trim().toUpperCase();
  const eventName = String(payload.eventName || '').trim();
  const organisation = String(payload.organisation || '').trim();
  if (!eventId || !eventName || !organisation) throw new Error('eventId, eventName and organisation are required.');
  if (evtRows_('Events').some(r => String(r.eventId).toUpperCase() === eventId)) throw new Error('Event ID already exists.');

  const ss = SpreadsheetApp.create('Eventra - ' + eventName);
  const tabs = {
    Participants: ['id','name','email','organisation','country','category','status','registeredAt'],
    Payments: ['paymentId','participantId','amount','currency','method','status','paidAt','receiptUrl'],
    Submissions: ['submissionId','participantId','title','abstract','track','fileUrl','status','submittedAt'],
    Reviewers: ['reviewerId','name','email','organisation','expertise','active'],
    ReviewerAssignments: ['assignmentId','submissionId','reviewerId','assignedAt','status'],
    Reviews: ['reviewId','assignmentId','score','comments','recommendation','submittedAt'],
    Notifications: ['notificationId','participantId','type','subject','status','sentAt'],
    Programme: ['programmeId','submissionId','session','type','date','time','room','chair'],
    Attendance: ['participantId','name','checkInTime','status'],
    Certificates: ['certificateId','participantId','type','fileUrl','emailStatus','sentAt'],
  };
  const defaultSheet = ss.getSheets()[0];
  defaultSheet.setName('Participants');
  defaultSheet.clear();
  Object.keys(tabs).forEach((name, i) => {
    const sh = name === 'Participants' ? defaultSheet : ss.insertSheet(name);
    sh.getRange(1,1,1,tabs[name].length).setValues([tabs[name]]);
    sh.setFrozenRows(1);
  });

  const row = [eventId,eventName,organisation,String(payload.eventDate || ''),String(payload.logoUrl || ''),String(payload.primaryColor || '#4B0082'),String(payload.secondaryColor || '#7C3AED'),String(payload.adminName || 'Event Administrator'),ss.getId(),'ACTIVE',new Date()];
  evtMasterSpreadsheet_().getSheetByName('Events').appendRow(row);
  return { success: true, event: evtPublicEvent_(evtFindEvent_(eventId)) };
}

function evtCreateOrganiserResponse_(payload) {
  const result = evtCreateOrganiser_(payload);
  return evtJson_(result);
}

function evtCreateOrganiser_(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const eventId = String(payload.eventId || '').trim().toUpperCase();
  if (!email || !eventId) throw new Error('Email and eventId are required.');
  evtFindEvent_(eventId);
  if (evtFindUser_(email)) throw new Error('A user with this email already exists.');

  const password = String(payload.password || evtGeneratePassword_());
  const user = [Utilities.getUuid(), email, evtHashPassword_(password), 'event_admin', eventId, 'YES', new Date()];
  evtMasterSpreadsheet_().getSheetByName('Users').appendRow(user);
  return { success: true, email, eventId, temporaryPassword: password };
}

function evtGeneratePassword_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 10) + 'A!';
}

function setupEventraMaster() {
  const existing = PropertiesService.getScriptProperties().getProperty('MASTER_SHEET_ID');
  const ss = existing ? SpreadsheetApp.openById(existing) : SpreadsheetApp.create('Eventra Master');
  PropertiesService.getScriptProperties().setProperty('MASTER_SHEET_ID', ss.getId());

  const events = ss.getSheetByName('Events') || ss.insertSheet('Events');
  const users = ss.getSheetByName('Users') || ss.insertSheet('Users');
  const eventHeaders = ['eventId','eventName','organisation','eventDate','logoUrl','primaryColor','secondaryColor','adminName','spreadsheetId','status','createdAt'];
  const userHeaders = ['userId','email','passwordHash','role','eventId','active','createdAt'];
  if (events.getLastRow() === 0) events.appendRow(eventHeaders);
  if (users.getLastRow() === 0) users.appendRow(userHeaders);
  events.setFrozenRows(1); users.setFrozenRows(1);

  // Create/update the first Super Admin using script properties.
  const adminEmail = PropertiesService.getScriptProperties().getProperty('SUPER_ADMIN_EMAIL');
  const adminPassword = PropertiesService.getScriptProperties().getProperty('SUPER_ADMIN_PASSWORD');
  if (!adminEmail || !adminPassword) {
    throw new Error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in Script Properties, then run setupEventraMaster() again.');
  }
  const existingUser = evtFindUser_(adminEmail);
  if (!existingUser) {
    users.appendRow([Utilities.getUuid(), adminEmail.toLowerCase(), evtHashPassword_(adminPassword), 'super_admin', '', 'YES', new Date()]);
  }
  Logger.log('Eventra Master Spreadsheet: ' + ss.getUrl());
}
