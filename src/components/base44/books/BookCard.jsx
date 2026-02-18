import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, User, FileText, CheckCircle2, Circle } from "lucide-react";
import StageProgressBar from "../dashboard/StageProgress";

const statusColors = {
  "Not Started": "bg-slate-100 text-slate-600",
  "In Progress": "bg-blue-100 text-blue-700",
  "On Hold": "bg-amber-100 text-amber-700",
  "Completed": "bg-emerald-100 text-emerald-700",
};

const priorityColors = {
  "Low": "bg-slate-50 text-slate-500 border-slate-200",
  "Medium": "bg-blue-50 text-blue-600 border-blue-200",
  "High": "bg-orange-50 text-orange-600 border-orange-200",
  "Urgent": "bg-red-50 text-red-600 border-red-200",
};

export default function BookCard({ book, onClick }) {
  const completedStages = [book.is_scanned, book.is_digitized, book.is_checked, book.is_uploaded].filter(Boolean).length;
  const progress = Math.round((completedStages / 4) * 100);

  return (
    <div
      onClick={() => onClick?.(book)}
      className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
              <User className="w-3 h-3" /> {book.author}
            </p>
          )}
        </div>
        <Badge className={cn("text-xs shrink-0", priorityColors[book.priority])}>
          {book.priority}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Badge className={cn("text-xs", statusColors[book.status])}>
          {book.status}
        </Badge>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <FileText className="w-3 h-3" /> {book.total_pages} pages
        </span>
      </div>

      <StageProgressBar currentStage={book.current_stage} status={book.status} />

      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <div className="font-semibold text-slate-700">{book.pages_scanned || 0}</div>
            <div className="text-slate-400">Scanned</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <div className="font-semibold text-slate-700">{book.pages_digitized || 0}</div>
            <div className="text-slate-400">Digitized</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Scan", completed: book.is_scanned },
            { label: "Digi", completed: book.is_digitized },
            { label: "Check", completed: book.is_checked },
            { label: "Upload", completed: book.is_uploaded },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center">
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300" />
              )}
              <div className="text-[10px] text-slate-400 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* overall progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Overall</span>
          <span className="font-medium text-slate-600">{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}