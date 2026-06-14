import Header from "@/components/layout/Header";
import ConsumableForm from "@/components/consumable/ConsumableForm";
import { useConsumableStore } from "@/store/consumableStore";
import { useParams } from "react-router-dom";
import { Pencil } from "lucide-react";

export default function ConsumableFormPage() {
  const { id } = useParams<{ id?: string }>();
  const hydrate = useConsumableStore((s) => s.hydrate);
  const getConsumableById = useConsumableStore((s) => s.getConsumableById);

  hydrate();

  const isEdit = Boolean(id);
  const existingConsumable = id ? getConsumableById(id) : undefined;

  if (isEdit && !existingConsumable) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="耗材不存在" showBack />
        <main className="container max-w-3xl py-10 text-center">
          <div className="card p-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-display text-2xl text-wood-800 mb-2">找不到此耗材</h2>
            <p className="text-wood-500 mb-6">该耗材可能已被删除，或链接无效</p>
          </div>
        </main>
      </div>
    );
  }

  const title = isEdit ? "编辑耗材" : "新增耗材";

  return (
    <div className="min-h-screen bg-paper">
      <Header
        title={title}
        showBack
        actions={
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-wood-200 text-sm">
            <Pencil size={16} strokeWidth={2.2} />
            {isEdit ? "修改耗材资料" : "填写耗材信息"}
          </div>
        }
      />
      <main className="container max-w-3xl py-6 sm:py-8 pb-32">
        <div className="mb-5 sm:mb-6">
          <p className="text-sm text-wood-500">
            <span className="font-display text-lg text-wood-800 mr-2">
              {isEdit ? "📝 修改耗材信息" : "📦 添加新耗材"}
            </span>
            标有 <span className="text-status-alert font-bold">*</span> 的字段为必填
          </p>
        </div>
        <ConsumableForm
          mode={isEdit ? "edit" : "new"}
          existingConsumable={existingConsumable}
        />
      </main>
    </div>
  );
}
