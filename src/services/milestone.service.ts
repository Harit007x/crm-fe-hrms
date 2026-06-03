import api from "../lib/api";

export interface Milestone {
  id: string;
  title: string;
  dueDate?: string;
  status: "Pending" | "In Progress" | "Completed" | "Delayed";
  projectId: string;
  assignedUserIds?: string[];
  assignedUsers?: Array<{ id: string; name: string; email: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestonePayload {
  title: string;
  dueDate?: string;
  status?: "Pending" | "In Progress" | "Completed" | "Delayed";
  projectId: string;
  assignedUserIds?: string[];
}

export interface UpdateMilestonePayload {
  title?: string;
  dueDate?: string;
  status?: "Pending" | "In Progress" | "Completed" | "Delayed";
  assignedUserIds?: string[];
}

export const milestoneService = {
  createMilestone: async (payload: CreateMilestonePayload): Promise<Milestone> => {
    const response = await api.post<{ success: boolean; data: Milestone }>("/milestones", payload);
    return response.data.data;
  },

  updateMilestone: async (id: string, payload: UpdateMilestonePayload): Promise<Milestone> => {
    const response = await api.put<{ success: boolean; data: Milestone }>(`/milestones/${id}`, payload);
    return response.data.data;
  },

  deleteMilestone: async (id: string): Promise<boolean> => {
    const response = await api.delete<{ success: boolean }>(`/milestones/${id}`);
    return response.data.success;
  },
};
