import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, AlertTriangle, PackageMinus, TrendingDown } from "lucide-react";
import type {
  NewConsumableInput,
  Consumable,
  ConsumableCategory,
  ConsumableUnit,
} from "@/types";
import {
  CONSUMABLE_CATEGORY_LIST,
  CONSUMABLE_UNIT_LIST,
  CONSUMABLE_EMOJI_OPTIONS,
  getConsumableCategoryInfo,
  getConsumableUnitInfo,
} from "@/types";
import { formatDateInput } from "@/utils/format";
import { useConsumableStore } from "@/store/consumableStore";

interface ConsumableFormProps {
  mode: "new" | "edit";
  existingConsumable?: Consumable;
}

const DEFAULT_FORM: NewConsumableInput = {
  name: "",
  category: "other",
  model: "",
  currentStock: 10,
  minStockThreshold: 5,
  unit: "piece",
  location: "",
  purchaseDate: formatDateInput(),
  unitPrice: undefined,
  notes: "",
  emojiIcon: "📦",
};

export default function ConsumableForm({ mode, existingConsumable }: ConsumableFormProps) {
  const navigate = useNavigate();
  const addConsumable = useConsumableStore((s) => s.addConsumable);
  const updateConsumable = useConsumableStore((s) => s.updateConsumable);

  const [form, setForm] = useState<NewConsumableInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewConsumableInput, string>>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (existingConsumable) {
      const { id, createdAt, updatedAt, usageRecords, ...rest } = existingConsumable;
      void id;
      void createdAt;
      void updatedAt;
      void usageRecords;
      setForm(rest);
    }
  }, [existingConsumable]);

  function updateField<K extends keyof NewConsumableInput>(
    key: K,
    value: NewConsumableInput[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "请输入耗材名称";
    if (form.name.trim().length > 30) next.name = "名称不能超过30个字符";
    if (form.model.length > 50) next.model = "型号规格不能超过50个字符";
    if (!form.location.trim()) next.location = "请填写存放位置";
    if (form.location.trim().length > 60) next.location = "位置描述不能超过60个字符";
    if (form.currentStock < 0) next.currentStock = "当前库存不能为负数";
    if (form.minStockThreshold < 0) next.minStockThreshold = "最低阈值不能为负数";
    if (form.minStockThreshold > form.currentStock * 3 && form.currentStock > 0)
      next.minStockThreshold = "阈值建议不超过当前库存的3倍";
    if (form.unitPrice !== undefined && form.unitPrice < 0)
      next.unitPrice = "单价不能为负数";
    if (form.notes.length > 200) next.notes = "备注不能超过200个字符";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === "new") {
        const created = addConsumable(form);
        navigate(`/consumable/${created.id}`, { replace: true });
      } else if (existingConsumable) {
        const updated = updateConsumable(existingConsumable.id, form);
        if (updated) navigate(`/consumable/${updated.id}`, { replace: true });
        else navigate("/consumables", { replace: true });
      }
    } catch (err) {
      alert(
        "保存失败，请重试。\n\n" + (err instanceof Error ? err.message : "未知错误")
      );
    }
  }

  const catInfo = getConsumableCategoryInfo(form.category);
  const unitInfo = getConsumableUnitInfo(form.unit);
  const willAlert = form.currentStock <= form.minStockThreshold;

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
              耗材名称 <span className="text-status-alert">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="例如：5号电池、电钻钻头"
              className={`input-field ${
                errors.name ? "!border-status-alert !ring-status-alert/20" : ""
              }`}
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
              onChange={(e) =>
                updateField("category", e.target.value as ConsumableCategory)
              }
              className="input-field appearance-none bg-[right_1rem_center] pr-10 bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23604932%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>')]"
            >
              {CONSUMABLE_CATEGORY_LIST.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="input-label">型号规格</label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => updateField("model", e.target.value)}
              placeholder="例如：AA碱性电池 1.5V、麻花钻 6mm HSS-G"
              className={`input-field ${
                errors.model ? "!border-status-alert !ring-status-alert/20" : ""
              }`}
              maxLength={50}
            />
            <div className="flex justify-between mt-1.5 px-1">
              {errors.model ? (
                <span className="text-xs text-status-alert">{errors.model}</span>
              ) : (
                <span className="text-[11px] text-wood-500">选填，方便区分同类型不同规格</span>
              )}
              <span className="text-[11px] text-wood-400">{form.model.length}/50</span>
            </div>
          </div>

          <div>
            <label className="input-label">计量单位</label>
            <select
              value={form.unit}
              onChange={(e) => updateField("unit", e.target.value as ConsumableUnit)}
              className="input-field appearance-none bg-[right_1rem_center] pr-10 bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23604932%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>')]"
            >
              {CONSUMABLE_UNIT_LIST.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className="input-label mb-2">图标（选择一个代表该耗材的 emoji）</label>
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
                  {CONSUMABLE_EMOJI_OPTIONS.map((em) => (
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

      {/* 库存与阈值 */}
      <section className="card p-5 sm:p-6">
        <h2 className="section-title mb-5">
          <span className="text-xl">📦</span>
          库存管理
          {willAlert && (
            <span className="ml-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-alert/15 text-status-alert text-xs font-bold animate-pulse-subtle">
              <AlertTriangle size={14} strokeWidth={2.5} />
              当前设置会触发补货提醒
            </span>
          )}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="input-label">
              当前库存 <span className="text-status-alert">*</span>
              <span className="ml-1 text-wood-400 font-normal">（{unitInfo.shortLabel}）</span>
            </label>
            <input
              type="number"
              min={0}
              step={form.unit === "meter" || form.unit === "kg" || form.unit === "liter" ? 0.1 : 1}
              value={form.currentStock}
              onChange={(e) =>
                updateField(
                  "currentStock",
                  e.target.value === ""
                    ? 0
                    : Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              className={`input-field ${
                errors.currentStock ? "!border-status-alert !ring-status-alert/20" : ""
              }`}
            />
            {errors.currentStock && (
              <p className="text-xs text-status-alert mt-1.5 px-1">
                {errors.currentStock}
              </p>
            )}
          </div>

          <div>
            <label className="input-label">
              最低库存阈值
              <span className="ml-1 text-wood-400 font-normal">（低于此值提醒补货）</span>
            </label>
            <div className="relative">
              <PackageMinus
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-400 pointer-events-none"
                strokeWidth={2.2}
              />
              <input
                type="number"
                min={0}
                step={form.unit === "meter" || form.unit === "kg" || form.unit === "liter" ? 0.1 : 1}
                value={form.minStockThreshold}
                onChange={(e) =>
                  updateField(
                    "minStockThreshold",
                    e.target.value === ""
                      ? 0
                      : Math.max(0, parseFloat(e.target.value) || 0)
                  )
                }
                className={`input-field !pl-11 ${
                  errors.minStockThreshold ? "!border-status-alert !ring-status-alert/20" : ""
                }`}
              />
            </div>
            {errors.minStockThreshold ? (
              <p className="text-xs text-status-alert mt-1.5 px-1">
                {errors.minStockThreshold}
              </p>
            ) : (
              <p className="text-[11px] text-wood-500 mt-1.5 px-1 flex items-center gap-1">
                <TrendingDown size={12} strokeWidth={2} />
                例：5号电池剩余少于4节时提醒补货，则填 4
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-wood-50 border border-wood-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-wood-700">库存状态预览</span>
            <span
              className={`text-sm font-bold ${
                willAlert ? "text-status-alert" : "text-status-good"
              }`}
            >
              {willAlert ? "⚠ 会触发补货提醒" : "✓ 库存充足"}
            </span>
          </div>
          <div className="h-3 bg-wood-100 rounded-full overflow-hidden shadow-inset relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                willAlert ? "bg-status-alert" : "bg-status-good"
              }`}
              style={{
                width: `${
                  form.minStockThreshold > 0
                    ? Math.min(
                        100,
                        (form.currentStock / (form.minStockThreshold * 2.5)) * 100
                      )
                    : 100
                }%`,
              }}
            />
            {form.minStockThreshold > 0 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-status-alert/70"
                style={{
                  left: `${Math.min(
                    100,
                    (form.minStockThreshold / (form.minStockThreshold * 2.5)) * 100
                  )}%`,
                }}
                title={`阈值线：${form.minStockThreshold}${unitInfo.shortLabel}`}
              />
            )}
          </div>
          <div className="flex justify-between mt-1.5 text-[11px] text-wood-400">
            <span>空</span>
            <span>
              阈值线 {form.minStockThreshold}
              {unitInfo.shortLabel}
            </span>
            <span>充足</span>
          </div>
        </div>
      </section>

      {/* 位置与购买 */}
      <section className="card p-5 sm:p-6">
        <h2 className="section-title mb-5">
          <span className="text-xl">📍</span>
          存放与购买
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
              placeholder="例如：玄关鞋柜上层-蓝色收纳盒"
              className={`input-field ${
                errors.location ? "!border-status-alert !ring-status-alert/20" : ""
              }`}
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
            <label className="input-label">购买日期</label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) => updateField("purchaseDate", e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label">
              单价（元）
              <span className="ml-1 text-wood-400 font-normal">（选填）</span>
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.unitPrice ?? ""}
              onChange={(e) =>
                updateField(
                  "unitPrice",
                  e.target.value === ""
                    ? undefined
                    : Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              className={`input-field ${
                errors.unitPrice ? "!border-status-alert !ring-status-alert/20" : ""
              }`}
              placeholder="0.00"
            />
            {errors.unitPrice && (
              <p className="text-xs text-status-alert mt-1.5 px-1">{errors.unitPrice}</p>
            )}
          </div>
        </div>
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
          placeholder="可记录购买渠道、适用范围、使用提醒等（选填，最多200字）"
          className={`input-field resize-y ${
            errors.notes ? "!border-status-alert !ring-status-alert/20" : ""
          }`}
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
            <AlertTriangle
              size={18}
              className="text-status-alert shrink-0 mt-0.5"
              strokeWidth={2.2}
            />
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
            {mode === "new" ? "保存新耗材" : "保存修改"}
          </button>
        </div>
      </div>
    </form>
  );
}
