'use client'

import { useBooks } from '@/hooks/useBooks'
import { useReports } from '@/hooks/itsection/use-reports'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, FileText, Users, CheckCircle2 } from 'lucide-react'

export default function AdminDashboard() {
  const { data: books = [], isLoading: booksLoading } = useBooks()
  const { data: reports = [], isLoading: reportsLoading } = useReports()
  const { getUsers } = useAuth()
  const { data: employees = [], isLoading: employeesLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers });

  const stats = {
    totalBooks: books.length,
    completedBooks: books.filter(b => b.status === 'Completed').length,
    inProgressBooks: books.filter(b => b.status === 'In Progress').length,
    totalReports: reports.length,
    totalEmployees: employees.length,
    todayReports: reports.filter(r => new Date(r.submitted_date).toDateString() === new Date().toDateString()).length
  }

  const stageDistribution = {
    Scanning: books.filter(b => b.current_stage === 'Scanning').length,
    Digitization: books.filter(b => b.current_stage === 'Digitization').length,
    Checking: books.filter(b => b.current_stage === 'Checking').length,
    Uploading: books.filter(b => b.current_stage === 'Uploading').length,
    Completed: books.filter(b => b.current_stage === 'Completed').length
  }

  const isLoading = booksLoading || reportsLoading || employeesLoading;

  if (isLoading) {
    return <div className="p-8">Loading dashboard stats...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your book digitization workflow</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Books</CardTitle>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-slate-500">{stats.inProgressBooks} in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Completed</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedBooks}</div>
            <p className="text-xs text-slate-500">
              {stats.totalBooks > 0 ? Math.round((stats.completedBooks / stats.totalBooks) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Reports</CardTitle>
            <FileText className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-slate-500">{stats.todayReports} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Employees</CardTitle>
            <Users className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-slate-500">Active team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Stage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Books by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stageDistribution).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="text-sm font-medium">{stage}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${stats.totalBooks > 0 ? (count / stats.totalBooks) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
