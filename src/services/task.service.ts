import api from "../lib/api";

export interface Task {
  id: string;
  content: string;
  priority: "Low" | "Medium" | "High";
  status: string;
  assigneeId?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export const taskService = {
  createTask: async (payload: {
    content: string;
    priority?: "Low" | "Medium" | "High";
    status?: string;
    assigneeId?: string;
    projectId?: string;
  }): Promise<Task> => {
    const response = await api.post<{ success: boolean; data: Task }>("/tasks", payload);
    return response.data.data;
  },

  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get<{ success: boolean; data: Task[] }>("/tasks");
    return response.data.data;
  },

  updateTask: async (id: string, payload: Partial<Task>): Promise<Task> => {
    const response = await api.put<{ success: boolean; data: Task }>(`/tasks/${id}`, payload);
    return response.data.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
