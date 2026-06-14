import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  PackageMinus,
  AlertTriangle,
  FileText,
  PackagePlus,
  Minus,
  Plus,
  History,
  DollarSign,
  Tag,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { useConsumableStore } from "@/store/consumableStore";
import {
  getConsumableCategoryInfo,
  getConsumableUnitInfo,
  isLowStock,
} from "@/types";
import { formatDate, formatDateInput, classNames } from "@/utils/format";

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

export default function ConsumableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hydrate = useConsumableStore((s) => s.hydrate);
  const getConsumableById = useConsumableStore((s) => s.getConsumableById);
  const deleteConsumable = useConsumableStore((s) => s.deleteConsumable);
  const addUsageRecord = useConsumableStore((s) => s.addUsageRecord);
  const restock = useConsumableStore((s) => s.restock);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [usageAmount, setUsageAmount] = useState(1);
  const [usageDate, setUsageDate] = useState(formatDateInput());
  const [usageNotes, setUsageNotes] = useState("");

  const [restockAmount, setRestockAmount] = useState(5);
  const [restockNotes, setRestockNotes] = useState("");

  hydrate();

  const consumable = id ? getConsumableById(id) : undefined;

  if (!consumable) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="耗材不存在" showBack />
        <main className="container max-w-3xl py-10 text-center">
          <div className="card p-12 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-display text-2xl text-wood-800 mb-2">找不到此耗材</h2>
            <p className="text-wood-500 mb-6">该耗材可能已被删除，或链接无效</p>
            <Link to="/consumables" className="btn-primary inline-flex">
              返回耗材清单
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const catInfo = getConsumableCategoryInfo(consumable.category);
  const unitInfo = getConsumableUnitInfo(consumable.unit);
  const lowStock = isLowStock(consumable);
  const ownedDays = 0;

  const displayStock = Number.isInteger(consumable.currentStock)
    ? consumable.currentStock
    : consumable.currentStock.toFixed(1);

  const stockPercent = Math.min(
    100,
    consumable.minStockThreshold > 0
      ? (consumable.currentStock / (consumable.minStockThreshold * 2.5)) * 100
      : 50
  );

  async function handleDelete() {
    setDeleting(true);
    try {
      deleteConsumable(consumable.id);
      navigate("/consumables", { replace: true });
    } finally {
      setDeleting(false);
    }
  }

  function openUsageForm() {
    const step =
      consumable.unit === "meter" ||
      consumable.unit === "kg" ||
      consumable.unit === "liter"
        ? 0.5
        : 1;
    setUsageAmount(Math.min(step, consumable.currentStock > 0 ? step : 0));
    setUsageDate(formatDateInput());
    setUsageNotes("");
    setShowUsageForm(true);
  }

  function handleUsageSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (usageAmount <= 0) return;
    if (usageAmount > consumable.currentStock) return;

    const result = addUsageRecord(consumable.id, {
      amount: usageAmount,
      usageDate,
      notes: usageNotes.trim() || undefined,
    });

    if (result) {
      setShowUsageForm(false);
    }
  }

  function openRestockForm() {
    const step =
      consumable.unit === "meter" ||
      consumable.unit === "kg" ||
      consumable.unit === "liter"
        ? 1
        : 5;
    setRestockAmount(step);
    setRestockNotes("");
    setShowRestockForm(true);
  }

  function handleRestockSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (restockAmount <= 0) return;

    restock(consumable.id, restockAmount, restockNotes.trim() || undefined);
    setShowRestockForm(false);
  }

  const step =
    consumable.unit === "meter" ||
    consumable.unit === "kg" ||
    consumable.unit === "liter"
      ? 0.5
      : 1;

  return (
    <div className="min-h-screen bg-paper">
      <Header
        showBack
        title={consumable.name}
        actions={
          <>
            <Link
              to={`/consumable/${consumable.id}/edit`}
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
        {/* 标题栏 */}
        <section
          className={classNames(
            "card p-5 sm:p-6 screw-corner relative overflow-hidden",
            lowStock && "ring-2 ring-status-alert/30"
          )}
        >
          {lowStock && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-status-alert/10 via-transparent to-transparent pointer-events-none" />
          )}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-4 min-w-0">
              <div
                className={classNames(
                  "shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inset",
                  lowStock ? "bg-status-alert/10" : catInfo.bgColor
                )}
              >
                <span>{consumable.emojiIcon || catInfo.emoji}</span>
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-2xl sm:text-3xl text-wood-900 leading-tight truncate">
                  {consumable.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`tag ${catInfo.bgColor} ${catInfo.color} text-sm !px-3 !py-1.5`}
                  >
                    <span className="text-base">{catInfo.emoji}</span>
                    {catInfo.label}
                  </span>
                  {consumable.model && (
                    <span className="tag bg-wood-100 text-wood-600 text-sm !px-3 !py-1.5">
                      <Tag size={14} strokeWidth={2} />
                      {consumable.model}
                    </span>
                  )}
                  {lowStock && (
                    <span className="tag bg-status-alert/15 text-status-alert text-sm !px-3 !py-1.5 animate-pulse-subtle">
                      <AlertTriangle size={14} strokeWidth={2.2} />
                      该补货了！
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 库存进度条大展示 */}
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-1">
                  当前库存
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className={classNames(
                      "font-display text-4xl sm:text-5xl leading-none",
                      lowStock ? "text-status-alert" : "text-wood-900"
                    )}
                  >
                    {displayStock}
                  </span>
                  <span className="text-xl text-wood-500">{unitInfo.label}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-1">
                  最低阈值
                </p>
                <div className="flex items-baseline gap-1 justify-end">
                  <PackageMinus size={18} className="text-wood-400" strokeWidth={2} />
                  <span className="font-display text-2xl text-wood-600">
                    {consumable.minStockThreshold}
                  </span>
                  <span className="text-sm text-wood-500">{unitInfo.shortLabel}</span>
                </div>
              </div>
            </div>

            <div className="h-5 bg-wood-100 rounded-full overflow-hidden shadow-inset relative">
              <div
                className={classNames(
                  "h-full rounded-full transition-all duration-700",
                  lowStock
                    ? "bg-status-alert animate-pulse-subtle"
                    : stockPercent < 50
                    ? "bg-status-warning"
                    : "bg-status-good"
                )}
                style={{ width: `${Math.max(8, stockPercent)}%` }}
              />
              {consumable.minStockThreshold > 0 && (
                <div
                  className="absolute top-0 bottom-0 w-1 bg-status-alert shadow-sm"
                  style={{
                    left: `${Math.min(
                      95,
                      (consumable.minStockThreshold /
                        (consumable.minStockThreshold * 2.5)) *
                        100
                    )}%`,
                  }}
                  title={`阈值线：${consumable.minStockThreshold}${unitInfo.shortLabel}`}
                />
              )}
            </div>

            <div className="flex justify-between text-[11px] text-wood-400">
              <span>0</span>
              <span className="text-status-alert font-medium">
                阈值线 {consumable.minStockThreshold}
                {unitInfo.shortLabel}
              </span>
              <span>
                充足 ({(consumable.minStockThreshold * 2.5).toFixed(step < 1 ? 1 : 0)}
                {unitInfo.shortLabel}
                +)
              </span>
            </div>
          </div>
        </section>

        {/* 信息卡片网格 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <InfoItem
            icon={MapPin}
            label="存放位置"
            value={
              <span className="text-base leading-relaxed break-words">
                {consumable.location}
              </span>
            }
          />
          <InfoItem
            icon={Calendar}
            label="购买日期"
            value={
              <div>
                <div className="text-base">{formatDate(consumable.purchaseDate)}</div>
                {ownedDays > 0 && (
                  <div className="text-xs text-wood-500 mt-0.5">已购入 {ownedDays} 天</div>
                )}
              </div>
            }
          />

          {lowStock ? (
            <InfoItem
              icon={AlertTriangle}
              label="库存状态"
              highlight
              value={
                <div>
                  <div className="font-bold">库存不足，需要补货</div>
                  <div className="text-xs mt-0.5 opacity-90">
                    已低于最低阈值 {consumable.minStockThreshold}
                    {unitInfo.shortLabel}
                  </div>
                </div>
              }
            />
          ) : (
            <InfoItem
              icon={PackageMinus}
              label="库存状态"
              value={
                <div>
                  <span className="inline-flex items-center gap-1.5 text-status-good font-semibold">
                    <span className="w-2 h-2 rounded-full bg-status-good" />
                    库存充足
                  </span>
                  <div className="text-xs text-wood-500 mt-0.5">
                    距离阈值还差{" "}
                    {(consumable.currentStock - consumable.minStockThreshold).toFixed(
                      step < 1 ? 1 : 0
                    )}
                    {unitInfo.shortLabel}
                  </div>
                </div>
              }
            />
          )}

          <InfoItem
            icon={DollarSign}
            label="参考价值"
            value={
              <div>
                {consumable.unitPrice ? (
                  <>
                    <div className="text-base">
                      ¥{(consumable.currentStock * consumable.unitPrice).toFixed(2)}
                    </div>
                    <div className="text-xs text-wood-500 mt-0.5">
                      单价 ¥{consumable.unitPrice.toFixed(2)}/{unitInfo.shortLabel}
                    </div>
                  </>
                ) : (
                  <span className="text-wood-400 text-sm">未设置单价</span>
                )}
              </div>
            }
          />
        </section>

        {/* 操作面板：使用记录 + 补货 */}
        <section className="card p-5 sm:p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title !mb-0">
              <PackageMinus size={20} strokeWidth={2.2} />
              库存操作
            </h2>
            {consumable.usageRecords && consumable.usageRecords.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-wood-500 hover:text-wood-700 flex items-center gap-1 transition-colors"
              >
                <History size={14} strokeWidth={2} />
                {showHistory ? "收起历史" : "查看记录"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <button
              type="button"
              onClick={openUsageForm}
              disabled={consumable.currentStock <= 0}
              className="p-5 rounded-xl border-2 border-wood-200 bg-white hover:border-wood-400 hover:bg-wood-50 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-wood-200 disabled:hover:bg-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-status-warning/15 text-status-warning flex items-center justify-center group-hover:scale-110 transition-transform group-disabled:group-hover:scale-100">
                  <Minus size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <p className="font-display text-lg text-wood-900">
                    {consumable.currentStock <= 0 ? "库存为空" : "登记使用"}
                  </p>
                  <p className="text-xs text-wood-500">
                    {consumable.currentStock <= 0
                      ? "请先补充库存"
                      : "记录消耗，自动扣减库存"}
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={openRestockForm}
              className={classNames(
                "p-5 rounded-xl border-2 transition-all group text-left",
                lowStock
                  ? "border-status-alert/40 bg-status-alert/5 hover:bg-status-alert/10"
                  : "border-status-good/30 bg-status-good/5 hover:bg-status-good/10 hover:border-status-good/50"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={classNames(
                    "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                    lowStock
                      ? "bg-status-alert/15 text-status-alert"
                      : "bg-status-good/15 text-status-good"
                  )}
                >
                  <Plus size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <p
                    className={classNames(
                      "font-display text-lg",
                      lowStock ? "text-status-alert" : "text-status-good"
                    )}
                  >
                    {lowStock ? "立即补货 🔥" : "补充库存"}
                  </p>
                  <p className="text-xs text-wood-500">采购入库，增加库存数量</p>
                </div>
              </div>
            </button>
          </div>

          {/* 使用历史 */}
          {showHistory &&
            consumable.usageRecords &&
            consumable.usageRecords.length > 0 && (
              <div className="border-t border-wood-200/60 pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-wood-600 mb-3 flex items-center gap-1.5">
                  <History size={14} strokeWidth={2} />
                  使用记录（共 {consumable.usageRecords.length} 条）
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {consumable.usageRecords.map((record) => {
                    const isRestock = record.amount < 0;
                    const displayAmount = Math.abs(record.amount);
                    const friendlyAmount = Number.isInteger(displayAmount)
                      ? displayAmount
                      : displayAmount.toFixed(1);
                    return (
                      <div
                        key={record.id}
                        className={classNames(
                          "p-3 rounded-lg border text-sm",
                          isRestock
                            ? "bg-status-good/5 border-status-good/20"
                            : "bg-wood-50 border-wood-200/60"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={classNames(
                              "font-bold flex items-center gap-1",
                              isRestock ? "text-status-good" : "text-wood-800"
                            )}
                          >
                            {isRestock ? (
                              <PackagePlus size={14} strokeWidth={2.5} />
                            ) : (
                              <PackageMinus size={14} strokeWidth={2.5} />
                            )}
                            {isRestock ? "补货 +" : "使用 -"}
                            {friendlyAmount}
                            {unitInfo.shortLabel}
                          </span>
                          <span
                            className={classNames(
                              "text-xs px-2 py-0.5 rounded-full",
                              isRestock
                                ? "bg-status-good/15 text-status-good"
                                : "bg-wood-200 text-wood-600"
                            )}
                          >
                            {formatDate(record.usageDate)}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-xs text-wood-500 mt-1">
                            备注：{record.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </section>

        {/* 备注 */}
        {consumable.notes && (
          <section className="card p-5 sm:p-6 animate-fade-in">
            <h2 className="section-title mb-3">
              <FileText size={20} strokeWidth={2.2} />
              备注说明
            </h2>
            <p className="text-wood-700 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-safety-orange/40 py-1 px-4 bg-wood-50/60 rounded-r-lg">
              {consumable.notes}
            </p>
          </section>
        )}

        {/* 底部操作 - 移动端 */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-wood-50 via-wood-50 to-wood-50/0 border-t border-wood-200/60 backdrop-blur-sm z-30">
          <div className="flex gap-3">
            <Link
              to={`/consumable/${consumable.id}/edit`}
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

      {/* 删除确认弹窗 */}
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
                  您即将删除耗材{" "}
                  <span className="font-bold text-wood-800">「{consumable.name}」</span>
                  ，此操作不可撤销，所有使用记录将被永久清除。
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

      {/* 使用登记弹窗 */}
      {showUsageForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowUsageForm(false)}
        >
          <div
            className="card w-full max-w-md p-6 sm:p-7 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-status-warning/15 flex items-center justify-center">
                <Minus size={26} className="text-status-warning" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-xl text-wood-900 mb-1">登记使用</h3>
                <p className="text-sm text-wood-500 leading-relaxed">
                  记录本次消耗的{unitInfo.label}，系统将自动扣减库存
                </p>
              </div>
            </div>

            <form onSubmit={handleUsageSubmit} className="space-y-4">
              <div>
                <label className="input-label">
                  消耗数量 <span className="text-status-alert">*</span>
                  <span className="ml-1 text-wood-400 font-normal">
                    （{unitInfo.shortLabel}，最大 {displayStock}{unitInfo.shortLabel}）
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setUsageAmount((v) => Math.max(step, Number((v - step).toFixed(2))))
                    }
                    disabled={usageAmount <= step}
                    className="w-12 h-12 rounded-xl border-2 border-wood-200 bg-white hover:border-safety-orange hover:bg-safety-orange/5 text-wood-700 text-2xl font-bold flex items-center justify-center transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-wood-200 disabled:hover:bg-white"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={step}
                    max={consumable.currentStock}
                    step={step}
                    value={usageAmount}
                    onChange={(e) =>
                      setUsageAmount(
                        e.target.value === ""
                          ? step
                          : Math.min(
                              consumable.currentStock,
                              Math.max(step, parseFloat(e.target.value) || step)
                            )
                      )
                    }
                    className={classNames(
                      "input-field !text-center !text-2xl !font-display flex-1",
                      usageAmount > consumable.currentStock &&
                        "!border-status-alert !ring-status-alert/20"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setUsageAmount((v) =>
                        Number(Math.min(consumable.currentStock, v + step).toFixed(2))
                      )
                    }
                    disabled={usageAmount + step > consumable.currentStock}
                    className="w-12 h-12 rounded-xl border-2 border-wood-200 bg-white hover:border-safety-orange hover:bg-safety-orange/5 text-wood-700 text-2xl font-bold flex items-center justify-center transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-wood-200 disabled:hover:bg-white"
                  >
                    +
                  </button>
                </div>
                <p
                  className={classNames(
                    "text-[11px] mt-2 text-center font-medium",
                    usageAmount > consumable.currentStock
                      ? "text-status-alert"
                      : "text-wood-500"
                  )}
                >
                  当前库存：{displayStock}{unitInfo.shortLabel} → 使用后剩余：
                  <span
                    className={classNames(
                      "font-bold",
                      consumable.currentStock - usageAmount < 0
                        ? "text-status-alert"
                        : consumable.currentStock - usageAmount <= consumable.minStockThreshold
                        ? "text-status-warning"
                        : "text-status-good"
                    )}
                  >
                    {Math.max(0, Number((consumable.currentStock - usageAmount).toFixed(2)))}
                  </span>
                  {unitInfo.shortLabel}
                  {consumable.currentStock - usageAmount < 0 && (
                    <span className="ml-1.5 text-status-alert font-bold">⚠ 超过库存！</span>
                  )}
                  {consumable.currentStock - usageAmount >= 0 &&
                    consumable.currentStock - usageAmount <= consumable.minStockThreshold && (
                      <span className="ml-1.5 text-status-alert font-bold">
                        ⚠ 将触发补货提醒
                      </span>
                    )}
                </p>
              </div>

              <div>
                <label className="input-label">使用日期</label>
                <input
                  type="date"
                  value={usageDate}
                  onChange={(e) => setUsageDate(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="input-label">备注说明</label>
                <textarea
                  value={usageNotes}
                  onChange={(e) => setUsageNotes(e.target.value)}
                  placeholder="可选，如使用场景、用途等"
                  className="input-field w-full min-h-[70px] resize-none"
                  rows={2}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowUsageForm(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={usageAmount <= 0 || usageAmount > consumable.currentStock}
                  className="btn-primary !bg-status-warning !text-white border-status-warning hover:bg-status-warning/90 disabled:opacity-60"
                >
                  {consumable.currentStock <= 0
                    ? "库存为空"
                    : usageAmount > consumable.currentStock
                    ? "超过可用库存"
                    : "确认登记"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 补货弹窗 */}
      {showRestockForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowRestockForm(false)}
        >
          <div
            className="card w-full max-w-md p-6 sm:p-7 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-status-good/15 flex items-center justify-center">
                <Plus size={26} className="text-status-good" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-xl text-wood-900 mb-1">补充库存</h3>
                <p className="text-sm text-wood-500 leading-relaxed">
                  记录本次采购入库的{unitInfo.label}数量
                </p>
              </div>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="input-label">
                  补货数量 <span className="text-status-alert">*</span>
                  <span className="ml-1 text-wood-400 font-normal">
                    （{unitInfo.shortLabel}）
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setRestockAmount((v) => Math.max(step, Number((v - step).toFixed(2))))
                    }
                    className="w-12 h-12 rounded-xl border-2 border-wood-200 bg-white hover:border-safety-orange hover:bg-safety-orange/5 text-wood-700 text-2xl font-bold flex items-center justify-center transition-colors shrink-0"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={step}
                    step={step}
                    value={restockAmount}
                    onChange={(e) =>
                      setRestockAmount(
                        e.target.value === ""
                          ? step
                          : Math.max(step, parseFloat(e.target.value) || step)
                      )
                    }
                    className="input-field !text-center !text-2xl !font-display flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRestockAmount((v) => Number((v + step).toFixed(2)))
                    }
                    className="w-12 h-12 rounded-xl border-2 border-wood-200 bg-white hover:border-safety-orange hover:bg-safety-orange/5 text-wood-700 text-2xl font-bold flex items-center justify-center transition-colors shrink-0"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-wood-500 mt-2 text-center">
                  当前库存：{displayStock} → 补货后共计：
                  <span className="font-bold text-status-good">
                    {Number((consumable.currentStock + restockAmount).toFixed(2))}
                  </span>
                  {unitInfo.shortLabel}
                  {consumable.currentStock + restockAmount > consumable.minStockThreshold &&
                    lowStock && (
                      <span className="ml-1.5 text-status-good font-bold">✓ 解除低库存警报</span>
                    )}
                </p>
              </div>

              <div>
                <label className="input-label">备注说明</label>
                <textarea
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  placeholder="可选，如购买渠道、批次号、单价等"
                  className="input-field w-full min-h-[70px] resize-none"
                  rows={2}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestockForm(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={restockAmount <= 0}
                  className="btn-primary !bg-status-good !text-white border-status-good hover:bg-status-good/90 disabled:opacity-60"
                >
                  确认入库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
