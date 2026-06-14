import { Link } from "react-router-dom";
import { MapPin, User, Calendar, Wallet } from "lucide-react";
import type { CommunityTool } from "@/types";
import { getCategoryInfo, getCommunityToolStatusInfo, getCreditLevel } from "@/types";
import { classNames } from "@/utils/format";
import { useCommunityStore } from "@/store/communityStore";

interface CommunityToolCardProps {
  tool: CommunityTool;
  index?: number;
}

export default function CommunityToolCard({ tool, index = 0 }: CommunityToolCardProps) {
  const catInfo = getCategoryInfo(tool.category);
  const statusInfo = getCommunityToolStatusInfo(tool.status);
  const delay = Math.min(index * 40, 400);
  const hydrate = useCommunityStore((s) => s.hydrate);
  const getCommunityUsers = useCommunityStore((s) => s.communityUsers);
  hydrate();

  const ownerUser = getCommunityUsers.find((u) => u.id === tool.ownerId);
  const ownerCreditLevel = ownerUser ? getCreditLevel(ownerUser.creditScore) : null;

  return (
    <Link
      to={`/community/tool/${tool.id}`}
      className="card card-hover group relative overflow-hidden animate-slide-up block min-h-[220px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3 p-4 pb-3 border-b border-wood-200/60 bg-gradient-to-b from-white/60 to-transparent">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inset ${catInfo.bgColor}`}
        >
          <span>{tool.emojiIcon || catInfo.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg text-wood-900 truncate leading-tight">
              {tool.name}
            </h3>
            <span className={`shrink-0 tag ${statusInfo.bgColor} ${statusInfo.color}`}>
              <span>{statusInfo.emoji}</span>
              {statusInfo.label}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className={`tag ${catInfo.bgColor} ${catInfo.color}`}>
              <span>{catInfo.emoji}</span>
              {catInfo.label}
            </span>
            {tool.deposit > 0 && (
              <span className="tag bg-wood-100 text-wood-700 flex items-center gap-1">
                <Wallet size={12} />
                押金 ¥{tool.deposit}
              </span>
            )}
            <span className="tag bg-status-good/10 text-status-good flex items-center gap-1">
              <Calendar size={12} />
              最长 {tool.maxBorrowDays} 天
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-3 space-y-2">
        <div className="flex items-start gap-2 text-sm text-wood-700">
          <User
            size={15}
            className="shrink-0 mt-0.5 text-safety-orange"
            strokeWidth={2.2}
          />
          <span className="font-medium">
            {tool.ownerAvatar} {tool.ownerName}
          </span>
          <span className="text-wood-400">·</span>
          <span className="text-wood-600 text-xs flex items-center gap-1">
            <MapPin size={12} />
            {tool.building}{tool.unit}
          </span>
          {ownerCreditLevel && (
            <span className={classNames("text-xs font-medium", ownerCreditLevel.color)}>
              {ownerCreditLevel.emoji} {ownerCreditLevel.label}信誉
            </span>
          )}
        </div>

        {tool.description && (
          <p className="text-xs text-wood-500 line-clamp-2 leading-relaxed pl-6">
            {tool.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-wood-400 font-medium">
            查看详情并申请借用 →
          </span>
          <span
            className={classNames(
              "shrink-0 w-2.5 h-2.5 rounded-full shadow-sm",
              tool.status === "available" ? "bg-status-good" : tool.status === "reserved" ? "bg-status-warning animate-pulse-subtle" : "bg-borrow animate-pulse-subtle"
            )}
          />
        </div>
      </div>

      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-safety-orange/8 via-transparent to-transparent pointer-events-none" />
    </Link>
  );
}
