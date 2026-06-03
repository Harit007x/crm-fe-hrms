import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "@/layouts/admin-layout";

// Pages
import LoginPage from "@/pages/login/page";
import SignupPage from "@/pages/signup/page";
import ForgotPasswordPage from "@/pages/forgot-password/page";
import ResetPasswordPage from "@/pages/reset-password/page";

import DashboardPage from "@/pages/admin/dashboard/page";
import AnalyticsPage from "@/pages/admin/analytics/page";
import ProjectsPage from "@/pages/admin/projects/page";
import ProjectNewPage from "@/pages/admin/projects/new/page";
import ProjectDetailsPage from "@/pages/admin/projects/[id]/page";
import TasksBoardPage from "@/pages/admin/tasks/board/page";
import ProposalsPage from "@/pages/admin/proposals/page";
import ProposalNewPage from "@/pages/admin/proposals/new/page";
import ProposalDetailsPage from "@/pages/admin/proposals/[id]/page";
import DailyReportsPage from "@/pages/admin/daily-reports/page";
import ExpensesPage from "@/pages/admin/expenses/page";
import InvoicesPage from "@/pages/admin/invoices/page";
import InvoiceNewPage from "@/pages/admin/invoices/new/page";
import InvoiceDetailsPage from "@/pages/admin/invoices/[id]/page";
import UsersPage from "@/pages/admin/users/page";
import FilesPage from "@/pages/admin/files/page";
import SettingsPage from "@/pages/admin/settings/page";

export const router = createBrowserRouter([
  // Redirect root to login
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  // Auth routes (no layout)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPasswordPage />,
  },

  // Admin routes (with sidebar layout)
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "analytics",
        element: <AnalyticsPage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "projects/new",
        element: <ProjectNewPage />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetailsPage />,
      },
      {
        path: "tasks/board",
        element: <TasksBoardPage />,
      },
      {
        path: "proposals",
        children: [
          {
            index: true,
            element: <ProposalsPage />,
          },
          {
            path: "new",
            element: <ProposalNewPage />,
          },
          {
            path: ":id",
            element: <ProposalDetailsPage />,
          },
        ],
      },
      {
        path: "daily-reports",
        element: <DailyReportsPage />,
      },
      {
        path: "expenses",
        element: <ExpensesPage />,
      },
      {
        path: "invoices",
        children: [
          {
            index: true,
            element: <InvoicesPage />,
          },
          {
            path: "new",
            element: <InvoiceNewPage />,
          },
          {
            path: ":id",
            element: <InvoiceDetailsPage />,
          },
        ],
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "files",
        element: <FilesPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
