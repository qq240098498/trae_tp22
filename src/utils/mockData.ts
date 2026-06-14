import type { NewToolInput, Tool } from "@/types";
import { generateId, formatDateInput } from "./format";

const now = new Date();
const daysAgo = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return formatDateInput(d);
};

export const INITIAL_TOOLS_INPUT: NewToolInput[] = [
  {
    name: "十字螺丝刀套装",
    category: "manual",
    location: "阳台收纳柜第二层-左侧工具箱",
    quantity: 6,
    purchaseDate: daysAgo(420),
    needsMaintenance: false,
    maintenanceType: "none",
    notes: "包含PH00-PH3共6支，磁性批头",
    images: [],
    emojiIcon: "🪛",
  },
  {
    name: "充电式电钻",
    category: "electric",
    location: "储藏室工具架-上层挂架",
    quantity: 1,
    purchaseDate: daysAgo(180),
    needsMaintenance: true,
    maintenanceType: "charge",
    notes: "12V锂电，两电一充。上次充电：3个月前",
    images: [],
    emojiIcon: "⚡",
  },
  {
    name: "活动扳手",
    category: "manual",
    location: "客厅电视柜抽屉",
    quantity: 2,
    purchaseDate: daysAgo(720),
    needsMaintenance: false,
    maintenanceType: "none",
    notes: "8寸+10寸各一把",
    images: [],
    emojiIcon: "🔧",
  },
  {
    name: "电工胶带",
    category: "consumable",
    location: "玄关鞋柜上层-蓝色收纳盒",
    quantity: 3,
    purchaseDate: daysAgo(90),
    needsMaintenance: false,
    maintenanceType: "none",
    notes: "黑/红/蓝三色各一卷",
    images: [],
    emojiIcon: "🩹",
  },
  {
    name: "人字梯",
    category: "other",
    location: "储物间门后",
    quantity: 1,
    purchaseDate: daysAgo(365),
    needsMaintenance: false,
    maintenanceType: "none",
    notes: "五步铝合金梯，承重150kg",
    images: [],
    emojiIcon: "🪜",
  },
  {
    name: "羊角锤",
    category: "manual",
    location: "阳台收纳柜第二层-中间",
    quantity: 1,
    purchaseDate: daysAgo(540),
    needsMaintenance: false,
    maintenanceType: "none",
    notes: "16oz玻璃纤维柄",
    images: [],
    emojiIcon: "🔨",
  },
  {
    name: "电动螺丝刀",
    category: "electric",
    location: "书房书桌抽屉",
    quantity: 1,
    purchaseDate: daysAgo(60),
    needsMaintenance: true,
    maintenanceType: "battery",
    notes: "使用4节5号电池，电量低需更换",
    images: [],
    emojiIcon: "🔋",
  },
  {
    name: "双面胶带/泡沫胶",
    category: "consumable",
    location: "厨房杂物柜-第三层",
    quantity: 4,
    purchaseDate: daysAgo(30),
    needsMaintenance: false,
    maintenanceType: "none",
    notes: "厚泡沫胶2卷+薄双面胶2卷",
    images: [],
    emojiIcon: "📦",
  },
];

export function createInitialTools(): Tool[] {
  return INITIAL_TOOLS_INPUT.map((input, index) => {
    const created = new Date(now);
    created.setDate(created.getDate() - (300 - index * 30));
    return {
      ...input,
      id: generateId(),
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    };
  });
}
