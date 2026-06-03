import api from "../lib/api";

export interface ProposalPhase {
  id?: string;
  name: string;
  description?: string;
  estimatedHours: number;
  rate: number;
}

export interface ProposalClient {
  id: string;
  name: string;
  email: string;
}

export interface Proposal {
  id: string;
  title: string;
  clientId: string;
  client: ProposalClient;
  validUntil: string;
  executiveSummary?: string;
  terms?: string;
  status: "Draft" | "Sent" | "Accepted" | "Rejected";
  value: number;
  phases?: ProposalPhase[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalPayload {
  title: string;
  clientId: string;
  validUntil: string;
  executiveSummary?: string;
  terms?: string;
  status?: "Draft" | "Sent" | "Accepted" | "Rejected";
  value?: number;
  phases?: ProposalPhase[];
}

export interface UpdateProposalPayload {
  title?: string;
  clientId?: string;
  validUntil?: string;
  executiveSummary?: string;
  terms?: string;
  status?: "Draft" | "Sent" | "Accepted" | "Rejected";
  value?: number;
  phases?: ProposalPhase[];
}

export const proposalService = {
  getAllProposals: async (): Promise<Proposal[]> => {
    const response = await api.get<{ success: boolean; data: Proposal[] }>("/proposals");
    return response.data.data;
  },

  getProposalById: async (id: string): Promise<Proposal> => {
    const response = await api.get<{ success: boolean; data: Proposal }>(`/proposals/${id}`);
    return response.data.data;
  },

  createProposal: async (payload: CreateProposalPayload): Promise<Proposal> => {
    const response = await api.post<{ success: boolean; data: Proposal }>("/proposals", payload);
    return response.data.data;
  },

  updateProposal: async (id: string, payload: UpdateProposalPayload): Promise<Proposal> => {
    const response = await api.put<{ success: boolean; data: Proposal }>(`/proposals/${id}`, payload);
    return response.data.data;
  },

  deleteProposal: async (id: string): Promise<boolean> => {
    const response = await api.delete<{ success: boolean }>(`/proposals/${id}`);
    return response.data.success;
  },
};
