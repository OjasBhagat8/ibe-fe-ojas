import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Landing from "../pages/Landing/Landing";
import RoomResults from "../pages/RoomResults/RoomResults";
import Checkout from "../pages/Checkout";
import Confirmation from "../pages/confirmation/Confirmation";
import MyBookings from "../pages/MyBookings";
import AuthCallback from "../pages/AuthCallback";
import SignoutCallback from "../pages/SignoutCallback";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import HousekeepingAuthGuard from "../layouts/HousekeepingAuthGuard";
import StaffLayout from "../layouts/StaffLayout";
import StaffLoginPage from "../pages/housekeeping/Login/StaffLoginPage";
import SupervisorLoginPage from "../pages/housekeeping/Login/SupervisorLoginPage";
import StaffOverviewPage from "../pages/housekeeping/StaffOverview/StaffOverviewPage";
import MyTasksPage from "../pages/housekeeping/MyTasks/MyTasksPage";
import ClockInOutPage from "../pages/housekeeping/ClockInOut/ClockInOutPage";
import ApplyLeavePage from "../pages/housekeeping/ApplyLeave/ApplyLeavePage";
import ShiftProgressPage from "../pages/housekeeping/ShiftProgress/ShiftProgressPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/hilton" />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/auth/signout",
    element: <SignoutCallback />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/:tenantName/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/:tenantName",
    children: [
      // --- Booking flow (existing) ---
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Landing />,
          },
          {
            path: "room-results",
            element: <RoomResults />,
          },
          {
            path: "checkout",
            element: <Checkout />,
          },
          {
            path: "confirmation",
            element: <Confirmation />,
          },
          {
            path: "my-bookings",
            element: <MyBookings />,
          },
        ],
      },

      // --- Supervisor login (no auth guard) ---
      {
        path: "supervisor/login",
        element: <SupervisorLoginPage />,
      },

      // --- Staff login (no auth guard) ---
      {
        path: "staff/login",
        element: <StaffLoginPage />,
      },

      // --- Staff portal (protected) ---
      {
        path: "staff",
        element: <HousekeepingAuthGuard />,
        children: [
          {
            element: <StaffLayout />,
            children: [
              {
                path: "overview",
                element: <StaffOverviewPage />,
              },
              {
                path: "tasks",
                element: <MyTasksPage />,
              },
              {
                path: "clock",
                element: <ClockInOutPage />,
              },
              {
                path: "leave",
                element: <ApplyLeavePage />,
              },
              {
                path: "progress",
                element: <ShiftProgressPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
