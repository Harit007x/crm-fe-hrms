import api from "../lib/api";

export interface FileRecord {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: {
    id: string;
    name: string;
  };
}

export const fileService = {
  uploadFile: async (payload: {
    name: string;
    size: string;
    type?: string;
    url: string;
  }): Promise<FileRecord> => {
    const response = await api.post<{ success: boolean; data: FileRecord }>("/files", payload);
    return response.data.data;
  },

  getAllFiles: async (): Promise<FileRecord[]> => {
    const response = await api.get<{ success: boolean; data: FileRecord[] }>("/files");
    return response.data.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },
};
