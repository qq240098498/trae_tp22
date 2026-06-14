import { Link } from "react-router-dom";
import { MapPin, AlertTriangle, PackageMinus } from "lucide-react";
import type { Consumable } from "@/types";
import { getConsumableCategoryInfo, getConsumableUnitInfo, isLowStock } from "@/types";
import { classNames } from "@/utils/format";

interface ConsumableCardProps {
  consumable: Consumable;
  index?: number;
}

export default function ConsumableCard({ consumable, index = 0 }: ConsumableCardProps) {
  const catInfo = getConsumableCategoryInfo(consumable.category);
  const unitInfo = getConsumableUnitInfo(consumable.unit);
  const lowStock = isLowStock(consumable);
  const delay = Math.min(index * 40, 400);

  const stockPercent = Math.min(
    100,
    consumable.minStockThreshold > 0
      ? (consumable.currentStock / (consumable.minStockThreshold * 2.5)) * 100
      : 50
  );

  const stockColor = lowStock
    ? "bg-status-alert"
    : stockPercent < 50
    ? "bg-status-warning"
    : "bg-status-good";

  const displayStock =
    Number.isInteger(consumable.currentStock)
      ? consumable.currentStock
      : consumable.currentStock.toFixed(1);

  return (
    <Link
      to={`/consumable/${consumable.id}`}
      className={classNames(
        "card card-hover group relative overflow-hidden animate-slide-up block min-h-[220px]",
        lowStock && "ring-2 ring-status-alert/30 hover:ring-status-alert/50"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3 p-4 pb-3 border-b border-wood-200/60 bg-gradient-to-b from-white/60 to-transparent">
        <div
          className={classNames(
            "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inset",
            lowStock ? "bg-status-alert/10" : catInfo.bgColor
          )}
        >
          <span>{consumable.emojiIcon || catInfo.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg text-wood-900 truncate leading-tight">
              {consumable.name}
            </h3>
            {lowStock && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-status-alert/15 text-status-alert text-xs font-bold animate-pulse-subtle">
                <AlertTriangle size={12} strokeWidth={2.5} />
                补货
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className={`tag ${catInfo.bgColor} ${catInfo.color}`}>
              <span>{catInfo.emoji}</span>
              {catInfo.label}
            </span>
            {consumable.model && (
              <span className="tag bg-wood-100 text-wood-600 text-xs">
                {consumable.model}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pt-3 space-y-3">
        <div
          className={classNames(
            "flex items-start gap-2 text-sm",
            consumable.location.length > 12 ? "text-wood-600" : "text-wood-700"
          )}
        >
          <MapPin
            size={15}
            className="shrink-0 mt-0.5 text-safety-orange"
            strokeWidth={2.2}
          />
          <span className="line-clamp-2 font-medium leading-snug">{consumable.location}</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span
                className={classNames(
                  "font-display text-2xl leading-none",
                  lowStock ? "text-status-alert" : "text-wood-900"
                )}
              >
                {displayStock}
              </span>
              <span className="text-wood-500 text-sm">{unitInfo.shortLabel}</span>
            </div>
            <div className="text-xs text-wood-400 flex items-center gap-1">
              <PackageMinus size={12} strokeWidth={2} />
              阈值 {consumable.minStockThreshold}
              {unitInfo.shortLabel}
            </div>
          </div>
          <div className="h-2 bg-wood-100 rounded-full overflow-hidden shadow-inset">
            <div
              className={classNames(
                "h-full rounded-full transition-all duration-500",
                stockColor
              )}
              style={{ width: `${Math.max(5, stockPercent)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-wood-400 font-medium">
            {lowStock ? (
              <span className="text-status-alert font-bold flex items-center gap-1">
                <AlertTriangle size={11} strokeWidth={2.5} />
                该补货了！
              </span>
            ) : (
              "查看详情 →"
            )}
          </span>
          <span
            className={classNames(
              "shrink-0 w-2.5 h-2.5 rounded-full shadow-sm",
              lowStock
                ? "bg-status-alert animate-pulse-subtle"
                : stockPercent < 50
                ? "bg-status-warning"
                : "bg-status-good"
            )}
            aria-label={lowStock ? "库存不足" : stockPercent < 50 ? "库存偏低" : "库存充足"}
          />
        </div>
      </div>

      {lowStock && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-status-alert/10 via-transparent to-transparent pointer-events-none" />
      )}
    </Link>
  );
}
