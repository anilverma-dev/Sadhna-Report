import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// NAYA: Navigate ko import kiya hai
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom"; 
import LoginForm from "./components/LoginForm.jsx";
import SignUp from "./components/SignUp.jsx";
import MainReport from "./components/MainReport.jsx";
import ProgressBar from "./components/ProgressBar/ProgressBar.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LoginForm /> },
      
      // 🔥 FIX 1: "/sign-up" se dash hata diya, ab ye Login page se match karega
      { path: "/signup", element: <SignUp /> }, 
      
      { path: "/progress", element: <MainReport /> },
      { path: "/sadhna-report", element: <ProgressBar /> },
      { path: "/admin", element: <AdminDashboard/> }, 
      
      // 🔥 FIX 2: Wildcard Route (Agar koi galat link dale, toh wapas Login par bhej do)
      { path: "*", element: <Navigate to="/" /> } 
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);