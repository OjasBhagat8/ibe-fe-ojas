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
]);
