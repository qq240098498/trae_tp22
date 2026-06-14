import { Link } from "react-router-dom";
import { MapPin, Layers } from "lucide-react";
import type { Tool } from "@/types";
import { getCategoryInfo } from "@/types";
import { classNames } from "@/utils/format";

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export default function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const catInfo = getCategoryInfo(tool.category);
  const needAttention = tool.needsMaintenance && tool.maintenanceType !== "none";
  const firstImage = tool.images[0];
  const delay = Math.min(index * 40, 400);

  return (
    <Link
      to={`/tool/${tool.id}`}
      className="card card-hover group relative overflow-hidden animate-slide-up block min-h-[220px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3 p-4 pb-3 border-b border-wood-200/60 bg-gradient-to-b from-white/60 to-transparent">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inset ${catInfo.bgColor}`}
        >
          {firstImage ? (
            <img
              src={firstImage}
              alt=""
              className="w-full h-full object-cover rounded-xl"
              loading="lazy"
            />
          ) : (
            <span>{tool.emojiIcon || catInfo.emoji}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg text-wood-900 truncate leading-tight">
              {tool.name}
            </h3>
            {tool.quantity > 1 && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-wood-800 text-wood-50 text-xs font-bold shadow-sm">
                <Layers size={12} strokeWidth={2.5} />
                ×{tool.quantity}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className={`tag ${catInfo.bgColor} ${catInfo.color}`}>
              <span>{catInfo.emoji}</span>
              {catInfo.label}
            </span>
            {needAttention && (
              <span className="tag bg-status-alert/15 text-status-alert animate-pulse-subtle">
                {tool.maintenanceType === "charge" ? "需充电" : "换电池"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pt-3 space-y-2">
        <div
          className={classNames(
            "flex items-start gap-2 text-sm",
            tool.location.length > 12 ? "text-wood-600" : "text-wood-700"
          )}
        >
          <MapPin
            size={15}
            className="shrink-0 mt-0.5 text-safety-orange"
            strokeWidth={2.2}
          />
          <span className="line-clamp-2 font-medium leading-snug">{tool.location}</span>
        </div>

        {tool.notes && (
          <p className="text-xs text-wood-500 line-clamp-2 leading-relaxed pl-6">
            {tool.notes}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-wood-400 font-medium">
            查看详情 →
          </span>
          <span
            className={`shrink-0 w-2.5 h-2.5 rounded-full ${
              needAttention ? "bg-status-alert animate-pulse-subtle" : "bg-status-good"
            } shadow-sm`}
            aria-label={needAttention ? "需要关注" : "状态正常"}
          />
        </div>
      </div>

      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-safety-orange/8 via-transparent to-transparent pointer-events-none" />
    </Link>
  );
}
