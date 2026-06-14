import { create } from "zustand";
import type {
  CommunityUser,
  CommunityTool,
  BorrowRequest,
  BorrowAgreement,
  CreditRecord,
  NewCommunityToolInput,
  NewBorrowRequestInput,
  CreditChangeType,
} from "@/types";
import { generateId } from "@/utils/format";
import { createInitialCommunityData, type CommunityInitialData } from "@/utils/mockData";

const STORAGE_KEY = "community_data";

interface CommunityStore {
  currentUser: CommunityUser | null;
  communityUsers: CommunityUser[];
  communityTools: CommunityTool[];
  borrowRequests: BorrowRequest[];
  borrowAgreements: BorrowAgreement[];
  creditRecords: CreditRecord[];
  hydrated: boolean;

  hydrate: () => void;
  getCurrentUser: () => CommunityUser | null;
  getCommunityTools: (query?: string, category?: string) => CommunityTool[];
  getCommunityToolById: (id: string) => CommunityTool | undefined;
  getMyCommunityTools: () => CommunityTool[];
  addCommunityTool: (input: NewCommunityToolInput) => CommunityTool;
  updateCommunityTool: (id: string, input: NewCommunityToolInput) => CommunityTool | null;
  removeCommunityTool: (id: string) => boolean;
  getBorrowRequests: (filter?: "all" | "as_requester" | "as_owner") => BorrowRequest[];
  getBorrowRequestById: (id: string) => BorrowRequest | undefined;
  createBorrowRequest: (toolId: string, input: NewBorrowRequestInput) => BorrowRequest | null;
  approveBorrowRequest: (requestId: string) => BorrowRequest | null;
  rejectBorrowRequest: (requestId: string) => BorrowRequest | null;
  completeBorrowRequest: (requestId: string, onTime: boolean) => BorrowRequest | null;
  cancelBorrowRequest: (requestId: string) => BorrowRequest | null;
  getBorrowAgreementById: (id: string) => BorrowAgreement | undefined;
  getAgreementByRequestId: (requestId: string) => BorrowAgreement | undefined;
  signAgreement: (agreementId: string, asLender: boolean) => BorrowAgreement | null;
  getCreditRecords: (userId: string) => CreditRecord[];
  addCreditRecord: (
    userId: string,
    type: CreditChangeType,
    change: number,
    description: string,
    relatedToolId?: string,
    relatedToolName?: string
  ) => CreditRecord | null;
  updateCreditScore: (userId: string, delta: number) => void;
}

function loadFromStorage(): CommunityInitialData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.communityUsers) &&
      Array.isArray(parsed.communityTools) &&
      Array.isArray(parsed.borrowRequests) &&
      Array.isArray(parsed.borrowAgreements) &&
      Array.isArray(parsed.creditRecords)
    ) {
      return parsed as CommunityInitialData;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(data: CommunityInitialData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("存储失败，可能是容量超限:", err);
    throw err;
  }
}

