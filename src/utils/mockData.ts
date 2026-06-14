import type {
  NewToolInput,
  Tool,
  NewConsumableInput,
  Consumable,
  NewMaintenanceTaskInput,
  MaintenanceTask,
  TaskPriority,
  TaskStatus,
  TaskToolItem,
  TaskConsumableItem,
} from "@/types";
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
      borrowRecords: [],
    };
  });
}

export const INITIAL_CONSUMABLES_INPUT: NewConsumableInput[] = [
  {
    name: "电钻钻头",
    category: "drill_bit",
    model: "麻花钻 6mm (HSS-G)",
    currentStock: 3,
    minStockThreshold: 5,
    unit: "piece",
    location: "储藏室工具架-中层抽屉",
    purchaseDate: daysAgo(120),
    unitPrice: 8.5,
    notes: "适用于木材、金属钻孔，共10支装，已用7支",
    emojiIcon: "🔩",
  },
  {
    name: "5号电池",
    category: "battery",
    model: "AA 碱性电池 1.5V",
    currentStock: 3,
    minStockThreshold: 4,
    unit: "battery",
    location: "玄关鞋柜上层-蓝色收纳盒",
    purchaseDate: daysAgo(60),
    unitPrice: 3.5,
    notes: "用于电动螺丝刀、遥控器等，剩余少于4节时提醒补货",
    emojiIcon: "🔋",
  },
  {
    name: "电工胶带",
    category: "tape",
    model: "PVC绝缘胶带 19mm×20m",
    currentStock: 8,
    minStockThreshold: 3,
    unit: "meter",
    location: "玄关鞋柜上层-蓝色收纳盒",
    purchaseDate: daysAgo(90),
    unitPrice: 0.15,
    notes: "黑/红/蓝三色共3卷，按剩余长度计算",
    emojiIcon: "🩹",
  },
  {
    name: "7号电池",
    category: "battery",
    model: "AAA 碱性电池 1.5V",
    currentStock: 6,
    minStockThreshold: 4,
    unit: "battery",
    location: "玄关鞋柜上层-蓝色收纳盒",
    purchaseDate: daysAgo(45),
    unitPrice: 3,
    notes: "用于体重秤、电视遥控器等",
    emojiIcon: "🔌",
  },
  {
    name: "十字螺丝",
    category: "screw",
    model: "M4×25mm 不锈钢",
    currentStock: 28,
    minStockThreshold: 20,
    unit: "piece",
    location: "书房书桌抽屉-零件盒A格",
    purchaseDate: daysAgo(180),
    unitPrice: 0.2,
    notes: "家具安装常用规格",
    emojiIcon: "⚙️",
  },
  {
    name: "双面泡沫胶",
    category: "tape",
    model: "厚款 24mm×5m",
    currentStock: 1.5,
    minStockThreshold: 2,
    unit: "meter",
    location: "厨房杂物柜-第三层",
    purchaseDate: daysAgo(30),
    unitPrice: 2.5,
    notes: "粘贴挂钩、相框用，按剩余长度计算",
    emojiIcon: "📦",
  },
  {
    name: "砂纸",
    category: "abrasive",
    model: "120目/240目/400目 混合装",
    currentStock: 5,
    minStockThreshold: 3,
    unit: "piece",
    location: "储藏室工具架-下层",
    purchaseDate: daysAgo(150),
    unitPrice: 1.2,
    notes: "木工打磨、除锈用",
    emojiIcon: "✨",
  },
  {
    name: "502胶水",
    category: "glue",
    model: "瞬间强力胶 3g×5支装",
    currentStock: 1,
    minStockThreshold: 2,
    unit: "piece",
    location: "书房书桌抽屉-零件盒B格",
    purchaseDate: daysAgo(100),
    unitPrice: 4,
    notes: "陶瓷、塑料、金属修补用，剩余1支",
    emojiIcon: "🧴",
  },
];

export function createInitialConsumables(): Consumable[] {
  return INITIAL_CONSUMABLES_INPUT.map((input, index) => {
    const created = new Date(now);
    created.setDate(created.getDate() - (200 - index * 20));
    return {
      ...input,
      id: generateId(),
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
      usageRecords: [],
    };
  });
}

