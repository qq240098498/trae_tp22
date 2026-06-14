import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
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
} from "lucide-react";
import Header from "@/components/layout/Header";
import ImageCarousel from "@/components/tool/ImageCarousel";
import { useToolStore } from "@/store/toolStore";
import { getCategoryInfo } from "@/types";
import { formatDate, daysSince } from "@/utils/format";

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

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  hydrate();

  const tool = id ? getToolById(id) : undefined;

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
    </div>
  );
}
