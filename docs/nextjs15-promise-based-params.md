# Next.js 15 Promise-Based Route Parameters Guide

## Introduction

Next.js 15 introduced a significant change in how route parameters are handled in API routes. Rather than being directly accessible as plain objects, route parameters are now returned as Promises that must be awaited. This document explains the implementation details and best practices for working with this new pattern.

## The Promise-Based Parameters Pattern

### Key Changes in Next.js 15

- Route parameters are now delivered as a Promise that must be awaited
- This applies to all dynamic API routes (routes with parameters in square brackets like `[id]`)
- TypeScript type annotations must reflect this Promise-based structure

## Implementation Details

### Type Definition

When defining route handlers, you need to properly type the parameters as a Promise:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  // Handler implementation
}
```

### Accessing Parameters

To access the actual parameter values, you must await the params Promise:

```typescript
const { id } = await params;
```

### Complete Example

Here's a complete example of a route handler that follows the Next.js 15 pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  // Await the params Promise to get the actual values
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }
  
  try {
    // Fetch and process data using the id parameter
    // ...
    
    return NextResponse.json({ /* your response data */ });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
```

## Multi-Parameter Routes

For routes with multiple parameters, all parameters are included in the Promise object:

```typescript
// Route: /api/posts/[postId]/comments/[commentId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
): Promise<Response> {
  const { postId, commentId } = await params;
  
  // Process using both parameters
  // ...
}
```

## Best Practices

### Error Handling

Since working with Promises introduces potential rejection scenarios, proper error handling is essential:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    // Process request
  } catch (error) {
    console.error('Error processing parameters:', error);
    return NextResponse.json({ error: 'Invalid request parameters' }, { status:400 });
  }
}
```

### Parameter Validation

Always validate parameters after awaiting them:

```typescript
const { id } = await params;

if (!id || typeof id !== 'string') {
  return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
}
```

### TypeScript Integration

Leverage TypeScript for better type safety with the Promise-based parameters:

```typescript
type PostParams = {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<PostParams> }
): Promise<Response> {
  const { id } = await params;
  // Implementation
}
```

## Common Pitfalls

### Forgetting to Await

The most common mistake is forgetting to await the params Promise:

```typescript
// ❌ INCORRECT: Not awaiting params
const { id } = params; // TypeScript error: Property 'id' does not exist on type 'Promise<{ id: string; }>'.

// ✅ CORRECT: Properly awaiting params
const { id } = await params;
```

### Incorrect Type Annotations

Make sure your type annotations correctly reflect the Promise-based structure:

```typescript
// ❌ INCORRECT: Missing Promise in type annotation
{ params }: { params: { id: string } }

// ✅ CORRECT: Properly typed Promise parameters
{ params }: { params: Promise<{ id: string }> }
```

## Migration from Earlier Next.js Versions

If upgrading from an earlier version of Next.js to version 15, you'll need to update all your API route handlers:

1. Add Promise wrapping to the params type annotation
2. Add await when destructuring params
3. Update any TypeScript interfaces or types related to route parameters

## Conclusion

The Promise-based parameters pattern in Next.js 15 represents a shift in how route parameters are handled. By following the practices outlined in this document, you can effectively work with this new pattern while maintaining type safety and robust error handling in your API routes.
