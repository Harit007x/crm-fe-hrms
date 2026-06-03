import api from "../lib/api";

export interface ExpenseProject {
  id: string;
  name: string;
}

export interface ExpenseSubmitter {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  id: string;
  date: string;
  category: "Travel" | "Meals" | "Software" | "Supplies" | "Other";
  amount: number;
  projectId?: string | null;
  project?: ExpenseProject | null;
  submittedById: string;
  submittedBy?: ExpenseSubmitter;
  status: "Pending" | "Approved" | "Reimbursed" | "Rejected";
  description: string;
  receiptUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  date: string;
  category: "Travel" | "Meals" | "Software" | "Supplies" | "Other";
  amount: number;
  projectId?: string;
  description: string;
  receiptUrl?: string;
}

export interface UpdateExpensePayload {
  date?: string;
  category?: "Travel" | "Meals" | "Software" | "Supplies" | "Other";
  amount?: number;
  projectId?: string | null;
  description?: string;
  receiptUrl?: string | null;
  status?: "Pending" | "Approved" | "Reimbursed" | "Rejected";
}

export const expenseService = {
  getAllExpenses: async (): Promise<Expense[]> => {
    const response = await api.get<{ success: boolean; data: Expense[] }>("/expenses");
    return response.data.data;
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    const response = await api.get<{ success: boolean; data: Expense }>(`/expenses/${id}`);
    return response.data.data;
  },

  createExpense: async (payload: CreateExpensePayload): Promise<Expense> => {
    const response = await api.post<{ success: boolean; data: Expense }>("/expenses", payload);
    return response.data.data;
  },

  updateExpense: async (id: string, payload: UpdateExpensePayload): Promise<Expense> => {
    const response = await api.put<{ success: boolean; data: Expense }>(`/expenses/${id}`, payload);
    return response.data.data;
  },

  deleteExpense: async (id: string): Promise<boolean> => {
    const response = await api.delete<{ success: boolean }>(`/expenses/${id}`);
    return response.data.success;
  },
};
