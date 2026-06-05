import api from "../lib/api";

export interface DailyReport {
  id: string;
  date: string;
  hours: number;
  tasksWorkedOn: string;
  blockers?: string;
  plan?: string;
  status: "Pending" | "Approved" | "Rejected";
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

export const dailyReportService = {
  createReport: async (payload: {
    date: string;
    hours: number;
    projectId: string;
    tasksWorkedOn: string;
    blockers?: string;
    plan?: string;
  }): Promise<DailyReport> => {
    const response = await api.post<{ success: boolean; data: DailyReport }>("/daily-reports", payload);
    return response.data.data;
  },

  getMyReports: async (): Promise<DailyReport[]> => {
    const response = await api.get<{ success: boolean; data: DailyReport[] }>("/daily-reports/my-reports");
    return response.data.data;
  },

  getAllReports: async (): Promise<DailyReport[]> => {
    const response = await api.get<{ success: boolean; data: DailyReport[] }>("/daily-reports");
    return response.data.data;
  },

  updateStatus: async (id: string, status: "Approved" | "Rejected"): Promise<DailyReport> => {
    const response = await api.put<{ success: boolean; data: DailyReport }>(`/daily-reports/${id}/status`, { status });
    return response.data.data;
  },
};
