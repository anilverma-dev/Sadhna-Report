import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 🔥 NAYA: Loading state
  const navigate = useNavigate();

  const [isChecking, setIsChecking] = useState(true);

  const loggedInUsers =
    JSON.parse(localStorage.getItem("logged_in_users")) || [];
  const hasActiveSession = loggedInUsers.length > 0;

  useEffect(() => {
    const activeEmail = localStorage.getItem("active_user_email");
    if (activeEmail) {
      navigate("/progress");
    } else {
      setIsChecking(false);
    }
  }, [navigate]);

  // 🔥 NAYA: Async API Call for Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://sadhna-backend-api.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Backend se login successful ho gaya!
        localStorage.setItem("active_user_email", data.user.email);

        let sessions =
          JSON.parse(localStorage.getItem("logged_in_users")) || [];
        if (!sessions.includes(data.user.email)) sessions.push(data.user.email);
        localStorage.setItem("logged_in_users", JSON.stringify(sessions));

        // 🛠️ TRICK: Abhi ke liye backend ka data local storage me dal rahe hain
        // taaki aapka MainReport crash na ho. Agle step me hum MainReport ko theek karenge.
        let localUsers = JSON.parse(localStorage.getItem("sadhna_users")) || [];
        const existingIndex = localUsers.findIndex(
          (u) => u.email === data.user.email,
        );
        if (existingIndex >= 0) localUsers[existingIndex] = data.user;
        else localUsers.push(data.user);
        localStorage.setItem("sadhna_users", JSON.stringify(localUsers));

        navigate("/progress");
      } else {
        alert(data.message); // Backend se aayi hui error dikhayega (Jaise: Invalid Password)
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert(
        "Server se connect nahi ho paya. Backend chalu hai ya nahi check karein.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToAccount = () => {
    if (loggedInUsers.length > 0) {
      localStorage.setItem("active_user_email", loggedInUsers[0]);
      navigate("/progress");
    }
  };

  if (isChecking) {
    return <div style={{ minHeight: "100vh", background: "#f1f5f9" }}></div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f5f9",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
            fontWeight: "800",
            color: "#0f172a",
          }}
        >
          Welcome Back
        </h2>

        <form
          onSubmit={handleLogin}
          autoComplete="off"
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <input
            type="email"
            placeholder="Email id"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="false"
            name="hidden-email"
            style={{
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              outline: "none",
              fontSize: "15px",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            style={{
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              outline: "none",
              fontSize: "15px",
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "16px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(99,102,241,0.2)",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
            fontSize: "14px",
            color: "#64748b",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#6366f1",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Sign Up
          </Link>
        </p>

        {hasActiveSession && (
          <button
            onClick={handleBackToAccount}
            style={{
              width: "100%",
              padding: "14px",
              background: "#e2e8f0",
              color: "#475569",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
              marginTop: "12px",
              transition: "0.2s",
            }}
          >
            🔙 Back to My Account
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;
