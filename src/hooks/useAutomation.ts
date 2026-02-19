import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, AutomationRule } from '@/lib/supabase/client'

export function useAutomationRules() {
  return useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: false })
      
      if (error) throw error
      return data as AutomationRule[]
    }
  })
}

export function useCreateRule() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (rule: Partial<AutomationRule>) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert(rule)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] })
    }
  })
}

export function useUpdateRule() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AutomationRule> }) => {
      const { data: updated, error } = await supabase
        .from('automation_rules')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] })
    }
  })
}

export function useDeleteRule() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] })
    }
  })
}
