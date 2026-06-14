import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Pencil,
  Trash2,
  FileText,
  Wallet,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Handshake,
  Clock,
  MapPin,
} from "lucide-react";
import Header from "@/components/layout/Header";
import CreditScoreDisplay from "@/components/community/CreditScoreDisplay";
import BorrowAgreementTemplate from "@/components/community/BorrowAgreementTemplate";
import { useCommunityStore } from "@/store/communityStore";
import {
  getCategoryInfo,
  getCommunityToolStatusInfo,
  getBorrowRequestStatusInfo,
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

export default function CommunityToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hydrate = useCommunityStore((s) => s.hydrate);
  const getCommunityToolById = useCommunityStore((s) => s.getCommunityToolById);
  const getCurrentUser = useCommunityStore((s) => s.getCurrentUser);
  const getBorrowRequests = useCommunityStore((s) => s.getBorrowRequests);
  const createBorrowRequest = useCommunityStore((s) => s.createBorrowRequest);
  const getAgreementByRequestId = useCommunityStore((s) => s.getAgreementByRequestId);
  const approveBorrowRequest = useCommunityStore((s) => s.approveBorrowRequest);
  const rejectBorrowRequest = useCommunityStore((s) => s.rejectBorrowRequest);
  const completeBorrowRequest = useCommunityStore((s) => s.completeBorrowRequest);
  const removeCommunityTool = useCommunityStore((s) => s.removeCommunityTool);
  const signAgreement = useCommunityStore((s) => s.signAgreement);

  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const [borrowDate, setBorrowDate] = useState(formatDateInput());
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [purpose, setPurpose] = useState("");

  hydrate();

  const tool = id ? getCommunityToolById(id) : undefined;
  const currentUser = getCurrentUser();

  if (!tool) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="工具不存在" showBack />
        <main className="container max-w-3xl py-10 text-center">
          <div className="card p-12 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-display text-2xl text-wood-800 mb-2">找不到此工具</h2>
            <p className="text-wood-500 mb-6">该工具可能已被下架，或链接无效</p>
            <Link to="/community" className="btn-primary inline-flex">
              返回社区工具
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const catInfo = getCategoryInfo(tool.category);
  const statusInfo = getCommunityToolStatusInfo(tool.status);
  const isOwner = currentUser?.id === tool.ownerId;

  const allRequests = getBorrowRequests();
  const pendingRequestsForTool = allRequests.filter(
    (r) => r.toolId === tool.id && r.status === "pending"
  );
  const myApprovedRequestForTool = allRequests.find(
    (r) => r.toolId === tool.id && r.requesterId === currentUser?.id && r.status === "approved"
  );
  const agreementForMyRequest = myApprovedRequestForTool
    ? getAgreementByRequestId(myApprovedRequestForTool.id)
    : undefined;

  const currentAgreement = currentRequestId
    ? getAgreementByRequestId(currentRequestId)
    : agreementForMyRequest;

  function openBorrowForm() {
    setBorrowDate(formatDateInput());
    setExpectedReturnDate("");
    setPurpose("");
    setShowBorrowForm(true);
  }

  function handleBorrowSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expectedReturnDate) return;

    const request = createBorrowRequest(tool.id, {
      borrowDate,
      expectedReturnDate,
      purpose: purpose.trim() || "",
    });

    setShowBorrowForm(false);
    if (request) {
      setCurrentRequestId(request.id);
      setShowAgreement(true);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      removeCommunityTool(tool.id);
      navigate("/community", { replace: true });
    } finally {
      setRemoving(false);
    }
  }

  function handleApprove(requestId: string) {
    approveBorrowRequest(requestId);
  }

  function handleReject(requestId: string) {
    rejectBorrowRequest(requestId);
  }

  function handleComplete(onTime: boolean) {
    if (myApprovedRequestForTool) {
      completeBorrowRequest(myApprovedRequestForTool.id, onTime);
      setShowCompleteConfirm(false);
    }
  }

  function handleSignAgreement(asLender: boolean) {
    if (currentAgreement) {
      signAgreement(currentAgreement.id, asLender);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header
        showBack
        title={tool.name}
        actions={
          isOwner ? (
            <>
              <Link
                to={`/community/tool/${tool.id}/edit`}
                className="hidden sm:inline-flex btn-secondary !py-2 !px-4"
              >
                <Pencil size={16} strokeWidth={2.2} />
                编辑
              </Link>
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="hidden sm:inline-flex btn-danger !py-2 !px-4"
              >
                <Trash2 size={16} strokeWidth={2.2} />
                下架
              </button>
            </>
          ) : null
        }
      />

      <main className="container max-w-5xl py-6 sm:py-8 space-y-6 sm:space-y-7 pb-28 sm:pb-10 animate-slide-up">
        <section className="card p-5 sm:p-6 screw-corner">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div
                className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inset ${catInfo.bgColor}`}
              >
                <span>{tool.emojiIcon || catInfo.emoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl sm:text-3xl text-wood-900 leading-tight truncate">
                  {tool.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`tag ${catInfo.bgColor} ${catInfo.color} text-sm !px-3 !py-1.5`}>
                    <span className="text-base">{catInfo.emoji}</span>
                    {catInfo.label}
                  </span>
                  <span className={`tag ${statusInfo.bgColor} ${statusInfo.color} text-sm !px-3 !py-1.5`}>
                    <span className="text-base">{statusInfo.emoji}</span>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-wood-50 border border-wood-200/60">
            <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-3">
              工具所有者
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-12 h-12 rounded-full bg-safety-gradient flex items-center justify-center text-white font-display text-lg shadow-sm">
                  {tool.ownerAvatar ? (
                    <img
                      src={tool.ownerAvatar}
                      alt=""
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    tool.ownerName.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-wood-800 truncate">{tool.ownerName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-wood-500 mt-0.5">
                    <MapPin size={12} strokeWidth={2} />
                    <span>{tool.building}栋{tool.unit}单元</span>
                  </div>
                </div>
              </div>
              <CreditScoreDisplay score={currentUser?.creditScore ?? 0} size="sm" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <InfoItem
            icon={FileText}
            label="工具描述"
            value={
              <p className="text-sm leading-relaxed text-wood-700 whitespace-pre-wrap">
                {tool.description || "暂无描述"}
              </p>
            }
          />
          <InfoItem
            icon={Wallet}
            label="押金金额"
            value={
              <div>
                <span className="font-display text-2xl text-safety-orange">
                  {tool.deposit > 0 ? `¥${tool.deposit}` : "无需押金"}
                </span>
                {tool.deposit > 0 && (
                  <p className="text-xs text-wood-500 mt-0.5">
                    工具完好归还时全额退还
                  </p>
                )}
              </div>
            }
          />
          <InfoItem
            icon={Calendar}
            label="最长借用天数"
            value={
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl">{tool.maxBorrowDays}</span>
                <span className="text-wood-500 text-sm">天</span>
              </div>
            }
          />
          <InfoItem
            icon={AlertCircle}
            label="使用注意事项"
            value={
              <p className="text-sm leading-relaxed text-wood-700 whitespace-pre-wrap">
                {tool.usageNotes || "暂无特殊注意事项"}
              </p>
            }
          />
        </section>

        {isOwner && pendingRequestsForTool.length > 0 && (
          <section className="card p-5 sm:p-6 animate-fade-in">
            <h2 className="section-title mb-4">
              <Clock size={20} strokeWidth={2.2} />
              待处理借用申请
              <span className="ml-2 text-xs font-body text-wood-500 font-normal">
                （共 {pendingRequestsForTool.length} 条）
              </span>
            </h2>
            <div className="space-y-3">
              {pendingRequestsForTool.map((request) => {
                const reqStatusInfo = getBorrowRequestStatusInfo(request.status);
                return (
                  <div
                    key={request.id}
                    className="p-4 rounded-xl bg-wood-50 border border-wood-200/60"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-wood-100 flex items-center justify-center text-wood-700 font-display">
                          {request.requesterAvatar ? (
                            <img
                              src={request.requesterAvatar}
                              alt=""
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            request.requesterName.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-wood-800">
                            {request.requesterName}
                          </p>
                          <p className="text-xs text-wood-500 mt-0.5">
                            {request.requesterBuilding}栋{request.requesterUnit}单元
                          </p>
                        </div>
                      </div>
                      <span className={`tag ${reqStatusInfo.bgColor} ${reqStatusInfo.color} text-xs shrink-0`}>
                        {reqStatusInfo.emoji} {reqStatusInfo.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="p-2.5 rounded-lg bg-white border border-wood-200/60">
                        <p className="text-xs text-wood-500 mb-0.5">借用日期</p>
                        <p className="font-medium text-wood-800">{formatDate(request.borrowDate)}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-wood-200/60">
                        <p className="text-xs text-wood-500 mb-0.5">预计归还</p>
                        <p className="font-medium text-wood-800">{formatDate(request.expectedReturnDate)}</p>
                      </div>
                    </div>
                    {request.purpose && (
                      <div className="p-2.5 rounded-lg bg-white border border-wood-200/60 mb-3">
                        <p className="text-xs text-wood-500 mb-0.5">借用用途</p>
                        <p className="text-sm text-wood-700 whitespace-pre-wrap">{request.purpose}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(request.id)}
                        className="btn-primary !bg-status-good !text-white border-status-good hover:bg-status-good/90 flex-1 !py-2 text-sm"
                      >
                        <CheckCircle2 size={16} strokeWidth={2.2} />
                        同意
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(request.id)}
                        className="btn-danger flex-1 !py-2 text-sm"
                      >
                        <AlertCircle size={16} strokeWidth={2.2} />
                        拒绝
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {myApprovedRequestForTool && agreementForMyRequest && (
          <section className="space-y-4 animate-fade-in">
            <BorrowAgreementTemplate
              agreement={agreementForMyRequest}
              onSign={handleSignAgreement}
              canSignAsLender={isOwner}
              canSignAsBorrower={!isOwner && currentUser?.id === myApprovedRequestForTool.requesterId}
            />
            <div className="card p-5 sm:p-6">
              <h2 className="section-title mb-4">
                <CheckCircle2 size={20} strokeWidth={2.2} />
                归还工具
              </h2>
              <p className="text-sm text-wood-600 mb-4">
                请确认已将工具完好归还给出借人后再标记完成。按时归还可获得信用奖励。
              </p>
              <button
                type="button"
                onClick={() => setShowCompleteConfirm(true)}
                className="w-full btn-primary !bg-status-good !text-white border-status-good hover:bg-status-good/90 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} strokeWidth={2.2} />
                确认已归还
              </button>
            </div>
          </section>
        )}

        {showAgreement && currentAgreement && (
          <section className="animate-fade-in">
            <BorrowAgreementTemplate
              agreement={currentAgreement}
              onSign={handleSignAgreement}
              canSignAsLender={isOwner}
              canSignAsBorrower={!isOwner}
            />
          </section>
        )}

        <section className="card p-5 sm:p-6 animate-fade-in">
          <h2 className="section-title mb-4">
            <Handshake size={20} strokeWidth={2.2} />
            操作
          </h2>

          {isOwner ? (
            <div className="space-y-3">
              <Link
                to={`/community/tool/${tool.id}/edit`}
                className="w-full p-4 rounded-xl border-2 border-wood-200 bg-white hover:border-wood-400 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-wood-100 text-wood-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Pencil size={20} strokeWidth={2.4} />
                  </div>
                  <div>
                    <p className="font-display text-lg text-wood-900">编辑工具信息</p>
                    <p className="text-xs text-wood-500">修改工具描述、押金、借用天数等信息</p>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="w-full p-4 rounded-xl border-2 border-status-alert/30 bg-status-alert/5 hover:bg-status-alert/10 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-status-alert/15 text-status-alert flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trash2 size={20} strokeWidth={2.4} />
                  </div>
                  <div>
                    <p className="font-display text-lg text-wood-900">下架此工具</p>
                    <p className="text-xs text-wood-500">从社区工具列表中移除，不再接受借用申请</p>
                  </div>
                </div>
              </button>
            </div>
          ) : tool.status === "available" ? (
            <button
              type="button"
              onClick={openBorrowForm}
              className="w-full p-4 rounded-xl border-2 border-safety-orange/30 bg-safety-orange/5 hover:bg-safety-orange/10 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-safety-orange/15 text-safety-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <p className="font-display text-lg text-wood-900">申请借用</p>
                  <p className="text-xs text-wood-500">填写借用信息，等待出借人同意</p>
                </div>
              </div>
            </button>
          ) : (
            <div className="text-center py-6 text-wood-400">
              <Clock size={36} strokeWidth={1.5} className="mx-auto mb-2 opacity-40" />
              <p className="font-medium">
                {statusInfo.emoji} 此工具当前{statusInfo.label}
              </p>
              <p className="text-xs mt-1">请稍后再来查看</p>
            </div>
          )}
        </section>

        {isOwner && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-wood-50 via-wood-50 to-wood-50/0 border-t border-wood-200/60 backdrop-blur-sm z-30">
            <div className="flex gap-3">
              <Link
                to={`/community/tool/${tool.id}/edit`}
                className="btn-secondary flex-1 min-h-[50px]"
              >
                <Pencil size={18} strokeWidth={2.2} />
                编辑
              </Link>
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="btn-danger flex-1 min-h-[50px]"
              >
                <Trash2 size={18} strokeWidth={2.2} />
                下架
              </button>
            </div>
          </div>
        )}
      </main>

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
                <h3 className="font-display text-xl text-wood-900 mb-1">申请借用</h3>
                <p className="text-sm text-wood-500 leading-relaxed">
                  填写借用信息，提交后等待出借人同意
                </p>
              </div>
            </div>

            <form onSubmit={handleBorrowSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">
                    借用日期 <span className="text-status-alert">*</span>
                  </label>
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
                <label className="input-label">借用用途</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="请简要描述借用用途，如：维修家中水龙头、组装家具等"
                  className="input-field w-full min-h-[100px] resize-none"
                  rows={4}
                />
                <p className="text-[11px] text-wood-400 mt-1 px-1">
                  清晰的用途说明有助于出借人更快同意您的申请
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>温馨提示：</strong>押金 ¥{tool.deposit || 0}，最长借用 {tool.maxBorrowDays} 天。
                  请按时归还，维护良好信用记录。
                </p>
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
                  disabled={!expectedReturnDate}
                  className="btn-primary !bg-borrow !text-white border-borrow hover:bg-borrow/90 disabled:opacity-60"
                >
                  提交申请
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !removing && setConfirmRemove(false)}
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
                <h3 className="font-display text-xl text-wood-900 mb-1">确认下架？</h3>
                <p className="text-sm text-wood-500 leading-relaxed">
                  您即将下架工具{" "}
                  <span className="font-bold text-wood-800">「{tool.name}」</span>
                  ，此操作不可撤销，下架后将不再接受新的借用申请。
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                disabled={removing}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={removing}
                className="btn-danger !bg-status-alert !text-white border-status-alert hover:bg-status-alert/90 disabled:opacity-60"
              >
                {removing ? "处理中..." : "确认下架"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteConfirm && myApprovedRequestForTool && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCompleteConfirm(false)}
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
                <h3 className="font-display text-xl text-wood-900 mb-1">确认归还？</h3>
                <p className="text-sm text-wood-500 leading-relaxed">
                  请确认已将「{tool.name}」完好归还给出借人 {tool.ownerName}。
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-status-good/8 border border-status-good/20 mb-4">
              <p className="text-sm text-status-good leading-relaxed">
                ✨ 按时归还可获得 <strong>+5 信用分</strong>奖励
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCompleteConfirm(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleComplete(true)}
                className="btn-primary !bg-status-good !text-white border-status-good hover:bg-status-good/90"
              >
                确认已归还
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
