# Eventra commercial setup: Super Admin + organiser accounts

## 1. Create the master Google Spreadsheet

1. Open the Google Apps Script project used by Eventra.
2. Replace the placeholder `Code.gs` with the supplied `google-apps-script/Code.gs` (merge with your existing live functions first if they already power badge/certificate/registration).
3. In **Project Settings → Script Properties**, add:

```text
SUPER_ADMIN_EMAIL=your-email@example.com
SUPER_ADMIN_PASSWORD=use-a-strong-password
```

4. Run `setupEventraMaster()` once from the Apps Script editor.
5. Authorise the script.
6. Copy the logged **Eventra Master Spreadsheet** URL if you want to inspect the Events and Users tabs.

## 2. Deploy Apps Script

Deploy as a Web App:
- Execute as: Me
- Who has access: Anyone with the link (or your institution's permitted setting)

Put the Web App `/exec` URL in the frontend `.env`:

```text
VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_AUTH_MODE=event
```

Do not put the master spreadsheet ID or passwords in the frontend.

## 3. Build the frontend

```bash
npm install
npm run build
```

Deploy the `frontend` folder through Render/Netlify/Vercel as a Vite static site.

## 4. Create the first event

Login using the Super Admin credentials. Open **Super Admin** and create:
- Event ID
- Event name
- Organisation
- Event date
- Admin name
- Organiser email

Eventra automatically creates a dedicated Google Spreadsheet for that event with all conference tabs.

## 5. Organiser login

The Super Admin can create an organiser account. A temporary password is returned once. Send it to the organiser securely; do not store/share passwords in public documents.

## 6. Security rules

- Never give organisers the master spreadsheet.
- Never give organisers the Apps Script editor access.
- Never commit `.env` files or passwords to GitHub.
- Every API action must validate the session and eventId on the server.
- Reviewers must only access their assigned submissions.
- Scanner staff should only have attendance permissions.

## 7. Important migration note

The original ZIP contains a placeholder `Code.gs`. Your live system has existing registration, badge, certificate and email functionality. Before deployment, merge this authentication/event-management layer into the actual production Apps Script rather than replacing working functions.
