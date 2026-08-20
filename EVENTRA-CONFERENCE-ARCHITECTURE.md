# Eventra Conference Management Platform

## Product scope

Registration → Payment → Submission → Reviewer Assignment → Review → Decision → Notification → Programme → QR Attendance → Certificate → Reports.

## Multi-event architecture

- One Eventra deployment can serve many events.
- Each event has a unique `eventId`.
- Recommended backend: one Google Spreadsheet per event.
- Each event spreadsheet contains multiple tabs:
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
- Organisers must never be given the Google Sheet directly.
- Organiser accounts should only access their own `eventId`.

## Roles

### Super Admin
Create/manage events, organiser accounts and system configuration.

### Event Admin
Manage registration, payments, submissions, reviewers, notifications, programme, attendance and certificates for one event.

### Reviewer
See only assigned submissions and submit scores/comments.

### Scanner Staff
QR scanning and attendance only.

### Participant
Registration, payment, submission, status and receiving QR/certificate links.

## Environment

Create `.env`:

```text
VITE_API_URL=https://YOUR-GOOGLE-APPS-SCRIPT-URL/exec
```

## Backend migration

The existing live Google Apps Script should be preserved until the new API actions are mapped. Do not replace a working production backend with the placeholder `Code.gs` in the original ZIP.

The backend should validate:
1. authenticated user
2. role
3. eventId
4. requested action
5. ownership/assignment

Never trust a client-supplied eventId by itself.

## Suggested API actions

- authLogin
- eventGet
- participantsList
- participantCreate
- paymentsList
- paymentUpdate
- submissionsList
- submissionCreate
- reviewersList
- reviewerCreate
- assignmentsList
- reviewerAssign
- reviewSubmit
- decisionUpdate
- notificationSend
- programmeList
- programmeUpdate
- attendanceCheckin
- certificateGenerate
- certificateSend
- reportsSummary
