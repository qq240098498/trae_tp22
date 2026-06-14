import { Search, Filter, X, AlertTriangle } from "lucide-react";
import { CONSUMABLE_CATEGORY_LIST } from "@/types";

interface ConsumableSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  category: string;
  onCategoryChange: (c: string) => void;
  onlyLowStock: boolean;
  onOnlyLowStockChange: (v: boolean) => void;
}

const ALL_CATEGORY = { key: "all" as const, label: "全部耗材", emoji: "📦" };

export default function ConsumableSearch({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  onlyLowStock,
  onOnlyLowStockChange,
}: ConsumableSearchProps) {
  const allList = [ALL_CATEGORY, ...CONSUMABLE_CATEGORY_LIST];

  return (
    <div className="card p-4 sm:p-5 animate-fade-in">
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-400 pointer-events-none"
          strokeWidth={2.2}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="搜索耗材名称、型号、存放位置、备注..."
          className="input-field !pl-12 !pr-12 !py-3.5 text-base min-h-[52px]"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-wood-400 hover:text-wood-700 hover:bg-wood-100 transition-colors"
            aria-label="清除搜索"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-wood-500 text-xs font-semibold mb-2">
        <Filter size={14} strokeWidth={2.2} />
        分类筛选
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {allList.map((c) => {
          const active = category === c.key;
          const catInfo = "color" in c ? c : null;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onCategoryChange(c.key)}
              className={`
                inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-h-[40px]
                ${active
                  ? "bg-safety-gradient text-white shadow-md shadow-safety-orange/25 border border-safety-orangeDark/20 scale-[1.02]"
                  : catInfo
                  ? `${catInfo.bgColor} ${catInfo.color} border border-transparent hover:border-wood-300 hover:scale-[1.02]`
                  : "bg-wood-100 text-wood-700 border border-transparent hover:border-wood-300 hover:scale-[1.02]"
                }
              `}
            >
              <span className="text-base leading-none">{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      <label
        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
          onlyLowStock
            ? "border-status-alert bg-status-alert/8 shadow-sm"
            : "border-wood-200 bg-white hover:border-wood-300"
        }`}
      >
        <input
          type="checkbox"
          checked={onlyLowStock}
          onChange={(e) => onOnlyLowStockChange(e.target.checked)}
          className="mt-0.5 w-5 h-5 rounded border-wood-300 text-status-alert focus:ring-status-alert/40"
        />
        <div className="min-w-0">
          <p
            className={`font-semibold flex items-center gap-1.5 ${
              onlyLowStock ? "text-status-alert" : "text-wood-800"
            }`}
          >
            <AlertTriangle size={16} strokeWidth={2.2} />
            只看库存不足
          </p>
          <p className="text-xs text-wood-500 mt-0.5">
            筛选当前库存低于最低阈值、需要补货的耗材
          </p>
        </div>
      </label>
    </div>
  );
}
