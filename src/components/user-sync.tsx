'use client';

import { useEffect, useRef } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { useUser } from '@/contexts/UserContext';

/**
 * UserSync component - Ensures user data is synchronized between Clerk and Supabase
 * This component should be rendered on pages requiring authentication
 */
export function UserSync() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const { refreshUserData, supabaseUser } = useUser();
  const hasSynced = useRef(false);
  
  // Create or update user record in Supabase on login - only once per session
  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (!clerkUser || hasSynced.current) return;
      
      try {
        hasSynced.current = true;
        
        // 1. First ensure the user exists (create minimal record if needed)
        const createResponse = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!createResponse.ok) {
          console.error('Failed to create user record');
          return;
        }
        
        // Only update if we don't already have the user data in Supabase
        if (!supabaseUser) {
          // 2. Then update with complete profile information
          const updateResponse = await fetch('/api/user', {
            method: 'PUT', 
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: clerkUser.emailAddresses[0]?.emailAddress || '',
              displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
              avatarUrl: clerkUser.imageUrl || ''
            })
          });
          
          if (!updateResponse.ok) {
            console.error('Failed to update user profile');
          } else {
            // Refresh the user data in context
            refreshUserData();
          }
        }
      } catch (error) {
        console.error('Error synchronizing user data:', error);
      }
    };
    
    if (clerkLoaded && clerkUser) {
      syncUserWithSupabase();
    }
  }, [clerkUser, clerkLoaded, refreshUserData, supabaseUser]);
  
  // This component doesn't render anything
  return null;
}
