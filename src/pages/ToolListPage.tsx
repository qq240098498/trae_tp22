import { useMemo, useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import StatsBar from "@/components/layout/StatsBar";
import ToolSearch from "@/components/tool/ToolSearch";
import ToolGrid from "@/components/tool/ToolGrid";
import { useToolStore } from "@/store/toolStore";
import { PackagePlus, Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { daysSince } from "@/utils/format";

export default function ToolListPage() {
  const hydrate = useToolStore((s) => s.hydrate);
  const searchTools = useToolStore((s) => s.searchTools);
  const getOverdueBorrows = useToolStore((s) => s.getOverdueBorrows);
  const updateBorrowStatuses = useToolStore((s) => s.updateBorrowStatuses);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [showOverdueAlert, setShowOverdueAlert] = useState(true);

  hydrate();

  useEffect(() => {
    updateBorrowStatuses();
  }, [updateBorrowStatuses]);

  const filteredTools = useMemo(
    () => searchTools(query, category),
    [query, category, searchTools]
  );

  const overdueBorrows = useMemo(() => getOverdueBorrows(), [getOverdueBorrows]);

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="container max-w-6xl py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-10">
        {/* 逾期催还提醒 */}
        {overdueBorrows.length > 0 && showOverdueAlert && (
          <section className="animate-slide-up">
            <div className="card bg-status-alert/8 border-status-alert/30 border-2 p-4 sm:p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-status-alert/10 via-transparent to-transparent pointer-events-none" />
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-status-alert/15 flex items-center justify-center animate-pulse-subtle">
                  <Clock size={20} className="text-status-alert" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg sm:text-xl text-wood-900 mb-1">
                    有 {overdueBorrows.length} 件工具逾期未还
                  </h3>
                  <p className="text-sm text-wood-600 mb-3">
                    请及时催还，避免工具丢失或遗忘
                  </p>
                  <div className="space-y-2">
                    {overdueBorrows.slice(0, 3).map(({ tool, record }) => {
                      const overdueDays = Math.max(0, daysSince(record.expectedReturnDate) || 0);
                      return (
                        <Link
                          key={record.id}
                          to={`/tool/${tool.id}`}
                          className="flex items-center justify-between p-2.5 bg-white/60 rounded-lg hover:bg-white transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl">{tool.emojiIcon}</span>
                            <div className="min-w-0">
                              <p className="font-medium text-wood-800 text-sm truncate">
                                {tool.name}
                              </p>
                              <p className="text-xs text-wood-500">
                                {record.borrowerName} · 逾期 {overdueDays} 天
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
                    {overdueBorrows.length > 3 && (
                      <p className="text-xs text-wood-400 text-center pt-1">
                        还有 {overdueBorrows.length - 3} 件逾期工具...
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOverdueAlert(false)}
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
                我的工具箱
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
          <StatsBar />
        </section>

        <ToolSearch
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
        />

        <section>
          <ToolGrid tools={filteredTools} searchQuery={query} />
        </section>
      </main>

      {/* 移动端悬浮新增按钮 */}
      <Link
        to="/tool/new"
        className="sm:hidden fixed bottom-5 right-5 z-30 w-16 h-16 rounded-full bg-safety-gradient text-white shadow-glow flex items-center justify-center active:scale-95 transition-transform"
        aria-label="新增工具"
      >
        <PackagePlus size={28} strokeWidth={2.4} />
      </Link>
    </div>
  );
}
