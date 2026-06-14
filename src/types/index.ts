export type ToolCategory = "manual" | "electric" | "consumable" | "other";
export type MaintenanceType = "charge" | "battery" | "none";
export type BorrowStatus = "borrowed" | "returned" | "overdue";
export type ConsumableUnit = "piece" | "meter" | "roll" | "box" | "battery" | "packet" | "kg" | "liter" | "other";
export type ConsumableCategory = "drill_bit" | "tape" | "battery" | "screw" | "glue" | "abrasive" | "paint" | "cleaning" | "other";

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
  borrowRecords: BorrowRecord[];
}

export interface BorrowRecord {
  id: string;
  borrowerName: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: BorrowStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type NewToolInput = Omit<Tool, "id" | "createdAt" | "updatedAt" | "borrowRecords">;
export type NewBorrowInput = Omit<BorrowRecord, "id" | "status" | "createdAt" | "updatedAt">;

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

export interface Consumable {
  id: string;
  name: string;
  category: ConsumableCategory;
  model: string;
  currentStock: number;
  minStockThreshold: number;
  unit: ConsumableUnit;
  location: string;
  purchaseDate: string;
  unitPrice?: number;
  notes: string;
  emojiIcon: string;
  createdAt: string;
  updatedAt: string;
  usageRecords: ConsumableUsageRecord[];
}

export interface ConsumableUsageRecord {
  id: string;
  amount: number;
  usageDate: string;
  notes?: string;
  createdAt: string;
}

export type NewConsumableInput = Omit<Consumable, "id" | "createdAt" | "updatedAt" | "usageRecords">;
export type NewConsumableUsageInput = Omit<ConsumableUsageRecord, "id" | "createdAt">;

export interface ConsumableCategoryInfo {
  key: ConsumableCategory;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export interface ConsumableUnitInfo {
  key: ConsumableUnit;
  label: string;
  shortLabel: string;
}

export const CONSUMABLE_CATEGORY_LIST: ConsumableCategoryInfo[] = [
  { key: "drill_bit", label: "钻头批头", emoji: "🔩", color: "text-steel-700", bgColor: "bg-steel-200" },
  { key: "tape", label: "胶带胶贴", emoji: "🩹", color: "text-wood-700", bgColor: "bg-wood-200" },
  { key: "battery", label: "电池电源", emoji: "🔋", color: "text-safety-orangeDark", bgColor: "bg-safety-orange/15" },
  { key: "screw", label: "螺丝螺母", emoji: "⚙️", color: "text-steel-600", bgColor: "bg-steel-100" },
  { key: "glue", label: "胶水粘合剂", emoji: "🧴", color: "text-wood-600", bgColor: "bg-wood-100" },
  { key: "abrasive", label: "砂纸磨具", emoji: "✨", color: "text-status-warning", bgColor: "bg-status-warning/15" },
  { key: "paint", label: "涂料油漆", emoji: "🎨", color: "text-wood-800", bgColor: "bg-wood-100" },
  { key: "cleaning", label: "清洁用品", emoji: "🧹", color: "text-status-good", bgColor: "bg-status-good/15" },
  { key: "other", label: "其他耗材", emoji: "📦", color: "text-wood-500", bgColor: "bg-wood-50" },
];

export const CONSUMABLE_UNIT_LIST: ConsumableUnitInfo[] = [
  { key: "piece", label: "个/件", shortLabel: "个" },
  { key: "meter", label: "米", shortLabel: "米" },
  { key: "roll", label: "卷", shortLabel: "卷" },
  { key: "box", label: "盒", shortLabel: "盒" },
  { key: "battery", label: "节(电池)", shortLabel: "节" },
  { key: "packet", label: "包/袋", shortLabel: "包" },
  { key: "kg", label: "千克", shortLabel: "kg" },
  { key: "liter", label: "升", shortLabel: "L" },
  { key: "other", label: "其他", shortLabel: "单位" },
];

export const CONSUMABLE_EMOJI_OPTIONS = [
  "🔩", "🩹", "🔋", "⚙️", "🧴", "✨", "🎨", "🧹",
  "📦", "🔌", "💡", "🧵", "🖇️", "📎", "✏️", "🖊️",
  "🧻", "🧽", "🧯", "🧰", "🔧", "🪛", "🔨", "⚡",
];

export function getConsumableCategoryInfo(category: ConsumableCategory): ConsumableCategoryInfo {
  return CONSUMABLE_CATEGORY_LIST.find((c) => c.key === category) ?? CONSUMABLE_CATEGORY_LIST[8];
}

export function getConsumableUnitInfo(unit: ConsumableUnit): ConsumableUnitInfo {
  return CONSUMABLE_UNIT_LIST.find((u) => u.key === unit) ?? CONSUMABLE_UNIT_LIST[8];
}

export function isLowStock(consumable: Consumable): boolean {
  return consumable.currentStock <= consumable.minStockThreshold;
}

export type TaskStatus = "pending" | "in_progress" | "resolved";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskToolItem {
  toolId: string;
  toolName: string;
  emojiIcon: string;
  quantity: number;
}

export interface TaskConsumableItem {
  consumableId: string;
  consumableName: string;
  emojiIcon: string;
  quantity: number;
  unit: ConsumableUnit;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeSpentMinutes?: number;
  resolutionNotes?: string;
  tools: TaskToolItem[];
  consumables: TaskConsumableItem[];
  emojiIcon: string;
}

export type NewMaintenanceTaskInput = Omit<
  MaintenanceTask,
  "id" | "createdAt" | "updatedAt" | "status"
>;

export type ResolveTaskInput = {
  timeSpentMinutes: number;
  resolutionNotes?: string;
};

export interface TaskStatusInfo {
  key: TaskStatus;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export interface TaskPriorityInfo {
  key: TaskPriority;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const TASK_STATUS_LIST: TaskStatusInfo[] = [
  { key: "pending", label: "待处理", emoji: "📋", color: "text-steel-600", bgColor: "bg-steel-200" },
  { key: "in_progress", label: "进行中", emoji: "🔧", color: "text-safety-orangeDark", bgColor: "bg-safety-orange/15" },
  { key: "resolved", label: "已解决", emoji: "✅", color: "text-status-good", bgColor: "bg-status-good/15" },
];

export const TASK_PRIORITY_LIST: TaskPriorityInfo[] = [
  { key: "low", label: "低", emoji: "🟢", color: "text-status-good", bgColor: "bg-status-good/15" },
  { key: "medium", label: "中", emoji: "🟡", color: "text-status-warning", bgColor: "bg-status-warning/15" },
  { key: "high", label: "高", emoji: "🔴", color: "text-status-alert", bgColor: "bg-status-alert/15" },
];

export const TASK_EMOJI_OPTIONS = [
  "🔧", "🔨", "⚡", "🪛", "🪚", "🔌", "💡", "🚿",
  "🪠", "🔩", "🧹", "🖌️", "🛠️", "🪓", "🔦", "🧰",
  "📋", "🏠", "🚪", "🪟", "💧", "🔥", "❄️", "🌡️",
];

export function getTaskStatusInfo(status: TaskStatus): TaskStatusInfo {
  return TASK_STATUS_LIST.find((s) => s.key === status) ?? TASK_STATUS_LIST[0];
}

export function getTaskPriorityInfo(priority: TaskPriority): TaskPriorityInfo {
  return TASK_PRIORITY_LIST.find((p) => p.key === priority) ?? TASK_PRIORITY_LIST[1];
}
