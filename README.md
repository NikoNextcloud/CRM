# PrintPilot AI CRM

Premium CRM application for print shops, vinyl printing companies, sign makers, advertising agencies and branding studios.

The app opens directly to the dashboard. There are no login, register, teams, roles or permissions screens because it is designed for one owner.

## What is included

- Next.js App Router, React, TypeScript and Tailwind CSS.
- Modern bright SaaS interface inspired by Linear, Notion, Vercel Dashboard and Stripe Dashboard.
- Dashboard metrics, revenue/profit/orders chart, recent customers, recent orders and upcoming deadlines.
- Customer 360 view on one page: information, financial overview, orders, files, product gallery, timeline, notes-style activity and AI analysis.
- Interactive Kanban board with drag and drop order movement.
- Cloudflare AI API route with safe demo mode until real keys are added.
- Supabase-ready database schema for customers, orders, order items, products, files, photos, notes, calls, timeline, notifications, tasks, payments, AI recommendations, activity logs and settings.
- Vercel-ready project structure.

## Detailed installation guide

### 1. Install Node.js

Install Node.js from:

https://nodejs.org/

Choose the LTS version. After installation, restart your terminal or computer.

To check that it works, open Command Prompt or PowerShell and run:

```bash
node -v
npm -v
```

You should see version numbers.

On this computer, the project can also use the existing bundled Node runtime in:

```text
C:\Users\User\Documents\IPTV\.runtime\node-v24.18.0-win-x64
```

The included `start-local.bat` automatically uses it when normal `npm` is not available.

### 2. Open the project folder

The project is here:

```text
C:\Users\User\Documents\IPTV\printpilot-ai-crm
```

You can open this folder in Visual Studio Code, Cursor, or another editor.

### 3. Install the app

Open a terminal inside the project folder and run:

```bash
npm install
```

This downloads Next.js, React, Tailwind, Supabase and the UI dependencies.

### 4. Start the local app

Run:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

You can also double-click:

```text
start-local.bat
```

This file installs dependencies and starts the local development server.

### 5. Create Supabase project

1. Go to https://supabase.com/
2. Create a new project.
3. Open SQL Editor.
4. Copy everything from:

```text
supabase/schema.sql
```

5. Paste it in Supabase SQL Editor.
6. Click Run.

This creates all CRM tables.

### 6. Create Supabase Storage buckets

In Supabase, open Storage and create these buckets:

```text
order-files
product-photos
company-assets
```

Use `order-files` for PDF, AI, CDR, SVG, EPS, PNG, JPG, DXF, ZIP and RAR order files.

### 7. Add environment variables

Make a copy of:

```text
.env.example
```

Rename the copy to:

```text
.env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3.1-8b-instruct
```

Restart the local server after changing `.env.local`.

### 8. Cloudflare AI setup

1. Go to https://dash.cloudflare.com/
2. Open your account.
3. Create an API token with Workers AI access.
4. Add the account ID and token to `.env.local`.

Without these keys, the AI route still works in demo mode and returns example recommendations.

### 9. Deploy to Vercel

1. Create a GitHub repository.
2. Upload or push this folder to GitHub.
3. Go to https://vercel.com/
4. Click Add New Project.
5. Import the GitHub repository.
6. Add the same environment variables from `.env.local` inside Vercel Project Settings.
7. Deploy.

After deployment, the app will open directly to the CRM dashboard.

## Development notes

The current version includes realistic sample data so the interface is useful immediately. The next production step is to replace the sample arrays in `lib/data.ts` with Supabase queries and connect file upload controls to Supabase Storage.
