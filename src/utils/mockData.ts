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
  CommunityUser,
  CommunityTool,
  BorrowRequest,
  BorrowAgreement,
  CreditRecord,
  CommunityToolStatus,
  BorrowRequestStatus,
  CreditChangeType,
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
    availableForCommunity: false,
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
    availableForCommunity: true,
    communityDescription: "可借给邻居使用",
    communityDeposit: 50,
    communityMaxDays: 7,
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
    availableForCommunity: true,
    communityDescription: "可借给邻居使用",
    communityDeposit: 0,
    communityMaxDays: 14,
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
    availableForCommunity: false,
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
    availableForCommunity: true,
    communityDescription: "可借给邻居使用",
    communityDeposit: 0,
    communityMaxDays: 7,
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
    availableForCommunity: true,
    communityDescription: "可借给邻居使用",
    communityDeposit: 0,
    communityMaxDays: 14,
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
    availableForCommunity: false,
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
    availableForCommunity: false,
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

export interface CommunityInitialData {
  currentUser: CommunityUser;
  communityUsers: CommunityUser[];
  communityTools: CommunityTool[];
  borrowRequests: BorrowRequest[];
  borrowAgreements: BorrowAgreement[];
  creditRecords: CreditRecord[];
}

export function createInitialCommunityData(): CommunityInitialData {
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const currentUser: CommunityUser = {
    id: generateId(),
    name: "我",
    avatar: "👤",
    building: "3号楼",
    unit: "2单元",
    roomNumber: "501",
    creditScore: 920,
    lendCount: 5,
    borrowCount: 3,
    joinedAt: sixMonthsAgo.toISOString(),
  };

  const communityUsers: CommunityUser[] = [
    {
      id: generateId(),
      name: "王阿姨",
      avatar: "👩‍🦰",
      building: "3号楼",
      unit: "1单元",
      roomNumber: "302",
      creditScore: 950,
      lendCount: 12,
      borrowCount: 4,
      joinedAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      name: "张师傅",
      avatar: "👨‍🔧",
      building: "3号楼",
      unit: "2单元",
      roomNumber: "101",
      creditScore: 935,
      lendCount: 20,
      borrowCount: 2,
      joinedAt: new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      name: "李大哥",
      avatar: "👨",
      building: "3号楼",
      unit: "3单元",
      roomNumber: "603",
      creditScore: 880,
      lendCount: 8,
      borrowCount: 6,
      joinedAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      name: "赵姐",
      avatar: "👩",
      building: "3号楼",
      unit: "1单元",
      roomNumber: "405",
      creditScore: 910,
      lendCount: 3,
      borrowCount: 5,
      joinedAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const wangAyi = communityUsers[0];
  const zhangShifu = communityUsers[1];
  const liDage = communityUsers[2];
  const zhaoJie = communityUsers[3];

  const communityTools: CommunityTool[] = [
    {
      id: generateId(),
      ownerId: wangAyi.id,
      ownerName: wangAyi.name,
      ownerAvatar: wangAyi.avatar,
      building: wangAyi.building,
      unit: wangAyi.unit,
      name: "人字梯",
      category: "other",
      description: "四步铝合金梯子，适合换灯泡、取高处物品",
      emojiIcon: "🪜",
      images: [],
      status: "available" as CommunityToolStatus,
      deposit: 0,
      maxBorrowDays: 7,
      usageNotes: "请小心使用，避免刮伤地面",
      createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      ownerId: zhangShifu.id,
      ownerName: zhangShifu.name,
      ownerAvatar: zhangShifu.avatar,
      building: zhangShifu.building,
      unit: zhangShifu.unit,
      name: "充电式电钻",
      category: "electric",
      description: "18V锂电钻，含多种钻头，适合家装维修",
      emojiIcon: "⚡",
      images: [],
      status: "lent" as CommunityToolStatus,
      deposit: 100,
      maxBorrowDays: 3,
      usageNotes: "使用前请检查电量，归还时请清理钻头",
      createdAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      ownerId: liDage.id,
      ownerName: liDage.name,
      ownerAvatar: liDage.avatar,
      building: liDage.building,
      unit: liDage.unit,
      name: "羊角锤",
      category: "manual",
      description: "16oz钢柄羊角锤，敲击、拔钉两用",
      emojiIcon: "🔨",
      images: [],
      status: "available" as CommunityToolStatus,
      deposit: 0,
      maxBorrowDays: 14,
      usageNotes: "请勿敲击硬物表面以免损伤锤面",
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      ownerId: zhaoJie.id,
      ownerName: zhaoJie.name,
      ownerAvatar: zhaoJie.avatar,
      building: zhaoJie.building,
      unit: zhaoJie.unit,
      name: "活动扳手",
      category: "manual",
      description: "10寸活动扳手，水管、螺母维修必备",
      emojiIcon: "🔧",
      images: [],
      status: "available" as CommunityToolStatus,
      deposit: 0,
      maxBorrowDays: 10,
      usageNotes: "使用时请根据螺母大小调整开口",
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      ownerId: zhangShifu.id,
      ownerName: zhangShifu.name,
      ownerAvatar: zhangShifu.avatar,
      building: zhangShifu.building,
      unit: zhangShifu.unit,
      name: "十字螺丝刀套装",
      category: "manual",
      description: "精密螺丝刀6件套，电子产品维修适用",
      emojiIcon: "🪛",
      images: [],
      status: "available" as CommunityToolStatus,
      deposit: 50,
      maxBorrowDays: 7,
      usageNotes: "批头较精密，请勿用力过猛以免损坏",
      createdAt: new Date(now.getTime() - 250 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 250 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const borrowRequests: BorrowRequest[] = [
    {
      id: generateId(),
      toolId: communityTools[1].id,
      toolName: communityTools[1].name,
      toolEmoji: communityTools[1].emojiIcon,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAvatar: currentUser.avatar,
      requesterBuilding: currentUser.building,
      requesterUnit: currentUser.unit,
      ownerId: zhangShifu.id,
      ownerName: zhangShifu.name,
      status: "approved" as BorrowRequestStatus,
      borrowDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expectedReturnDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: "家里安装吊柜需要钻孔",
      agreementSigned: true,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      toolId: communityTools[0].id,
      toolName: communityTools[0].name,
      toolEmoji: communityTools[0].emojiIcon,
      requesterId: liDage.id,
      requesterName: liDage.name,
      requesterAvatar: liDage.avatar,
      requesterBuilding: liDage.building,
      requesterUnit: liDage.unit,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      status: "pending" as BorrowRequestStatus,
      borrowDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      expectedReturnDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: "客厅吸顶灯坏了，需要换灯泡",
      agreementSigned: false,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      toolId: communityTools[2].id,
      toolName: communityTools[2].name,
      toolEmoji: communityTools[2].emojiIcon,
      requesterId: zhaoJie.id,
      requesterName: zhaoJie.name,
      requesterAvatar: zhaoJie.avatar,
      requesterBuilding: zhaoJie.building,
      requesterUnit: zhaoJie.unit,
      ownerId: liDage.id,
      ownerName: liDage.name,
      status: "completed" as BorrowRequestStatus,
      borrowDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      expectedReturnDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      actualReturnDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: "组装新买的书架",
      agreementSigned: true,
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const borrowAgreements: BorrowAgreement[] = [
    {
      id: generateId(),
      requestId: borrowRequests[0].id,
      toolName: communityTools[1].name,
      lenderName: zhangShifu.name,
      borrowerName: currentUser.name,
      borrowDate: borrowRequests[0].borrowDate,
      expectedReturnDate: borrowRequests[0].expectedReturnDate,
      deposit: communityTools[1].deposit,
      terms: [
        "借用人应妥善保管借用工具，不得转借他人或用于违法用途",
        "借用人应按约定日期归还工具，如需延期请提前与出借人协商",
        "归还时工具应保持借出时的完好状态，如有损坏需照价赔偿",
        "借用期间工具如发生故障或损坏，借用人应及时通知出借人",
        "押金在工具完好归还时全额退还，如有损坏将从押金中扣除相应费用",
        "双方应本着邻里互助、友好协商的原则解决借用过程中的问题",
      ],
      signedByLender: true,
      signedByBorrower: true,
      signedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const creditRecords: CreditRecord[] = [
    {
      id: generateId(),
      userId: currentUser.id,
      type: "lend" as CreditChangeType,
      change: 5,
      description: "借出活动扳手给邻居使用",
      relatedToolId: communityTools[3].id,
      relatedToolName: communityTools[3].name,
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      userId: currentUser.id,
      type: "return_on_time" as CreditChangeType,
      change: 3,
      description: "按时归还人字梯",
      relatedToolId: communityTools[0].id,
      relatedToolName: communityTools[0].name,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      userId: currentUser.id,
      type: "borrow" as CreditChangeType,
      change: 2,
      description: "借用羊角锤组装家具",
      relatedToolId: communityTools[2].id,
      relatedToolName: communityTools[2].name,
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      userId: currentUser.id,
      type: "lend" as CreditChangeType,
      change: 5,
      description: "借出充电式电钻给张师傅使用",
      relatedToolId: communityTools[1].id,
      relatedToolName: communityTools[1].name,
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return {
    currentUser,
    communityUsers,
    communityTools,
    borrowRequests,
    borrowAgreements,
    creditRecords,
  };
}
