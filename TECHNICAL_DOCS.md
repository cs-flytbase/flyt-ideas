# Reddit at Home - Technical Documentation

This document provides a comprehensive technical overview of the Reddit at Home application codebase. It's designed to give developers a clear understanding of the code structure, component relationships, and data flow.

## Application Architecture

### Technology Stack
- **Frontend**: Next.js 14+ with App Router, React, TypeScript
- **Styling**: Tailwind CSS with ShadCN UI components
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended)

### Directory Structure

```
src/
├── app/                  # App Router pages and API routes
│   ├── api/              # Backend API endpoints
│   ├── dashboard/        # Dashboard page
│   ├── ideas/            # Ideas listing and detail pages
│   ├── posts/            # Posts listing and detail pages
│   └── tools/            # Tools directory pages
├── components/           # Reusable React components
│   ├── ui/               # UI components (ShadCN)
│   ├── idea-card.tsx     # Card component for ideas
│   ├── main-layout.tsx   # Main application layout with sidebar and navbar
│   └── sidebar.tsx       # Navigation sidebar
├── contexts/             # React contexts for state management
│   └── UserContext.tsx   # User context provider
├── lib/                  # Utility functions and service logic
│   ├── database.ts       # Database service functions
│   └── supabase.ts       # Supabase client configuration
└── styles/               # Global styles
```

## Core Components

### MainLayout (src/components/main-layout.tsx)
The main layout wrapper that includes the sidebar navigation and top navbar with user authentication. It maintains consistent layout across the application.

### Sidebar (src/components/sidebar.tsx)
Navigation component that provides links to different sections of the application and displays the current user's avatar and name.

### IdeaCard (src/components/idea-card.tsx)
Card component used to display individual ideas in the ideas listing page with title, description, author information, and interaction controls.

## Database Services (src/lib/database.ts)

The application uses a service-oriented approach to database interactions, with several key services:

### usersService
Handles user-related operations:
- `getUserById(userId)`: Fetch user by ID
- `getTopContributors(limit)`: Get users who have published the most ideas

### ideasService
Manages idea-related operations:
- `getIdeas(options)`: Fetch ideas with optional filtering
- `getIdea(id)`: Get a single idea by ID
- `createIdea(idea, userId)`: Create a new idea
- `updateIdea(ideaId, updates)`: Update an existing idea
- `deleteIdea(ideaId)`: Delete an idea

### checklistsService
Handles checklist functionality:
- `getIdeaChecklists(ideaId, userId)`: Get checklists for an idea
- `createChecklist(checklist, userId)`: Create a new checklist
- `updateChecklist(checklistId, updates)`: Update a checklist
- `addChecklistItem(item, userId)`: Add an item to a checklist
- `toggleItemCompletion(itemId, completed, userId)`: Mark items complete/incomplete

### postsService
Manages forum posts and comments:
- `getPosts(options)`: Get posts with optional filters
- `getPost(id)`: Get a single post by ID
- `createPost(post, userId)`: Create a new post
- `getPostComments(postId)`: Get comments for a post
- `addPostComment(postId, content, userId)`: Add a comment to a post

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  last_active: string;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}
```

### Idea
```typescript
interface Idea {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  is_published: boolean;
  published_at?: string;
  upvotes: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}
```

### Post
```typescript
interface Post {
  id: string;
  title: string;
  content: string;
  description: string;
  creator_id: string;
  is_public: boolean;
  upvotes: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}
```

### Checklist
```typescript
interface Checklist {
  id: string;
  idea_id: string;
  title: string;
  is_shared: boolean;
  creator_id: string;
  created_at: string;
  updated_at: string;
}
```

### ChecklistItem
```typescript
interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  position: number;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  created_by: string;
}
```

### TopContributor
```typescript
interface TopContributor {
  id: string;
  display_name: string;
  avatar_url: string;
  post_count: number;
  comment_count: number;
  idea_count: number;
  total_contributions: number;
}
```

## Key Pages and Their Functionality

### Dashboard (/dashboard)
The dashboard provides an overview of the user's ideas and recent activity. It features:
- Split-screen layout with ideas list on the left (1/3) and implementation details on right (2/3)
- Quick access to personal and shared checklists
- Status filters for ideas (draft, in-progress, completed, archived)

### Ideas Page (/ideas)
Lists all published ideas with:
- Filtering by categories
- Top Contributors section showing users who have published the most ideas
- Ideas displayed in card format with author, date, and interaction statistics
- Create new idea functionality

### Posts Page (/posts)
Community discussion forum with:
- Threaded comments on posts
- User attribution with avatars
- Ability to create, read, update, and delete posts/comments
- Tag-based categorization

## Authentication Flow

The application uses Clerk for authentication:
1. User signs in via Clerk's authentication UI
2. Upon successful authentication, user data is stored in the Clerk session
3. The UserContext provider in the application provides the user information to components
4. User data is synchronized with the application's database for user-specific operations

## Database Integration

Supabase integration provides:
1. User data storage and retrieval
2. Posts, ideas, and checklist management
3. Permissions and access control
4. Efficient queries using joins and filtering

## Common Patterns

### Data Fetching
The application follows these patterns for data fetching:
1. API routes in `/app/api` handle server-side operations
2. Client components use `fetch` or custom hooks to request data
3. Loading states are managed with React state variables
4. Error handling is implemented at both API and UI levels

### State Management
The application uses:
1. React Context for global state (UserContext)
2. React useState and useEffect for component-level state
3. Props for component communication
4. URL parameters for page-specific data

### UI Component Organization
The UI follows these principles:
1. Page components in the `/app` directory define routes
2. Reusable components in `/components` for common UI elements
3. ShadCN UI components for consistent styling and behavior
4. Tailwind CSS for custom styling

## Database Schema

### Tables
- `users`: User profiles linked to Clerk authentication
- `ideas`: User-created ideas with metadata
- `posts`: Community discussion posts
- `post_comments`: Comments on posts
- `checklists`: Implementation checklists linked to ideas
- `checklist_items`: Individual items within checklists
- `idea_collaborators`: User collaborations on ideas

### Relationships
- Users can create multiple ideas, posts, and comments
- Ideas can have multiple checklists
- Checklists can have multiple items
- Posts can have multiple comments
- Ideas can have multiple collaborators

## Best Practices for Extending the Codebase

1. **Adding New Features**:
   - Create components in the appropriate `/components` subdirectory
   - Add API endpoints in `/app/api` following the existing pattern
   - Update database services in `database.ts` for new data operations

2. **Styling New Components**:
   - Use Tailwind CSS classes consistent with the existing design
   - Leverage ShadCN UI components where possible
   - Follow the dark mode theme conventions

3. **Adding New Pages**:
   - Create new directories in `/app` following Next.js App Router conventions
   - Use the MainLayout component for consistent navigation
   - Implement proper loading and error states
