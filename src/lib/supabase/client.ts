import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Book = {
  id: string
  file_name: string
  title: string
  author: string
  year: string
  total_pages: number
  pages_scanned: number
  pages_digitized: number
  current_stage: 'Scanning' | 'Digitization' | 'Checking' | 'Uploading' | 'Completed'
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed'
  is_scanned: boolean
  is_digitized: boolean
  is_checked: boolean
  is_uploaded: boolean
  assigned_to_scanning?: string
  assigned_to_digitization?: string
  assigned_to_checking?: string
  assigned_to_uploading?: string
  priority: string
  notes?: string
  created_at: string
  updated_at: string
}

export type DailyReport = {
  id: string
  employee_id: string
  employee_email: string
  employee_name: string
  report_date: string
  book_id: string
  book_title: string
  stage: string
  pages_count?: number
  notes?: string
  created_at: string
}

export type AutomationRule = {
  id: string
  name: string
  description?: string
  trigger_type: string
  trigger_stage?: string
  trigger_pages_count?: number
  action_type: string
  action_target_stage?: string
  action_employee_id?: string
  action_notification_message?: string
  is_active: boolean
  priority: number
  created_at: string
}

export type Notification = {
  id: string
  recipient_id: string
  recipient_email: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  book_id?: string
  book_title?: string
  is_read: boolean
  read_date?: string
  created_at: string
}
