'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the User type based on your public profiles table
type User = {
  id: string;
  full_name: string | null;
};

const userQueryKeys = {
  all: ['users'] as const,
};

/**
 * Hook to fetch all users from the `profiles` table.
 */
export const useUsers = () => {
  const { toast } = useToast();
  return useQuery<User[], Error>({
    queryKey: userQueryKeys.all,
    queryFn: async () => {
      // Fetch user data from the public `profiles` table
      const { data, error } = await supabase
        .from('profiles') 
        .select('id, full_name:name'); // Select id and rename 'name' to 'full_name'

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error Fetching Users',
          description: error.message,
        });
        throw new Error(error.message);
      }
      return data || [];
    },
    // Stale-while-revalidate strategy for user data; it doesn't change often
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};
