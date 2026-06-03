import api from "../lib/api";

export interface TeamLead {
  id: string;
  name: string;
  email: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leadId: string;
  lead: TeamLead;
  memberIds: string[];
  members: TeamMember[];
  createdAt: string;
}

export interface CreateTeamPayload {
  name: string;
  description?: string;
  leadId: string;
  memberIds?: string[];
}

export interface UpdateTeamPayload {
  name?: string;
  description?: string;
  leadId?: string;
  memberIds?: string[];
}

export const teamService = {
  getAllTeams: async (): Promise<Team[]> => {
    const response = await api.get<{ success: boolean; data: Team[] }>("/teams");
    return response.data.data;
  },

  getTeamById: async (id: string): Promise<Team> => {
    const response = await api.get<{ success: boolean; data: Team }>(`/teams/${id}`);
    return response.data.data;
  },

  createTeam: async (payload: CreateTeamPayload): Promise<Team> => {
    const response = await api.post<{ success: boolean; data: Team }>("/teams", payload);
    return response.data.data;
  },

  updateTeam: async (id: string, payload: UpdateTeamPayload): Promise<Team> => {
    const response = await api.put<{ success: boolean; data: Team }>(`/teams/${id}`, payload);
    return response.data.data;
  },

  deleteTeam: async (id: string): Promise<boolean> => {
    const response = await api.delete<{ success: boolean }>(`/teams/${id}`);
    return response.data.success;
  },
};
