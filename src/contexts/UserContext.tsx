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
      console.error('Cannot sync user: Clerk user is null or undefined');
      return;
    }
    
    if (!supabaseUser) {
      console.error('Cannot sync user: Supabase user is null or undefined');
      return;
    }

    try {
      // Get email from the first email address in the list
      const primaryEmail = clerkUser.emailAddresses?.length > 0 
        ? clerkUser.emailAddresses[0].emailAddress 
        : '';
      
      // Build a display name from firstName and lastName
      const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      
      // For debugging
      console.log('Syncing user with data:', {
        id: clerkUser.id,
        email: primaryEmail,
        avatar_url: clerkUser.imageUrl,
        display_name: fullName || 'User'
      });
      
      // Check if Supabase URL is available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase URL or anon key is missing. Cannot sync user.');
        return;
      }

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
        console.log('Successfully synced user in Supabase');
        setSupabaseUser(data);
      }
    } catch (error) {
      // Check for network errors specifically
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network error when syncing user with Supabase. Please check your connection and Supabase credentials.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';
        console.error(`Failed to sync Supabase user: ${errorMessage}`, { error, stack: errorStack });
      }
    }
  };

  useEffect(() => {
    if (clerkLoaded) {
      fetchSupabaseUser();
    }
  }, [clerkUser, clerkLoaded]);

  useEffect(() => {
    if (clerkLoaded && clerkUser) {
      fetchSupabaseUser().then(userExists => {
        if (!userExists) {
          createSupabaseUser();
        }
      });
    }
  }, [clerkLoaded, clerkUser]);

  useEffect(() => {
    if (clerkLoaded && clerkUser && supabaseUser) {
      syncSupabaseUser();
    }
  }, [clerkLoaded, clerkUser, supabaseUser]);

  const refreshUserData = async () => {
    setIsLoading(true);
    await fetchSupabaseUser();
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
