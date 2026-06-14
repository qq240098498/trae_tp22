import { create } from "zustand";
import type {
  NewMaintenanceTaskInput,
  ResolveTaskInput,
  MaintenanceTask,
  TaskStatus,
} from "@/types";
import { generateId } from "@/utils/format";
import { createInitialTasks } from "@/utils/mockData";

const STORAGE_KEY = "family_maintenance_tasks_data";

interface MaintenanceStore {
  tasks: MaintenanceTask[];
  hydrated: boolean;

  hydrate: () => void;
  addTask: (input: NewMaintenanceTaskInput) => MaintenanceTask;
  updateTask: (
    id: string,
    input: NewMaintenanceTaskInput
  ) => MaintenanceTask | null;
  deleteTask: (id: string) => boolean;
  getTaskById: (id: string) => MaintenanceTask | undefined;
  searchTasks: (
    query: string,
    status?: string,
    priority?: string
  ) => MaintenanceTask[];
  updateTaskStatus: (id: string, status: TaskStatus) => MaintenanceTask | null;
  resolveTask: (
    id: string,
    input: ResolveTaskInput
  ) => MaintenanceTask | null;
  reopenTask: (id: string) => MaintenanceTask | null;
  getPendingTasks: () => MaintenanceTask[];
  getInProgressTasks: () => MaintenanceTask[];
  getResolvedTasks: () => MaintenanceTask[];
}

function loadFromStorage(): MaintenanceTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as MaintenanceTask[];
    return [];
  } catch {
    return [];
  }
}

function saveToStorage(tasks: MaintenanceTask[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("存储失败，可能是容量超限:", err);
    throw err;
  }
}

export const useMaintenanceStore = create<MaintenanceStore>((set, get) => ({
  tasks: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    let tasks = loadFromStorage();
    if (tasks.length === 0) {
      tasks = createInitialTasks();
      try {
        saveToStorage(tasks);
      } catch {
        // 首次写入失败（通常没问题）
      }
    }
    set({ tasks, hydrated: true });
  },

  addTask: (input: NewMaintenanceTaskInput) => {
    const now = new Date().toISOString();
    const newTask: MaintenanceTask = {
      ...input,
      id: generateId(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    const nextTasks = [newTask, ...get().tasks];
    saveToStorage(nextTasks);
    set({ tasks: nextTasks });
    return newTask;
  },

  updateTask: (id: string, input: NewMaintenanceTaskInput) => {
    const { tasks } = get();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated: MaintenanceTask = {
      ...tasks[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    const nextTasks = tasks.slice();
    nextTasks[idx] = updated;
    saveToStorage(nextTasks);
    set({ tasks: nextTasks });
    return updated;
  },

  deleteTask: (id: string) => {
    const { tasks } = get();
    const nextTasks = tasks.filter((t) => t.id !== id);
    if (nextTasks.length === tasks.length) return false;
    saveToStorage(nextTasks);
    set({ tasks: nextTasks });
    return true;
  },

  getTaskById: (id: string) => {
    return get().tasks.find((t) => t.id === id);
  },

  searchTasks: (query: string, status?: string, priority?: string) => {
    const q = query.trim().toLowerCase();
    return get().tasks.filter((t) => {
      if (status && status !== "all" && t.status !== status) return false;
      if (priority && priority !== "all" && t.priority !== priority)
        return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.resolutionNotes?.toLowerCase().includes(q) ?? false) ||
        t.tools.some((tool) => tool.toolName.toLowerCase().includes(q)) ||
        t.consumables.some((c) => c.consumableName.toLowerCase().includes(q))
      );
    });
  },

  updateTaskStatus: (id: string, status: TaskStatus) => {
    const { tasks } = get();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const updated: MaintenanceTask = {
      ...tasks[idx],
      status,
      updatedAt: now,
    };
    if (status === "resolved" && !tasks[idx].resolvedAt) {
      updated.resolvedAt = now;
    } else if (status !== "resolved") {
      updated.resolvedAt = undefined;
      updated.timeSpentMinutes = undefined;
      updated.resolutionNotes = undefined;
    }
    const nextTasks = tasks.slice();
    nextTasks[idx] = updated;
    saveToStorage(nextTasks);
    set({ tasks: nextTasks });
    return updated;
  },

  resolveTask: (id: string, input: ResolveTaskInput) => {
    const { tasks } = get();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const updated: MaintenanceTask = {
      ...tasks[idx],
      status: "resolved",
      resolvedAt: now,
      timeSpentMinutes: input.timeSpentMinutes,
      resolutionNotes: input.resolutionNotes?.trim() || undefined,
      updatedAt: now,
    };
    const nextTasks = tasks.slice();
    nextTasks[idx] = updated;
    saveToStorage(nextTasks);
    set({ tasks: nextTasks });
    return updated;
  },

  reopenTask: (id: string) => {
    const { tasks } = get();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const updated: MaintenanceTask = {
      ...tasks[idx],
      status: "in_progress",
      resolvedAt: undefined,
      timeSpentMinutes: undefined,
      resolutionNotes: undefined,
      updatedAt: now,
    };
    const nextTasks = tasks.slice();
    nextTasks[idx] = updated;
    saveToStorage(nextTasks);
    set({ tasks: nextTasks });
    return updated;
  },

  getPendingTasks: () => {
    return get().tasks.filter((t) => t.status === "pending");
  },

  getInProgressTasks: () => {
    return get().tasks.filter((t) => t.status === "in_progress");
  },

  getResolvedTasks: () => {
    return get().tasks.filter((t) => t.status === "resolved");
  },
}));
