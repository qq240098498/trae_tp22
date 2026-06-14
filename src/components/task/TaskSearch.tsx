import { Search, Filter, X } from "lucide-react";
import { TASK_STATUS_LIST, TASK_PRIORITY_LIST, TaskStatus, TaskPriority } from "@/types";

interface TaskSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  status: "all" | TaskStatus;
  onStatusChange: (s: "all" | TaskStatus) => void;
  priority: "all" | TaskPriority;
  onPriorityChange: (p: "all" | TaskPriority) => void;
}

const ALL_STATUS = { key: "all" as const, label: "全部状态", emoji: "📋", color: "", bgColor: "" };
const ALL_PRIORITY = { key: "all" as const, label: "全部优先级", emoji: "🎯", color: "", bgColor: "" };

export default function TaskSearch({
  query,
  onQueryChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
}: TaskSearchProps) {
  const allStatusList = [ALL_STATUS, ...TASK_STATUS_LIST];
  const allPriorityList = [ALL_PRIORITY, ...TASK_PRIORITY_LIST];

  return (
    <div className="card p-4 sm:p-5 animate-fade-in">
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-400 pointer-events-none"
          strokeWidth={2.2}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="搜索任务标题、描述、备注..."
          className="input-field !pl-12 !pr-12 !py-3.5 text-base min-h-[52px]"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-wood-400 hover:text-wood-700 hover:bg-wood-100 transition-colors"
            aria-label="清除搜索"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-wood-500 text-xs font-semibold mb-2">
        <Filter size={14} strokeWidth={2.2} />
        状态筛选
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {allStatusList.map((s) => {
          const active = status === s.key;
          const statusInfo = "color" in s && s.color ? s : null;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onStatusChange(s.key)}
              className={`
                inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-h-[40px]
                ${active
                  ? "bg-safety-gradient text-white shadow-md shadow-safety-orange/25 border border-safety-orangeDark/20 scale-[1.02]"
                  : statusInfo
                  ? `${statusInfo.bgColor} ${statusInfo.color} border border-transparent hover:border-wood-300 hover:scale-[1.02]`
                  : "bg-wood-100 text-wood-700 border border-transparent hover:border-wood-300 hover:scale-[1.02]"
                }
              `}
            >
              <span className="text-base leading-none">{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-wood-500 text-xs font-semibold mb-2">
        <Filter size={14} strokeWidth={2.2} />
        优先级筛选
      </div>
      <div className="flex flex-wrap gap-2">
        {allPriorityList.map((p) => {
          const active = priority === p.key;
          const priorityInfo = "color" in p && p.color ? p : null;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onPriorityChange(p.key)}
              className={`
                inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-h-[40px]
                ${active
                  ? "bg-safety-gradient text-white shadow-md shadow-safety-orange/25 border border-safety-orangeDark/20 scale-[1.02]"
                  : priorityInfo
                  ? `${priorityInfo.bgColor} ${priorityInfo.color} border border-transparent hover:border-wood-300 hover:scale-[1.02]`
                  : "bg-wood-100 text-wood-700 border border-transparent hover:border-wood-300 hover:scale-[1.02]"
                }
              `}
            >
              <span className="text-base leading-none">{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
