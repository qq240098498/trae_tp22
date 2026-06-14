import Header from "@/components/layout/Header";
import TaskForm from "@/components/task/TaskForm";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { useParams } from "react-router-dom";
import { Pencil } from "lucide-react";

export default function TaskFormPage() {
  const { id } = useParams<{ id?: string }>();
  const hydrate = useMaintenanceStore((s) => s.hydrate);
  const getTaskById = useMaintenanceStore((s) => s.getTaskById);

  hydrate();

  const isEdit = Boolean(id);
  const existingTask = id ? getTaskById(id) : undefined;

  if (isEdit && !existingTask) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="任务不存在" showBack />
        <main className="container max-w-3xl py-10 text-center">
          <div className="card p-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-display text-2xl text-wood-800 mb-2">找不到此任务</h2>
            <p className="text-wood-500 mb-6">该任务可能已被删除，或链接无效</p>
          </div>
        </main>
      </div>
    );
  }

  const title = isEdit ? "编辑任务" : "新建维修任务";

  return (
    <div className="min-h-screen bg-paper">
      <Header
        title={title}
        showBack
        actions={
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-wood-200 text-sm">
            <Pencil size={16} strokeWidth={2.2} />
            {isEdit ? "修改任务信息" : "创建维修任务"}
          </div>
        }
      />
      <main className="container max-w-3xl py-6 sm:py-8 pb-32">
        <div className="mb-5 sm:mb-6">
          <p className="text-sm text-wood-500">
            <span className="font-display text-lg text-wood-800 mr-2">
              {isEdit ? "📝 修改任务信息" : "🛠️ 创建维修任务"}
            </span>
            标有 <span className="text-status-alert font-bold">*</span> 的字段为必填
          </p>
        </div>
        <TaskForm mode={isEdit ? "edit" : "new"} existingTask={existingTask} />
      </main>
    </div>
  );
}