function buildStorageData(state: {
  currentUser: CommunityUser | null;
  communityUsers: CommunityUser[];
  communityTools: CommunityTool[];
  borrowRequests: BorrowRequest[];
  borrowAgreements: BorrowAgreement[];
  creditRecords: CreditRecord[];
}): CommunityInitialData {
  return {
    currentUser: state.currentUser ?? ({} as CommunityUser),
    communityUsers: state.communityUsers,
    communityTools: state.communityTools,
    borrowRequests: state.borrowRequests,
    borrowAgreements: state.borrowAgreements,
    creditRecords: state.creditRecords,
  };
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  currentUser: null,
  communityUsers: [],
  communityTools: [],
  borrowRequests: [],
  borrowAgreements: [],
  creditRecords: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const stored = loadFromStorage();
    if (stored) {
      set({
        currentUser: stored.currentUser,
        communityUsers: stored.communityUsers,
        communityTools: stored.communityTools,
        borrowRequests: stored.borrowRequests,
        borrowAgreements: stored.borrowAgreements,
        creditRecords: stored.creditRecords,
        hydrated: true,
      });
    } else {
      const initial = createInitialCommunityData();
      try {
        saveToStorage(initial);
      } catch {
      }
      set({
        currentUser: initial.currentUser,
        communityUsers: initial.communityUsers,
        communityTools: initial.communityTools,
        borrowRequests: initial.borrowRequests,
        borrowAgreements: initial.borrowAgreements,
        creditRecords: initial.creditRecords,
        hydrated: true,
      });
    }
  },

  getCurrentUser: () => {
    return get().currentUser;
  },

  getCommunityTools: (query?: string, category?: string) => {
    const q = query?.trim().toLowerCase() ?? "";
    return get().communityTools.filter((t) => {
      if (category && category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    });
  },

  getCommunityToolById: (id: string) => {
    return get().communityTools.find((t) => t.id === id);
  },

  getMyCommunityTools: () => {
    const user = get().currentUser;
    if (!user) return [];
    return get().communityTools.filter((t) => t.ownerId === user.id);
  },

  addCommunityTool: (input: NewCommunityToolInput) => {
    const user = get().currentUser;
    if (!user) {
      throw new Error("用户未登录");
    }
    const now = new Date().toISOString();
    const newTool: CommunityTool = {
      ...input,
      id: generateId(),
      ownerId: user.id,
      ownerName: user.name,
      ownerAvatar: user.avatar,
      building: user.building,
      unit: user.unit,
      status: "available",
      createdAt: now,
      updatedAt: now,
    };
    const nextTools = [newTool, ...get().communityTools];
    const nextState = { ...get(), communityTools: nextTools };
    saveToStorage(buildStorageData(nextState));
    set({ communityTools: nextTools });
    return newTool;
  },

  updateCommunityTool: (id: string, input: NewCommunityToolInput) => {
    const { communityTools } = get();
    const idx = communityTools.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated: CommunityTool = {
      ...communityTools[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    const nextTools = communityTools.slice();
    nextTools[idx] = updated;
    const nextState = { ...get(), communityTools: nextTools };
    saveToStorage(buildStorageData(nextState));
    set({ communityTools: nextTools });
    return updated;
  },

  removeCommunityTool: (id: string) => {
    const { communityTools } = get();
    const nextTools = communityTools.filter((t) => t.id !== id);
    if (nextTools.length === communityTools.length) return false;
    const nextState = { ...get(), communityTools: nextTools };
    saveToStorage(buildStorageData(nextState));
    set({ communityTools: nextTools });
    return true;
  },

  getBorrowRequests: (filter?: "all" | "as_requester" | "as_owner") => {
    const user = get().currentUser;
    if (!user) return [];
    const requests = get().borrowRequests;
    if (!filter || filter === "all") return requests;
    if (filter === "as_requester") {
      return requests.filter((r) => r.requesterId === user.id);
    }
    return requests.filter((r) => r.ownerId === user.id);
  },

  getBorrowRequestById: (id: string) => {
    return get().borrowRequests.find((r) => r.id === id);
  },

  createBorrowRequest: (toolId: string, input: NewBorrowRequestInput) => {
    const user = get().currentUser;
    const tool = get().communityTools.find((t) => t.id === toolId);
    if (!user || !tool) return null;
    if (tool.status !== "available") return null;

    const now = new Date().toISOString();
    const newRequest: BorrowRequest = {
      ...input,
      id: generateId(),
      toolId: tool.id,
      toolName: tool.name,
      toolEmoji: tool.emojiIcon,
      requesterId: user.id,
      requesterName: user.name,
      requesterAvatar: user.avatar,
      requesterBuilding: user.building,
      requesterUnit: user.unit,
      ownerId: tool.ownerId,
      ownerName: tool.ownerName,
      status: "pending",
      agreementSigned: false,
      createdAt: now,
      updatedAt: now,
    };

    const newAgreement: BorrowAgreement = {
      id: generateId(),
      requestId: newRequest.id,
      toolName: tool.name,
      lenderName: tool.ownerName,
      borrowerName: user.name,
      borrowDate: input.borrowDate,
      expectedReturnDate: input.expectedReturnDate,
      deposit: tool.deposit,
      terms: [
        "借用人应妥善保管借用工具，不得转借他人或用于违法用途",
        "借用人应按约定日期归还工具，如需延期请提前与出借人协商",
        "归还时工具应保持借出时的完好状态，如有损坏需照价赔偿",
        "借用期间工具如发生故障或损坏，借用人应及时通知出借人",
        "押金在工具完好归还时全额退还，如有损坏将从押金中扣除相应费用",
        "双方应本着邻里互助、友好协商的原则解决借用过程中的问题",
      ],
      signedByLender: false,
      signedByBorrower: false,
      createdAt: now,
    };

    const nextRequests = [newRequest, ...get().borrowRequests];
    const nextAgreements = [newAgreement, ...get().borrowAgreements];
    const nextState = { ...get(), borrowRequests: nextRequests, borrowAgreements: nextAgreements };
    saveToStorage(buildStorageData(nextState));
    set({ borrowRequests: nextRequests, borrowAgreements: nextAgreements });
    return newRequest;
  },

  approveBorrowRequest: (requestId: string) => {
    const { borrowRequests, communityTools } = get();
    const idx = borrowRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return null;
    const request = borrowRequests[idx];
    if (request.status !== "pending") return null;

    const now = new Date().toISOString();
    const updatedRequest: BorrowRequest = {
      ...request,
      status: "approved",
      updatedAt: now,
    };

    const toolIdx = communityTools.findIndex((t) => t.id === request.toolId);
    let nextTools = communityTools;
    if (toolIdx !== -1) {
      nextTools = communityTools.slice();
      nextTools[toolIdx] = {
        ...communityTools[toolIdx],
        status: "lent",
        updatedAt: now,
      };
    }

    const nextRequests = borrowRequests.slice();
    nextRequests[idx] = updatedRequest;

    const nextState = { ...get(), borrowRequests: nextRequests, communityTools: nextTools };
    saveToStorage(buildStorageData(nextState));
    set({ borrowRequests: nextRequests, communityTools: nextTools });

    get().addCreditRecord(request.ownerId, "lend", 5, "出借工具获得信用奖励", request.toolId, request.toolName);
    get().updateCreditScore(request.ownerId, 5);

    const { communityUsers } = get();
    const lenderIdx = communityUsers.findIndex((u) => u.id === request.ownerId);
    if (lenderIdx !== -1) {
      const nextUsers = communityUsers.slice();
      nextUsers[lenderIdx] = {
        ...nextUsers[lenderIdx],
        lendCount: nextUsers[lenderIdx].lendCount + 1,
      };
      const state = { ...get(), communityUsers: nextUsers };
      saveToStorage(buildStorageData(state));
      set({ communityUsers: nextUsers });
    }

    return updatedRequest;
  },

  rejectBorrowRequest: (requestId: string) => {
    const { borrowRequests } = get();
    const idx = borrowRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return null;
    const request = borrowRequests[idx];
    if (request.status !== "pending") return null;

    const now = new Date().toISOString();
    const updatedRequest: BorrowRequest = {
      ...request,
      status: "rejected",
      updatedAt: now,
    };

    const nextRequests = borrowRequests.slice();
    nextRequests[idx] = updatedRequest;
    const nextState = { ...get(), borrowRequests: nextRequests };
    saveToStorage(buildStorageData(nextState));
    set({ borrowRequests: nextRequests });
    return updatedRequest;
  },

  completeBorrowRequest: (requestId: string, onTime: boolean) => {
    const { borrowRequests, communityTools } = get();
    const idx = borrowRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return null;
    const request = borrowRequests[idx];
    if (request.status !== "approved") return null;

    const now = new Date().toISOString();
    const updatedRequest: BorrowRequest = {
      ...request,
      status: "completed",
      actualReturnDate: now,
      completedAt: now,
      updatedAt: now,
    };

    const toolIdx = communityTools.findIndex((t) => t.id === request.toolId);
    let nextTools = communityTools;
    if (toolIdx !== -1) {
      nextTools = communityTools.slice();
      nextTools[toolIdx] = {
        ...communityTools[toolIdx],
        status: "available",
        updatedAt: now,
      };
    }

    const nextRequests = borrowRequests.slice();
    nextRequests[idx] = updatedRequest;

    const nextState = { ...get(), borrowRequests: nextRequests, communityTools: nextTools };
    saveToStorage(buildStorageData(nextState));
    set({ borrowRequests: nextRequests, communityTools: nextTools });

    const creditDelta = onTime ? 5 : -10;
    const creditType: CreditChangeType = onTime ? "return_on_time" : "return_overdue";
    const creditDesc = onTime ? "按时归还工具获得信用奖励" : "逾期归还工具扣除信用分";
    get().addCreditRecord(request.requesterId, creditType, creditDelta, creditDesc, request.toolId, request.toolName);
    get().updateCreditScore(request.requesterId, creditDelta);

    const { communityUsers } = get();
    const borrowerIdx = communityUsers.findIndex((u) => u.id === request.requesterId);
    if (borrowerIdx !== -1) {
      const nextUsers = communityUsers.slice();
      nextUsers[borrowerIdx] = {
        ...nextUsers[borrowerIdx],
        borrowCount: nextUsers[borrowerIdx].borrowCount + 1,
      };
      const state = { ...get(), communityUsers: nextUsers };
      saveToStorage(buildStorageData(state));
      set({ communityUsers: nextUsers });
    }

    return updatedRequest;
  },

  cancelBorrowRequest: (requestId: string) => {
    const { borrowRequests } = get();
    const idx = borrowRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return null;
    const request = borrowRequests[idx];
    if (request.status !== "pending") return null;

    const now = new Date().toISOString();
    const updatedRequest: BorrowRequest = {
      ...request,
      status: "cancelled",
      updatedAt: now,
    };

    const nextRequests = borrowRequests.slice();
    nextRequests[idx] = updatedRequest;
    const nextState = { ...get(), borrowRequests: nextRequests };
    saveToStorage(buildStorageData(nextState));
    set({ borrowRequests: nextRequests });
    return updatedRequest;
  },

  getBorrowAgreementById: (id: string) => {
    return get().borrowAgreements.find((a) => a.id === id);
  },

  getAgreementByRequestId: (requestId: string) => {
    return get().borrowAgreements.find((a) => a.requestId === requestId);
  },

  signAgreement: (agreementId: string, asLender: boolean) => {
    const { borrowAgreements, borrowRequests } = get();
    const idx = borrowAgreements.findIndex((a) => a.id === agreementId);
    if (idx === -1) return null;
    const agreement = borrowAgreements[idx];

    const now = new Date().toISOString();
    let signedAt = agreement.signedAt;
    if ((asLender && !agreement.signedByLender) || (!asLender && !agreement.signedByBorrower)) {
      signedAt = now;
    }

    const updatedAgreement: BorrowAgreement = {
      ...agreement,
      signedByLender: asLender ? true : agreement.signedByLender,
      signedByBorrower: !asLender ? true : agreement.signedByBorrower,
      signedAt,
      createdAt: agreement.createdAt,
    };

    const nextAgreements = borrowAgreements.slice();
    nextAgreements[idx] = updatedAgreement;

    let nextRequests = borrowRequests;
    if (updatedAgreement.signedByLender && updatedAgreement.signedByBorrower) {
      const reqIdx = borrowRequests.findIndex((r) => r.id === agreement.requestId);
      if (reqIdx !== -1) {
        nextRequests = borrowRequests.slice();
        nextRequests[reqIdx] = {
          ...nextRequests[reqIdx],
          agreementSigned: true,
          updatedAt: now,
        };
      }
    }

    const nextState = { ...get(), borrowAgreements: nextAgreements, borrowRequests: nextRequests };
    saveToStorage(buildStorageData(nextState));
    set({ borrowAgreements: nextAgreements, borrowRequests: nextRequests });
    return updatedAgreement;
  },

  getCreditRecords: (userId: string) => {
    return get().creditRecords.filter((r) => r.userId === userId);
  },

  addCreditRecord: (
    userId: string,
    type: CreditChangeType,
    change: number,
    description: string,
    relatedToolId?: string,
    relatedToolName?: string
  ) => {
    const now = new Date().toISOString();
    const newRecord: CreditRecord = {
      id: generateId(),
      userId,
      type,
      change,
      description,
      relatedToolId,
      relatedToolName,
      createdAt: now,
    };
    const nextRecords = [newRecord, ...get().creditRecords];
    const nextState = { ...get(), creditRecords: nextRecords };
    saveToStorage(buildStorageData(nextState));
    set({ creditRecords: nextRecords });
    return newRecord;
  },

  updateCreditScore: (userId: string, delta: number) => {
    const { communityUsers, currentUser } = get();
    const idx = communityUsers.findIndex((u) => u.id === userId);
    if (idx === -1) return;

    const nextUsers = communityUsers.slice();
    nextUsers[idx] = {
      ...nextUsers[idx],
      creditScore: Math.max(0, Math.min(1000, nextUsers[idx].creditScore + delta)),
    };

    let nextCurrentUser = currentUser;
    if (currentUser && currentUser.id === userId) {
      nextCurrentUser = {
        ...currentUser,
        creditScore: nextUsers[idx].creditScore,
      };
    }

    const nextState = { ...get(), communityUsers: nextUsers, currentUser: nextCurrentUser };
    saveToStorage(buildStorageData(nextState));
    set({ communityUsers: nextUsers, currentUser: nextCurrentUser });
  },
}));
