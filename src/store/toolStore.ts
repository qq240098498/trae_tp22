import { create } from "zustand";
import type { NewToolInput, NewBorrowInput, Tool, BorrowRecord } from "@/types";
import { generateId } from "@/utils/format";
import { createInitialTools } from "@/utils/mockData";

const STORAGE_KEY = "family_toolbox_data";

interface ToolStore {
  tools: Tool[];
  hydrated: boolean;

  hydrate: () => void;
  addTool: (input: NewToolInput) => Tool;
  updateTool: (id: string, input: NewToolInput) => Tool | null;
  deleteTool: (id: string) => boolean;
  getToolById: (id: string) => Tool | undefined;
  searchTools: (query: string, category?: string) => Tool[];
  getCommunityAvailableTools: () => Tool[];
  toggleCommunityAvailability: (id: string) => Tool | null;

  addBorrowRecord: (toolId: string, input: NewBorrowInput) => BorrowRecord | null;
  returnBorrowRecord: (toolId: string, recordId: string) => BorrowRecord | null;
  getActiveBorrowRecord: (toolId: string) => BorrowRecord | undefined;
  getOverdueBorrows: () => { tool: Tool; record: BorrowRecord }[];
  updateBorrowStatuses: () => void;
}

function loadFromStorage(): Tool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return (parsed as Tool[]).map((t) => ({
        ...t,
        borrowRecords: t.borrowRecords ?? [],
        availableForCommunity: t.availableForCommunity ?? false,
        communityDescription: t.communityDescription,
        communityDeposit: t.communityDeposit,
        communityMaxDays: t.communityMaxDays,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

function saveToStorage(tools: Tool[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
  } catch (err) {
    console.error("存储失败，可能是容量超限:", err);
    throw err;
  }
}

export const useToolStore = create<ToolStore>((set, get) => ({
  tools: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    let tools = loadFromStorage();
    if (tools.length === 0) {
      tools = createInitialTools();
      try {
        saveToStorage(tools);
      } catch {
        // 首次写入失败（通常没问题）
      }
    }
    set({ tools, hydrated: true });
  },

  addTool: (input: NewToolInput) => {
    const now = new Date().toISOString();
    const newTool: Tool = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      borrowRecords: [],
      availableForCommunity: input.availableForCommunity ?? false,
    };
    const nextTools = [newTool, ...get().tools];
    saveToStorage(nextTools);
    set({ tools: nextTools });
    return newTool;
  },

  updateTool: (id: string, input: NewToolInput) => {
    const { tools } = get();
    const idx = tools.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated: Tool = {
      ...tools[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    const nextTools = tools.slice();
    nextTools[idx] = updated;
    saveToStorage(nextTools);
    set({ tools: nextTools });
    return updated;
  },

  deleteTool: (id: string) => {
    const { tools } = get();
    const nextTools = tools.filter((t) => t.id !== id);
    if (nextTools.length === tools.length) return false;
    saveToStorage(nextTools);
    set({ tools: nextTools });
    return true;
  },

  getToolById: (id: string) => {
    return get().tools.find((t) => t.id === id);
  },

  searchTools: (query: string, category?: string) => {
    const q = query.trim().toLowerCase();
    return get().tools.filter((t) => {
      if (category && category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
      );
    });
  },

  getCommunityAvailableTools: () => {
    return get().tools.filter((t) => t.availableForCommunity);
  },

  toggleCommunityAvailability: (id: string) => {
    const { tools } = get();
    const idx = tools.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated: Tool = {
      ...tools[idx],
      availableForCommunity: !tools[idx].availableForCommunity,
      updatedAt: new Date().toISOString(),
    };
    const nextTools = tools.slice();
    nextTools[idx] = updated;
    saveToStorage(nextTools);
    set({ tools: nextTools });
    return updated;
  },

  addBorrowRecord: (toolId: string, input: NewBorrowInput) => {
    const { tools } = get();
    const idx = tools.findIndex((t) => t.id === toolId);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const newRecord: BorrowRecord = {
      ...input,
      id: generateId(),
      status: "borrowed",
      createdAt: now,
      updatedAt: now,
    };

    const updatedTool: Tool = {
      ...tools[idx],
      borrowRecords: [newRecord, ...tools[idx].borrowRecords],
      updatedAt: now,
    };

    const nextTools = tools.slice();
    nextTools[idx] = updatedTool;
    saveToStorage(nextTools);
    set({ tools: nextTools });
    return newRecord;
  },

  returnBorrowRecord: (toolId: string, recordId: string) => {
    const { tools } = get();
    const idx = tools.findIndex((t) => t.id === toolId);
    if (idx === -1) return null;

    const tool = tools[idx];
    const recordIdx = tool.borrowRecords.findIndex((r) => r.id === recordId);
    if (recordIdx === -1) return null;

    const now = new Date().toISOString();
    const updatedRecord: BorrowRecord = {
      ...tool.borrowRecords[recordIdx],
      status: "returned",
      actualReturnDate: now,
      updatedAt: now,
    };

    const updatedRecords = tool.borrowRecords.slice();
    updatedRecords[recordIdx] = updatedRecord;

    const updatedTool: Tool = {
      ...tool,
      borrowRecords: updatedRecords,
      updatedAt: now,
    };

    const nextTools = tools.slice();
    nextTools[idx] = updatedTool;
    saveToStorage(nextTools);
    set({ tools: nextTools });
    return updatedRecord;
  },

  getActiveBorrowRecord: (toolId: string) => {
    const tool = get().tools.find((t) => t.id === toolId);
    if (!tool) return undefined;
    return tool.borrowRecords.find((r) => r.status === "borrowed" || r.status === "overdue");
  },

  getOverdueBorrows: () => {
    const { updateBorrowStatuses } = get();
    updateBorrowStatuses();
    const result: { tool: Tool; record: BorrowRecord }[] = [];
    for (const tool of get().tools) {
      for (const record of tool.borrowRecords) {
        if (record.status === "overdue") {
          result.push({ tool, record });
        }
      }
    }
    return result;
  },

  updateBorrowStatuses: () => {
    const { tools } = get();
    const now = new Date();
    let hasChanges = false;

    const nextTools = tools.map((tool) => {
      const records = tool.borrowRecords ?? [];
      const updatedRecords = records.map((record) => {
        if (record.status === "borrowed") {
          const expectedDate = new Date(record.expectedReturnDate);
          expectedDate.setHours(23, 59, 59, 999);
          if (now > expectedDate) {
            hasChanges = true;
            return { ...record, status: "overdue" as const, updatedAt: now.toISOString() };
          }
        }
        return record;
      });

      if (updatedRecords.some((r, i) => r !== records[i]) || records !== tool.borrowRecords) {
        return { ...tool, borrowRecords: updatedRecords, updatedAt: now.toISOString() };
      }
      return tool;
    });

    if (hasChanges) {
      saveToStorage(nextTools);
      set({ tools: nextTools });
    }
  },
}));
