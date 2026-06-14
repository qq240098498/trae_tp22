import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Layers,
  Zap,
  Battery,
  FileText,
  AlertTriangle,
  UserCheck,
  RotateCcw,
  Plus,
  Clock,
  History,
} from "lucide-react";
import Header from "@/components/layout/Header";
import ImageCarousel from "@/components/tool/ImageCarousel";
import { useToolStore } from "@/store/toolStore";
import { getCategoryInfo } from "@/types";
import { formatDate, daysSince, formatDateInput, classNames } from "@/utils/format";

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

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hydrate = useToolStore((s) => s.hydrate);
  const getToolById = useToolStore((s) => s.getToolById);
  const deleteTool = useToolStore((s) => s.deleteTool);
  const addBorrowRecord = useToolStore((s) => s.addBorrowRecord);
  const returnBorrowRecord = useToolStore((s) => s.returnBorrowRecord);
  const getActiveBorrowRecord = useToolStore((s) => s.getActiveBorrowRecord);
  const updateBorrowStatuses = useToolStore((s) => s.updateBorrowStatuses);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [returning, setReturning] = useState(false);

  const [borrowerName, setBorrowerName] = useState("");
  const [borrowDate, setBorrowDate] = useState(formatDateInput());
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [borrowNotes, setBorrowNotes] = useState("");

  hydrate();

  useEffect(() => {
    updateBorrowStatuses();
  }, [updateBorrowStatuses]);

  const tool = id ? getToolById(id) : undefined;
  const activeBorrow = tool ? getActiveBorrowRecord(tool.id) : undefined;
  const isBorrowed = !!activeBorrow;
  const isOverdue = activeBorrow?.status === "overdue";
  const overdueDays = activeBorrow
    ? Math.max(0, daysSince(activeBorrow.expectedReturnDate) || 0)
    : 0;

  if (!tool) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="工具不存在" showBack />
        <main className="container max-w-3xl py-10 text-center">
          <div className="card p-12 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-display text-2xl text-wood-800 mb-2">找不到此工具</h2>
            <p className="text-wood-500 mb-6">该工具可能已被删除，或链接无效</p>
            <Link to="/" className="btn-primary inline-flex">
              返回工具列表
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const catInfo = getCategoryInfo(tool.category);
  const needsAttention = tool.needsMaintenance && tool.maintenanceType !== "none";
  const ownedDays = daysSince(tool.purchaseDate);
  const createdDays = daysSince(tool.createdAt);

  async function handleDelete() {
    setDeleting(true);
    try {
      deleteTool(tool.id);
      navigate("/", { replace: true });
    } finally {
      setDeleting(false);
    }
  }

  function openBorrowForm() {
    setBorrowerName("");
    setBorrowDate(formatDateInput());
    setExpectedReturnDate("");
    setBorrowNotes("");
    setShowBorrowForm(true);
  }

  function handleBorrowSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!borrowerName.trim() || !expectedReturnDate) return;

    addBorrowRecord(tool.id, {
      borrowerName: borrowerName.trim(),
      borrowDate,
      expectedReturnDate,
      notes: borrowNotes.trim() || undefined,
    });

    setShowBorrowForm(false);
  }

  async function handleReturn() {
    if (!activeBorrow) return;
    setReturning(true);
    try {
      returnBorrowRecord(tool.id, activeBorrow.id);
      setShowReturnConfirm(false);
    } finally {
      setReturning(false);
    }
  }

  const maintenanceIcon =
    tool.maintenanceType === "charge" ? Zap : tool.maintenanceType === "battery" ? Battery : Zap;
  const maintenanceLabel =
    tool.maintenanceType === "charge" ? "需定期充电" : "需更换电池";

  return (
    <div className="min-h-screen bg-paper">
      <Header
        showBack
        title={tool.name}
        actions={
          <>
            <Link
              to={`/tool/${tool.id}/edit`}
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
        <section className="card p-5 sm:p-6 screw-corner">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-4 min-w-0">
              <div
                className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inset ${catInfo.bgColor}`}
              >
                {tool.images[0] ? (
                  <img
                    src={tool.images[0]}
                    alt=""
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span>{tool.emojiIcon || catInfo.emoji}</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-2xl sm:text-3xl text-wood-900 leading-tight truncate">
                  {tool.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`tag ${catInfo.bgColor} ${catInfo.color} text-sm !px-3 !py-1.5`}>
                    <span className="text-base">{catInfo.emoji}</span>
                    {catInfo.label}
                  </span>
                  {tool.quantity > 1 && (
                    <span className="tag bg-wood-800 text-wood-50 text-sm !px-3 !py-1.5">
                      <Layers size={14} strokeWidth={2.5} />
                      共 {tool.quantity} 件
                    </span>
                  )}
                  {isBorrowed && (
                    <span
                      className={classNames(
                        "tag text-sm !px-3 !py-1.5 flex items-center gap-1.5",
                        isOverdue
                          ? "bg-status-alert/15 text-status-alert animate-pulse-subtle"
                          : "bg-borrow/15 text-borrow"
                      )}
                    >
                      {isOverdue ? <Clock size={14} strokeWidth={2.2} /> : <UserCheck size={14} strokeWidth={2.2} />}
                      {isOverdue ? "逾期未还" : "外借中"}
                    </span>
                  )}
                  {needsAttention && (
                    <span className="tag bg-status-alert/15 text-status-alert text-sm !px-3 !py-1.5 animate-pulse-subtle">
                      <AlertTriangle size={14} strokeWidth={2.2} />
                      {maintenanceLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <ImageCarousel images={tool.images} altPrefix={tool.name} />
        </section>

        {/* 信息卡片网格 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <InfoItem
            icon={MapPin}
            label="存放位置"
            value={
              <span className="text-base leading-relaxed break-words">{tool.location}</span>
            }
          />
          <InfoItem
            icon={Calendar}
            label="购买日期"
            value={
              <div>
                <div className="text-base">{formatDate(tool.purchaseDate)}</div>
                {ownedDays !== null && ownedDays > 0 && (
                  <div className="text-xs text-wood-500 mt-0.5">
                    已使用 {ownedDays.toLocaleString()} 天 · 入库于{" "}
                    {createdDays !== null ? `${createdDays} 天前` : "未知"}
                  </div>
                )}
              </div>
            }
          />

          {needsAttention ? (
            <InfoItem
              icon={maintenanceIcon}
              label="维护提醒"
              highlight
              value={
                <div>
                  <div className="font-bold">{maintenanceLabel}</div>
                  <div className="text-xs mt-0.5 opacity-90">
                    请定期检查，避免使用时电量不足
                  </div>
                </div>
              }
            />
          ) : (
            <InfoItem
              icon={Zap}
              label="维护要求"
              value={
                <div>
                  <span className="inline-flex items-center gap-1.5 text-status-good font-semibold">
                    <span className="w-2 h-2 rounded-full bg-status-good" />
                    无需特殊维护
                  </span>
                </div>
              }
            />
          )}

          <InfoItem
            icon={Layers}
            label="数量"
            value={
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl">{tool.quantity}</span>
                <span className="text-wood-500 text-sm">件</span>
              </div>
            }
          />
        </section>

        {/* 借用状态 */}
        <section className="card p-5 sm:p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title !mb-0">
              <UserCheck size={20} strokeWidth={2.2} />
              借用登记
            </h2>
            {tool.borrowRecords && tool.borrowRecords.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-wood-500 hover:text-wood-700 flex items-center gap-1 transition-colors"
              >
                <History size={14} strokeWidth={2} />
                {showHistory ? "收起历史" : "查看历史"}
              </button>
            )}
          </div>

          {isBorrowed && activeBorrow ? (
            <div
              className={classNames(
                "p-4 rounded-xl border-2 mb-4",
                isOverdue
                  ? "bg-status-alert/8 border-status-alert/30"
                  : "bg-borrow/8 border-borrow/30"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={classNames(
                      "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                      isOverdue ? "bg-status-alert/15 text-status-alert" : "bg-borrow/15 text-borrow"
                    )}
                  >
                    {isOverdue ? <Clock size={18} strokeWidth={2.2} /> : <UserCheck size={18} strokeWidth={2.2} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg text-wood-900 mb-1">
                      {activeBorrow.borrowerName}
                      <span className="ml-2 text-sm font-normal text-wood-500">正在借用</span>
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-wood-600">
                        <span className="text-wood-400">借用日期：</span>
                        {formatDate(activeBorrow.borrowDate)}
                      </p>
                      <p className={classNames("font-medium", isOverdue ? "text-status-alert" : "text-wood-600")}>
                        <span className="text-wood-400 font-normal">预计归还：</span>
                        {formatDate(activeBorrow.expectedReturnDate)}
                        {isOverdue && <span className="ml-2">（逾期 {overdueDays} 天）</span>}
                      </p>
                      {activeBorrow.notes && (
                        <p className="text-wood-500 text-xs mt-2">
                          备注：{activeBorrow.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowReturnConfirm(true)}
                  className="btn-primary !bg-status-good !text-white border-status-good hover:bg-status-good/90 !py-2 !px-4"
                >
                  <RotateCcw size={16} strokeWidth={2.2} />
                  确认归还
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-wood-400">
              <UserCheck size={36} strokeWidth={1.5} className="mx-auto mb-2 opacity-40" />
              <p>当前未借出</p>
            </div>
          )}

          {!isBorrowed && (
            <button
              type="button"
              onClick={openBorrowForm}
              className="w-full btn-secondary flex items-center justify-center gap-2 !py-3"
            >
              <Plus size={18} strokeWidth={2.2} />
              登记借用
            </button>
          )}

          {/* 借用历史 */}
          {showHistory && tool.borrowRecords && tool.borrowRecords.length > 0 && (
            <div className="mt-4 border-t border-wood-200/60 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-wood-600 mb-3">借用历史</h3>
              {tool.borrowRecords.map((record) => (
                <div
                  key={record.id}
                  className={classNames(
                    "p-3 rounded-lg border text-sm",
                    record.status === "returned"
                      ? "bg-wood-50 border-wood-200/60"
                      : record.status === "overdue"
                      ? "bg-status-alert/5 border-status-alert/20"
                      : "bg-borrow/5 border-borrow/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-wood-800">{record.borrowerName}</span>
                    <span
                      className={classNames(
                        "text-xs px-2 py-0.5 rounded-full",
                        record.status === "returned"
                          ? "bg-status-good/15 text-status-good"
                          : record.status === "overdue"
                          ? "bg-status-alert/15 text-status-alert"
                          : "bg-borrow/15 text-borrow"
                      )}
                    >
                      {record.status === "returned"
                        ? "已归还"
                        : record.status === "overdue"
                        ? "逾期中"
                        : "借用中"}
                    </span>
                  </div>
                  <p className="text-xs text-wood-500">
                    {formatDate(record.borrowDate)} →{" "}
                    {record.actualReturnDate
                      ? formatDate(record.actualReturnDate)
                      : `预计 ${formatDate(record.expectedReturnDate)}`}
                  </p>
                  {record.notes && (
                    <p className="text-xs text-wood-400 mt-1">备注：{record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 备注 */}
        {tool.notes && (
          <section className="card p-5 sm:p-6 animate-fade-in">
            <h2 className="section-title mb-3">
              <FileText size={20} strokeWidth={2.2} />
              备注说明
            </h2>
            <p className="text-wood-700 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-safety-orange/40 py-1 px-4 bg-wood-50/60 rounded-r-lg">
              {tool.notes}
            </p>
          </section>
        )}

        {/* 底部操作 - 移动端 */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-wood-50 via-wood-50 to-wood-50/0 border-t border-wood-200/60 backdrop-blur-sm z-30">
          <div className="flex gap-3">
            <Link
              to={`/tool/${tool.id}/edit`}
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
                  您即将删除工具{" "}
                  <span className="font-bold text-wood-800">「{tool.name}」</span>
                  ，此操作不可撤销，包括所有照片记录在内的相关数据将被永久清除。
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

      {/* 借用登记弹窗 */}
      {showBorrowForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowBorrowForm(false)}
        >
          <div
            className="card w-full max-w-md p-6 sm:p-7 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-borrow/15 flex items-center justify-center">
                <UserCheck size={26} className="text-borrow" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-xl text-wood-900 mb-1">登记借用</h3>
                <p className="text-sm text-wood-500 leading-relaxed">
                  记录借用信息，便于追踪和催还
                </p>
              </div>
            </div>

            <form onSubmit={handleBorrowSubmit} className="space-y-4">
              <div>
                <label className="input-label">
                  借用人 <span className="text-status-alert">*</span>
                </label>
                <input
                  type="text"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="如：张三、邻居李阿姨"
                  className="input-field w-full"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">借用日期</label>
                  <input
                    type="date"
                    value={borrowDate}
                    onChange={(e) => setBorrowDate(e.target.value)}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">
                    预计归还 <span className="text-status-alert">*</span>
                  </label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="input-field w-full"
                    min={borrowDate}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label">备注说明</label>
                <textarea
                  value={borrowNotes}
                  onChange={(e) => setBorrowNotes(e.target.value)}
                  placeholder="可选，如借用用途、注意事项等"
                  className="input-field w-full min-h-[80px] resize-none"
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowBorrowForm(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!borrowerName.trim() || !expectedReturnDate}
                  className="btn-primary !bg-borrow !text-white border-borrow hover:bg-borrow/90 disabled:opacity-60"
                >
                  确认登记
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 归还确认弹窗 */}
      {showReturnConfirm && activeBorrow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !returning && setShowReturnConfirm(false)}
        >
          <div
            className="card w-full max-w-md p-6 sm:p-7 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-status-good/15 flex items-center justify-center">
                <RotateCcw size={26} className="text-status-good" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-xl text-wood-900 mb-1">确认归还？</h3>
                <p className="text-sm text-wood-500 leading-relaxed">
                  确认 <span className="font-bold text-wood-800">{activeBorrow.borrowerName}</span>{" "}
                  已归还「{tool.name}」？
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowReturnConfirm(false)}
                disabled={returning}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleReturn}
                disabled={returning}
                className="btn-primary !bg-status-good !text-white border-status-good hover:bg-status-good/90 disabled:opacity-60"
              >
                {returning ? "处理中..." : "确认归还"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
