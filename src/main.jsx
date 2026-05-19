import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
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
      { path: "/sign-up", element: <SignUp /> },
      { path: "/progress", element: <MainReport /> },
      { path: "/sadhna-report", element: <ProgressBar /> },
      { path: "/admin", element: <AdminDashboard/> }, 
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
