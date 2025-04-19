# Flyt Idea – User Manual

Welcome to **Flyt Idea**, a collaborative platform for sharing ideas, managing implementation checklists, and leveraging community-driven tools. This guide will help you understand the platform's purpose and how to use each feature effectively.

---

## What is Flyt Idea?

**Flyt Idea** is a modern web platform designed to:
- **Share and discuss ideas** with your team or the broader community (Reddit-style threaded discussions)
- **Collaborate on projects** using shared and personal implementation checklists
- **Track progress** and assign tasks
- **Discover and recommend tools** with an upvoting system and AI-powered suggestions

The platform is built with a clean, intuitive UI using Next.js, Tailwind CSS, and ShadCN UI components, and uses Clerk for secure authentication.

---

## Core Features & How to Use Them

### 1. Home Page
- **Landing page** with a modern gradient background
- **Navigation bar** provides quick links to Dashboard, Ideas, and Tools
- **Explore Ideas** and **Get Started** buttons for easy onboarding

### 2. Dashboard
- **Central hub** for your activity
- **Quick stats**: See active collaborators, your ideas, completed tasks, and hours saved
- **Ideas Management**: View your own and collaborated ideas in a list with status, privacy badges, and progress bars
- **Checklists**: Access shared and personal checklists, track task completion, and see who did what
- **Notifications**: Stay updated on collaboration requests, task updates, and comments
- **Active Collaborators**: See who's online and their roles

### 3. Ideas
- **List view** of all ideas you have access to
- **Toggle privacy**: Switch ideas between public and private
- **Threaded discussions**: Comment and reply in Reddit-style threads
- **Status filtering**: Filter ideas by draft, in-progress, completed, or archived

### 4. Implementation Checklists
- **Directly linked to ideas**
- **Shared checklists**: Visible to all collaborators, tracks who completed each task
- **Personal checklists**: Only visible to you
- **Task assignment**: Assign items to users, set due dates, and mark completion

### 5. Tools Directory
- **Community-curated tools**: Browse, search, and upvote tools
- **Tool details**: See descriptions, categories, pros/cons, best use cases, and power users
- **Become a power user**: Mark yourself as an expert for a tool
- **AI-powered suggestions**: Get recommendations for tools relevant to your ideas

### 6. Authentication & Security
- **Sign up or log in** with Clerk
- **Row-Level Security** ensures your data is only visible to authorized users

---

## Getting Started

1. **Sign Up**: Click 'Get Started' on the home page and create an account.
2. **Explore the Dashboard**: View your stats, ideas, and checklists.
3. **Create an Idea**: Use the 'Create New Idea' button on the dashboard.
4. **Collaborate**: Invite others to your ideas and assign checklist tasks.
5. **Join Discussions**: Comment on ideas and reply to others.
6. **Discover Tools**: Browse the tools directory and become a power user for your favorites.

---

## FAQ

**Q: Who can see my ideas?**
A: Only you and your invited collaborators can see private ideas. Public ideas are visible to the community.

**Q: How do I track who completed a checklist item?**
A: Shared checklists display the user who completed each task.

**Q: Can I assign tasks to others?**
A: Yes, assign checklist items to collaborators and set due dates.

**Q: What is a power user?**
A: Power users are experts on a tool who can help others with best practices and support.

---

## Support
For help or feedback, contact the platform administrator or open an issue on the project repository.

---

Enjoy collaborating and building great ideas with Flyt Idea!

---

## Database Schema Overview

Flyt Idea uses a PostgreSQL database (via Supabase) with the following tables structure:

### Core Tables

| Table Name | Description |
|------------|-------------|
| `users` | Stores user profiles linked to Clerk authentication, including display name, email, avatar, and bio |
| `ideas` | Main content table for storing ideas with title, description, status, and visibility settings |
| `idea_collaborators` | Junction table that links users to ideas they collaborate on with specified roles |
| `idea_assignments` | Tracks which users are assigned to (picked) which ideas, with status tracking (pending, in_progress, completed) |
| `idea_votes` | Records user votes (upvotes/downvotes) on ideas |
| `comments` | Stores threaded discussion comments on ideas with parent-child relationships |

### Task Management

| Table Name | Description |
|------------|-------------|
| `checklists` | Groups of tasks associated with ideas, can be personal or shared |
| `checklist_items` | Individual tasks within checklists with completion status, assignments, and due dates |

### Feature Requests System

| Table Name | Description |
|------------|-------------|
| `feature_requests` | Stores community feature requests with title, description, category, and status |
| `feature_request_comments` | Comments on feature requests |
| `feature_request_tags` | Tag categories for feature requests |
| `feature_request_to_tags` | Junction table connecting feature requests to their tags |
| `feature_request_upvotes` | Records user upvotes on feature requests |

### Content & Activity Tracking

| Table Name | Description |
|------------|-------------|
| `posts` | General content posts outside the ideas framework |
| `tools` | Directory of tools with descriptions, links, and votes |
| `tool_votes` | Records user votes on tools |
| `activity_log` | Tracks user actions across the platform (e.g., completing tasks, creating ideas) |
| `notifications` | System notifications for users about comments, mentions, and status changes |

The database uses Row-Level Security (RLS) policies to ensure data privacy and implements foreign key relationships to maintain data integrity across tables.
