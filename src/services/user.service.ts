import api from "../lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "TEAM_MEMBER" | "CLIENT" | "HR";
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "TEAM_MEMBER" | "CLIENT" | "HR";
  password?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: "ADMIN" | "MANAGER" | "TEAM_MEMBER" | "CLIENT" | "HR";
}

export const userService = {
  getAllUsers: async (role?: string): Promise<User[]> => {
    const params = role ? { role } : {};
    const response = await api.get<{ success: boolean; data: User[] }>("/users", { params });
    return response.data.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    const response = await api.post<{ success: boolean; data: User }>("/users", payload);
    return response.data.data;
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const response = await api.put<{ success: boolean; data: User }>(`/users/${id}`, payload);
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<boolean> => {
    const response = await api.delete<{ success: boolean }>(`/users/${id}`);
    return response.data.success;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: User }>("/users/profile");
    return response.data.data;
  },

  updateProfile: async (payload: { name?: string; email?: string }): Promise<User> => {
    const response = await api.put<{ success: boolean; data: User }>("/users/profile", payload);
    return response.data.data;
  },
};
