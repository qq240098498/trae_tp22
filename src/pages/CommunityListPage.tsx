import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import CommunityToolCard from "@/components/community/CommunityToolCard";
import Empty from "@/components/Empty";
import { useCommunityStore } from "@/store/communityStore";
import { Search, Filter, X, PackagePlus, Users, Package, User } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORY_LIST } from "@/types";

const ALL_CATEGORY = { key: "all" as const, label: "全部工具", emoji: "🧰" };

export default function CommunityListPage() {
  const hydrate = useCommunityStore((s) => s.hydrate);
  const getCommunityTools = useCommunityStore((s) => s.getCommunityTools);
  const communityTools = useCommunityStore((s) => s.communityTools);
  const communityUsers = useCommunityStore((s) => s.communityUsers);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  hydrate();

  const filteredTools = useMemo(
    () => getCommunityTools(query, category),
    [query, category, getCommunityTools]
  );

  const availableToolsCount = useMemo(
    () => communityTools.filter((t) => t.status === "available").length,
    [communityTools]
  );

  const allList = [ALL_CATEGORY, ...CATEGORY_LIST];

  const headerActions = (
    <Link
      to="/community/my"
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 transition-colors text-sm font-medium"
    >
      <User size={16} strokeWidth={2.2} />
      <span>我的</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-paper">
      <Header title="邻里社区" showBack={false} actions={headerActions} />
      <main className="container max-w-6xl py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-10">
        <section className="animate-fade-in">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-wood-900 leading-tight">
                邻里共享工具
              </h2>
              <p className="text-sm text-wood-500 mt-1">
                共 <span className="font-bold text-safety-orange">{filteredTools.length}</span>{" "}
                件工具
                {query.trim() && (
                  <>
                    {" "}· 搜索"
                    <span className="font-medium text-wood-700">{query.trim()}</span>"
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="card screw-corner p-4 ring-1 ring-safety-orange/20 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-wood-500 mb-1">可借工具</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-2xl sm:text-3xl text-wood-900 leading-none">
                      {availableToolsCount}
                    </span>
                    <span className="text-xs text-wood-500 font-medium">件</span>
                  </div>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-safety-orange/20 to-safety-orange/5 text-safety-orange flex items-center justify-center shadow-inset">
                  <Package size={18} strokeWidth={2.2} />
                </div>
              </div>
            </div>

            <div className="card screw-corner p-4 ring-1 ring-status-good/20 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-wood-500 mb-1">社区用户</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-2xl sm:text-3xl text-wood-900 leading-none">
                      {communityUsers.length}
                    </span>
                    <span className="text-xs text-wood-500 font-medium">人</span>
                  </div>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-status-good/20 to-status-good/5 text-status-good flex items-center justify-center shadow-inset">
                  <Users size={18} strokeWidth={2.2} />
                </div>
              </div>
            </div>
          </div>
        </section>

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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索工具名称、描述..."
              className="input-field !pl-12 !pr-12 !py-3.5 text-base min-h-[52px]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
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
                  onClick={() => setCategory(c.key)}
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

        <section>
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {filteredTools.map((tool, index) => (
                <CommunityToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </section>
      </main>

      <Link
        to="/community/tool/new"
        className="fixed bottom-5 right-5 z-30 w-16 h-16 rounded-full bg-safety-gradient text-white shadow-glow flex items-center justify-center active:scale-95 transition-transform"
        aria-label="发布我的工具"
      >
        <PackagePlus size={28} strokeWidth={2.4} />
      </Link>
    </div>
  );
}
