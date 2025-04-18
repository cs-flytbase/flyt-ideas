# Dashboard Page Code Logic Documentation

## File Location
`src/app/dashboard/page.tsx`

## Component Structure
The dashboard page is implemented as a React functional component using Next.js 14 App Router architecture. It uses a combination of ShadCN UI components and custom styling with Tailwind CSS.

```tsx
const DashboardPage = () => {
  // Data preparation
  const myIdeas = ideasData.ideas.slice(0, 2);
  const collaboratedIdeas = ideasData.ideas.slice(2, 4);
  const checklists = checklistsData.checklists.slice(0, 2);
  const notifications = [...]; // Mock notification data
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header section */}
        {/* Stats cards */}
        {/* Main content grid */}
      </div>
    </MainLayout>
  );
}
```

## Key Functionality

### Imports
- UI Components:
  - `MainLayout` for the page structure with sidebar
  - Various UI components from ShadCN: `Card`, `Button`, `Avatar`, `Tabs`, `Badge`
  - Lucide icons: `Bell`, `CheckCircle`, `Users`, `PlusCircle`, `Clock`, `ChevronRight`
- Data:
  - `ideasData` from JSON data file for idea content
  - `checklistsData` from JSON data file for task management

### Data Management
- Separates ideas into two categories:
  - `myIdeas`: First 2 ideas from the JSON as user-created ideas
  - `collaboratedIdeas`: Next 2 ideas as ideas the user is collaborating on
- Loads checklists data with tasks and collaborator information
- Creates mock notification data with different types:
  - Collaboration requests that require accept/decline actions
  - Task updates with associated idea information
  - Comments on existing ideas

### UI Organization
1. **Layout Structure**:
   - Main content divided into two areas using CSS Grid:
     - Main content area (2/3 width on large screens)
     - Sidebar (1/3 width on large screens)
   - Responsive design that adapts to different screen sizes

2. **Component Hierarchy**:
   ```
   MainLayout
   └── Dashboard Container
       ├── Header Section (title + create button)
       ├── Stats Cards Grid
       │   └── 4 Stat Cards
       └── Main Content Grid
           ├── Ideas Section (2/3 width)
           │   ├── Tab Navigation
           │   ├── My Ideas Tab Content
           │   │   └── Idea Cards + Create Card
           │   ├── Collaborated Tab Content
           │   │   └── Idea Cards
           │   └── Shared Checklists
           │       └── Checklist Cards
           └── Sidebar (1/3 width)
               ├── Notifications Panel
               │   └── Notification Items
               └── Active Collaborators Panel
                   └── User List Items
   ```

### Key Interactive Elements
1. **Tab Interface**: Implements a tab system for toggling between "My Ideas" and "Collaborated Ideas"
2. **Notification Actions**: Provides accept/decline buttons for collaboration requests
3. **Progress Visualization**: Uses dynamic width styling to show progress bars
4. **Conditional Styling**:
   - Applies different styling for completed vs. incomplete tasks
   - Uses different colors for private vs. public ideas
   - Shows visual indicators for online/away user status
   - Highlights unread notifications with background color

### State Management Considerations
- Currently uses static data with no client-side state management
- Future implementation will need:
  - Authentication state for user identification
  - Form state for creating new ideas
  - Server state for real-time updates via Supabase

### Performance Optimizations
- Limits the number of displayed items (ideas, checklists, notifications)
- Uses CSS grid and flexbox for efficient layouts
- Implements responsive design to optimize for different devices
- Uses Tailwind's utility classes for styling without extra CSS
- Uses ShadCN's pre-built components for consistent UI patterns
