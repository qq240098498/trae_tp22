export type ToolCategory = "manual" | "electric" | "consumable" | "other";
export type MaintenanceType = "charge" | "battery" | "none";

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  location: string;
  quantity: number;
  purchaseDate: string;
  needsMaintenance: boolean;
  maintenanceType: MaintenanceType;
  notes: string;
  images: string[];
  emojiIcon: string;
  createdAt: string;
  updatedAt: string;
}

export type NewToolInput = Omit<Tool, "id" | "createdAt" | "updatedAt">;

export interface CategoryInfo {
  key: ToolCategory;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const CATEGORY_LIST: CategoryInfo[] = [
  { key: "manual", label: "手动工具", emoji: "🔧", color: "text-steel-700", bgColor: "bg-steel-200" },
  { key: "electric", label: "电动工具", emoji: "⚡", color: "text-safety-orangeDark", bgColor: "bg-safety-orange/15" },
  { key: "consumable", label: "耗材配件", emoji: "📦", color: "text-wood-700", bgColor: "bg-wood-200" },
  { key: "other", label: "其他物品", emoji: "🏷️", color: "text-steel-600", bgColor: "bg-steel-100" },
];

export const EMOJI_OPTIONS = [
  "🔧", "🪛", "🔨", "⚡", "🪚", "✂️", "📏", "📐",
  "🪜", "🧹", "🧰", "🔦", "🔑", "🩹", "📦", "🎨",
  "🪓", "⛏️", "🔩", "🧱", "🪣", "🪠", "🚿", "💡",
  "🔌", "🔋", "🧲", "🪝", "🧵", "🖇️", "🏷️", "✨",
];

export function getCategoryInfo(category: ToolCategory): CategoryInfo {
  return CATEGORY_LIST.find((c) => c.key === category) ?? CATEGORY_LIST[3];
}
