import { Search, Filter, X } from "lucide-react";
import { CATEGORY_LIST } from "@/types";

interface ToolSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  category: string;
  onCategoryChange: (c: string) => void;
}

const ALL_CATEGORY = { key: "all" as const, label: "全部工具", emoji: "🧰" };

export default function ToolSearch({
  query,
  onQueryChange,
  category,
  onCategoryChange,
}: ToolSearchProps) {
  const allList = [ALL_CATEGORY, ...CATEGORY_LIST];

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
          placeholder="搜索工具名称、存放位置、备注..."
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
      <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
