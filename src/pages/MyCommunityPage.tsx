import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PackagePlus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  User,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import Header from "@/components/layout/Header";
import CreditScoreDisplay from "@/components/community/CreditScoreDisplay";
import CommunityToolCard from "@/components/community/CommunityToolCard";
import Empty from "@/components/Empty";
import { useCommunityStore } from "@/store/communityStore";
import { getBorrowRequestStatusInfo } from "@/types";
import type { BorrowRequestStatus } from "@/types";
import { formatDate, classNames } from "@/utils/format";

type TabKey = "as_owner" | "as_requester" | "my_tools";

const TABS: { key: TabKey; label: string }[] = [
  { key: "as_owner", label: "我借出的" },
  { key: "as_requester", label: "我借入的" },
  { key: "my_tools", label: "我的工具" },
];

export default function MyCommunityPage() {
  const hydrate = useCommunityStore((s) => s.hydrate);
  const getCurrentUser = useCommunityStore((s) => s.getCurrentUser);
  const getBorrowRequests = useCommunityStore((s) => s.getBorrowRequests);
  const getMyCommunityTools = useCommunityStore((s) => s.getMyCommunityTools);
  const getCreditRecords = useCommunityStore((s) => s.getCreditRecords);
  const approveBorrowRequest = useCommunityStore((s) => s.approveBorrowRequest);
  const rejectBorrowRequest = useCommunityStore((s) => s.rejectBorrowRequest);
  const completeBorrowRequest = useCommunityStore((s) => s.completeBorrowRequest);

  const [activeTab, setActiveTab] = useState<TabKey>("as_owner");

  hydrate();

  const currentUser = getCurrentUser();
  const ownerRequests = getBorrowRequests("as_owner");
  const requesterRequests = getBorrowRequests("as_requester");
  const myTools = getMyCommunityTools();
  const creditRecords = currentUser ? getCreditRecords(currentUser.id) : [];

  function handleApprove(requestId: string) {
    approveBorrowRequest(requestId);
  }

  function handleReject(requestId: string) {
    rejectBorrowRequest(requestId);
  }

  function handleComplete(requestId: string) {
    completeBorrowRequest(requestId, true);
  }

  function renderBorrowRequestCard(
    request: (typeof ownerRequests)[number],
    role: "owner" | "requester"
  ) {
    const statusInfo = getBorrowRequestStatusInfo(request.status as BorrowRequestStatus);
    const otherPersonName =
      role === "owner" ? request.requesterName : request.ownerName;
    const otherPersonAvatar =
      role === "owner" ? request.requesterAvatar : "";
    const isPending = request.status === "pending";
    const isApproved = request.status === "approved";

    return (
      <div
        key={request.id}
        className="card p-4 sm:p-5 animate-fade-in"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-wood-100 flex items-center justify-center text-2xl shadow-inset">
              <span>{request.toolEmoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg text-wood-900 truncate leading-tight">
                  {request.toolName}
                </h3>
                <span className={`tag ${statusInfo.bgColor} ${statusInfo.color} text-xs shrink-0`}>
                  {statusInfo.emoji} {statusInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="shrink-0 w-6 h-6 rounded-full bg-safety-gradient flex items-center justify-center text-white text-xs font-display">
                  {otherPersonAvatar ? (
                    <img
                      src={otherPersonAvatar}
                      alt=""
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    otherPersonName.charAt(0)
                  )}
                </div>
                <span className="text-sm text-wood-700 font-medium">
                  {role === "owner" ? "借用人" : "出借人"}：{otherPersonName}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-wood-50 border border-wood-200/60">
            <div className="flex items-center gap-1.5 text-wood-500 text-xs font-medium mb-1">
              <Calendar size={12} strokeWidth={2} />
              借用日期
            </div>
            <p className="text-sm font-semibold text-wood-800">
              {formatDate(request.borrowDate)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-wood-50 border border-wood-200/60">
            <div className="flex items-center gap-1.5 text-wood-500 text-xs font-medium mb-1">
              <Clock size={12} strokeWidth={2} />
              预计归还
            </div>
            <p className="text-sm font-semibold text-wood-800">
              {formatDate(request.expectedReturnDate)}
            </p>
          </div>
          {request.actualReturnDate && (
            <div className="p-3 rounded-xl bg-status-good/8 border border-status-good/20">
              <div className="flex items-center gap-1.5 text-status-good text-xs font-medium mb-1">
                <CheckCircle2 size={12} strokeWidth={2} />
                实际归还
              </div>
              <p className="text-sm font-semibold text-wood-800">
                {formatDate(request.actualReturnDate)}
              </p>
            </div>
          )}
        </div>

        {request.purpose && (
          <div className="p-3 rounded-xl bg-wood-50 border border-wood-200/60 mb-4">
            <div className="flex items-center gap-1.5 text-wood-500 text-xs font-medium mb-1.5">
              <FileText size={12} strokeWidth={2} />
              借用用途
            </div>
            <p className="text-sm text-wood-700 leading-relaxed whitespace-pre-wrap">
              {request.purpose}
            </p>
          </div>
        )}

        {role === "owner" && (isPending || isApproved) && (
          <div className="flex gap-2">
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => handleApprove(request.id)}
                  className="btn-primary !bg-status-good !text-white border-status-good hover:bg-status-good/90 flex-1 !py-2.5 text-sm"
                >
                  <CheckCircle2 size={16} strokeWidth={2.2} />
                  同意出借
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(request.id)}
                  className="btn-danger flex-1 !py-2.5 text-sm"
                >
                  <AlertCircle size={16} strokeWidth={2.2} />
                  拒绝
                </button>
              </>
            )}
            {isApproved && (
              <button
                type="button"
                onClick={() => handleComplete(request.id)}
                className="btn-primary !bg-status-good !text-white border-status-good hover:bg-status-good/90 w-full !py-2.5 text-sm"
              >
                <CheckCircle2 size={16} strokeWidth={2.2} />
                确认已归还
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderRequestsList(requests: typeof ownerRequests, role: "owner" | "requester") {
    if (requests.length === 0) {
      return (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-wood-600 font-medium">
            {role === "owner" ? "暂无借出记录" : "暂无借入记录"}
          </p>
          <p className="text-xs text-wood-400 mt-1">
            {role === "owner" ? "发布工具到社区后，他人可向您申请借用" : "前往社区工具列表申请借用工具"}
          </p>
          {role === "requester" && (
            <Link
              to="/community"
              className="btn-primary inline-flex mt-4 !py-2 !px-5 text-sm"
            >
              浏览社区工具
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {requests.map((req) => renderBorrowRequestCard(req, role))}
      </div>
    );
  }

  function renderMyTools() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        <Link
          to="/community/tool/new"
          className="card card-hover flex flex-col items-center justify-center min-h-[220px] p-6 text-center border-2 border-dashed border-wood-300 bg-wood-50/50 hover:border-safety-orange hover:bg-safety-orange/5 group animate-fade-in"
        >
          <div className="w-14 h-14 rounded-2xl bg-safety-orange/15 text-safety-orange flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <PackagePlus size={26} strokeWidth={2.2} />
          </div>
          <p className="font-display text-lg text-wood-800 mb-1">添加工具</p>
          <p className="text-xs text-wood-500 leading-relaxed">
            分享您的工具给邻里
            <br />
            赚取信用积分
          </p>
        </Link>
        {myTools.length > 0 ? (
          myTools.map((tool, index) => (
            <CommunityToolCard key={tool.id} tool={tool} index={index} />
          ))
        ) : (
          <></>
        )}
      </div>
    );
  }

  const displayRequests =
    activeTab === "as_owner" ? ownerRequests : requesterRequests;

  return (
    <div className="min-h-screen bg-paper">
      <Header title="我的社区" showBack />

      <main className="container max-w-5xl py-6 sm:py-8 space-y-6 sm:space-y-8 pb-10">
        {currentUser && (
          <section className="animate-fade-in">
            <CreditScoreDisplay
              score={currentUser.creditScore}
              lendCount={currentUser.lendCount}
              borrowCount={currentUser.borrowCount}
              size="lg"
            />
          </section>
        )}

        <section className="animate-fade-in">
          <div className="card p-2 bg-wood-900/5">
            <div className="grid grid-cols-3 gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={classNames(
                      "py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[48px]",
                      isActive
                        ? "bg-white text-wood-900 shadow-md ring-1 ring-wood-200/60"
                        : "text-wood-600 hover:text-wood-900 hover:bg-white/60"
                    )}
                  >
                    {tab.label}
                    <span
                      className={classNames(
                        "ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold",
                        isActive
                          ? "bg-safety-orange/15 text-safety-orange"
                          : "bg-wood-200 text-wood-600"
                      )}
                    >
                      {tab.key === "as_owner"
                        ? ownerRequests.length
                        : tab.key === "as_requester"
                        ? requesterRequests.length
                        : myTools.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          {activeTab === "my_tools"
            ? renderMyTools()
            : renderRequestsList(
                displayRequests,
                activeTab === "as_owner" ? "owner" : "requester"
              )}
        </section>

        <section className="animate-fade-in">
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">
              <User size={20} strokeWidth={2.2} />
              信用记录
            </h2>
            {creditRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-wood-500 text-sm">暂无信用记录</p>
              </div>
            ) : (
              <div className="space-y-2">
                {creditRecords.slice(0, 10).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-wood-50 border border-wood-200/60 hover:bg-wood-100 transition-colors"
                  >
                    <div
                      className={classNames(
                        "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                        record.change >= 0
                          ? "bg-status-good/15 text-status-good"
                          : "bg-status-alert/15 text-status-alert"
                      )}
                    >
                      {record.change >= 0 ? (
                        <TrendingUp size={18} strokeWidth={2.2} />
                      ) : (
                        <TrendingDown size={18} strokeWidth={2.2} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-wood-800 text-sm leading-snug">
                        {record.description}
                        {record.relatedToolName && (
                          <span className="text-wood-500">
                            {" "}· {record.relatedToolName}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-wood-400 mt-0.5">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                    <div
                      className={classNames(
                        "shrink-0 font-display text-xl font-bold",
                        record.change >= 0 ? "text-status-good" : "text-status-alert"
                      )}
                    >
                      {record.change >= 0 ? "+" : ""}
                      {record.change}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
