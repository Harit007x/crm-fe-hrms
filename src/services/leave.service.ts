import api from "../lib/api";

export interface LeaveRecord {
  id: string;
  userId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

export const leaveService = {
  getMyLeaves: async (): Promise<LeaveRecord[]> => {
    const response = await api.get<{ success: boolean; data: LeaveRecord[] }>("/leaves/my");
    return response.data.data;
  },

  getAllLeaves: async (): Promise<LeaveRecord[]> => {
    const response = await api.get<{ success: boolean; data: LeaveRecord[] }>("/leaves");
    return response.data.data;
  },

  applyLeave: async (payload: {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<LeaveRecord> => {
    const response = await api.post<{ success: boolean; data: LeaveRecord; message: string }>(
      "/leaves",
      payload
    );
    return response.data.data;
  },

  updateLeaveStatus: async (id: string, status: "Approved" | "Rejected" | "Pending"): Promise<LeaveRecord> => {
    const response = await api.patch<{ success: boolean; data: LeaveRecord; message: string }>(
      `/leaves/${id}/status`,
      { status }
    );
    return response.data.data;
  },
};
