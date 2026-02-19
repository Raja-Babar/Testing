'use client';

import { cn } from "@/lib/utils";

const stages = [
  { id: 'scanned', label: 'Scanned' },
  { id: 'digitized', label: 'Digitized' },
  { id: 'checked', label: 'Checked' },
  { id: 'uploaded', label: 'Uploaded' },
];

export default function StageProgressBar({ book }) {
  const currentStageIndex = stages.findIndex(s => s.id === book.current_stage) || 0;

  return (
    <div className="flex items-center space-x-2">
      {stages.map((stage, index) => {
        const isCompleted = book[`is_${stage.id}`];
        const isActive = index === currentStageIndex;

        return (
          <div key={stage.id} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
              isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500",
              isActive ? "ring-2 ring-blue-500" : ""
            )}>
              {index + 1}
            </div>
            <div className={cn("ml-2 text-sm", isCompleted ? "text-gray-800" : "text-gray-500")}>
              {stage.label}
            </div>
            {index < stages.length - 1 && (
              <div className="w-12 h-1 mx-2 bg-gray-200 rounded-full">
                <div className={cn("h-1 rounded-full", isCompleted ? "bg-green-500" : "")} style={{ width: isCompleted ? '100%' : '0%' }}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
