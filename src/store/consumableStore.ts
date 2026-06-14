import { create } from "zustand";
import type { NewConsumableInput, NewConsumableUsageInput, Consumable, ConsumableUsageRecord } from "@/types";
import { generateId } from "@/utils/format";
import { createInitialConsumables } from "@/utils/mockData";

const STORAGE_KEY = "family_consumables_data";

interface ConsumableStore {
  consumables: Consumable[];
  hydrated: boolean;

  hydrate: () => void;
  addConsumable: (input: NewConsumableInput) => Consumable;
  updateConsumable: (id: string, input: NewConsumableInput) => Consumable | null;
  deleteConsumable: (id: string) => boolean;
  getConsumableById: (id: string) => Consumable | undefined;
  searchConsumables: (query: string, category?: string, onlyLowStock?: boolean) => Consumable[];
  getLowStockConsumables: () => Consumable[];

  addUsageRecord: (consumableId: string, input: NewConsumableUsageInput) => ConsumableUsageRecord | null;
  restock: (consumableId: string, amount: number, notes?: string) => Consumable | null;
}

function loadFromStorage(): Consumable[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Consumable[];
    return [];
  } catch {
    return [];
  }
}

function saveToStorage(consumables: Consumable[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consumables));
  } catch (err) {
    console.error("存储失败，可能是容量超限:", err);
    throw err;
  }
}

export const useConsumableStore = create<ConsumableStore>((set, get) => ({
  consumables: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    let consumables = loadFromStorage();
    if (consumables.length === 0) {
      consumables = createInitialConsumables();
      try {
        saveToStorage(consumables);
      } catch {
        // 首次写入失败（通常没问题）
      }
    }
    set({ consumables, hydrated: true });
  },

  addConsumable: (input: NewConsumableInput) => {
    const now = new Date().toISOString();
    const newConsumable: Consumable = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      usageRecords: [],
    };
    const nextConsumables = [newConsumable, ...get().consumables];
    saveToStorage(nextConsumables);
    set({ consumables: nextConsumables });
    return newConsumable;
  },

  updateConsumable: (id: string, input: NewConsumableInput) => {
    const { consumables } = get();
    const idx = consumables.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated: Consumable = {
      ...consumables[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    const nextConsumables = consumables.slice();
    nextConsumables[idx] = updated;
    saveToStorage(nextConsumables);
    set({ consumables: nextConsumables });
    return updated;
  },

  deleteConsumable: (id: string) => {
    const { consumables } = get();
    const nextConsumables = consumables.filter((c) => c.id !== id);
    if (nextConsumables.length === consumables.length) return false;
    saveToStorage(nextConsumables);
    set({ consumables: nextConsumables });
    return true;
  },

  getConsumableById: (id: string) => {
    return get().consumables.find((c) => c.id === id);
  },

  searchConsumables: (query: string, category?: string, onlyLowStock?: boolean) => {
    const q = query.trim().toLowerCase();
    return get().consumables.filter((c) => {
      if (category && category !== "all" && c.category !== category) return false;
      if (onlyLowStock && c.currentStock > c.minStockThreshold) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.notes.toLowerCase().includes(q)
      );
    });
  },

  getLowStockConsumables: () => {
    return get().consumables.filter((c) => c.currentStock <= c.minStockThreshold);
  },

  addUsageRecord: (consumableId: string, input: NewConsumableUsageInput) => {
    const { consumables } = get();
    const idx = consumables.findIndex((c) => c.id === consumableId);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const newRecord: ConsumableUsageRecord = {
      ...input,
      id: generateId(),
      createdAt: now,
    };

    const consumable = consumables[idx];
    const updatedConsumable: Consumable = {
      ...consumable,
      currentStock: Math.max(0, consumable.currentStock - input.amount),
      usageRecords: [newRecord, ...consumable.usageRecords],
      updatedAt: now,
    };

    const nextConsumables = consumables.slice();
    nextConsumables[idx] = updatedConsumable;
    saveToStorage(nextConsumables);
    set({ consumables: nextConsumables });
    return newRecord;
  },

  restock: (consumableId: string, amount: number, notes?: string) => {
    const { consumables } = get();
    const idx = consumables.findIndex((c) => c.id === consumableId);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const consumable = consumables[idx];
    const updatedConsumable: Consumable = {
      ...consumable,
      currentStock: consumable.currentStock + amount,
      updatedAt: now,
    };

    if (notes) {
      const restockRecord: ConsumableUsageRecord = {
        id: generateId(),
        amount: -amount,
        usageDate: now,
        notes,
        createdAt: now,
      };
      updatedConsumable.usageRecords = [restockRecord, ...consumable.usageRecords];
    }

    const nextConsumables = consumables.slice();
    nextConsumables[idx] = updatedConsumable;
    saveToStorage(nextConsumables);
    set({ consumables: nextConsumables });
    return updatedConsumable;
  },
}));
