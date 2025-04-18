# FlytIdeas - Database Schema Documentation

This document outlines the database schema for the FlytIdeas collaborative platform, with a particular focus on ideas and implementation checklists.

## Core Entities

### Users
- Mapped to Clerk authentication
- Stores basic user information and online status
- Primary key: `id` (text, Clerk user ID)

### Ideas
- Central concept for collaboration
- Can be public (published) or private (unpublished)
- Primary key: `id` (UUID)
- Creator reference: `creator_id` (references users)
- Status tracking for progress (`draft`, `in_progress`, `completed`, `archived`)

### Idea Collaborators
- Junction table connecting users to ideas they collaborate on
- Defines collaboration roles (viewer, editor, admin)
- References both `users` and `ideas` tables

## Implementation Checklists

Based on user requirements, checklists are a core feature:

### Checklists
- Directly connected to ideas via `idea_id`
- Can be either shared (visible to all collaborators) or personal
- Primary key: `id` (UUID)
- Idea reference: `idea_id` (references ideas)
- Creator reference: `creator_id` (references users)
- `is_shared` boolean flag distinguishes between shared and personal checklists

### Checklist Items
- Individual tasks within a checklist
- Tracks completion status and who completed the task
- Supports optional assignment to specific users
- Optional due dates for task planning
- Primary key: `id` (UUID)
- Checklist reference: `checklist_id` (references checklists)

## Discussion System

### Comments
- Supports threaded discussions on ideas
- Self-referencing for nested replies via `parent_id`
- Primary key: `id` (UUID)
- Idea reference: `idea_id` (references ideas)
- Author reference: `user_id` (references users)

## Community Features

### Tools Directory
- Collaborative directory of useful tools
- Upvoting system to highlight popular tools
- Primary key: `id` (UUID)
- Submitter reference: `submitted_by` (references users)

### Posts
- Community posts for discussions outside of specific ideas
- Primary key: `id` (UUID)
- Author reference: `creator_id` (references users)

## Activity Tracking

### Activity Log
- Tracks important activities across the platform
- Particularly useful for monitoring checklist item completions
- Primary key: `id` (UUID)
- References to relevant entities (users, ideas, checklists, etc.)

## Row-Level Security (RLS)

All tables have row-level security enabled with appropriate policies:

- Published ideas are visible to everyone
- Unpublished ideas are only visible to their creators and collaborators
- Users can only create/update their own content
- Collaborators have access based on their assigned roles

## Type Handling Notes

When working with the database:

- User IDs from Clerk authentication are stored as text
- All other primary keys are UUIDs
- When comparing between these types in policies or queries, explicit type casting is required:
  ```sql
  auth.uid()::text = creator_id::text
  ```

## UI Implementation

The current implementation provides:
- Split-screen approach with ideas list on the left (1/3 width)
- Implementation checklists on the right (2/3 width) when an idea is selected
- Clean UI focused on core functionality without unnecessary features
