import { createClient as createClientBase } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Create a single supabase client for the entire server component tree
export async function createClient() {
  const cookieStore = await cookies();
  
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClientBase(
    supabaseUrl, 
    supabaseKey, 
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          // Forward the auth cookie to Supabase
          'Cookie': cookieStore.toString(),
        },
      },
    }
  );
}
