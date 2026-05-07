# Beginner Guide: Run This Project on localhost

This guide shows you how to download the project from GitHub and run it on your own computer.

## 1. What You Need First

Install these before you start:

- Git
- Node.js 18 or newer (Node.js 20 LTS recommended)
- npm (installed with Node.js)
- A code editor (VS Code recommended)

Check versions in Terminal:

```bash
git --version
node --version
npm --version
```

## 2. Download the Project from GitHub

Open Terminal and run:

```bash
git clone https://github.com/aintelzenter/schoolclub.git
cd schoolclub
```

## 3. Install Project Dependencies

```bash
npm install
```

## 4. Create Environment File

Create a file named .env.local in the project root.

Add these variables (replace values with your own):

```dotenv
# Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Email (Nodemailer - Free SMTP)
# For development, you can skip this (email sending will be disabled)
# For production, set up free SMTP (Gmail, Mailtrap, or Ethereal)
# See .env.local.example for detailed instructions
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Admin allowlist (comma-separated emails)
ADMIN_EMAILS=admin1@example.com,admin2@example.com
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

Important:

- Do not commit .env.local to GitHub.
- Keep service keys and secrets private.
- Email sending is optional for local development (warnings will be logged if SMTP_HOST is not set).

## 5. Set Up Supabase Database

Open your Supabase project dashboard.

Go to SQL Editor and run the SQL from:

- supabase-setup.sql

This creates required tables and policies, including:

- profiles
- applications

## 6. Configure Google OAuth

In Google Cloud Console:

- Create or open an OAuth client
- Add this Authorized Redirect URI:

https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback

In Supabase Dashboard:

- Authentication -> Providers -> Google
- Enable Google
- Paste the same Google Client ID and Client Secret

In your app:

- Ensure NEXTAUTH_URL is http://localhost:3000
- Ensure this callback is allowed by Google:

http://localhost:3000/api/auth/callback/google

## 7. Start the App

```bash
npm run dev
```

Open:

- http://localhost:3000

## 8. Common Issues and Fixes

### Issue: Could not find table public.applications

Fix:

- Run supabase-setup.sql in Supabase SQL Editor
- Refresh page and retry

### Issue: Sign in loops back to sign-in page

Fix:

- Confirm Google redirect URIs are correct
- Confirm Google provider is enabled in Supabase
- Confirm .env.local values match your project

### Issue: Admin page says Forbidden

Fix:

- Sign in with an email listed in ADMIN_EMAILS
- Restart dev server after editing .env.local

## 9. Useful Commands

```bash
npm run dev     # start local dev server
npm run build   # build production bundle
npm run start   # run production build
npm run lint    # run lint checks
```

## 10. Stop the Server

In the terminal running the app, press:

- Control + C
