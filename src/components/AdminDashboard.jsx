import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [facilitatorName, setFacilitatorName] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [students, setStudents] = useState([]);
  const [timeFilter, setTimeFilter] = useState("Weekly");

  useEffect(() => {
    const savedAdmin = localStorage.getItem("active_admin");
    if (savedAdmin) {
      setFacilitatorName(savedAdmin);
      setIsLogged(true);
      loadStudents(savedAdmin);
    }
  }, []);

  const loadStudents = (adminName) => {
    const allUsers = JSON.parse(localStorage.getItem("sadhna_users")) || [];
    const loggedInEmails = JSON.parse(localStorage.getItem("logged_in_users")) || [];
    const myStudents = allUsers.filter(u => u.facilitator === adminName && loggedInEmails.includes(u.email));
    setStudents(myStudents);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (!facilitatorName) return alert("Select Facilitator Name");
    localStorage.setItem("active_admin", facilitatorName);
    setIsLogged(true);
    loadStudents(facilitatorName);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("active_admin");
    setIsLogged(false);
    setFacilitatorName("");
    navigate("/");
  };

  const getStudentProgress = (history) => {
    if (!history || history.length === 0) return 0;
    const now = new Date();
    let filtered = [];
    
    if (timeFilter === "Daily") {
      filtered = history.filter(i => new Date(i.date).toLocaleDateString() === now.toLocaleDateString());
    } else {
      const days = timeFilter === "Weekly" ? 7 : timeFilter === "Monthly" ? 30 : 365;
      filtered = history.filter(i => (now - new Date(i.date)) / 86400000 <= days);
    }
    
    if (!filtered.length) return 0;
    return Math.round((filtered.reduce((s, i) => s + i.points, 0) / (filtered.length * 50)) * 100);
  };

  if (!isLogged) {
    return (
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <h2 className={styles.heading}>Admin Panel</h2>
          <form onSubmit={handleAdminLogin}>
            <select className={styles.inputBox} onChange={(e) => setFacilitatorName(e.target.value)} defaultValue="" required>
              <option value="" disabled>Select Your Name</option>
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
            <button type="submit" className={styles.enterBtn}>Enter Dashboard</button>
          </form>
          <button onClick={() => navigate("/")} className={styles.backBtn}>← Back to User Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashContainer}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>Dashboard</h2>
          <p className={styles.headerSub}>Facilitator: {facilitatorName}</p>
        </div>
        <button onClick={handleAdminLogout} className={styles.logoutBtn}>Logout Admin</button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeaderWrap}>
          <h3 className={styles.tableTitle}>Currently Active Students</h3>
          <select className={styles.selectFilter} value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
            <option value="Daily">Daily Score</option>
            <option value="Weekly">Weekly Average</option>
            <option value="Monthly">Monthly Average</option>
            <option value="Yearly">Yearly Average</option>
          </select>
        </div>

        {students.length === 0 ? (
          <p className={styles.emptyMessage}>Abhi aapka koi bhi student logged in nahi hai.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Student Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Phone</th>
                  <th className={styles.th} style={{textAlign: 'center'}}>Total Entries</th>
                  <th className={styles.th} style={{textAlign: 'center'}}>{timeFilter} Score</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const score = getStudentProgress(student.history);
                  const scoreClass = score >= 80 ? styles.scoreGreen : score >= 50 ? styles.scoreOrange : styles.scoreRed;
                  
                  return (
                    <tr key={student.email} className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdName}`}><span className={styles.activeDot}></span>{student.name}</td>
                      <td className={styles.td}>{student.email}</td>
                      <td className={styles.td}>{student.phone}</td>
                      <td className={styles.badgeWrap}><span className={styles.badge}>{student.history?.length || 0}</span></td>
                      <td className={styles.badgeWrap}><span className={scoreClass}>{score}%</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;