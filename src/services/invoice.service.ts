import api from "../lib/api";

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceClient {
  id: string;
  name: string;
  email: string;
}

export interface InvoiceProject {
  id: string;
  name: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  client?: InvoiceClient;
  projectId?: string | null;
  project?: InvoiceProject | null;
  issueDate: string;
  dueDate: string;
  tax: number;
  subtotal: number;
  total: number;
  notes?: string | null;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  items?: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoicePayload {
  clientId: string;
  projectId?: string;
  issueDate: string;
  dueDate: string;
  tax?: number;
  notes?: string;
  status?: "Draft" | "Sent" | "Paid" | "Overdue";
  items: InvoiceItem[];
}

export interface UpdateInvoicePayload {
  clientId?: string;
  projectId?: string | null;
  issueDate?: string;
  dueDate?: string;
  tax?: number;
  notes?: string | null;
  status?: "Draft" | "Sent" | "Paid" | "Overdue";
  items?: InvoiceItem[];
}

export const invoiceService = {
  getAllInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get<{ success: boolean; data: Invoice[] }>("/invoices");
    return response.data.data;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await api.get<{ success: boolean; data: Invoice }>(`/invoices/${id}`);
    return response.data.data;
  },

  createInvoice: async (payload: CreateInvoicePayload): Promise<Invoice> => {
    const response = await api.post<{ success: boolean; data: Invoice }>("/invoices", payload);
    return response.data.data;
  },

  updateInvoice: async (id: string, payload: UpdateInvoicePayload): Promise<Invoice> => {
    const response = await api.put<{ success: boolean; data: Invoice }>(`/invoices/${id}`, payload);
    return response.data.data;
  },

  deleteInvoice: async (id: string): Promise<boolean> => {
    const response = await api.delete<{ success: boolean }>(`/invoices/${id}`);
    return response.data.success;
  },
};
