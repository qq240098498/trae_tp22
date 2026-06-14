import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import StatsBar from "@/components/layout/StatsBar";
import ToolSearch from "@/components/tool/ToolSearch";
import ToolGrid from "@/components/tool/ToolGrid";
import { useToolStore } from "@/store/toolStore";
import { PackagePlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function ToolListPage() {
  const hydrate = useToolStore((s) => s.hydrate);
  const searchTools = useToolStore((s) => s.searchTools);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  hydrate();

  const filteredTools = useMemo(
    () => searchTools(query, category),
    [query, category, searchTools]
  );

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="container max-w-6xl py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-10">
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
