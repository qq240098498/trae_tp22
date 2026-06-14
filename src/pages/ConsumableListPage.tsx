import { useMemo, useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import ConsumableSearch from "@/components/consumable/ConsumableSearch";
import ConsumableGrid from "@/components/consumable/ConsumableGrid";
import { useConsumableStore } from "@/store/consumableStore";
import {
  PackagePlus,
  AlertTriangle,
  ChevronRight,
  Package,
  TrendingDown,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getConsumableUnitInfo, isLowStock } from "@/types";

export default function ConsumableListPage() {
  const hydrate = useConsumableStore((s) => s.hydrate);
  const searchConsumables = useConsumableStore((s) => s.searchConsumables);
  const getLowStockConsumables = useConsumableStore((s) => s.getLowStockConsumables);
  const consumables = useConsumableStore((s) => s.consumables);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);

  hydrate();

  const filteredConsumables = useMemo(
    () => searchConsumables(query, category, onlyLowStock),
    [query, category, onlyLowStock, searchConsumables]
  );

  const lowStockConsumables = useMemo(
    () => getLowStockConsumables(),
    [getLowStockConsumables]
  );

  const stats = useMemo(() => {
    const total = consumables.length;
    const lowStock = consumables.filter((c) => isLowStock(c)).length;
    const uniqueLocations = new Set(
      consumables.map((c) => c.location.split("-")[0].trim())
    ).size;
    const thisMonth = consumables.filter((c) => {
      const d = new Date(c.createdAt);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const totalValue = consumables.reduce((sum, c) => {
      if (c.unitPrice) return sum + c.currentStock * c.unitPrice;
      return sum;
    }, 0);

    return { total, lowStock, uniqueLocations, thisMonth, totalValue };
  }, [consumables]);

  const statItems = [
    {
      label: "耗材种类",
      value: stats.total,
      unit: "种",
      icon: Package,
      color: "from-safety-orange/20 to-safety-orange/5 text-safety-orange",
      ring: "ring-safety-orange/20",
    },
    {
      label: "库存不足",
      value: stats.lowStock,
      unit: "种",
      icon: TrendingDown,
      color:
        stats.lowStock > 0
          ? "from-status-alert/20 to-status-alert/5 text-status-alert"
          : "from-status-good/20 to-status-good/5 text-status-good",
      ring: stats.lowStock > 0 ? "ring-status-alert/20" : "ring-status-good/20",
    },
    {
      label: "存放区域",
      value: stats.uniqueLocations,
      unit: "处",
      icon: MapPin,
      color: "from-wood-600/20 to-wood-500/5 text-wood-700",
      ring: "ring-wood-400/20",
    },
    {
      label: "库存总值",
      value: stats.totalValue >= 1000 ? (stats.totalValue / 1000).toFixed(1) + "k" : stats.totalValue.toFixed(0),
      unit: "元",
      icon: Sparkles,
      color: "from-status-warning/20 to-status-warning/5 text-status-warning",
      ring: "ring-status-warning/20",
    },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="container max-w-6xl py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-10">
        {/* 低库存补货提醒 */}
        {lowStockConsumables.length > 0 && showLowStockAlert && (
          <section className="animate-slide-up">
            <div className="card bg-status-alert/8 border-status-alert/30 border-2 p-4 sm:p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-status-alert/10 via-transparent to-transparent pointer-events-none" />
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-status-alert/15 flex items-center justify-center animate-pulse-subtle">
                  <AlertTriangle
                    size={20}
                    className="text-status-alert"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg sm:text-xl text-wood-900 mb-1">
                    有 {lowStockConsumables.length} 种耗材需要补货
                  </h3>
                  <p className="text-sm text-wood-600 mb-3">
                    库存已低于最低阈值，请及时采购补充
                  </p>
                  <div className="space-y-2">
                    {lowStockConsumables.slice(0, 3).map((c) => {
                      const unitInfo = getConsumableUnitInfo(c.unit);
                      const displayStock = Number.isInteger(c.currentStock)
                        ? c.currentStock
                        : c.currentStock.toFixed(1);
                      return (
                        <Link
                          key={c.id}
                          to={`/consumable/${c.id}`}
                          className="flex items-center justify-between p-2.5 bg-white/60 rounded-lg hover:bg-white transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl">{c.emojiIcon}</span>
                            <div className="min-w-0">
                              <p className="font-medium text-wood-800 text-sm truncate">
                                {c.name}
                              </p>
                              <p className="text-xs text-status-alert font-bold">
                                剩余 {displayStock}
                                {unitInfo.shortLabel} / 阈值 {c.minStockThreshold}
                                {unitInfo.shortLabel}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={16}
                            className="shrink-0 text-wood-400 group-hover:text-status-alert transition-colors"
                          />
                        </Link>
                      );
                    })}
                    {lowStockConsumables.length > 3 && (
                      <p className="text-xs text-wood-400 text-center pt-1">
                        还有 {lowStockConsumables.length - 3} 种需要补货...
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLowStockAlert(false)}
                  className="shrink-0 text-wood-400 hover:text-wood-600 transition-colors p-1"
                  aria-label="关闭提醒"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="animate-fade-in">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-wood-900 leading-tight">
                配件耗材清单
              </h2>
              <p className="text-sm text-wood-500 mt-1">
                共{" "}
                <span className="font-bold text-safety-orange">
                  {filteredConsumables.length}
                </span>{" "}
                种耗材
                {query.trim() && (
                  <>
                    {" "}· 搜索"
                    <span className="font-medium text-wood-700">{query.trim()}</span>"
                  </>
                )}
                {onlyLowStock && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-alert/15 text-status-alert text-xs font-medium">
                    <AlertTriangle size={12} />
                    仅看库存不足
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {statItems.map(({ label, value, unit, icon: Icon, color, ring }) => (
              <div
                key={label}
                className={`card screw-corner p-4 ring-1 ${ring} animate-fade-in`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-wood-500 mb-1">{label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-2xl sm:text-3xl text-wood-900 leading-none">
                        {value}
                      </span>
                      <span className="text-xs text-wood-500 font-medium">{unit}</span>
                    </div>
                  </div>
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-inset`}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <ConsumableSearch
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          onlyLowStock={onlyLowStock}
          onOnlyLowStockChange={setOnlyLowStock}
        />

        <section>
          <ConsumableGrid
            consumables={filteredConsumables}
            searchQuery={query}
          />
        </section>
      </main>

      {/* 移动端悬浮新增按钮 */}
      <Link
        to="/consumable/new"
        className="sm:hidden fixed bottom-5 right-5 z-30 w-16 h-16 rounded-full bg-safety-gradient text-white shadow-glow flex items-center justify-center active:scale-95 transition-transform"
        aria-label="新增耗材"
      >
        <PackagePlus size={28} strokeWidth={2.4} />
      </Link>
    </div>
  );
}
