import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import TaskSearch from "@/components/task/TaskSearch";
import TaskGrid from "@/components/task/TaskGrid";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { ClipboardPlus, Wrench, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { TaskStatus, TaskPriority } from "@/types";

export default function TaskListPage() {
  const hydrate = useMaintenanceStore((s) => s.hydrate);
  const searchTasks = useMaintenanceStore((s) => s.searchTasks);
  const tasks = useMaintenanceStore((s) => s.tasks);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | TaskStatus>("all");
  const [priority, setPriority] = useState<"all" | TaskPriority>("all");

  hydrate();

  const filteredTasks = useMemo(
    () => searchTasks(query, status, priority),
    [query, status, priority, searchTasks]
  );

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const resolved = tasks.filter((t) => t.status === "resolved").length;
    const highPriority = tasks.filter((t) => t.priority === "high" && t.status !== "resolved").length;
    return { pending, inProgress, resolved, highPriority };
  }, [tasks]);

  const statItems = [
    {
      label: "待处理",
      value: stats.pending,
      icon: Clock,
      color: "from-steel-200/50 to-steel-100/30 text-steel-700",
      ring: "ring-steel-300/30",
    },
    {
      label: "进行中",
      value: stats.inProgress,
      icon: Wrench,
      color:
        stats.inProgress > 0
          ? "from-safety-orange/20 to-safety-orange/5 text-safety-orange"
          : "from-steel-200/50 to-steel-100/30 text-steel-700",
      ring: stats.inProgress > 0 ? "ring-safety-orange/20" : "ring-steel-300/30",
    },
    {
      label: "已解决",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "from-status-good/20 to-status-good/5 text-status-good",
      ring: "ring-status-good/20",
    },
    {
      label: "高优先级",
      value: stats.highPriority,
      icon: AlertCircle,
      color:
        stats.highPriority > 0
          ? "from-status-alert/20 to-status-alert/5 text-status-alert"
          : "from-steel-200/50 to-steel-100/30 text-steel-700",
      ring: stats.highPriority > 0 ? "ring-status-alert/20" : "ring-steel-300/30",
    },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="container max-w-6xl py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-10">
        <section className="animate-fade-in">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-wood-900 leading-tight">
                维修任务
              </h2>
              <p className="text-sm text-wood-500 mt-1">
                共 <span className="font-bold text-safety-orange">{filteredTasks.length}</span> 个任务
                {query.trim() && (
                  <>
                    {" "}· 搜索"
                    <span className="font-medium text-wood-700">{query.trim()}</span>"
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {statItems.map(({ label, value, icon: Icon, color, ring }) => (
              <div
                key={label}
                className={`card screw-corner p-4 ring-1 ${ring} animate-fade-in`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-wood-500 mb-1">{label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-2xl sm:text-3xl text-wood-900 leading-none">
                        {value}
                      </span>
                      <span className="text-xs text-wood-500 font-medium">个</span>
                    </div>
                  </div>
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-inset`}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <TaskSearch
          query={query}
          onQueryChange={setQuery}
          status={status}
          onStatusChange={setStatus}
          priority={priority}
          onPriorityChange={setPriority}
        />

        <section>
          <TaskGrid tasks={filteredTasks} searchQuery={query} />
        </section>
      </main>

      <Link
        to="/task/new"
        className="sm:hidden fixed bottom-5 right-5 z-30 w-16 h-16 rounded-full bg-safety-gradient text-white shadow-glow flex items-center justify-center active:scale-95 transition-transform"
        aria-label="新建任务"
      >
        <ClipboardPlus size={28} strokeWidth={2.4} />
      </Link>
    </div>
  );
}
