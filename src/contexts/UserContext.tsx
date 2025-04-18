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

  const syncSupabaseUser = async () => {
    if (!clerkUser || !supabaseUser) return;

    try {
      // Get email from the first email address in the list
      const primaryEmail = clerkUser.emailAddresses?.length > 0 
        ? clerkUser.emailAddresses[0].emailAddress 
        : '';
      
      // Build a display name from firstName and lastName
      const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error syncing user in Supabase:', error);
      } else {
        setSupabaseUser(data);
      }
    } catch (error) {
      console.error('Failed to sync Supabase user:', error);
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
