import ConsumableCard from "./ConsumableCard";
import type { Consumable } from "@/types";
import { PackageSearch, PackagePlus } from "lucide-react";
import { Link } from "react-router-dom";

interface ConsumableGridProps {
  consumables: Consumable[];
  searchQuery: string;
}

export default function ConsumableGrid({ consumables, searchQuery }: ConsumableGridProps) {
  if (consumables.length === 0) {
    const hasQuery = searchQuery.trim().length > 0;
    return (
      <div className="card p-8 sm:p-12 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-wood-100 flex items-center justify-center mb-5 shadow-inset">
          {hasQuery ? (
            <PackageSearch size={38} className="text-wood-400" strokeWidth={1.7} />
          ) : (
            <PackagePlus size={38} className="text-wood-400" strokeWidth={1.7} />
          )}
        </div>
        <h3 className="font-display text-xl text-wood-800 mb-2">
          {hasQuery ? "没有找到匹配的耗材" : "耗材清单还是空的"}
        </h3>
        <p className="text-wood-500 text-sm mb-6 max-w-sm mx-auto">
          {hasQuery
            ? `没有找到包含"${searchQuery}"的耗材，试试其他关键词？`
            : "点击下方按钮添加第一件耗材，开始管理你的配件耗材吧～"}
        </p>
        {!hasQuery && (
          <Link to="/consumable/new" className="btn-primary inline-flex min-w-[160px]">
            <PackagePlus size={18} strokeWidth={2.2} />
            添加第一件耗材
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {consumables.map((consumable, idx) => (
        <ConsumableCard key={consumable.id} consumable={consumable} index={idx} />
      ))}
    </div>
  );
}
