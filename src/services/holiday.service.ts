import axios from "axios";

const API_URL = "http://localhost:5000/api/holidays";

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
    const response = await axios.get(API_URL, { withCredentials: true });
    return response.data;
  },

  createHoliday: async (data: Partial<Holiday>): Promise<Holiday> => {
    const response = await axios.post(API_URL, data, { withCredentials: true });
    return response.data;
  },

  updateHoliday: async (id: string, data: Partial<Holiday>): Promise<Holiday> => {
    const response = await axios.put(`${API_URL}/${id}`, data, { withCredentials: true });
    return response.data;
  },

  deleteHoliday: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
  },
};
