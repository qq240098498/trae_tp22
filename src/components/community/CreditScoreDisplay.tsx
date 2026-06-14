import { Star, TrendingUp, Award } from "lucide-react";
import { getCreditLevel } from "@/types";
import { classNames } from "@/utils/format";

interface CreditScoreDisplayProps {
  score: number;
  lendCount?: number;
  borrowCount?: number;
  size?: "sm" | "md" | "lg";
}

export default function CreditScoreDisplay({
  score,
  lendCount,
  borrowCount,
  size = "md",
}: CreditScoreDisplayProps) {
  const level = getCreditLevel(score);
  const maxScore = 1000;
  const percentage = Math.min(100, (score / maxScore) * 100);

  if (size === "sm") {
    return (
      <div className="flex items-center gap-2">
        <Star size={14} className="text-safety-orange" fill="currentColor" />
        <span className={classNames("font-semibold", level.color)}>
          {score}
        </span>
        <span className="text-xs text-wood-500">{level.emoji} {level.label}</span>
      </div>
    );
  }

  if (size === "lg") {
    return (
      <div className="card p-6 bg-gradient-to-br from-safety-orange/10 via-wood-50 to-wood-50">
        <div className="flex items-center gap-6">
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-full bg-safety-gradient flex items-center justify-center shadow-lg shadow-safety-orange/20 relative">
              <div className="text-center">
                <div className="text-3xl font-display text-white leading-none">{score}</div>
                <div className="text-[10px] text-white/80 mt-1">信用分</div>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-safety-orange" />
              <span className={classNames("text-xl font-display", level.color)}>
                {level.emoji} {level.label}
              </span>
            </div>
            <div className="h-2 rounded-full bg-wood-200/60 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-safety-gradient transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-sm">
              {(lendCount !== undefined || borrowCount !== undefined) && (
                <div className="flex items-center gap-3">
                  {lendCount !== undefined && (
                    <div className="flex items-center gap-1.5 text-wood-600">
                      <TrendingUp size={14} className="text-status-good" />
                      <span>借出 <strong className="text-wood-800">{lendCount}</strong> 次</span>
                    </div>
                  )}
                  {borrowCount !== undefined && (
                    <div className="flex items-center gap-1.5 text-wood-600">
                      <Star size={14} className="text-borrow" />
                      <span>借入 <strong className="text-wood-800">{borrowCount}</strong> 次</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-wood-500 mt-2">
              按时归还可获得信用奖励，逾期将扣除信用分
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-wood-50 border border-wood-200/60">
      <div className="w-12 h-12 rounded-xl bg-safety-gradient flex items-center justify-center shadow-sm">
        <div className="text-center">
          <div className="text-lg font-display text-white leading-none">{score}</div>
        </div>
      </div>
      <div>
        <div className={classNames("font-semibold", level.color)}>
          {level.emoji} {level.label}
        </div>
        <div className="h-1.5 rounded-full bg-wood-200/60 overflow-hidden w-24 mt-1">
          <div
            className="h-full rounded-full bg-safety-gradient"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
