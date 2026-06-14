import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, AlertTriangle } from "lucide-react";
import type { NewToolInput, Tool, ToolCategory, MaintenanceType } from "@/types";
import { CATEGORY_LIST, EMOJI_OPTIONS, getCategoryInfo } from "@/types";
import { formatDateInput } from "@/utils/format";
import { useToolStore } from "@/store/toolStore";
import ImageUploader from "./ImageUploader";

interface ToolFormProps {
  mode: "new" | "edit";
  existingTool?: Tool;
}

const DEFAULT_FORM: NewToolInput = {
  name: "",
  category: "manual",
  location: "",
  quantity: 1,
  purchaseDate: formatDateInput(),
  needsMaintenance: false,
  maintenanceType: "none",
  notes: "",
  images: [],
  emojiIcon: "🔧",
};

export default function ToolForm({ mode, existingTool }: ToolFormProps) {
  const navigate = useNavigate();
  const addTool = useToolStore((s) => s.addTool);
  const updateTool = useToolStore((s) => s.updateTool);

  const [form, setForm] = useState<NewToolInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewToolInput, string>>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (existingTool) {
      const { id, createdAt, updatedAt, ...rest } = existingTool;
      void id;
      void createdAt;
      void updatedAt;
      setForm(rest);
    }
  }, [existingTool]);

  function updateField<K extends keyof NewToolInput>(key: K, value: NewToolInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "请输入工具名称";
    if (form.name.trim().length > 30) next.name = "名称不能超过30个字符";
    if (!form.location.trim()) next.location = "请填写存放位置";
    if (form.location.trim().length > 60) next.location = "位置描述不能超过60个字符";
    if (form.quantity < 1 || !Number.isInteger(form.quantity))
      next.quantity = "数量必须是大于 0 的整数";
    if (form.notes.length > 200) next.notes = "备注不能超过200个字符";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === "new") {
        const created = addTool(form);
        navigate(`/tool/${created.id}`, { replace: true });
      } else if (existingTool) {
        const updated = updateTool(existingTool.id, form);
        if (updated) navigate(`/tool/${updated.id}`, { replace: true });
        else navigate("/", { replace: true });
      }
    } catch (err) {
      alert(
        "保存失败：存储空间已满，请减少图片数量或删除部分旧工具后重试。\n\n" +
          (err instanceof Error ? err.message : "未知错误")
      );
    }
  }

  const catInfo = getCategoryInfo(form.category);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
      {/* 基本信息 */}
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
      </section>

      {/* 位置与数量 */}
      <section className="card p-5 sm:p-6">
        <h2 className="section-title mb-5">
          <span className="text-xl">📍</span>
          存放与数量
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="md:col-span-2">
            <label className="input-label">
              存放位置 <span className="text-status-alert">*</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="例如：阳台收纳柜第二层-左侧工具箱"
              className={`input-field ${errors.location ? "!border-status-alert !ring-status-alert/20" : ""}`}
              maxLength={60}
            />
            <div className="flex justify-between mt-1.5 px-1">
              {errors.location ? (
                <span className="text-xs text-status-alert">{errors.location}</span>
              ) : (
                <span className="text-[11px] text-wood-500">
                  建议格式：房间-家具-层/区域，便于日后搜索
                </span>
              )}
              <span className="text-[11px] text-wood-400">{form.location.length}/60</span>
            </div>
          </div>

          <div>
            <label className="input-label">数量</label>
            <input
              type="number"
              min={1}
              step={1}
              value={form.quantity}
              onChange={(e) =>
                updateField(
                  "quantity",
                  e.target.value === "" ? 1 : Math.max(1, parseInt(e.target.value) || 1)
                )
              }
              className={`input-field ${errors.quantity ? "!border-status-alert !ring-status-alert/20" : ""}`}
            />
            {errors.quantity && (
              <p className="text-xs text-status-alert mt-1.5 px-1">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="input-label">购买日期</label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) => updateField("purchaseDate", e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </section>

      {/* 维护信息 */}
      <section className="card p-5 sm:p-6">
        <h2 className="section-title mb-5">
          <span className="text-xl">⚡</span>
          维护提醒
        </h2>

        <label className="flex items-start gap-3 p-4 rounded-xl bg-status-warning/5 border border-status-warning/20 cursor-pointer hover:bg-status-warning/10 transition mb-4">
          <input
            type="checkbox"
            checked={form.needsMaintenance}
            onChange={(e) => {
              const val = e.target.checked;
              updateField("needsMaintenance", val);
              if (!val) updateField("maintenanceType", "none");
              else if (form.maintenanceType === "none")
                updateField("maintenanceType", "charge");
            }}
            className="mt-0.5 w-5 h-5 rounded border-wood-300 text-safety-orange focus:ring-safety-orange/40"
          />
          <div className="min-w-0">
            <p className="font-semibold text-wood-800">
              此工具需要定期维护
            </p>
            <p className="text-xs text-wood-500 mt-0.5">
              勾选后将在列表与详情中高亮显示，提醒您及时充电或更换电池
            </p>
          </div>
        </label>

        {form.needsMaintenance && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            {[
              { k: "charge", label: "🔌 需要充电", desc: "如电钻、电动螺丝刀" },
              { k: "battery", label: "🔋 更换电池", desc: "使用一次性/充电电池" },
            ].map((opt) => (
              <label
                key={opt.k}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  form.maintenanceType === opt.k
                    ? "border-safety-orange bg-safety-orange/5 shadow-sm"
                    : "border-wood-200 bg-white hover:border-wood-400"
                }`}
              >
                <input
                  type="radio"
                  name="maintenanceType"
                  value={opt.k}
                  checked={form.maintenanceType === opt.k}
                  onChange={() =>
                    updateField("maintenanceType", opt.k as MaintenanceType)
                  }
                  className="sr-only"
                />
                <p className="font-semibold text-wood-800">{opt.label}</p>
                <p className="text-xs text-wood-500 mt-1">{opt.desc}</p>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* 图片 */}
      <section className="card p-5 sm:p-6">
        <h2 className="section-title mb-5">
          <span className="text-xl">📷</span>
          照片记录
          <span className="ml-2 text-xs font-body text-wood-500 font-normal">
            （存放位置照片可帮助快速找到工具）
          </span>
        </h2>
        <ImageUploader
          images={form.images}
          onChange={(imgs) => updateField("images", imgs)}
        />
      </section>

      {/* 备注 */}
      <section className="card p-5 sm:p-6">
        <h2 className="section-title mb-5">
          <span className="text-xl">📝</span>
          备注说明
        </h2>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="可记录规格型号、借用情况、使用提醒等（选填，最多200字）"
          className={`input-field resize-y ${errors.notes ? "!border-status-alert !ring-status-alert/20" : ""}`}
          maxLength={200}
        />
        <div className="flex justify-between mt-1.5 px-1">
          {errors.notes ? (
            <span className="text-xs text-status-alert">{errors.notes}</span>
          ) : (
            <span />
          )}
          <span className="text-[11px] text-wood-400">{form.notes.length}/200</span>
        </div>
      </section>

      {/* 提交区 */}
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
            {mode === "new" ? "保存新工具" : "保存修改"}
          </button>
        </div>
      </div>
    </form>
  );
}
