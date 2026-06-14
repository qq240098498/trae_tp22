export type ToolCategory = "manual" | "electric" | "consumable" | "other";
export type MaintenanceType = "charge" | "battery" | "none";
export type BorrowStatus = "borrowed" | "returned" | "overdue";
export type ConsumableUnit = "piece" | "meter" | "roll" | "box" | "battery" | "packet" | "kg" | "liter" | "other";
export type ConsumableCategory = "drill_bit" | "tape" | "battery" | "screw" | "glue" | "abrasive" | "paint" | "cleaning" | "other";

export type CommunityToolStatus = "available" | "lent" | "reserved";
export type BorrowRequestStatus = "pending" | "approved" | "rejected" | "completed" | "cancelled";
export type CreditChangeType = "lend" | "return_on_time" | "return_overdue" | "borrow" | "damaged" | "violation";

export interface CommunityUser {
  id: string;
  name: string;
  avatar: string;
  building: string;
  unit: string;
  roomNumber: string;
  creditScore: number;
  lendCount: number;
  borrowCount: number;
  joinedAt: string;
}

export interface CommunityTool {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  building: string;
  unit: string;
  name: string;
  category: ToolCategory;
  description: string;
  emojiIcon: string;
  images: string[];
  status: CommunityToolStatus;
  deposit: number;
  maxBorrowDays: number;
  usageNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRequest {
  id: string;
  toolId: string;
  toolName: string;
  toolEmoji: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterBuilding: string;
  requesterUnit: string;
  ownerId: string;
  ownerName: string;
  status: BorrowRequestStatus;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  purpose: string;
  agreementSigned: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface BorrowAgreement {
  id: string;
  requestId: string;
  toolName: string;
  lenderName: string;
  borrowerName: string;
  borrowDate: string;
  expectedReturnDate: string;
  deposit: number;
  terms: string[];
  signedByLender: boolean;
  signedByBorrower: boolean;
  signedAt?: string;
  createdAt: string;
}

export interface CreditRecord {
  id: string;
  userId: string;
  type: CreditChangeType;
  change: number;
  description: string;
  relatedToolId?: string;
  relatedToolName?: string;
  createdAt: string;
}

export type NewCommunityToolInput = Omit<CommunityTool, "id" | "status" | "createdAt" | "updatedAt" | "ownerId" | "ownerName" | "ownerAvatar" | "building" | "unit">;
export type NewBorrowRequestInput = Omit<BorrowRequest, "id" | "status" | "createdAt" | "updatedAt" | "requesterId" | "requesterName" | "requesterAvatar" | "requesterBuilding" | "requesterUnit" | "ownerId" | "ownerName" | "agreementSigned" | "completedAt" | "toolId" | "toolName" | "toolEmoji">;

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
  availableForCommunity: boolean;
  communityDescription?: string;
  communityDeposit?: number;
  communityMaxDays?: number;
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

export interface CommunityToolStatusInfo {
  key: CommunityToolStatus;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export interface BorrowRequestStatusInfo {
  key: BorrowRequestStatus;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const COMMUNITY_TOOL_STATUS_LIST: CommunityToolStatusInfo[] = [
  { key: "available", label: "可借用", emoji: "✅", color: "text-status-good", bgColor: "bg-status-good/15" },
  { key: "reserved", label: "已预约", emoji: "⏳", color: "text-status-warning", bgColor: "bg-status-warning/15" },
  { key: "lent", label: "借出中", emoji: "📤", color: "text-borrow", bgColor: "bg-borrow/15" },
];

export const BORROW_REQUEST_STATUS_LIST: BorrowRequestStatusInfo[] = [
  { key: "pending", label: "等待审核", emoji: "⏳", color: "text-status-warning", bgColor: "bg-status-warning/15" },
  { key: "approved", label: "已同意", emoji: "✅", color: "text-status-good", bgColor: "bg-status-good/15" },
  { key: "rejected", label: "已拒绝", emoji: "❌", color: "text-status-alert", bgColor: "bg-status-alert/15" },
  { key: "completed", label: "已完成", emoji: "🎉", color: "text-steel-600", bgColor: "bg-steel-200" },
  { key: "cancelled", label: "已取消", emoji: "🚫", color: "text-wood-500", bgColor: "bg-wood-100" },
];

export function getCommunityToolStatusInfo(status: CommunityToolStatus): CommunityToolStatusInfo {
  return COMMUNITY_TOOL_STATUS_LIST.find((s) => s.key === status) ?? COMMUNITY_TOOL_STATUS_LIST[0];
}

export function getBorrowRequestStatusInfo(status: BorrowRequestStatus): BorrowRequestStatusInfo {
  return BORROW_REQUEST_STATUS_LIST.find((s) => s.key === status) ?? BORROW_REQUEST_STATUS_LIST[0];
}

export const DEFAULT_BORROW_AGREEMENT_TERMS: string[] = [
  "借用人应妥善保管借用工具，不得转借他人或用于违法用途",
  "借用人应按约定日期归还工具，如需延期请提前与出借人协商",
  "归还时工具应保持借出时的完好状态，如有损坏需照价赔偿",
  "借用期间工具如发生故障或损坏，借用人应及时通知出借人",
  "押金在工具完好归还时全额退还，如有损坏将从押金中扣除相应费用",
  "双方应本着邻里互助、友好协商的原则解决借用过程中的问题",
];

export function getCreditLevel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 950) return { label: "极佳", color: "text-status-good", emoji: "🌟" };
  if (score >= 900) return { label: "优秀", color: "text-status-good", emoji: "👏" };
  if (score >= 800) return { label: "良好", color: "text-safety-orange", emoji: "👍" };
  if (score >= 700) return { label: "一般", color: "text-status-warning", emoji: "😊" };
  if (score >= 600) return { label: "有待提升", color: "text-status-warning", emoji: "💪" };
  return { label: "信用较低", color: "text-status-alert", emoji: "⚠️" };
}
