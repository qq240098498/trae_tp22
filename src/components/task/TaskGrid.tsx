import TaskCard from "./TaskCard";
import type { MaintenanceTask } from "@/types";
import { ClipboardPlus, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface TaskGridProps {
  tasks: MaintenanceTask[];
  searchQuery: string;
}

export default function TaskGrid({ tasks, searchQuery }: TaskGridProps) {
  if (tasks.length === 0) {
    const hasQuery = searchQuery.trim().length > 0;
    return (
      <div className="card p-8 sm:p-12 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-wood-100 flex items-center justify-center mb-5 shadow-inset">
          {hasQuery ? (
            <Search size={38} className="text-wood-400" strokeWidth={1.7} />
          ) : (
            <ClipboardPlus size={38} className="text-wood-400" strokeWidth={1.7} />
          )}
        </div>
        <h3 className="font-display text-xl text-wood-800 mb-2">
          {hasQuery ? "没有找到匹配的任务" : "还没有维修任务"}
        </h3>
        <p className="text-wood-500 text-sm mb-6 max-w-sm mx-auto">
          {hasQuery
            ? `没有找到包含"${searchQuery}"的任务，试试其他关键词？`
            : "点击下方按钮创建第一个维修任务，开始管理你的维修工作吧～"}
        </p>
        {!hasQuery && (
          <Link to="/task/new" className="btn-primary inline-flex min-w-[160px]">
            <ClipboardPlus size={18} strokeWidth={2.2} />
            创建第一个任务
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {tasks.map((task, idx) => (
        <TaskCard key={task.id} task={task} index={idx} />
      ))}
    </div>
  );
}
