'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

type UserContextType = {
  user: any | null;
  isLoading: boolean;
  supabaseUser: any | null;
  refreshUserData: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  supabaseUser: null,
  refreshUserData: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSupabaseUser = async () => {
    if (!clerkUser) {
      setSupabaseUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUser.id)
        .single();

      if (error) {
        console.error('Error fetching user from Supabase:', error);
        setSupabaseUser(null);
        return false;
      } else {
        setSupabaseUser(data);
        return true;
      }
    } catch (error) {
      console.error('Failed to fetch Supabase user:', error);
      setSupabaseUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createSupabaseUser = async () => {
    if (!clerkUser) return;

    try {
      // Get email from the first email address in the list
      const primaryEmail = clerkUser.emailAddresses?.length > 0 
        ? clerkUser.emailAddresses[0].emailAddress 
        : '';
      
      // Build a display name from firstName and lastName
      const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: clerkUser.id,
            email: primaryEmail,
            avatar_url: clerkUser.imageUrl,
            display_name: fullName || 'User',
            is_online: true,
            last_active: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user in Supabase:', error);
      } else {
        setSupabaseUser(data);
      }
    } catch (error) {
      console.error('Failed to create Supabase user:', error);
    }
  };

  // Helper function to retry a promise with exponential backoff
  const retryWithBackoff = async (
    fn: () => Promise<any>,
    retries = 3,
    delay = 300,
    backoffFactor = 2
  ) => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      
      console.log(`Retrying after ${delay}ms, ${retries} retries left...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return retryWithBackoff(fn, retries - 1, delay * backoffFactor, backoffFactor);
    }
  };

  const syncSupabaseUser = async () => {
    if (!clerkUser) {
      return;
    }
    
    if (!supabaseUser) {
      return;
    }
    
    // Check if user data has actually changed to avoid unnecessary syncs
    const primaryEmail = clerkUser.emailAddresses?.length > 0 
      ? clerkUser.emailAddresses[0].emailAddress 
      : '';
    
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    
    // Compare with current data in Supabase
    if (
      supabaseUser.email === primaryEmail &&
      supabaseUser.avatar_url === clerkUser.imageUrl &&
      supabaseUser.display_name === (fullName || 'User')
    ) {
      // No changes needed
      return;
    }
    
    // Only log when in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Syncing user with updated data');
    }
    
    // Check if Supabase URL is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase URL or anon key is missing. Cannot sync user.');
      return;
    }

    try {
      // Use retry logic for network operations
      const result = await retryWithBackoff(async () => {
        return await supabase
          .from('users')
          .update({
            email: primaryEmail,
            avatar_url: clerkUser.imageUrl,
            display_name: fullName || 'User',
            is_online: true,
            last_active: new Date().toISOString()
          })
          .eq('id', clerkUser.id)
          .select()
          .single();
      });
      
      const { data, error } = result;

      if (error) {
        console.error('Error syncing user in Supabase:', JSON.stringify(error));
      } else {
        // Only log in development environment
        if (process.env.NODE_ENV === 'development') {
          console.log('Successfully synced user in Supabase');
        }
        setSupabaseUser(data);
      }
    } catch (error) {
      // Check for network errors specifically
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network error when syncing user with Supabase. Please check your connection and Supabase credentials.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to sync Supabase user: ${errorMessage}`);
      }
    }
  };

  // Debounce function to prevent rapid consecutive calls
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced version of syncSupabaseUser to prevent excessive updates
  const debouncedSyncUser = debounce(syncSupabaseUser, 1000);

  // Track if we've already done the initial sync
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  // Single useEffect for user initialization and syncing
  useEffect(() => {
    let isMounted = true;
    
    const initUser = async () => {
      // Skip if Clerk hasn't loaded yet or there's no user
      if (!clerkLoaded || !clerkUser) {
        if (isMounted) {
          setSupabaseUser(null);
          setIsLoading(false);
          setInitialSyncDone(false);
        }
        return;
      }
      
      // Check if user exists in Supabase
      const userExists = await fetchSupabaseUser();
      
      // If mounted and user doesn't exist, create them
      if (isMounted && !userExists) {
        await createSupabaseUser();
        setInitialSyncDone(true);
      } 
      // If user exists and we haven't done initial sync, sync now
      else if (isMounted && userExists && !initialSyncDone) {
        await syncSupabaseUser();
        setInitialSyncDone(true);
      }
    };
    
    initUser();
    
    return () => {
      isMounted = false;
    };
  }, [clerkLoaded, clerkUser]);

  const refreshUserData = async () => {
    setIsLoading(true);
    const userExists = await fetchSupabaseUser();
    if (userExists && clerkUser) {
      debouncedSyncUser();
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        user: clerkUser, 
        isLoading, 
        supabaseUser,
        refreshUserData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
