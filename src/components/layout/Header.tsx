import { Link, useLocation } from "react-router-dom";
import { PackagePlus, ArrowLeft, Wrench, Package } from "lucide-react";
import { classNames } from "@/utils/format";
import { useConsumableStore } from "@/store/consumableStore";


interface HeaderProps {
  title?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export default function Header({ title, showBack, actions }: HeaderProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const isToolRoute =
    pathname === "/" || pathname.startsWith("/tool");
  const isConsumableRoute =
    pathname.startsWith("/consumable") || pathname === "/consumables";
  const isConsumableList = pathname === "/consumables";
  const isHome = (pathname === "/" || pathname === "/consumables") && !showBack;

  const displayTitle = title ?? "家庭工具箱";

  const lowStockCount = useConsumableStore((s) => s.getLowStockConsumables().length);
  const hydrate = useConsumableStore((s) => s.hydrate);
  hydrate();

  const backTo = isConsumableRoute ? "/consumables" : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-wood-300/50 backdrop-blur-md bg-wood-900/92 text-wood-50 shadow-lg">
      <div className="bg-wood-dark bg-[length:6px_100%]">
        <div className="container max-w-6xl flex flex-col">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {showBack ? (
                <Link
                  to={backTo}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors -ml-3"
                  aria-label="返回列表"
                >
                  <ArrowLeft size={20} strokeWidth={2.2} />
                  <span className="text-sm font-medium hidden sm:inline">返回</span>
                </Link>
              ) : (
                <Link to="/" className="flex items-center gap-2.5 group">
                  <div className="w-10 h-10 rounded-xl bg-safety-gradient flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow">
                    <Wrench size={22} className="text-white drop-shadow-sm" strokeWidth={2.2} />
                  </div>
                  <div className="leading-tight">
                    <h1 className="font-display text-xl tracking-wide text-shadow-sm">
                      {displayTitle}
                    </h1>
                    <p className="text-[11px] text-wood-300/80 font-medium hidden sm:block">
                      让每一件工具都随手可得
                    </p>
                  </div>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              {actions}
              {pathname === "/" && (
                <Link to="/tool/new" className="btn-primary !py-2.5 !px-4 sm:!px-5 min-h-[44px]">
                  <PackagePlus size={18} strokeWidth={2.2} />
                  <span className="hidden sm:inline">新增工具</span>
                  <span className="sm:hidden">新增</span>
                </Link>
              )}
              {isConsumableList && (
                <Link to="/consumable/new" className="btn-primary !py-2.5 !px-4 sm:!px-5 min-h-[44px]">
                  <PackagePlus size={18} strokeWidth={2.2} />
                  <span className="hidden sm:inline">新增耗材</span>
                  <span className="sm:hidden">新增</span>
                </Link>
              )}
            </div>
          </div>

          {/* 模块导航 Tab - 仅在列表页（非详情/非编辑页）显示 */}
          {(pathname === "/" || pathname === "/consumables") && !showBack && (
            <nav className="flex gap-1 pb-3 -mt-1">
              <Link
                to="/"
                className={classNames(
                  "relative flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition-all",
                  isToolRoute
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-wood-300/70 hover:text-white hover:bg-white/5"
                )}
              >
                <Wrench size={16} strokeWidth={2.2} />
                工具箱
              </Link>
              <Link
                to="/consumables"
                className={classNames(
                  "relative flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition-all",
                  isConsumableRoute
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-wood-300/70 hover:text-white hover:bg-white/5"
                )}
              >
                <Package size={16} strokeWidth={2.2} />
                配件耗材
                {lowStockCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-status-alert text-white text-[11px] font-bold animate-pulse-subtle">
                    {lowStockCount}
                  </span>
                )}
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
