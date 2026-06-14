import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Pencil,
  Trash2,
  Calendar,
  Clock3,
  Wrench,
  Package,
  FileText,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import {
  getTaskStatusInfo,
  getTaskPriorityInfo,
  CONSUMABLE_UNIT_LIST,
} from "@/types";
import { formatDate, daysSince, classNames } from "@/utils/format";

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

function InfoItem({ icon: Icon, label, value, highlight }: InfoItemProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl ${
        highlight
          ? "bg-status-alert/8 border border-status-alert/25"
          : "bg-wood-50 border border-wood-200/60"
      }`}
    >
      <div
        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
          highlight ? "bg-status-alert/15 text-status-alert" : "bg-wood-100 text-wood-600"
        }`}
      >
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <div className={`font-medium ${highlight ? "text-status-alert" : "text-wood-800"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}小时`;
  return `${hours}小时${mins}分钟`;
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hydrate = useMaintenanceStore((s) => s.hydrate);
  const getTaskById = useMaintenanceStore((s) => s.getTaskById);
  const deleteTask = useMaintenanceStore((s) => s.deleteTask);
  const updateTaskStatus = useMaintenanceStore((s) => s.updateTaskStatus);
  const resolveTask = useMaintenanceStore((s) => s.resolveTask);
  const reopenTask = useMaintenanceStore((s) => s.reopenTask);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const [timeSpentHours, setTimeSpentHours] = useState(0);
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(30);
  const [resolutionNotes, setResolutionNotes] = useState("");

  hydrate();

  const task = id ? getTaskById(id) : undefined;

  if (!task) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="任务不存在" showBack />
        <main className="container max-w-3xl py-10 text-center">
          <div className="card p-12 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-display text-2xl text-wood-800 mb-2">找不到此任务</h2>
            <p className="text-wood-500 mb-6">该任务可能已被删除，或链接无效</p>
            <Link to="/tasks" className="btn-primary inline-flex">
              返回任务列表
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const statusInfo = getTaskStatusInfo(task.status);
  const priorityInfo = getTaskPriorityInfo(task.priority);
  const isResolved = task.status === "resolved";
  const displayDate = isResolved ? task.resolvedAt ?? task.updatedAt : task.createdAt;
  const createdDays = daysSince(task.createdAt);

  async function handleDelete() {
    setDeleting(true);
    try {
      deleteTask(task.id);
      navigate("/tasks", { replace: true });
    } finally {
      setDeleting(false);
    }
  }

  function handleResolveSubmit(e: React.FormEvent) {
    e.preventDefault();
    const totalMinutes = timeSpentHours * 60 + timeSpentMinutes;
    if (totalMinutes <= 0) return;

    resolveTask(task.id, {
      timeSpentMinutes: totalMinutes,
      resolutionNotes: resolutionNotes.trim() || undefined,
    });
    setShowResolveForm(false);
  }

  function handleStatusChange(status: "pending" | "in_progress") {
    updateTaskStatus(task.id, status);
    setShowStatusMenu(false);
  }

  function handleReopen() {
    reopenTask(task.id);
  }

  function openResolveForm() {
    setTimeSpentHours(0);
    setTimeSpentMinutes(30);
    setResolutionNotes("");
    setShowResolveForm(true);
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header
        showBack
        title={task.title}
        actions={
          <>
            <Link
              to={`/task/${task.id}/edit`}
              className="hidden sm:inline-flex btn-secondary !py-2 !px-4"
            >
              <Pencil size={16} strokeWidth={2.2} />
              编辑
            </Link>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="hidden sm:inline-flex btn-danger !py-2 !px-4"
            >
              <Trash2 size={16} strokeWidth={2.2} />
              删除
            </button>
          </>
        }
      />

      <main className="container max-w-5xl py-6 sm:py-8 space-y-6 sm:space-y-7 pb-28 sm:pb-10 animate-slide-up">
        <section className="card p-5 sm:p-6 screw-corner">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-4 min-w-0">
              <div
                className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inset ${statusInfo.bgColor}`}
              >
                <span>{task.emojiIcon || statusInfo.emoji}</span>
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-2xl sm:text-3xl text-wood-900 leading-tight truncate">
                  {task.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`tag ${statusInfo.bgColor} ${statusInfo.color} text-sm !px-3 !py-1.5`}>
                    <span className="text-base">{statusInfo.emoji}</span>
                    {statusInfo.label}
                  </span>
                  <span className={`tag ${priorityInfo.bgColor} ${priorityInfo.color} text-sm !px-3 !py-1.5`}>
                    <span className="text-base">{priorityInfo.emoji}</span>
                    {priorityInfo.label}优先级
                  </span>
                </div>
              </div>
            </div>
          </div>

          {task.description && (
            <div className="mt-4 p-3 rounded-xl bg-wood-50/60 border border-wood-200/60">
              <p className="text-wood-700 text-sm leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm text-wood-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} strokeWidth={2} />
              <span>{isResolved ? "解决于" : "创建于"} {formatDate(displayDate)}</span>
            </div>
            {createdDays !== null && (
              <span>· {createdDays} 天前创建</span>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <InfoItem
            icon={isResolved ? CheckCircle2 : Clock3}
            label="任务状态"
            highlight={!isResolved && task.priority === "high"}
            value={
              <div>
                <div className={classNames("font-bold", isResolved ? "text-status-good" : task.status === "in_progress" ? "text-safety-orange" : "text-wood-800")}>
                  {statusInfo.emoji} {statusInfo.label}
                </div>
                {isResolved && task.timeSpentMinutes !== undefined && (
                  <div className="text-xs text-wood-500 mt-0.5">
                    耗时 {formatDuration(task.timeSpentMinutes)}
                  </div>
                )}
              </div>
            }
          />
          <InfoItem
            icon={AlertCircle}
            label="优先级"
            value={
              <div>
                <span className={classNames("font-bold", task.priority === "high" ? "text-status-alert" : task.priority === "medium" ? "text-status-warning" : "text-status-good")}>
                  {priorityInfo.emoji} {priorityInfo.label}优先级
                </span>
              </div>
            }
          />
        </section>

        {task.tools.length > 0 && (
          <section className="card p-5 sm:p-6 animate-fade-in">
            <h2 className="section-title mb-4">
              <Wrench size={20} className="text-safety-orange" strokeWidth={2.2} />
              工具清单
              <span className="ml-2 text-xs font-body text-wood-500 font-normal">
                （共 {task.tools.length} 件）
              </span>
            </h2>
            <div className="space-y-2">
              {task.tools.map((t) => (
                <Link
                  key={t.toolId}
                  to={`/tool/${t.toolId}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-wood-50 border border-wood-200/60 hover:bg-white hover:border-wood-400 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-safety-orange/10 flex items-center justify-center text-lg">
                      {t.emojiIcon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-wood-800 text-sm truncate group-hover:text-safety-orange transition-colors">
                        {t.toolName}
                      </p>
                      <p className="text-xs text-wood-500">数量：{t.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs text-wood-400 group-hover:text-safety-orange transition-colors">
                    查看工具 →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {task.consumables.length > 0 && (
          <section className="card p-5 sm:p-6 animate-fade-in">
            <h2 className="section-title mb-4">
              <Package size={20} className="text-wood-500" strokeWidth={2.2} />
              配件耗材清单
              <span className="ml-2 text-xs font-body text-wood-500 font-normal">
                （共 {task.consumables.length} 种）
              </span>
            </h2>
            <div className="space-y-2">
              {task.consumables.map((c) => {
                const unitInfo = CONSUMABLE_UNIT_LIST.find((u) => u.key === c.unit);
                return (
                  <Link
                    key={c.consumableId}
                    to={`/consumable/${c.consumableId}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-wood-50 border border-wood-200/60 hover:bg-white hover:border-wood-400 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-wood-100 flex items-center justify-center text-lg">
                        {c.emojiIcon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-wood-800 text-sm truncate group-hover:text-safety-orange transition-colors">
                          {c.consumableName}
                        </p>
                        <p className="text-xs text-wood-500">
                          数量：{c.quantity} {unitInfo?.shortLabel || "个"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-wood-400 group-hover:text-safety-orange transition-colors">
                      查看耗材 →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {isResolved && task.resolutionNotes && (
          <section className="card p-5 sm:p-6 animate-fade-in">
            <h2 className="section-title mb-3">
              <FileText size={20} strokeWidth={2.2} />
              解决备注
            </h2>
            <p className="text-wood-700 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-status-good/40 py-1 px-4 bg-status-good/5 rounded-r-lg">
              {task.resolutionNotes}
            </p>
          </section>
        )}

        {isResolved && task.timeSpentMinutes !== undefined && (
          <section className="card p-5 sm:p-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-status-good/15 flex items-center justify-center">
                <Clock3 size={24} className="text-status-good" strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-0.5">
                  维修耗时
                </p>
                <p className="font-display text-2xl text-wood-900">
                  {formatDuration(task.timeSpentMinutes)}
                </p>
                <p className="text-xs text-wood-500 mt-0.5">
                  下次同类问题可参考此耗时评估
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="card p-5 sm:p-6 animate-fade-in">
          <h2 className="section-title mb-4">
            <CheckCircle2 size={20} strokeWidth={2.2} />
            任务操作
          </h2>

          {isResolved ? (
            <button
              type="button"
              onClick={handleReopen}
              className="w-full p-4 rounded-xl border-2 border-safety-orange/30 bg-safety-orange/5 hover:bg-safety-orange/10 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-safety-orange/15 text-safety-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RotateCcw size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <p className="font-display text-lg text-wood-900">重新打开任务</p>
                  <p className="text-xs text-wood-500">将状态改为"进行中"，可继续处理</p>
                </div>
              </div>
            </button>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={openResolveForm}
                className="w-full p-4 rounded-xl border-2 border-status-good/30 bg-status-good/5 hover:bg-status-good/10 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-status-good/15 text-status-good flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={20} strokeWidth={2.4} />
                  </div>
                  <div>
                    <p className="font-display text-lg text-wood-900">标记为已解决</p>
                    <p className="text-xs text-wood-500">记录维修耗时和解决备注，方便下次参考</p>
                  </div>
                </div>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="w-full p-4 rounded-xl border-2 border-wood-200 bg-white hover:border-wood-400 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-wood-100 text-wood-600 flex items-center justify-center">
                      <Clock3 size={20} strokeWidth={2.4} />
                    </div>
                    <div>
                      <p className="font-display text-lg text-wood-900">更改状态</p>
                      <p className="text-xs text-wood-500">
                        当前：{statusInfo.emoji} {statusInfo.label}
                      </p>
                    </div>
                  </div>
                </button>

                {showStatusMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-20 rounded-xl border border-wood-200 bg-white shadow-cardHover animate-fade-in overflow-hidden">
                    {task.status !== "pending" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange("pending")}
                        className="w-full flex items-center gap-3 p-3 hover:bg-wood-50 transition-colors text-left"
                      >
                        <span className="text-lg">📋</span>
                        <span className="text-sm font-medium text-wood-800">待处理</span>
                      </button>
                    )}
                    {task.status !== "in_progress" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange("in_progress")}
                        className="w-full flex items-center gap-3 p-3 hover:bg-wood-50 transition-colors text-left"
                      >
                        <span className="text-lg">🔧</span>
                        <span className="text-sm font-medium text-wood-800">进行中</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-wood-50 via-wood-50 to-wood-50/0 border-t border-wood-200/60 backdrop-blur-sm z-30">
          <div className="flex gap-3">
            <Link
              to={`/task/${task.id}/edit`}
              className="btn-secondary flex-1 min-h-[50px]"
            >
              <Pencil size={18} strokeWidth={2.2} />
              编辑
            </Link>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="btn-danger flex-1 min-h-[50px]"
            >
              <Trash2 size={18} strokeWidth={2.2} />
              删除
            </button>
          </div>
        </div>
      </main>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !deleting && setConfirmDelete(false)}
        >
          <div
            className="card w-full max-w-md p-6 sm:p-7 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-status-alert/15 flex items-center justify-center">
                <Trash2 size={26} className="text-status-alert" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-xl text-wood-900 mb-1">确认删除？</h3>
                <p className="text-sm text-wood-500 leading-relaxed">
                  您即将删除任务{" "}
                  <span className="font-bold text-wood-800">「{task.title}」</span>
                  ，此操作不可撤销，关联的工具和耗材记录将被永久清除。
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger !bg-status-alert !text-white border-status-alert hover:bg-status-alert/90 disabled:opacity-60"
              >
                {deleting ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResolveForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowResolveForm(false)}
        >
          <div
            className="card w-full max-w-md p-6 sm:p-7 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-status-good/15 flex items-center justify-center">
                <CheckCircle2 size={26} className="text-status-good" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-xl text-wood-900 mb-1">标记为已解决</h3>
                <p className="text-sm text-wood-500 leading-relaxed">
                  记录维修耗时和解决备注，方便下次同类问题参考
                </p>
              </div>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="input-label">
                  维修耗时 <span className="text-status-alert">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-wood-500 mb-1 block">小时</label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={timeSpentHours}
                      onChange={(e) =>
                        setTimeSpentHours(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="input-field !text-center !text-xl !font-display"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-wood-500 mb-1 block">分钟</label>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      step={5}
                      value={timeSpentMinutes}
                      onChange={(e) =>
                        setTimeSpentMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))
                      }
                      className="input-field !text-center !text-xl !font-display"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-wood-500 mt-2 text-center">
                  共计 {formatDuration(timeSpentHours * 60 + timeSpentMinutes)}
                </p>
              </div>

              <div>
                <label className="input-label">解决备注</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="记录解决方法、使用的材料、注意事项等，方便下次同类问题参考"
                  className="input-field w-full min-h-[100px] resize-none"
                  rows={4}
                />
                <p className="text-[11px] text-wood-400 mt-1 px-1">
                  建议详细描述解决过程，下次遇到同类问题可快速参考
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveForm(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={timeSpentHours * 60 + timeSpentMinutes <= 0}
                  className="btn-primary !bg-status-good !text-white border-status-good hover:bg-status-good/90 disabled:opacity-60"
                >
                  确认解决
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
