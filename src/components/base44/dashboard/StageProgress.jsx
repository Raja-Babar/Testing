import React from 'react';
import { cn } from "@/lib/utils";
import { ScanLine, Sparkles, CheckCircle, Upload } from "lucide-react";

const stages = [
  { key: "Scanning", label: "Scanning", icon: ScanLine, color: "bg-blue-500" },
  { key: "Digitization", label: "Digitization", icon: Sparkles, color: "bg-amber-500" },
  { key: "Checking", label: "Checking", icon: CheckCircle, color: "bg-purple-500" },
  { key: "Uploading", label: "Uploading", icon: Upload, color: "bg-emerald-500" },
];

export default function StageProgressBar({ currentStage, status }) {
  const currentIdx = stages.findIndex(s => s.key === currentStage);
  const isCompleted = status === "Completed";

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, idx) => {
        const Icon = stage.icon;
        const isPast = isCompleted || idx < currentIdx;
        const isCurrent = !isCompleted && idx === currentIdx;
        
        return (
          <div key={stage.key} className="flex items-center gap-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-all",
              isPast && "bg-emerald-100 text-emerald-600",
              isCurrent && `${stage.color} text-white shadow-sm`,
              !isPast && !isCurrent && "bg-slate-100 text-slate-300"
            )}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            {idx < stages.length - 1 && (
              <div className={cn(
                "w-4 h-0.5 rounded-full",
                isPast ? "bg-emerald-300" : "bg-slate-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}