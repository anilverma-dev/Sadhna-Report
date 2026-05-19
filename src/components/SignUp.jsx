import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./SignUp.module.css";

const SignUp = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "", facilitator: "" });
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("sadhna_users")) || [];
    
    if (users.find(u => u.email === formData.email)) {
      alert("Yeh Email pehle se register hai! Login kariye.");
      return;
    }

    const newUser = { ...formData, history: [], role: "user" };
    users.push(newUser);
    localStorage.setItem("sadhna_users", JSON.stringify(users));
    
    let loggedInUsers = JSON.parse(localStorage.getItem("logged_in_users")) || [];
    if (!loggedInUsers.includes(formData.email)) loggedInUsers.push(formData.email);
    localStorage.setItem("logged_in_users", JSON.stringify(loggedInUsers));
    localStorage.setItem("active_user_email", formData.email);
    
    alert("Signup Successful!");
    navigate("/progress");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Create Account</h2>
        <form onSubmit={handleSignUp}>
          <input type="text" placeholder="Full Name" required className={styles.inputBox} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="email" placeholder="Email id" required className={styles.inputBox} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required className={styles.inputBox} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <input type="number" placeholder="Phone No" required className={styles.inputBox} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          
          <select className={`${styles.inputBox} ${styles.inputLast}`} required onChange={(e) => setFormData({...formData, facilitator: e.target.value})} defaultValue="">
            <option value="" disabled>Select Facilitator</option>
            <option value="Avinashi Govind Prabhuji">Avinashi Govind Prabhuji</option>
            <option value="Devash Baldev Prabhuji">Devash Baldev Prabhuji</option>
            <option value="Dev Krishna Prabhuji">Dev Krishna Prabhuji</option>
            <option value="Praneshwar Shyam Prabhuji">Praneshwar Shyam Prabhuji</option>
            <option value="Prajwal Prabhuji">Prajwal Prabhuji</option>
            <option value="Thust Madan Mohan Prabhuji">Thust Madan Mohan Prabhuji</option>
            <option value="Digvijay Gourang Prabhuji">Digvijay Gourang Prabhuji</option>
            <option value="Veerbhadra Prabhuji">Veerbhadra Prabhuji</option>
            <option value="Vishudh Parth Prabhuji">Vishudh Parth Prabhuji</option>
            <option value="Mohan Murari Prabhuji">Mohan Murari Prabhuji</option>
            <option value="Hitkar Vaman Prabhuji">Hitkar Vaman Prabhuji</option>
            <option value="Tribhang Kanai Prabhuji">Tribhang Kanai Prabhuji</option>
            <option value="Koshal Pati Prabhuji">Koshal Pati Prabhuji</option>
            <option value="Amal Gaur Prabhuji">Amal Gaur Prabhuji</option>
            <option value="Vimal Arjun Prabhuji">Vimal Arjun Prabhuji</option>
          </select>

          <button type="submit" className={styles.signupBtn}>Sign Up</button>
          
          <p className={styles.footerText}>
            Already have an account? 
            <Link to="/" className={styles.loginLink}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;