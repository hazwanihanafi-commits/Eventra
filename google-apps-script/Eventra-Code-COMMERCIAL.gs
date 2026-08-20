/*******************************************************
 * EVENTRA MASTER BACKEND
 * Google Apps Script Web App
 *
 * Master Google Sheet:
 * 1V95VUOcUAVnPR0AWXTaOPVk6-ZRV-pQ9i2bjyUOlXbI
 *
 * Master tabs:
 * - Events
 * - Users
 *
 * This backend provides:
 * - Super Admin login
 * - Event Admin login
 * - Event creation
 * - Organiser creation
 * - Event-scoped access
 * - Password hashing
 * - Session tokens
 *
 * IMPORTANT:
 * Set Script Properties:
 * MASTER_SHEET_ID
 * SUPER_ADMIN_EMAIL
 * SUPER_ADMIN_PASSWORD
 *
 * For production, use a strong password and rotate it.
 *******************************************************/

const CONFIG = {
  MASTER_SHEET_ID:
    PropertiesService.getScriptProperties().getProperty("MASTER_SHEET_ID") ||
    "1V95VUOcUAVnPR0AWXTaOPVk6-ZRV-pQ9i2bjyUOlXbI",
  SUPER_ADMIN_EMAIL:
    PropertiesService.getScriptProperties().getProperty("SUPER_ADMIN_EMAIL") || "",
  SUPER_ADMIN_PASSWORD:
    PropertiesService.getScriptProperties().getProperty("SUPER_ADMIN_PASSWORD") || "",
  SESSION_TTL_SECONDS: 21600, // 6 hours
  EVENT_TABS: [
    "Participants",
    "Payments",
    "Submissions",
    "Reviewers",
    "ReviewerAssignments",
    "Reviews",
    "Notifications",
    "Programme",
    "Attendance",
    "Certificates"
  ]
};

const MASTER_HEADERS = {
  Events: [
    "eventId",
    "eventName",
    "organisation",
    "eventDate",
    "spreadsheetId",
    "status",
    "createdAt"
  ],
  Users: [
    "userId",
    "name",
    "email",
    "passwordHash",
    "role",
    "eventId",
    "status",
    "createdAt"
  ]
};

const EVENT_HEADERS = {
  Participants: [
    "participantId","name","email","phone","organisation","country",
    "category","registrationStatus","paymentStatus","qrCode",
    "checkedIn","checkInTime","certificateStatus"
  ],
  Payments: [
    "paymentId","participantId","name","email","category","amount",
    "currency","paymentMethod","transactionRef","proofUrl",
    "paymentStatus","paidAt","receiptUrl"
  ],
  Submissions: [
    "submissionId","participantId","title","abstract","submissionType",
    "track","fileUrl","submittedAt","status","decision","decisionDate"
  ],
  Reviewers: [
    "reviewerId","name","email","organisation","expertise","status",
    "conflictOfInterest"
  ],
  ReviewerAssignments: [
    "assignmentId","submissionId","reviewerId","assignedAt","dueDate","status"
  ],
  Reviews: [
    "reviewId","assignmentId","submissionId","reviewerId","score",
    "comments","recommendation","submittedAt"
  ],
  Notifications: [
    "notificationId","recipientId","recipientEmail","type","subject",
    "status","sentAt","error"
  ],
  Programme: [
    "programmeId","submissionId","presentationType","session","date",
    "startTime","endTime","room","chairperson","status"
  ],
  Attendance: [
    "attendanceId","participantId","qrCode","checkInTime","checkInBy","status"
  ],
  Certificates: [
    "certificateId","participantId","name","certificateType",
    "certificateUrl","emailStatus","sentAt"
  ]
};

/* =========================
   WEB APP
   ========================= */

