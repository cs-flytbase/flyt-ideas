# Dashboard Page UI Documentation

## Overview
The dashboard serves as the central hub for the "FlytIdeas" collaboration platform. It features a modern, Notion-inspired interface with a focus on idea management, collaboration, and task tracking.

## UI Components

### 1. Header Section
- Page title "Dashboard" with a welcome message
- Prominent "Create New Idea" button with plus icon
- Clean spacing with responsive layout that stacks on mobile

### 2. Quick Stats Cards
- Four metric cards in a responsive grid layout (1-column mobile, 2-column tablet, 4-column desktop)
- Each card displays:
  - Icon in a subtle primary color circle
  - Metric name and value
  - Visual consistency across all metrics
- Stats shown: Active Collaborators, My Ideas, Completed Tasks, Hours Saved

### 3. Ideas Management Section
- Tab interface with "My Ideas" and "Collaborated" views
- Card-based layout with 2 columns on larger screens
- Each idea card displays:
  - Idea title and description (truncated with ellipsis)
  - Visual badge indicating privacy status (Private/Public)
  - Number of collaborators with user icon
  - Status badge (In Progress, Reviewing)
  - Progress bar showing completion percentage
  - Collaborator avatars with initials
  - "View Details" action button
- Empty state card for creating new ideas with plus icon

### 4. Shared Checklists Section
- Heading with "View All" action button
- List of checklist cards showing:
  - Checklist title with completion percentage badge
  - Progress bar visualizing completion
  - First 3 checklist items with completion checkboxes
  - "More items" indicator if there are additional items
  - Collaborator avatars and last updated timestamp

### 5. Notifications Panel
- Card with notification count badge
- List of different notification types:
  - Collaboration requests with accept/decline actions
  - Task updates
  - Comments
- Visual distinction between read/unread notifications
- "View All Notifications" action button

### 6. Active Collaborators Panel
- List of team members with avatars
- Full names displayed with initials in avatar
- Online status indicator (green dot for online, amber for away)
- Clean dividers between users

## Color Coding & Status Indicators
- Purple badge for Private ideas
- Blue badge for Public ideas
- Outline badges for status (In Progress, Reviewing)
- Green dots for online users, amber for away users
- Subtle background for unread notifications

## Responsive Behavior
- Desktop: 3-column layout (2/3 for main content, 1/3 for sidebar)
- Tablet: Stacked layout with 2-column grid for ideas
- Mobile: Single-column layout with all elements stacked vertically

## Styling Notes
- Clean, minimalist design with ample white space
- Subtle shadows and rounded corners on cards
- Consistent use of avatars for user representation
- Progress bars use the primary color theme
- Muted colors for secondary information
- Clear visual hierarchy with section headings