const INITIAL_TASKS_INPUT: (NewMaintenanceTaskInput & {
  status?: TaskStatus;
  resolvedAt?: string;
  timeSpentMinutes?: number;
  resolutionNotes?: string;
})[] = [
  {
    title: "客厅吸顶灯更换灯泡",
    description: "客厅主灯有两个灯泡不亮了，需要拆下灯罩更换新的LED灯泡。",
    priority: "medium",
    emojiIcon: "💡",
    tools: [
      { toolId: "mock_tool_ladder", toolName: "人字梯", emojiIcon: "🪜", quantity: 1 },
      { toolId: "mock_tool_screwdriver_set", toolName: "十字螺丝刀套装", emojiIcon: "🪛", quantity: 1 },
    ],
    consumables: [
      { consumableId: "mock_battery_5", consumableName: "5号电池", emojiIcon: "🔋", quantity: 2, unit: "battery" },
    ],
  },
  {
    title: "卫生间水龙头漏水维修",
    description: "洗手池冷热水龙头关闭后仍有水滴渗漏，需要拆开检查阀芯，可能需要更换密封圈或整个阀芯。",
    priority: "high",
    emojiIcon: "🚿",
    tools: [
      { toolId: "mock_tool_wrench", toolName: "活动扳手", emojiIcon: "🔧", quantity: 2 },
      { toolId: "mock_tool_screwdriver_set", toolName: "十字螺丝刀套装", emojiIcon: "🪛", quantity: 1 },
    ],
    consumables: [
      { consumableId: "mock_tape_electrical", consumableName: "电工胶带", emojiIcon: "🩹", quantity: 1, unit: "meter" },
    ],
    status: "in_progress",
  },
  {
    title: "书桌抽屉滑轨修复",
    description: "大抽屉拉出时卡顿，滑轨生锈，需拆下清理并涂润滑油，检查滑轮是否损坏。",
    priority: "low",
    emojiIcon: "🗄️",
    tools: [
      { toolId: "mock_tool_screwdriver_set", toolName: "十字螺丝刀套装", emojiIcon: "🪛", quantity: 1 },
    ],
    consumables: [
      { consumableId: "mock_screw_cross", consumableName: "十字螺丝", emojiIcon: "⚙️", quantity: 8, unit: "piece" },
      { consumableId: "mock_glue_502", consumableName: "502胶水", emojiIcon: "🧴", quantity: 1, unit: "piece" },
    ],
    status: "resolved",
    resolvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    timeSpentMinutes: 45,
    resolutionNotes: "拆下滑轨用砂纸打磨除锈，涂抹了少量润滑油。更换了2颗松动的螺丝，抽屉开关恢复顺畅。下次类似问题建议先检查螺丝松紧。",
  },
  {
    title: "阳台晾衣架钢丝绳更换",
    description: "升降晾衣架钢丝绳磨损严重，有毛刺，需要整根更换避免断裂。",
    priority: "medium",
    emojiIcon: "🧵",
    tools: [
      { toolId: "mock_tool_ladder", toolName: "人字梯", emojiIcon: "🪜", quantity: 1 },
      { toolId: "mock_tool_wrench", toolName: "活动扳手", emojiIcon: "🔧", quantity: 1 },
      { toolId: "mock_tool_hammer", toolName: "羊角锤", emojiIcon: "🔨", quantity: 1 },
    ],
    consumables: [
      { consumableId: "mock_tape_foam", consumableName: "双面泡沫胶", emojiIcon: "📦", quantity: 1, unit: "meter" },
    ],
  },
  {
    title: "厨房吊柜重新固定",
    description: "吊柜与墙面连接处松动，开门时晃动明显，需要重新加固膨胀螺丝。",
    priority: "high",
    emojiIcon: "🚪",
    tools: [
      { toolId: "mock_tool_drill", toolName: "充电式电钻", emojiIcon: "⚡", quantity: 1 },
      { toolId: "mock_tool_ladder", toolName: "人字梯", emojiIcon: "🪜", quantity: 1 },
    ],
    consumables: [
      { consumableId: "mock_screw_cross", consumableName: "十字螺丝", emojiIcon: "⚙️", quantity: 12, unit: "piece" },
      { consumableId: "mock_drill_bit", consumableName: "电钻钻头", emojiIcon: "🔩", quantity: 2, unit: "piece" },
    ],
    status: "resolved",
    resolvedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    timeSpentMinutes: 90,
    resolutionNotes: "拆下原有螺丝重新钻孔，使用加长膨胀螺丝固定，共加固4个吊点。建议使用8mm以上钻头配合膨胀管，承重更稳固。",
  },
];

export function createInitialTasks(): MaintenanceTask[] {
  return INITIAL_TASKS_INPUT.map((input, index) => {
    const created = new Date(now);
    created.setDate(created.getDate() - (30 - index * 4));
    const { status, resolvedAt, timeSpentMinutes, resolutionNotes, ...rest } = input;
    return {
      ...rest,
      id: generateId(),
      status: (status ?? "pending") as TaskStatus,
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
      resolvedAt,
      timeSpentMinutes,
      resolutionNotes,
    };
  });
}