function doGet(e) {
  return json_({
    success: true,
    service: "Eventra Master Backend",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    return json_(route_(body));
  } catch (err) {
    return json_({
      success: false,
      error: err.message || String(err)
    });
  }
}

function route_(p) {
  const action = String(p.action || "").trim();

  switch (action) {
    case "health":
      return { success: true, service: "Eventra", version: "1.0.0" };

    case "setupMaster":
      return setupMaster();

    case "login":
      return login_(p);

    case "logout":
      return logout_(p);

    case "me":
      return me_(p);

    case "listEvents":
      requireRole_(p, ["super_admin"]);
      return { success: true, events: readObjects_("Events") };

    case "getEvent":
      requireAuthenticated_(p);
      return getEvent_(p);

    case "createEvent":
      requireRole_(p, ["super_admin"]);
      return createEvent_(p);

    case "createOrganiser":
      requireRole_(p, ["super_admin"]);
      return createOrganiser_(p);

    case "createEventWithOrganiser":
      requireRole_(p, ["super_admin"]);
      return createEventWithOrganiser_(p);

    case "dashboardStats":
      requireRole_(p, ["super_admin"]);
      return dashboardStats_(p);

    case "listUsers":
      requireRole_(p, ["super_admin"]);
      return { success: true, users: safeUsers_() };

    case "listEventData":
      requireEventAccess_(p);
      return listEventData_(p);

    default:
      throw new Error("Unknown action: " + action);
  }
}

/* =========================
   AUTHENTICATION
   ========================= */

function login_(p) {
  const email = normalizeEmail_(p.email);
  const password = String(p.password || "");

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  // Super Admin can be defined through Script Properties.
  if (
    CONFIG.SUPER_ADMIN_EMAIL &&
    email === normalizeEmail_(CONFIG.SUPER_ADMIN_EMAIL) &&
    CONFIG.SUPER_ADMIN_PASSWORD &&
    password === CONFIG.SUPER_ADMIN_PASSWORD
  ) {
    const token = createSession_({
      userId: "SUPERADMIN",
      email: email,
      name: "Eventra Super Admin",
      role: "super_admin",
      eventId: ""
    });

    return {
      success: true,
      token: token,
      user: {
        userId: "SUPERADMIN",
        name: "Eventra Super Admin",
        email: email,
        role: "super_admin",
        eventId: ""
      }
    };
  }

  const users = readObjects_("Users");
  const user = users.find(function (u) {
    return normalizeEmail_(u.email) === email &&
      String(u.status || "ACTIVE").toUpperCase() === "ACTIVE";
  });

  if (!user) throw new Error("Invalid email or password.");

  const expected = String(user.passwordHash || "");
  const supplied = hashPassword_(password);

  if (!expected || expected !== supplied) {
    throw new Error("Invalid email or password.");
  }

  const token = createSession_({
    userId: user.userId,
    email: email,
    name: user.name,
    role: user.role,
    eventId: user.eventId || ""
  });

  return {
    success: true,
    token: token,
    user: {
      userId: user.userId,
      name: user.name,
      email: email,
      role: user.role,
      eventId: user.eventId || ""
    }
  };
}

function logout_(p) {
  const token = String(p.token || "");
  if (token) {
    CacheService.getScriptCache().remove("SESSION_" + token);
  }
  return { success: true };
}

function me_(p) {
  const session = requireAuthenticated_(p);
  return { success: true, user: session };
}

function createSession_(user) {
  const token = Utilities.getUuid().replace(/-/g, "") + secretsSuffix_();
  const cache = CacheService.getScriptCache();

  cache.put(
    "SESSION_" + token,
    JSON.stringify(user),
    CONFIG.SESSION_TTL_SECONDS
  );

  return token;
}

function getSession_(token) {
  if (!token) return null;

  const raw = CacheService.getScriptCache().get("SESSION_" + token);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function requireAuthenticated_(p) {
  const session = getSession_(String(p.token || ""));
  if (!session) {
    throw new Error("Authentication required.");
  }
  return session;
}

function requireSuperAdmin_(p) {
  const session = requireAuthenticated_(p);
  if (session.role !== "super_admin") {
    throw new Error("Super Admin access required.");
  }
  return session;
}

function requireRole_(p, roles) {
  const session = requireAuthenticated_(p);
  if (roles.indexOf(session.role) === -1) {
    throw new Error("Insufficient permission.");
  }
  return session;
}

function requireEventAccess_(p) {
  const session = requireAuthenticated_(p);
  const requestedEventId = String(p.eventId || "");

  if (!requestedEventId) {
    throw new Error("eventId is required.");
  }

  if (
    session.role !== "super_admin" &&
    session.eventId !== requestedEventId
  ) {
    throw new Error("You do not have access to this event.");
  }

  return session;
}

/* =========================
   MASTER SETUP
   ========================= */

function setupMaster() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);

  ensureSheetWithHeaders_(ss, "Events", MASTER_HEADERS.Events);
  ensureSheetWithHeaders_(ss, "Users", MASTER_HEADERS.Users);

  // Add configured Super Admin to Users if not already present.
  if (CONFIG.SUPER_ADMIN_EMAIL && CONFIG.SUPER_ADMIN_PASSWORD) {
    const users = readObjects_("Users");
    const email = normalizeEmail_(CONFIG.SUPER_ADMIN_EMAIL);

    const exists = users.some(function (u) {
      return normalizeEmail_(u.email) === email;
    });

    if (!exists) {
      appendObject_("Users", {
        userId: "USR-SUPERADMIN",
        name: "Eventra Super Admin",
        email: email,
        passwordHash: hashPassword_(CONFIG.SUPER_ADMIN_PASSWORD),
        role: "super_admin",
        eventId: "",
        status: "ACTIVE",
        createdAt: now_()
      });
    }
  }

  return {
    success: true,
    message: "Eventra master workbook is ready.",
    spreadsheetId: ss.getId(),
    url: ss.getUrl()
  };
}

