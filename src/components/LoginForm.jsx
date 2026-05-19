import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LoginForm.module.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const activeUser = localStorage.getItem("active_user_email");
    if (activeUser) navigate("/progress");
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("sadhna_users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      let loggedInUsers = JSON.parse(localStorage.getItem("logged_in_users")) || [];
      if (!loggedInUsers.includes(email)) loggedInUsers.push(email);
      localStorage.setItem("logged_in_users", JSON.stringify(loggedInUsers));
      localStorage.setItem("active_user_email", email); 
      navigate("/progress");
    } else {
      alert("Invalid Email or Password! Sahi details bhariye.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email id" className={styles.inputBox} autoComplete="off" required onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className={`${styles.inputBox} ${styles.inputLast}`} autoComplete="new-password" required onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className={styles.loginBtn}>Login</button>

          <div className={styles.adminLinkWrap}>
            <Link to="/admin" className={styles.adminLink}>👨‍🏫 Login as Facilitator</Link>
          </div>

          <p className={styles.footerText}>
            Don't have an account? 
            <Link to="/sign-up" className={styles.signupLink}>Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;