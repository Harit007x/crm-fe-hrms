import api from "../lib/api";

export interface Holiday {
  id: string;
  title: string;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const holidayService = {
  getHolidays: async (): Promise<Holiday[]> => {
    const response = await api.get<Holiday[]>("/holidays");
    return response.data;
  },

  createHoliday: async (data: Partial<Holiday>): Promise<Holiday> => {
    const response = await api.post<Holiday>("/holidays", data);
    return response.data;
  },

  updateHoliday: async (id: string, data: Partial<Holiday>): Promise<Holiday> => {
    const response = await api.put<Holiday>(`/holidays/${id}`, data);
    return response.data;
  },

  deleteHoliday: async (id: string): Promise<void> => {
    await api.delete(`/holidays/${id}`);
  },
};
