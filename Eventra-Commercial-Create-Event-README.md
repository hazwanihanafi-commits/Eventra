# Eventra Commercial Event Creation

## Backend
Replace your Google Apps Script `Code.gs` with `Eventra-Code-COMMERCIAL.gs`.

This adds:
- `createEventWithOrganiser`
- `dashboardStats`

The new action creates:
1. Event record in Master `Events`
2. A dedicated Google Spreadsheet
3. All event tabs
4. Event Admin user
5. Event-scoped `eventId`

## Frontend
Add:
- `SuperAdminDashboard.jsx`
- `SuperAdminDashboard.css`

The component expects:
- `VITE_API_URL` = Apps Script `/exec` URL
- login token stored as `eventra_token` or `token`

If your login uses another localStorage key, change `getToken()`.

## Important
Do not commit passwords, API keys, or `.env` files to GitHub.
