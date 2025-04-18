import { NextResponse } from 'next/server';
import { usersService } from '@/lib/database';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    // Get limit from query params or use default
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    
    // Fetch top contributors
    const topContributors = await usersService.getTopContributors(limit);
    
    return NextResponse.json(topContributors);
  } catch (error) {
    console.error('Error fetching top contributors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top contributors' },
      { status: 500 }
    );
  }
}
