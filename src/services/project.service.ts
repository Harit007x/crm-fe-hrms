import api from "../lib/api";
import type { Milestone } from "./milestone.service";

export interface ProjectManager {
  id: string;
  name: string;
  email: string;
}

export interface ProjectClient {
  id: string;
  name: string;
  email: string;
}

export interface ProjectTeam {
  id: string;
  name: string;
  lead?: { id: string; name: string; email: string };
  members?: Array<{ id: string; name: string; email: string }>;
}

export interface Project {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status: "Pending" | "In Progress" | "Completed" | "Delayed";
  progress: number;
  startDate?: string;
  endDate?: string;
  managerId: string;
  manager: ProjectManager;
  clientId: string;
  client: ProjectClient;
  teamId?: string;
  team?: ProjectTeam;
  milestones?: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  code?: string;
  description?: string;
  status?: "Pending" | "In Progress" | "Completed" | "Delayed";
  progress?: number;
  startDate?: string;
  endDate?: string;
  managerId: string;
  clientId: string;
  teamId?: string;
  milestones?: Array<{
    title: string;
    dueDate?: string;
    status?: "Pending" | "In Progress" | "Completed" | "Delayed";
    assignedUserIds?: string[];
  }>;
}

export interface UpdateProjectPayload {
  name?: string;
  code?: string;
  description?: string;
  status?: "Pending" | "In Progress" | "Completed" | "Delayed";
  progress?: number;
  startDate?: string;
  endDate?: string;
  managerId?: string;
  clientId?: string;
  teamId?: string;
}

export const projectService = {
  getAllProjects: async (): Promise<Project[]> => {
    const response = await api.get<{ success: boolean; data: Project[] }>("/projects");
    return response.data.data;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get<{ success: boolean; data: Project }>(`/projects/${id}`);
    return response.data.data;
  },

  createProject: async (payload: CreateProjectPayload): Promise<Project> => {
    const response = await api.post<{ success: boolean; data: Project }>("/projects", payload);
    return response.data.data;
  },

  updateProject: async (id: string, payload: UpdateProjectPayload): Promise<Project> => {
    const response = await api.put<{ success: boolean; data: Project }>(`/projects/${id}`, payload);
    return response.data.data;
  },

  deleteProject: async (id: string): Promise<boolean> => {
    const response = await api.delete<{ success: boolean }>(`/projects/${id}`);
    return response.data.success;
  },
};
