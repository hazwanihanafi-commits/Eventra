# Eventra — Smart Event Registration & Management Platform

Eventra is an event/conference management platform designed to cover the complete event lifecycle:

**Registration → Payment → Submission → Reviewer Assignment → Review → Decision → Notification → Programme → QR Attendance → Certificate → Reports**

## Architecture

- Frontend: React + Vite
- Backend: Google Apps Script Web App
- Database: one Google Spreadsheet per event
- Authentication: Super Admin + Event Admin + Reviewer + Scanner roles
- Deployment: Render/Netlify/Vercel for frontend; Google Apps Script for backend

### Multi-event model

One Eventra deployment can serve multiple organisers:

```text
Eventra
├── Event A → Spreadsheet A
├── Event B → Spreadsheet B
└── Event C → Spreadsheet C
```

Each event spreadsheet contains:

- Participants
- Payments
- Submissions
- Reviewers
- ReviewerAssignments
- Reviews
- Notifications
- Programme
- Attendance
- Certificates

Organisers do **not** receive access to the underlying Google Sheets.

## Roles

### Super Admin
Creates events, organiser accounts and manages all events.

### Event Admin
Manages one event only.

### Reviewer
Views and reviews only assigned submissions.

### Scanner Staff
Performs QR check-in.

### Participant
Registers, pays, submits abstracts and receives QR/certificate emails.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

For production:

```bash
npm run build
```

Deploy the generated `frontend/dist` folder as a static site.

## Google Apps Script setup

See:

- `EVENTRA-SETUP.md`
- `EVENTRA_V2_MIGRATION.md`
- `EVENTRA-CONFERENCE-ARCHITECTURE.md`

The Apps Script must be deployed as a Web App and its `/exec` URL placed in `VITE_API_URL`.

## Important production rule

Do not commit:

- `.env`
- passwords
- API keys
- Google service credentials
- master spreadsheet IDs intended to remain private
- participant data

Use environment variables and Google Apps Script Properties for secrets.

## Current implementation status

The repository contains the Eventra multi-event foundation, authentication flow, event workspace structure, participant/attendance/reporting foundation, conference-management module structure, and Google Apps Script event/authentication layer.

Before a real commercial deployment, merge the multi-event authentication/eventId layer with the **actual production Apps Script functions currently used for registration, QR, badge, certificate and email**. The placeholder backend in this repository intentionally does not overwrite or expose those production credentials/functions.
