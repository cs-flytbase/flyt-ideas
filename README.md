# Reddit at Home

A collaborative platform for sharing ideas and managing implementation checklists. Built with Next.js 14+ and TypeScript.

## Features

- **Ideas Management**: List view of ideas with public/private toggle functionality
- **Implementation Checklists**: Directly connected to ideas with shared and personal options
- **Posts & Comments**: Reddit-style threaded discussions for sharing and collaborating on ideas
- **Top Contributors**: Showcase of users who have published the most ideas
- **Collaborative Tracking**: See who completed which tasks on shared checklists
- **Modern UI**: Clean, focused interface built with Tailwind CSS and ShadCN UI components
- **Authentication**: Secure user authentication with Clerk

## Application Structure

### Pages

- **Dashboard** (`/dashboard`): Main overview of your ideas and recent activity
- **Ideas** (`/ideas`): Browse all ideas with filtering options
  - **Idea Details** (`/ideas/[id]`): View specific idea with discussions and checklists
- **Posts** (`/posts`): Community discussions and idea sharing
  - **Post Details** (`/posts/[id]`): View specific post with comments
- **Tools** (`/tools`): Access community-driven tools directory
  - **Tool Details** (`/tools/[id]`): View specific tool information
- **Authentication**: Handled via Clerk (login/signup flows)

### API Endpoints

- `/api/ideas`: Manage ideas
- `/api/ideas/[id]`: Operations on specific ideas
- `/api/ideas/[id]/checklists`: Manage checklists for specific ideas
- `/api/posts`: Manage posts and discussions
- `/api/posts/[id]`: Operations on specific posts
- `/api/posts/[id]/comments`: Manage comments on posts
- `/api/users/top-contributors`: Get users who have published the most ideas
- `/api/checklist-items`: Manage checklist items
- `/api/checklist-items/[itemId]`: Operations on specific checklist items

## Ideas & Checklists

### Ideas Management
- Ideas are displayed in a clean list view format (not cards)
- Toggle between public and private status for each idea
- Split-screen interface with ideas list on the left (1/3 width) and implementation details on the right (2/3 width)
- Filter ideas by various criteria including status and collaboration

### Implementation Checklists
- Directly connected to ideas for seamless workflow
- Two types of checklists:
  - **Shared Checklists**: Visible to all collaborators with tracking of who completed which tasks
  - **Personal Checklists**: Private to-do lists for individual planning
- Progress tracking with completion metrics
- Assign tasks to specific team members

## Posts & Community

### Posts System
- Share thoughts, questions, and discussions with the community
- Rich text content with support for formatting
- Tag posts for better organization
- Upvote system for highlighting valuable content

### Comments
- Threaded comment system on posts for discussions
- User avatars and names displayed for better community interaction
- Ability to delete your own comments

### Top Contributors
- Showcase of users who have published ideas
- Visual indicators (badges) for the top 3 contributors
- Encourages participation and community building

## User Interface

The application features a modern, clean UI with:
- Main layout with sidebar navigation and top navbar with user authentication
- Threaded discussion system for idea collaboration
- Tailwind CSS and ShadCN UI components for consistent styling
- Geist Sans as the primary font throughout the application
- Responsive design that works on mobile, tablet and desktop

## Authentication

The application uses Clerk for authentication:
- Secure user sign-up and login
- User profile management
- Avatar and display name customization
- Integration with application permissions system

## Data Management

The application uses Supabase for data storage:
- PostgreSQL database for structured data
- Real-time updates where appropriate
- Efficient querying with joins and batched operations
- Proper error handling and fallbacks

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Design

This project uses:
- [Tailwind CSS](https://tailwindcss.com) for styling
- [ShadCN UI](https://ui.shadcn.com) for components
- [Geist Sans](https://vercel.com/font) as the main font family
- [Clerk](https://clerk.dev) for authentication
- [Supabase](https://supabase.com) for database
- App Router for page routing
- TypeScript for type safety

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Clerk Documentation](https://clerk.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)