/* =========================
   EVENTS
   ========================= */

function createEvent_(p) {
  const session = requireSuperAdmin_(p);

  const eventName = String(p.eventName || "").trim();
  const organisation = String(p.organisation || "").trim();
  const eventDate = String(p.eventDate || "").trim();
  const requestedEventId = String(p.eventId || "").trim();

  if (!eventName || !organisation) {
    throw new Error("eventName and organisation are required.");
  }

  const eventId = requestedEventId || makeEventId_(eventName);

  const existing = readObjects_("Events").find(function (e) {
    return String(e.eventId).toUpperCase() === eventId.toUpperCase();
  });

  if (existing) {
    throw new Error("Event ID already exists.");
  }

  const eventSS = SpreadsheetApp.create("Eventra - " + eventName);

  CONFIG.EVENT_TABS.forEach(function (tab) {
    ensureSheetWithHeaders_(eventSS, tab, EVENT_HEADERS[tab]);
  });

  const event = {
    eventId: eventId,
    eventName: eventName,
    organisation: organisation,
    eventDate: eventDate,
    spreadsheetId: eventSS.getId(),
    status: "ACTIVE",
    createdAt: now_()
  };

  appendObject_("Events", event);

  return {
    success: true,
    event: event,
    spreadsheetUrl: eventSS.getUrl(),
    createdBy: session.email
  };
}

function getEvent_(p) {
  const session = requireAuthenticated_(p);
  const eventId = String(p.eventId || session.eventId || "");

  if (!eventId) throw new Error("eventId is required.");

  if (session.role !== "super_admin" && session.eventId !== eventId) {
    throw new Error("Access denied.");
  }

  const event = readObjects_("Events").find(function (e) {
    return String(e.eventId) === eventId;
  });

  if (!event) throw new Error("Event not found.");

  return { success: true, event: event };
}

/* =========================
   COMMERCIAL EVENT CREATION
   ========================= */

function createEventWithOrganiser_(p) {
  const session = requireRole_(p, ["super_admin"]);

  const eventName = String(p.eventName || "").trim();
  const organisation = String(p.organisation || "").trim();
  const eventDate = String(p.eventDate || "").trim();
  const requestedEventId = String(p.eventId || "").trim();
  const organiserName = String(p.organiserName || "").trim();
  const organiserEmail = normalizeEmail_(p.organiserEmail);
  const organiserPassword = String(p.organiserPassword || "");

  if (!eventName || !organisation || !eventDate || !organiserName ||
      !organiserEmail || !organiserPassword) {
    throw new Error(
      "eventName, organisation, eventDate, organiserName, organiserEmail and organiserPassword are required."
    );
  }

  if (organiserPassword.length < 8) {
    throw new Error("Organiser password must be at least 8 characters.");
  }

  // Prevent duplicate event ID.
  const eventId = requestedEventId || makeEventId_(eventName);
  const existingEvent = readObjects_("Events").find(function (e) {
    return String(e.eventId).toUpperCase() === eventId.toUpperCase();
  });
  if (existingEvent) throw new Error("Event ID already exists: " + eventId);

  // Prevent duplicate organiser email.
  const existingUser = readObjects_("Users").find(function (u) {
    return normalizeEmail_(u.email) === organiserEmail;
  });
  if (existingUser) throw new Error("An organiser with this email already exists.");

  // Create event workbook.
  const eventSS = SpreadsheetApp.create("Eventra - " + eventName);

  CONFIG.EVENT_TABS.forEach(function (tab) {
    ensureSheetWithHeaders_(eventSS, tab, EVENT_HEADERS[tab]);
  });

  const event = {
    eventId: eventId,
    eventName: eventName,
    organisation: organisation,
    eventDate: eventDate,
    spreadsheetId: eventSS.getId(),
    status: "ACTIVE",
    createdAt: now_()
  };

  appendObject_("Events", event);

  const user = {
    userId: "USR-" + Utilities.getUuid().substring(0, 8).toUpperCase(),
    name: organiserName,
    email: organiserEmail,
    passwordHash: hashPassword_(organiserPassword),
    role: "event_admin",
    eventId: eventId,
    status: "ACTIVE",
    createdAt: now_()
  };

  appendObject_("Users", user);

  return {
    success: true,
    event: event,
    organiser: safeUser_(user),
    spreadsheetUrl: eventSS.getUrl(),
    createdBy: session.email
  };
}

