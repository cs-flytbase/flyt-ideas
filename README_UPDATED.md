# Reddit at Home – Platform Overview

## Purpose
Reddit at Home is a collaborative platform for idea sharing, project management, and tool discovery. It is designed for teams and communities to:
- Share and discuss ideas in a Reddit-style threaded format
- Collaborate on implementation checklists (shared and personal)
- Track project progress and task completion
- Discover, upvote, and recommend tools, with AI-powered suggestions

## Tech Stack
- **Frontend:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS, ShadCN UI
- **Font:** Geist Sans
- **Authentication:** Clerk
- **Database:** PostgreSQL via Supabase (with Row-Level Security)

## Key Features
- **Dashboard:** Central hub with stats, idea management, checklists, notifications, and collaborators
- **Ideas List:** Toggle privacy, threaded discussions, status filtering, and collaboration
- **Checklists:** Linked to ideas, assignable tasks, completion tracking, due dates
- **Tools Directory:** Community-curated, upvoting, power user roles, detailed tool info, AI suggestions

## Recent Changes
- Improved type safety and error handling in API route handlers
- Fixed type errors related to tool icon rendering (now uses `toolIcons[tool.icon_name]`)
- Updated checklist item deletion logic for better security and clarity
- Documentation and user manual updated for clarity and onboarding

## Documentation
- See `/docs/architecture.md` for system architecture
- See `/docs/database-schema.md` for database design
- See `/USER_MANUAL.md` for a user manual and onboarding guide

## Getting Started
1. Clone the repo and install dependencies (`npm install`)
2. Set up your `.env.local` for Supabase/Clerk
3. Run the development server (`npm run dev`)
4. Sign up and start collaborating!

---

For more details, see the documentation in the `/docs` folder and the user manual.
