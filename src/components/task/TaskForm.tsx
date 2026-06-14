import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  AlertTriangle,
  Wrench,
  Package,
  Plus,
  X,
  Search,
} from "lucide-react";
import type {
  NewMaintenanceTaskInput,
  MaintenanceTask,
  TaskPriority,
  TaskToolItem,
  TaskConsumableItem,
  Tool,
  Consumable,
  ConsumableUnit,
} from "@/types";
import {
  TASK_PRIORITY_LIST,
  TASK_EMOJI_OPTIONS,
  getTaskPriorityInfo,
  CONSUMABLE_UNIT_LIST,
} from "@/types";
import { useToolStore } from "@/store/toolStore";
import { useConsumableStore } from "@/store/consumableStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";

interface TaskFormProps {
  mode: "new" | "edit";
  existingTask?: MaintenanceTask;
}

const DEFAULT_FORM: NewMaintenanceTaskInput = {
  title: "",
  description: "",
  priority: "medium",
  emojiIcon: "🔧",
  tools: [],
  consumables: [],
  resolutionNotes: undefined,
  resolvedAt: undefined,
  timeSpentMinutes: undefined,
};

export default function TaskForm({ mode, existingTask }: TaskFormProps) {
  const navigate = useNavigate();
  const addTask = useMaintenanceStore((s) => s.addTask);
  const updateTask = useMaintenanceStore((s) => s.updateTask);

  const tools = useToolStore((s) => s.tools);
  const hydrateTools = useToolStore((s) => s.hydrate);
  hydrateTools();

  const consumables = useConsumableStore((s) => s.consumables);
  const hydrateConsumables = useConsumableStore((s) => s.hydrate);
  hydrateConsumables();

  const [form, setForm] = useState<NewMaintenanceTaskInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewMaintenanceTaskInput, string>>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [showConsumablePicker, setShowConsumablePicker] = useState(false);
  const [toolSearch, setToolSearch] = useState("");
  const [consumableSearch, setConsumableSearch] = useState("");
  const [toolQuantityInput, setToolQuantityInput] = useState(1);
  const [consumableQuantityInput, setConsumableQuantityInput] = useState(1);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [selectedConsumableId, setSelectedConsumableId] = useState<string | null>(null);

  useEffect(() => {
    if (existingTask) {
      const { id, createdAt, updatedAt, status, resolvedAt, timeSpentMinutes, resolutionNotes, ...rest } = existingTask;
      void id; void createdAt; void updatedAt; void status; void resolvedAt; void timeSpentMinutes; void resolutionNotes;
      setForm(rest);
    }
  }, [existingTask]);

  function updateField<K extends keyof NewMaintenanceTaskInput>(key: K, value: NewMaintenanceTaskInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = "请输入任务标题";
    if (form.title.trim().length > 40) next.title = "标题不能超过40个字符";
    if (form.description.length > 500) next.description = "描述不能超过500个字符";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === "new") {
        const created = addTask(form);
        navigate(`/task/${created.id}`, { replace: true });
      } else if (existingTask) {
        const updated = updateTask(existingTask.id, form);
        if (updated) navigate(`/task/${updated.id}`, { replace: true });
        else navigate("/tasks", { replace: true });
      }
    } catch (err) {
      alert(
        "保存失败：存储空间已满。\n\n" +
          (err instanceof Error ? err.message : "未知错误")
      );
    }
  }

  function addTool() {
    if (!selectedToolId) return;
    const tool = tools.find((t) => t.id === selectedToolId);
    if (!tool) return;
    if (form.tools.some((t) => t.toolId === tool.id)) return;

    const item: TaskToolItem = {
      toolId: tool.id,
      toolName: tool.name,
      emojiIcon: tool.emojiIcon || "🔧",
      quantity: Math.max(1, toolQuantityInput),
    };
    updateField("tools", [...form.tools, item]);
    setSelectedToolId(null);
    setToolQuantityInput(1);
    setShowToolPicker(false);
  }

  function removeTool(toolId: string) {
    updateField(
      "tools",
      form.tools.filter((t) => t.toolId !== toolId)
    );
  }

  function addConsumable() {
    if (!selectedConsumableId) return;
    const consumable = consumables.find((c) => c.id === selectedConsumableId);
    if (!consumable) return;
    if (form.consumables.some((c) => c.consumableId === consumable.id)) return;

    const item: TaskConsumableItem = {
      consumableId: consumable.id,
      consumableName: consumable.name,
      emojiIcon: consumable.emojiIcon || "📦",
      quantity: Math.max(1, consumableQuantityInput),
      unit: consumable.unit,
    };
    updateField("consumables", [...form.consumables, item]);
    setSelectedConsumableId(null);
    setConsumableQuantityInput(1);
    setShowConsumablePicker(false);
  }

  function removeConsumable(consumableId: string) {
    updateField(
      "consumables",
      form.consumables.filter((c) => c.consumableId !== consumableId)
    );
  }

  const filteredTools = tools.filter((t) => {
    if (form.tools.some((ft) => ft.toolId === t.id)) return false;
    if (!toolSearch.trim()) return true;
    const q = toolSearch.trim().toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q)
    );
  });

  const filteredConsumables = consumables.filter((c) => {
    if (form.consumables.some((fc) => fc.consumableId === c.id)) return false;
    if (!consumableSearch.trim()) return true;
    const q = consumableSearch.trim().toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q)
    );
  });

  const priorityInfo = getTaskPriorityInfo(form.priority);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
      <section className="card p-5 sm:p-6">
        <h2 className="section-title mb-5">
          <span className="text-xl">{form.emojiIcon}</span>
          基本信息
        </h2>

        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="input-label">
              任务标题 <span className="text-status-alert">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="例如：客厅吸顶灯更换灯泡"
              className={`input-field ${errors.title ? "!border-status-alert !ring-status-alert/20" : ""}`}
              maxLength={40}
            />
            <div className="flex justify-between mt-1.5 px-1">
              {errors.title ? (
                <span className="text-xs text-status-alert">{errors.title}</span>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-wood-400">{form.title.length}/40</span>
            </div>
          </div>

          <div>
            <label className="input-label mb-2">图标</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="w-14 h-14 rounded-xl border-2 border-wood-300 bg-white text-3xl hover:border-safety-orange hover:scale-105 transition flex items-center justify-center shadow-inset"
              >
                {form.emojiIcon}
              </button>
              {showEmojiPicker && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowEmojiPicker(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 z-30 w-full max-w-sm p-3 rounded-xl border border-wood-200 bg-white shadow-cardHover animate-fade-in grid grid-cols-8 gap-1.5">
                    {TASK_EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          updateField("emojiIcon", em);
                          setShowEmojiPicker(false);
                        }}
                        className={`aspect-square rounded-lg text-xl flex items-center justify-center transition ${
                          form.emojiIcon === em
                            ? "bg-safety-orange/15 ring-2 ring-safety-orange/50 scale-110"
                            : "hover:bg-wood-100"
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="input-label">优先级</label>
            <div className="grid grid-cols-3 gap-3">
              {TASK_PRIORITY_LIST.map((p) => (
                <label
                  key={p.key}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition text-center ${
                    form.priority === p.key
                      ? "border-safety-orange bg-safety-orange/5 shadow-sm"
                      : "border-wood-200 bg-white hover:border-wood-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.key}
                    checked={form.priority === p.key}
                    onChange={() => updateField("priority", p.key as TaskPriority)}
                    className="sr-only"
                  />
                  <span className="text-lg">{p.emoji}</span>
                  <p className="text-sm font-semibold text-wood-800 mt-1">{p.label}优先级</p>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">任务描述</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="描述维修问题、需要做的事情等（选填，最多500字）"
              className={`input-field resize-y ${errors.description ? "!border-status-alert !ring-status-alert/20" : ""}`}
              maxLength={500}
            />
            <div className="flex justify-between mt-1.5 px-1">
              {errors.description ? (
                <span className="text-xs text-status-alert">{errors.description}</span>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-wood-400">{form.description.length}/500</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="section-title mb-5">
          <Wrench size={20} className="text-safety-orange" strokeWidth={2.2} />
          关联工具清单
          <span className="ml-2 text-xs font-body text-wood-500 font-normal">
            （选择完成此任务需要使用的工具）
          </span>
        </h2>

        {form.tools.length > 0 && (
          <div className="space-y-2 mb-4">
            {form.tools.map((t) => (
              <div
                key={t.toolId}
                className="flex items-center justify-between p-3 rounded-xl bg-wood-50 border border-wood-200/60 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">{t.emojiIcon}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-wood-800 text-sm truncate">{t.toolName}</p>
                    <p className="text-xs text-wood-500">数量：{t.quantity}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTool(t.toolId)}
                  className="shrink-0 p-1.5 rounded-lg text-wood-400 hover:text-status-alert hover:bg-status-alert/10 transition-colors"
                  aria-label={`移除${t.toolName}`}
                >
                  <X size={16} strokeWidth={2.2} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setToolSearch("");
            setSelectedToolId(null);
            setToolQuantityInput(1);
            setShowToolPicker(true);
          }}
          className="w-full btn-secondary flex items-center justify-center gap-2 !py-3"
        >
          <Plus size={18} strokeWidth={2.2} />
          添加工具
        </button>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="section-title mb-5">
          <Package size={20} className="text-wood-500" strokeWidth={2.2} />
          配件耗材清单
          <span className="ml-2 text-xs font-body text-wood-500 font-normal">
            （选择完成此任务需要的耗材配件）
          </span>
        </h2>

        {form.consumables.length > 0 && (
          <div className="space-y-2 mb-4">
            {form.consumables.map((c) => {
              const unitInfo = CONSUMABLE_UNIT_LIST.find((u) => u.key === c.unit);
              return (
                <div
                  key={c.consumableId}
                  className="flex items-center justify-between p-3 rounded-xl bg-wood-50 border border-wood-200/60 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">{c.emojiIcon}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-wood-800 text-sm truncate">{c.consumableName}</p>
                      <p className="text-xs text-wood-500">
                        数量：{c.quantity} {unitInfo?.shortLabel || "个"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeConsumable(c.consumableId)}
                    className="shrink-0 p-1.5 rounded-lg text-wood-400 hover:text-status-alert hover:bg-status-alert/10 transition-colors"
                    aria-label={`移除${c.consumableName}`}
                  >
                    <X size={16} strokeWidth={2.2} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setConsumableSearch("");
            setSelectedConsumableId(null);
            setConsumableQuantityInput(1);
            setShowConsumablePicker(true);
          }}
          className="w-full btn-secondary flex items-center justify-center gap-2 !py-3"
        >
          <Plus size={18} strokeWidth={2.2} />
          添加耗材配件
        </button>
      </section>

      <div className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-gradient-to-t from-wood-50 via-wood-50/95 to-wood-50/0 border-t border-wood-200/60 backdrop-blur-sm">
        {Object.keys(errors).length > 0 && (
          <div className="mb-3 p-3 rounded-lg bg-status-alert/10 border border-status-alert/30 flex items-start gap-2 animate-fade-in">
            <AlertTriangle size={18} className="text-status-alert shrink-0 mt-0.5" strokeWidth={2.2} />
            <p className="text-sm text-status-alert">请检查上方标红的必填项后再保存</p>
          </div>
        )}
        <div className="max-w-6xl mx-auto flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary min-h-[48px]"
          >
            取消
          </button>
          <button
            type="submit"
            className="btn-primary min-h-[48px] min-w-[140px] text-base"
          >
            <Save size={18} strokeWidth={2.2} />
            {mode === "new" ? "创建任务" : "保存修改"}
          </button>
        </div>
      </div>

      {showToolPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowToolPicker(false)}
        >
          <div
            className="card w-full max-w-md p-6 sm:p-7 animate-slide-up max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-safety-orange/15 flex items-center justify-center">
                <Wrench size={26} className="text-safety-orange" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl text-wood-900 mb-1">选择工具</h3>
                <p className="text-sm text-wood-500">从工具箱中选择需要的工具</p>
              </div>
            </div>

            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400 pointer-events-none"
                strokeWidth={2.2}
              />
              <input
                type="text"
                value={toolSearch}
                onChange={(e) => setToolSearch(e.target.value)}
                placeholder="搜索工具名称..."
                className="input-field !pl-10 !py-2.5 text-sm"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0">
              {filteredTools.length === 0 ? (
                <p className="text-center text-wood-400 py-6 text-sm">
                  {tools.length === 0 ? "暂无工具，请先添加工具" : "没有匹配的工具"}
                </p>
              ) : (
                filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setSelectedToolId(tool.id === selectedToolId ? null : tool.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                      selectedToolId === tool.id
                        ? "border-safety-orange bg-safety-orange/5"
                        : "border-wood-200 bg-white hover:border-wood-400"
                    }`}
                  >
                    <span className="text-xl">{tool.emojiIcon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-wood-800 text-sm truncate">{tool.name}</p>
                      <p className="text-xs text-wood-500 truncate">{tool.location}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {selectedToolId && (
              <div className="mb-4 p-3 rounded-xl bg-wood-50 border border-wood-200/60">
                <label className="input-label !text-xs !mb-2">使用数量</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setToolQuantityInput((v) => Math.max(1, v - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-wood-200 bg-white hover:border-safety-orange text-wood-700 text-xl font-bold flex items-center justify-center transition-colors shrink-0"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={toolQuantityInput}
                    onChange={(e) =>
                      setToolQuantityInput(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="input-field !text-center !text-lg !font-display flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setToolQuantityInput((v) => v + 1)}
                    className="w-10 h-10 rounded-lg border-2 border-wood-200 bg-white hover:border-safety-orange text-wood-700 text-xl font-bold flex items-center justify-center transition-colors shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowToolPicker(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={addTool}
                disabled={!selectedToolId}
                className="btn-primary disabled:opacity-60"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showConsumablePicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowConsumablePicker(false)}
        >
          <div
            className="card w-full max-w-md p-6 sm:p-7 animate-slide-up max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-wood-200 flex items-center justify-center">
                <Package size={26} className="text-wood-700" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl text-wood-900 mb-1">选择耗材配件</h3>
                <p className="text-sm text-wood-500">从配件清单中选择需要的耗材</p>
              </div>
            </div>

            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400 pointer-events-none"
                strokeWidth={2.2}
              />
              <input
                type="text"
                value={consumableSearch}
                onChange={(e) => setConsumableSearch(e.target.value)}
                placeholder="搜索耗材名称或型号..."
                className="input-field !pl-10 !py-2.5 text-sm"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0">
              {filteredConsumables.length === 0 ? (
                <p className="text-center text-wood-400 py-6 text-sm">
                  {consumables.length === 0 ? "暂无耗材，请先添加耗材" : "没有匹配的耗材"}
                </p>
              ) : (
                filteredConsumables.map((c) => {
                  const unitInfo = CONSUMABLE_UNIT_LIST.find((u) => u.key === c.unit);
                  const displayStock = Number.isInteger(c.currentStock)
                    ? c.currentStock
                    : c.currentStock.toFixed(1);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedConsumableId(c.id === selectedConsumableId ? null : c.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                        selectedConsumableId === c.id
                          ? "border-safety-orange bg-safety-orange/5"
                          : "border-wood-200 bg-white hover:border-wood-400"
                      }`}
                    >
                      <span className="text-xl">{c.emojiIcon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-wood-800 text-sm truncate">{c.name}</p>
                        <p className="text-xs text-wood-500">
                          库存：{displayStock} {unitInfo?.shortLabel || "个"}
                          {c.model ? ` · ${c.model}` : ""}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {selectedConsumableId && (
              <div className="mb-4 p-3 rounded-xl bg-wood-50 border border-wood-200/60">
                <label className="input-label !text-xs !mb-2">使用数量</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setConsumableQuantityInput((v) => Math.max(1, v - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-wood-200 bg-white hover:border-safety-orange text-wood-700 text-xl font-bold flex items-center justify-center transition-colors shrink-0"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={consumableQuantityInput}
                    onChange={(e) =>
                      setConsumableQuantityInput(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="input-field !text-center !text-lg !font-display flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setConsumableQuantityInput((v) => v + 1)}
                    className="w-10 h-10 rounded-lg border-2 border-wood-200 bg-white hover:border-safety-orange text-wood-700 text-xl font-bold flex items-center justify-center transition-colors shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowConsumablePicker(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={addConsumable}
                disabled={!selectedConsumableId}
                className="btn-primary disabled:opacity-60"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
