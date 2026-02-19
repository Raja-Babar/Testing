'use client';

import { cn } from "@/lib/utils";

const stages = ["Scanning", "Digitization", "Checking", "Uploading", "Completed"];

export function StageProgressBar({ currentStage, status }) {
    const currentStageIndex = stages.indexOf(currentStage);
    const isCompleted = status === 'Completed';

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
                {stages.map(stage => <span key={stage}>{stage}</span>)}
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200 flex items-center">
                <div
                    className={cn(
                        "h-2.5 rounded-full transition-all duration-500",
                        isCompleted ? "bg-green-500" : "bg-blue-500"
                    )}
                    style={{ width: `${isCompleted ? 100 : (currentStageIndex / (stages.length - 2)) * 100}%` }}
                />
            </div>
        </div>
    );
}
