# Eventra V2 – Multi-Event Migration

This version changes the frontend from a single USM/ICEE interface into an event-based platform.

## What changed

- Removed hard-coded USM/ICEE branding from the main dashboard, header and footer.
- Added dynamic event information: event ID, event name, organisation, date, logo and colours.
- Added organiser login page and protected routes.
- Added session storage for organiser/event information.
- Added `eventId` to API requests.
- Added a logout button.
- Kept `VITE_AUTH_MODE=legacy` as the default so the existing live API can still be used while the backend is migrated.
- Badge and print-badge pages now use event configuration instead of hard-coded ICEE/USM text.

## Recommended commercial architecture

One organiser/event should have its own Google Sheet. The organiser should never edit the Sheet directly.

`Organiser -> Eventra -> Event API -> Event Google Sheet`

Suggested master structure:

- `Events` sheet: eventId, eventName, organisation, eventDate, sheetId, logoUrl, primaryColor, secondaryColor, status
- `Users` sheet: userId, email, passwordHash, role, eventId, active
- One participant Sheet per event

Roles:

- `super_admin`: manage all events
- `event_admin`: manage one event
- `scanner`: scan/check-in only

## Backend requirement

The uploaded `google-apps-script/Code.gs` is only an API-ready placeholder and is not the full backend used by the currently deployed Eventra/USM system. Do NOT replace your currently working live Apps Script blindly.

Before commercial deployment, merge the following backend capabilities into the actual live Apps Script:

1. `login` – verify organiser credentials and return a short-lived session token plus event configuration.
2. `events` – super admin event list.
3. `event` – return event configuration for an authorised event.
4. `list`, `stats`, `participant`, `checkin`, `sendBadgeEmail`, `generateCertificate`, `sendCertificateEmail`, `sendAllCertificateEmails` – every action must validate `eventId` and the authenticated user before accessing the event Sheet.
5. Never trust a participant/event ID supplied by the browser without checking that the logged-in user has access to that event.

## Frontend modes

### Temporary migration mode

`.env`:

`VITE_AUTH_MODE=legacy`

This keeps the existing live backend behaviour. It is NOT a secure commercial login; any credentials will create a local legacy session.

### Commercial mode

`.env`:

`VITE_AUTH_MODE=event`

The frontend then calls `POST ?action=login` and expects:

```json
{
  "success": true,
  "session": {
    "token": "SESSION_TOKEN",
    "role": "event_admin",
    "email": "organiser@example.com",
    "event": {
      "eventId": "EVT001",
      "eventName": "ABC Conference 2027",
      "organisation": "ABC University",
      "eventDate": "10–12 March 2027",
      "logoUrl": "https://...",
      "primaryColor": "#4B0082",
      "secondaryColor": "#7C3AED",
      "adminName": "Conference Secretariat"
    }
  }
}
```

## New event onboarding

For every new organiser:

1. Create a new Google Sheet.
2. Create the participant columns used by Eventra.
3. Register the event in the master `Events` sheet.
4. Create an organiser account linked to that event ID.
5. Give the organiser their Eventra login only.
6. Test registration, QR delivery, scanning, badge generation and certificate email.
7. Archive the event Sheet after the event.

## Important

Do not give clients your master Google Sheet, Apps Script project, service credentials or Super Admin account.
