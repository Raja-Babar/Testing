import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .order('full_name')
      
      if (error) throw error
      return data
    }
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })
}
