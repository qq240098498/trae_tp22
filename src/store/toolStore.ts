import { create } from "zustand";
import type { NewToolInput, Tool } from "@/types";
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
}

function loadFromStorage(): Tool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Tool[];
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
}));
