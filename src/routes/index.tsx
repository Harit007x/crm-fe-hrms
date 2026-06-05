import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "@/layouts/admin-layout";
import HRLayout from "@/layouts/hr-layout";

// Pages
import LoginPage from "@/pages/login/page";
import SignupPage from "@/pages/signup/page";
import ForgotPasswordPage from "@/pages/forgot-password/page";
import ResetPasswordPage from "@/pages/reset-password/page";

import DashboardPage from "@/pages/admin/dashboard/page";
import ProjectsPage from "@/pages/admin/projects/page";
import ProjectNewPage from "@/pages/admin/projects/new/page";
import ProjectDetailsPage from "@/pages/admin/projects/[id]/page";
import TasksBoardPage from "@/pages/admin/tasks/board/page";
import DailyReportsPage from "@/pages/admin/daily-reports/page";
import ExpensesPage from "@/pages/admin/expenses/page";
import UsersPage from "@/pages/admin/users/page";
import FilesPage from "@/pages/admin/files/page";
import SettingsPage from "@/pages/admin/settings/page";
import LeaveApplyPage from "@/pages/admin/leave-apply/page";
import EventsPage from "@/pages/admin/events/page";

// HR Pages
import HRDashboardPage from "@/pages/hr/dashboard/page";
import HRAttendancePage from "@/pages/hr/attendance/page";
import HRLeavesPage from "@/pages/hr/leaves/page";
import HRHolidaysPage from "@/pages/hr/holidays/page";
import HREventsPage from "@/pages/hr/events/page";

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
        path: "daily-reports",
        element: <DailyReportsPage />,
      },
      {
        path: "expenses",
        element: <ExpensesPage />,
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
      {
        path: "leave-apply",
        element: <LeaveApplyPage />,
      },
      {
        path: "events",
        element: <EventsPage />,
      },
    ],
  },

  // HR routes
  {
    path: "/hr",
    element: <HRLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/hr/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <HRDashboardPage />,
      },
      {
        path: "employees",
        element: <UsersPage />, // reusing admin users page
      },
      {
        path: "attendance",
        element: <HRAttendancePage />,
      },
      {
        path: "leaves",
        element: <HRLeavesPage />,
      },
      {
        path: "holidays",
        element: <HRHolidaysPage />,
      },
      {
        path: "events",
        element: <HREventsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
