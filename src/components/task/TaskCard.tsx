import { Link } from "react-router-dom";
import { Wrench, Package, Calendar, Clock3 } from "lucide-react";
import type { MaintenanceTask } from "@/types";
import { getTaskStatusInfo, getTaskPriorityInfo } from "@/types";
import { classNames, formatDate } from "@/utils/format";

interface TaskCardProps {
  task: MaintenanceTask;
  index?: number;
}

export default function TaskCard({ task, index = 0 }: TaskCardProps) {
  const statusInfo = getTaskStatusInfo(task.status);
  const priorityInfo = getTaskPriorityInfo(task.priority);
  const delay = Math.min(index * 40, 400);

  const isResolved = task.status === "resolved";
  const displayDate = isResolved ? task.resolvedAt ?? task.updatedAt : task.createdAt;

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}小时`;
    return `${hours}小时${mins}分钟`;
  }

  return (
    <Link
      to={`/task/${task.id}`}
      className="card card-hover group relative overflow-hidden animate-slide-up block min-h-[220px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3 p-4 pb-3 border-b border-wood-200/60 bg-gradient-to-b from-white/60 to-transparent">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inset ${statusInfo.bgColor}`}
        >
          <span>{task.emojiIcon || statusInfo.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg text-wood-900 truncate leading-tight">
              {task.title}
            </h3>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className={`tag ${statusInfo.bgColor} ${statusInfo.color}`}>
              <span>{statusInfo.emoji}</span>
              {statusInfo.label}
            </span>
            <span className={`tag ${priorityInfo.bgColor} ${priorityInfo.color}`}>
              <span>{priorityInfo.emoji}</span>
              {priorityInfo.label}优先级
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-3 space-y-2">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-wood-700">
            <Wrench size={15} className="shrink-0 text-safety-orange" strokeWidth={2.2} />
            <span className="font-medium">工具 {task.tools.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-wood-700">
            <Package size={15} className="shrink-0 text-wood-500" strokeWidth={2.2} />
            <span className="font-medium">耗材 {task.consumables.length}</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-sm text-wood-600">
            <Calendar size={14} className="shrink-0 text-wood-400" strokeWidth={2} />
            <span>
              {isResolved ? "解决于" : "创建于"} {formatDate(displayDate)}
            </span>
          </div>
          {isResolved && task.timeSpentMinutes !== undefined && (
            <div className="flex items-center gap-1.5 text-sm text-wood-600">
              <Clock3 size={14} className="shrink-0 text-status-good" strokeWidth={2} />
              <span>耗时 {formatDuration(task.timeSpentMinutes)}</span>
            </div>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-wood-500 line-clamp-2 leading-relaxed pt-1">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-wood-400 font-medium">查看详情 →</span>
          <span
            className={classNames(
              "shrink-0 w-2.5 h-2.5 rounded-full shadow-sm",
              task.status === "resolved"
                ? "bg-status-good"
                : task.status === "in_progress"
                ? "bg-safety-orange animate-pulse-subtle"
                : task.priority === "high"
                ? "bg-status-alert animate-pulse-subtle"
                : task.priority === "medium"
                ? "bg-status-warning"
                : "bg-steel-400"
            )}
            aria-label={statusInfo.label}
          />
        </div>
      </div>

      <div
        className={classNames(
          "absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl via-transparent to-transparent pointer-events-none",
          task.status === "in_progress" && "from-safety-orange/8",
          task.status === "resolved" && "from-status-good/8",
          task.status === "pending" && task.priority === "high" && "from-status-alert/8",
          task.status === "pending" && task.priority !== "high" && "from-wood-800/6"
        )}
      />
    </Link>
  );
}
