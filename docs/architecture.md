# FlytIdeas - Architecture Overview

This document outlines the architecture of the FlytIdeas platform, focusing on how the database schema integrates with the frontend components.

## Tech Stack

- **Frontend**: Next.js 14+ with App Router and TypeScript
- **Styling**: Tailwind CSS with ShadCN UI components
- **Font**: Geist Sans throughout the UI
- **Authentication**: Clerk
- **Database**: PostgreSQL via Supabase
- **Schema**: Row-Level Security for data protection

## Core Components

### Dashboard Layout

Following user preferences, the dashboard focuses specifically on ideas and implementation checklists:

- **Split-screen approach**:
  - Ideas list on the left (1/3 width)
  - Implementation checklists on the right (2/3 width) when an idea is selected
  - Clean, focused UI without unnecessary features

### Ideas Management

- **List View**: Ideas displayed in a simplified list rather than cards
- **Status Toggle**: Ability to toggle between public/private status
- **Filtering**: By status (draft, in-progress, completed, archived)
- **Data Flow**: Ideas table → IdeasList component → Dashboard

### Implementation Checklists

- **Direct Connection**: Checklists are directly connected to ideas
- **Two Types**:
  - Shared checklists (visible to all collaborators)
  - Personal checklists (private to the creator)
- **Completion Tracking**: Shared checklists track who completed which tasks
- **Data Flow**: Ideas → Checklists → ChecklistItems → UI

## Database Integration

### Authentication Flow

1. Clerk handles user authentication
2. User data syncs to the `users` table via triggers
3. RLS policies restrict data access based on authentication

### Data Access Patterns

- **Ideas Retrieval**:
  ```typescript
  // Public ideas or ideas the user has access to via RLS policies
  const { data: ideas } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false });
  ```

- **Checklist Retrieval**:
  ```typescript
  // Get both shared and personal checklists for an idea
  const { data: checklists } = await supabase
    .from('checklists')
    .select('*, checklist_items(*)')
    .eq('idea_id', ideaId);
  ```

### Type Safety

Database interactions maintain type safety through:
- Properly cast UUID and text fields in queries
- Supabase TypeScript types for database tables
- Frontend validation before data submission

## UI/UX Considerations

- **Simplified Dashboard**: Focus on core functionality
- **Progressive Disclosure**: Complex features hidden until needed
- **Inline Editing**: Edit ideas and checklist items without page transitions
- **Real-time Updates**: Checklist completions trigger activity logs

## Security Model

- Type handling is crucial for security policies:
  ```sql
  auth.uid()::text = creator_id::text
  ```
- These policies ensure:
  - Users can only see content they have permission to view
  - Content creation/editing is restricted to appropriate users
  - Collaborative features maintain proper access boundaries
