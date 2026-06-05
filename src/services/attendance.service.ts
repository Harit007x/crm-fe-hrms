import api from "../lib/api";

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  punchIn: string;
  punchOut: string | null;
  totalHours: number | null;
  status: "Present" | "Half-Day" | "Late";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface MonthlySummary {
  totalDays: number;
  totalHours: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  avgHoursPerDay: number;
}

export interface MonthlyResponse {
  records: AttendanceRecord[];
  summary: MonthlySummary;
}

export const attendanceService = {
  getTodayStatus: async (): Promise<AttendanceRecord | null> => {
    const response = await api.get<{ success: boolean; data: AttendanceRecord | null }>("/attendance/today");
    return response.data.data;
  },

  getMonthlyRecords: async (year: number, month: number): Promise<MonthlyResponse> => {
    const response = await api.get<{ success: boolean; data: MonthlyResponse }>(
      `/attendance/monthly?year=${year}&month=${month}`
    );
    return response.data.data;
  },

  getAllAttendances: async (date?: string): Promise<AttendanceRecord[]> => {
    const url = date ? `/attendance?date=${date}` : "/attendance";
    const response = await api.get<{ success: boolean; data: AttendanceRecord[] }>(url);
    return response.data.data;
  },

  deleteAttendance: async (id: string): Promise<void> => {
    await api.delete(`/attendance/${id}`);
  },

  punchIn: async (notes?: string): Promise<AttendanceRecord> => {
    const response = await api.post<{ success: boolean; data: AttendanceRecord; message: string }>(
      "/attendance/punch-in",
      { notes }
    );
    return response.data.data;
  },

  punchOut: async (notes?: string): Promise<AttendanceRecord> => {
    const response = await api.post<{ success: boolean; data: AttendanceRecord; message: string }>(
      "/attendance/punch-out",
      { notes }
    );
    return response.data.data;
  },
};
