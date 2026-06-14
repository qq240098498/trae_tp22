import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, AlertTriangle, Pencil } from "lucide-react";
import Header from "@/components/layout/Header";
import type { NewCommunityToolInput, ToolCategory } from "@/types";
import { CATEGORY_LIST, EMOJI_OPTIONS, getCategoryInfo } from "@/types";
import { formatDateInput } from "@/utils/format";
import { useCommunityStore } from "@/store/communityStore";

const DEFAULT_FORM: NewCommunityToolInput = {
  name: "",
  category: "manual",
  description: "",
  emojiIcon: "🔧",
  images: [],
  deposit: 0,
  maxBorrowDays: 7,
  usageNotes: "",
};

export default function CommunityToolFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const hydrate = useCommunityStore((s) => s.hydrate);
  const getCommunityToolById = useCommunityStore((s) => s.getCommunityToolById);
  const addCommunityTool = useCommunityStore((s) => s.addCommunityTool);
  const updateCommunityTool = useCommunityStore((s) => s.updateCommunityTool);

  hydrate();

  const isEdit = Boolean(id);
  const existingTool = id ? getCommunityToolById(id) : undefined;

  const [form, setForm] = useState<NewCommunityToolInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewCommunityToolInput, string>>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (existingTool) {
      const { id, status, createdAt, updatedAt, ownerId, ownerName, ownerAvatar, building, unit, ...rest } = existingTool;
      void id;
      void status;
      void createdAt;
      void updatedAt;
      void ownerId;
      void ownerName;
      void ownerAvatar;
      void building;
      void unit;
      setForm(rest);
    }
  }, [existingTool]);

  if (isEdit && !existingTool) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="工具不存在" showBack />
        <main className="container max-w-3xl py-10 text-center">
          <div className="card p-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-display text-2xl text-wood-800 mb-2">找不到此工具</h2>
            <p className="text-wood-500 mb-6">该工具可能已被删除，或链接无效</p>
          </div>
        </main>
      </div>
    );
  }

  function updateField<K extends keyof NewCommunityToolInput>(key: K, value: NewCommunityToolInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "请输入工具名称";
    if (form.name.trim().length > 30) next.name = "名称不能超过30个字符";
    if (!form.description.trim()) next.description = "请填写工具描述";
    if (form.description.trim().length > 200) next.description = "描述不能超过200个字符";
    if (form.deposit < 0 || !Number.isFinite(form.deposit)) next.deposit = "押金必须是非负数字";
    if (form.maxBorrowDays < 1 || !Number.isInteger(form.maxBorrowDays)) next.maxBorrowDays = "最长借用天数必须是大于 0 的整数";
    if (form.usageNotes.length > 300) next.usageNotes = "使用说明不能超过300个字符";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (!isEdit) {
        addCommunityTool(form);
        navigate("/community/my", { replace: true });
      } else if (existingTool) {
        updateCommunityTool(existingTool.id, form);
        navigate("/community/my", { replace: true });
      }
    } catch (err) {
      alert(
        "保存失败：存储空间已满，请稍后重试。\n\n" +
          (err instanceof Error ? err.message : "未知错误")
      );
    }
  }

  const title = isEdit ? "编辑社区工具" : "上架工具";
  const catInfo = getCategoryInfo(form.category);

  return (
    <div className="min-h-screen bg-paper">
      <Header
        title={title}
        showBack
        actions={
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-wood-200 text-sm">
            <Pencil size={16} strokeWidth={2.2} />
            {isEdit ? "修改工具资料" : "填写工具信息"}
          </div>
        }
      />
      <main className="container max-w-3xl py-6 sm:py-8 pb-32">
        <div className="mb-5 sm:mb-6">
          <p className="text-sm text-wood-500">
            <span className="font-display text-lg text-wood-800 mr-2">
              {isEdit ? "📝 修改社区工具信息" : "🤝 上架新工具"}
            </span>
            标有 <span className="text-status-alert font-bold">*</span> 的字段为必填
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          <section className="card p-5 sm:p-6">
            <h2 className="section-title mb-5">
              <span className="text-xl">{catInfo.emoji}</span>
              基本信息
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div className="md:col-span-2">
                <label className="input-label">
                  工具名称 <span className="text-status-alert">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="例如：十字螺丝刀套装"
                  className={`input-field ${errors.name ? "!border-status-alert !ring-status-alert/20" : ""}`}
                  maxLength={30}
                />
                <div className="flex justify-between mt-1.5 px-1">
                  {errors.name ? (
                    <span className="text-xs text-status-alert">{errors.name}</span>
                  ) : (
                    <span />
                  )}
                  <span className="text-[11px] text-wood-400">{form.name.length}/30</span>
                </div>
              </div>

              <div>
                <label className="input-label">分类</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value as ToolCategory)}
                  className="input-field appearance-none bg-[right_1rem_center] pr-10 bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23604932%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>')]"
                >
                  {CATEGORY_LIST.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="input-label mb-2">图标（选择一个代表该工具的 emoji）</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className="w-14 h-14 rounded-xl border-2 border-wood-300 bg-white text-3xl hover:border-safety-orange hover:scale-105 transition flex items-center justify-center shadow-inset"
                >
                  {form.emojiIcon || catInfo.emoji}
                </button>
                {showEmojiPicker && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowEmojiPicker(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 z-30 w-full max-w-sm p-3 rounded-xl border border-wood-200 bg-white shadow-cardHover animate-fade-in grid grid-cols-8 gap-1.5">
                      {EMOJI_OPTIONS.map((em) => (
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

            <div className="mt-5">
              <label className="input-label">
                工具描述 <span className="text-status-alert">*</span>
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="简要描述工具用途、规格型号等，帮助邻居了解是否适合借用（最多200字）"
                className={`input-field resize-y ${errors.description ? "!border-status-alert !ring-status-alert/20" : ""}`}
                maxLength={200}
              />
              <div className="flex justify-between mt-1.5 px-1">
                {errors.description ? (
                  <span className="text-xs text-status-alert">{errors.description}</span>
                ) : (
                  <span />
                )}
                <span className="text-[11px] text-wood-400">{form.description.length}/200</span>
              </div>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="section-title mb-5">
              <span className="text-xl">💰</span>
              借用规则
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="input-label">押金（元）</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.deposit}
                  onChange={(e) =>
                    updateField(
                      "deposit",
                      e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0)
                    )
                  }
                  className={`input-field ${errors.deposit ? "!border-status-alert !ring-status-alert/20" : ""}`}
                  placeholder="0"
                />
                {errors.deposit && (
                  <p className="text-xs text-status-alert mt-1.5 px-1">{errors.deposit}</p>
                )}
                <p className="text-[11px] text-wood-500 mt-1.5 px-1">
                  工具完好归还时全额退还，如有损坏将扣除相应费用
                </p>
              </div>

              <div>
                <label className="input-label">最长借用天数</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={form.maxBorrowDays}
                  onChange={(e) =>
                    updateField(
                      "maxBorrowDays",
                      e.target.value === "" ? 7 : Math.max(1, parseInt(e.target.value) || 7)
                    )
                  }
                  className={`input-field ${errors.maxBorrowDays ? "!border-status-alert !ring-status-alert/20" : ""}`}
                  placeholder="7"
                />
                {errors.maxBorrowDays && (
                  <p className="text-xs text-status-alert mt-1.5 px-1">{errors.maxBorrowDays}</p>
                )}
                <p className="text-[11px] text-wood-500 mt-1.5 px-1">
                  借用人需在此期限内归还，如需延期请提前协商
                </p>
              </div>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="section-title mb-5">
              <span className="text-xl">📝</span>
              使用说明
            </h2>
            <textarea
              rows={3}
              value={form.usageNotes}
              onChange={(e) => updateField("usageNotes", e.target.value)}
              placeholder="使用注意事项、维护要求、特殊操作说明等（选填，最多300字）"
              className={`input-field resize-y ${errors.usageNotes ? "!border-status-alert !ring-status-alert/20" : ""}`}
              maxLength={300}
            />
            <div className="flex justify-between mt-1.5 px-1">
              {errors.usageNotes ? (
                <span className="text-xs text-status-alert">{errors.usageNotes}</span>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-wood-400">{form.usageNotes.length}/300</span>
            </div>
          </section>

          <div className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-gradient-to-t from-wood-50 via-wood-50/95 to-wood-50/0 border-t border-wood-200/60 backdrop-blur-sm">
            {Object.keys(errors).length > 0 && (
              <div className="mb-3 p-3 rounded-lg bg-status-alert/10 border border-status-alert/30 flex items-start gap-2 animate-fade-in">
                <AlertTriangle size={18} className="text-status-alert shrink-0 mt-0.5" strokeWidth={2.2} />
                <p className="text-sm text-status-alert">
                  请检查上方标红的必填项后再保存
                </p>
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
                {isEdit ? "保存修改" : "确认上架"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