function dashboardStats_(p) {
  requireRole_(p, ["super_admin"]);

  const events = readObjects_("Events");
  const users = readObjects_("Users");

  return {
    success: true,
    stats: {
      totalEvents: events.length,
      activeEvents: events.filter(function (e) {
        return String(e.status || "").toUpperCase() === "ACTIVE";
      }).length,
      totalOrganisers: users.filter(function (u) {
        return String(u.role || "") === "event_admin";
      }).length
    },
    events: events
  };
}

/* =========================
   ORGANISERS
   ========================= */

function createOrganiser_(p) {
  requireSuperAdmin_(p);

  const name = String(p.name || "").trim();
  const email = normalizeEmail_(p.email);
  const password = String(p.password || "");
  const eventId = String(p.eventId || "").trim();

  if (!name || !email || !password || !eventId) {
    throw new Error("name, email, password and eventId are required.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const event = readObjects_("Events").find(function (e) {
    return String(e.eventId) === eventId;
  });

  if (!event) throw new Error("Event not found.");

  const users = readObjects_("Users");

  if (users.some(function (u) {
    return normalizeEmail_(u.email) === email;
  })) {
    throw new Error("A user with this email already exists.");
  }

  const user = {
    userId: "USR-" + Utilities.getUuid().substring(0, 8).toUpperCase(),
    name: name,
    email: email,
    passwordHash: hashPassword_(password),
    role: "event_admin",
    eventId: eventId,
    status: "ACTIVE",
    createdAt: now_()
  };

  appendObject_("Users", user);

  return {
    success: true,
    user: safeUser_(user),
    event: event
  };
}

function safeUsers_() {
  return readObjects_("Users").map(safeUser_);
}

function safeUser_(u) {
  return {
    userId: u.userId,
    name: u.name,
    email: u.email,
    role: u.role,
    eventId: u.eventId,
    status: u.status,
    createdAt: u.createdAt
  };
}

/* =========================
   EVENT DATA
   ========================= */

function listEventData_(p) {
  const session = requireEventAccess_(p);
  const eventId = String(p.eventId);

  const event = readObjects_("Events").find(function (e) {
    return String(e.eventId) === eventId;
  });

  if (!event) throw new Error("Event not found.");

  const tab = String(p.tab || "Participants");

  if (CONFIG.EVENT_TABS.indexOf(tab) === -1) {
    throw new Error("Invalid event data tab.");
  }

  const ss = SpreadsheetApp.openById(event.spreadsheetId);
  const sheet = ss.getSheetByName(tab);

  if (!sheet) throw new Error("Event tab not found: " + tab);

  return {
    success: true,
    eventId: eventId,
    tab: tab,
    rows: sheetToObjects_(sheet),
    accessedBy: session.email
  };
}

/* =========================
   SHEET HELPERS
   ========================= */

function getMaster_() {
  return SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
}

function ensureSheetWithHeaders_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function readObjects_(sheetName) {
  const ss = getMaster_();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

  return sheetToObjects_(sheet);
}

function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) return [];

  const headers = values[0].map(function (h) {
    return String(h).trim();
  });

  return values.slice(1)
    .filter(function (row) {
      return row.some(function (v) {
        return String(v).trim() !== "";
      });
    })
    .map(function (row) {
      const obj = {};
      headers.forEach(function (header, i) {
        obj[header] = row[i];
      });
      return obj;
    });
}

function appendObject_(sheetName, obj) {
  const ss = getMaster_();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) throw new Error("Master sheet not found: " + sheetName);

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const row = headers.map(function (h) {
    return obj[String(h)] !== undefined ? obj[String(h)] : "";
  });

  sheet.appendRow(row);
}

/* =========================
   SECURITY HELPERS
   ========================= */

function hashPassword_(password) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(password),
    Utilities.Charset.UTF_8
  );

  return bytes.map(function (b) {
    const v = b < 0 ? b + 256 : b;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
}

function normalizeEmail_(email) {
  return String(email || "").trim().toLowerCase();
}

function secretsSuffix_() {
  return Utilities.getUuid().replace(/-/g, "").substring(0, 16);
}

/* =========================
   UTILITIES
   ========================= */

function makeEventId_(name) {
  const clean = String(name)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .substring(0, 8);

  return (clean || "EVENT") + "-" + new Date().getFullYear();
}

function now_() {
  return new Date().toISOString();
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};

  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return e.parameter || {};
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
