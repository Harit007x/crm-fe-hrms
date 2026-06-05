import api from "../lib/api";

export interface EventRecord {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export const eventService = {
  getEvents: async (): Promise<EventRecord[]> => {
    const response = await api.get<{ success: boolean; data: EventRecord[] }>("/events");
    return response.data.data;
  },

  createEvent: async (payload: {
    title: string;
    description?: string;
    date: string;
  }): Promise<EventRecord> => {
    const response = await api.post<{ success: boolean; data: EventRecord; message: string }>(
      "/events",
      payload
    );
    return response.data.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(`/events/${id}`);
  },
};
