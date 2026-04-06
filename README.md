# ANSXtra - Amnuaysilpa School Extracurricular Hub

A extracurricular activities portal for Amnuaysilpa School(Built with Next.js 14, TypeScript, and Tailwind CSS)

## Features

- **Fully Responsive**: Optimized for mobile, tablet, and desktop
- **8 Active Clubs**: Operation Smile, Interact, Duke of Edinburgh, Eco Committee, UNICEF, MUN, TEDx, and School Production
- **Application System**: Students can browse clubs, submit applications, and track their status
- **Local Storage**: Applications are saved locally (ready for backend integration)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4+
- **Animations**: Framer Motion 11+
- **Form Validation**: Zod + React Hook Form
- **Icons**: Lucide React

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
ansxtra-clubsweb/
├── app/                          # Next.js 14 app directory
│   ├── layout.tsx               # Root layout with header/footer
│   ├── page.tsx                 # Home page
│   ├── clubs/                   # Clubs catalog and detail pages
│   ├── apply/                   # Application form and confirmation
│   ├── applications/            # User's application history
│   ├── about/                   # About page
│   └── not-found.tsx           # Custom 404 page
├── components/
│   ├── layout/                  # Header and Footer
│   ├── ui/                      # Reusable UI components
│   ├── clubs/                   # Club-specific components
│   └── home/                    # Home page sections
├── lib/
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Utility functions
│   ├── validations/             # Zod schemas
│   └── types/                   # TypeScript types
├── data/
│   └── clubs.json              # Club data
└── public/
    └── clubs/                   # Club images (optional)
```


'''
What You Need to Do Before Deploying
Ensure .env.local is not committed (it should be in .gitignore).
Fill in required env vars (Supabase keys, Google OAuth, NEXTAUTH_SECRET).
Make sure Supabase backend is set up (profiles table + RLS policies in Supabase SQL editor).
Set the production NEXTAUTH_URL to your deployed URL (e.g., https://your-app.vercel.app).

''''

