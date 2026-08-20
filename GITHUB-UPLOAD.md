# Upload Eventra to GitHub

1. Create a new GitHub repository, e.g. `Eventra-Conference-Platform`.
2. Keep the repository private while development is ongoing.
3. Upload the contents of this folder (not the ZIP file itself).
4. Do not upload `.env`.
5. Upload `frontend/.env.example` only.
6. Connect the repository to Render/Netlify/Vercel.
7. Add the production `VITE_API_URL` as an environment variable in the hosting service.
8. Deploy the Google Apps Script backend separately.

Recommended repository layout:

```text
Eventra-Conference-Platform/
├── frontend/
├── google-apps-script/
├── src/
├── participants/
├── dashboard/
├── admin/
├── scanner/
├── README.md
├── EVENTRA-SETUP.md
└── .gitignore
```

For the first commercial event, create one event spreadsheet and one Event Admin account.
