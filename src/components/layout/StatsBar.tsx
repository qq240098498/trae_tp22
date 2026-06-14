import { useMemo } from "react";
import { useToolStore } from "@/store/toolStore";
import { Package, Zap, MapPin, Sparkles } from "lucide-react";

export default function StatsBar() {
  const tools = useToolStore((s) => s.tools);

  const stats = useMemo(() => {
    const total = tools.length;
    const needCharge = tools.filter(
      (t) => t.needsMaintenance && t.maintenanceType !== "none"
    ).length;
    const uniqueLocations = new Set(tools.map((t) => t.location.split("-")[0].trim())).size;
    const thisMonth = tools.filter((t) => {
      const d = new Date(t.createdAt);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { total, needCharge, uniqueLocations, thisMonth };
  }, [tools]);

  const items = [
    {
      label: "工具总数",
      value: stats.total,
      unit: "件",
      icon: Package,
      color: "from-safety-orange/20 to-safety-orange/5 text-safety-orange",
      ring: "ring-safety-orange/20",
    },
    {
      label: "需维护",
      value: stats.needCharge,
      unit: "件",
      icon: Zap,
      color:
        stats.needCharge > 0
          ? "from-status-alert/20 to-status-alert/5 text-status-alert"
          : "from-status-good/20 to-status-good/5 text-status-good",
      ring: stats.needCharge > 0 ? "ring-status-alert/20" : "ring-status-good/20",
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
      label: "本月新增",
      value: stats.thisMonth,
      unit: "件",
      icon: Sparkles,
      color: "from-status-warning/20 to-status-warning/5 text-status-warning",
      ring: "ring-status-warning/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map(({ label, value, unit, icon: Icon, color, ring }) => (
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
  );
}
