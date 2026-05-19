import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MainReport.module.css";

const MainReport = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("Daily");
  const [allUsers, setAllUsers] = useState([]);
  const [activeEmail, setActiveEmail] = useState("");
  const [loggedInEmails, setLoggedInEmails] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    wakeH: "", wakeM: "", wakeF: "AM", rounds: "", chantH: "", chantM: "", chantF: "AM",
    readH: "", readM: "", didHear: "No", hearH: "", hearM: "", sleepH: "", sleepM: "", sleepF: "PM"
  });

  useEffect(() => {
    const email = localStorage.getItem("active_user_email");
    const sessionEmails = JSON.parse(localStorage.getItem("logged_in_users")) || [];
    const users = JSON.parse(localStorage.getItem("sadhna_users")) || [];
    if (!email) { navigate("/"); return; }
    setActiveEmail(email);
    setLoggedInEmails(sessionEmails);
    setAllUsers(users);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const currentUser = allUsers.find(u => u.email === activeEmail) || { history: [], name: "User" };

  const switchUser = (email) => {
    localStorage.setItem("active_user_email", email);
    setActiveEmail(email);
    setShowDropdown(false);
  };

  const handleLogoutCurrent = (e) => {
    e.stopPropagation();
    const updatedList = loggedInEmails.filter(email => email !== activeEmail);
    localStorage.setItem("logged_in_users", JSON.stringify(updatedList));
    setLoggedInEmails(updatedList);
    if (updatedList.length > 0) switchUser(updatedList[0]);
    else { localStorage.removeItem("active_user_email"); navigate("/"); }
  };

  const handleAddExisting = () => {
    localStorage.removeItem("active_user_email"); 
    navigate("/");
  };

  const rules = {
    wake: (d) => d.wakeF === "AM" && (parseInt(d.wakeH) < 5 || (parseInt(d.wakeH) === 5 && (parseInt(d.wakeM)||0) === 0) || parseInt(d.wakeH) === 12),
    chant: (d) => parseInt(d.rounds) >= 16 && d.chantF === "AM" && (parseInt(d.chantH) < 8 || (parseInt(d.chantH) === 8 && (parseInt(d.chantM)||0) === 0) || parseInt(d.chantH) === 12),
    read: (d) => (parseInt(d.readH)||0) >= 1 || (parseInt(d.readM)||0) >= 60,
    hear: (d) => d.didHear === "Yes" && ((parseInt(d.hearH)||0) >= 1 || (parseInt(d.hearM)||0) >= 60),
    sleep: (d) => d.sleepF === "PM" && (parseInt(d.sleepH) >= 10 && parseInt(d.sleepH) < 12)
  };

  const getProgress = () => {
    const now = new Date();
    let filtered = [];
    if (view === "Daily") {
      filtered = currentUser.history.filter(i => new Date(i.date).toLocaleDateString() === now.toLocaleDateString());
    } else {
      const days = view === "Weekly" ? 7 : view === "Monthly" ? 30 : 365;
      filtered = currentUser.history.filter(i => (now - new Date(i.date)) / 86400000 <= days);
    }
    if (!filtered.length) return 0;
    return Math.round((filtered.reduce((s, i) => s + i.points, 0) / (filtered.length * 50)) * 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let pts = 0; if(rules.wake(formData)) pts+=10; if(rules.chant(formData)) pts+=10; 
    if(rules.read(formData)) pts+=10; if(rules.hear(formData)) pts+=10; if(rules.sleep(formData)) pts+=10;

    const today = new Date().toLocaleDateString();
    const updatedUsers = allUsers.map(u => {
      if (u.email === activeEmail) {
        const cleanHistory = u.history.filter(h => new Date(h.date).toLocaleDateString() !== today);
        return { ...u, history: [...cleanHistory, { date: new Date().toISOString(), points: pts, ...formData }] };
      }
      return u;
    });
    setAllUsers(updatedUsers);
    localStorage.setItem("sadhna_users", JSON.stringify(updatedUsers));
    alert("Data Saved Successfully!");
  };

  const handleInput = (n, v, max) => { if (/^\d*$/.test(v) && (v === "" || parseInt(v) <= max)) setFormData({...formData, [n]: v}); };
  const handleBlur = (n, v) => { if (v.length === 1) setFormData({...formData, [n]: "0" + v}); };

  const currentProg = getProgress();
  const circleStyle = { background: currentProg > 0 ? `conic-gradient(#48bb78 ${currentProg * 3.6}deg, #edf2f7 0deg)` : "#edf2f7" };

  return (
    <div className={styles.container}>
      <div ref={dropdownRef} className={styles.header}>
        <div onClick={() => setShowDropdown(!showDropdown)} className={styles.userTrigger}>
          <div className={styles.avatarMain}>{currentUser.name.charAt(0).toUpperCase()}</div>
          {currentUser.name}
          <span className={`${styles.dropdownIcon} ${showDropdown ? styles.dropdownIconOpen : ""}`}>▼</span>
        </div>

        {showDropdown && (
          <div className={styles.dropdownMenu}>
            <div className={styles.dropdownList}>
              {loggedInEmails.map(email => {
                const u = allUsers.find(user => user.email === email);
                if (!u) return null;
                const isActive = email === activeEmail;
                return (
                  <div key={email} onClick={() => switchUser(email)} className={`${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ""}`}>
                    <div className={styles.avatarItem}>{u.name.charAt(0).toUpperCase()}</div>
                    <div className={styles.itemName}>
                      <p className={isActive ? styles.itemActiveName : ""}>{u.name}</p>
                    </div>
                    {isActive && <span className={styles.checkIcon}>✓</span>}
                  </div>
                )
              })}
            </div>
            <div onClick={handleAddExisting} className={styles.actionAdd}>+ Add Existing Account</div>
            <div onClick={handleLogoutCurrent} className={styles.actionLogout}>Log out {currentUser.name}</div>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.btnGroup}>
          {["Daily", "Weekly", "Monthly", "Yearly"].map(t => (
            <button key={t} className={view === t ? styles.activeBtn : styles.inactiveBtn} onClick={() => setView(t)}>{t}</button>
          ))}
        </div>
        <div className={styles.progressWrap}>
          <div className={styles.progressCircleBase} style={circleStyle}>
            <div className={styles.innerCircle}>
              <h1 className={styles.progressH1}>{currentProg}%</h1>
              <small className={styles.progressLabel}>{view}</small>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.card}>
        <h2 className={styles.formHeading}>Daily Sadhna Entry</h2>
        
        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}>🌅 1. Wake Up (By 5:00 AM)</h4>
          <div className={styles.gridRow}>
            <input type="text" placeholder="HH" className={styles.inputBox} value={formData.wakeH} onChange={e=>handleInput("wakeH", e.target.value, 12)} onBlur={e=>handleBlur("wakeH", e.target.value)} required />
            <input type="text" placeholder="MM" className={styles.inputBox} value={formData.wakeM} onChange={e=>handleInput("wakeM", e.target.value, 59)} onBlur={e=>handleBlur("wakeM", e.target.value)} required />
            <select className={styles.inputBox} value={formData.wakeF} onChange={e=>setFormData({...formData, wakeF: e.target.value})}><option>AM</option><option>PM</option></select>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}>📿 2. Chanting (16 Rds by 8:00 AM)</h4>
          <div className={styles.gridRow}>
            <input type="text" placeholder="Rounds" className={styles.inputBox} value={formData.rounds} onChange={e=>handleInput("rounds", e.target.value, 108)} />
            <input type="text" placeholder="HH" className={styles.inputBox} value={formData.chantH} onChange={e=>handleInput("chantH", e.target.value, 12)} onBlur={e=>handleBlur("chantH", e.target.value)} />
            <input type="text" placeholder="MM" className={styles.inputBox} value={formData.chantM} onChange={e=>handleInput("chantM", e.target.value, 59)} onBlur={e=>handleBlur("chantM", e.target.value)} />
            <select className={styles.inputBox} value={formData.chantF} onChange={e=>setFormData({...formData, chantF: e.target.value})}><option>AM</option><option>PM</option></select>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}>📖 3. Reading (1 Hr+)</h4>
          <div className={styles.gridRow}>
            <input type="text" placeholder="Hours" className={styles.inputBox} value={formData.readH} onChange={e=>handleInput("readH", e.target.value, 23)} />
            <input type="text" placeholder="Mins" className={styles.inputBox} value={formData.readM} onChange={e=>handleInput("readM", e.target.value, 59)} />
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}>🎧 4. Hearing (1 Hr+)</h4>
          <div className={styles.gridRow}>
            <select className={`${styles.inputBox} ${formData.didHear==="Yes" ? styles.inputBoxGreen : ""}`} value={formData.didHear} onChange={e=>setFormData({...formData, didHear: e.target.value})}><option value="No">Did not hear</option><option value="Yes">Yes, I heard</option></select>
            {formData.didHear === "Yes" && (
              <><input type="text" placeholder="Hours" className={styles.inputBox} value={formData.hearH} onChange={e=>handleInput("hearH", e.target.value, 23)} />
              <input type="text" placeholder="Mins" className={styles.inputBox} value={formData.hearM} onChange={e=>handleInput("hearM", e.target.value, 59)} /></>
            )}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}>😴 5. Sleep (By 10 PM & max 7h)</h4>
          <div className={styles.gridRow}>
            <input type="text" placeholder="HH" className={styles.inputBox} value={formData.sleepH} onChange={e=>handleInput("sleepH", e.target.value, 12)} onBlur={e=>handleBlur("sleepH", e.target.value)} required />
            <input type="text" placeholder="MM" className={styles.inputBox} value={formData.sleepM} onChange={e=>handleInput("sleepM", e.target.value, 59)} onBlur={e=>handleBlur("sleepM", e.target.value)} required />
            <select className={styles.inputBox} value={formData.sleepF} onChange={e=>setFormData({...formData, sleepF: e.target.value})}><option>PM</option><option>AM</option></select>
          </div>
        </div>
        
        <button type="submit" className={styles.submitBtn}>💾 Save Today's Report</button>
      </form>

      <div className={styles.card}>
        <h3 className={styles.historyHeading}>📋 History Log</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th><th className={styles.th}>Score</th><th className={styles.th}>WakeUp</th>
                <th className={styles.th}>Chant</th><th className={styles.th}>Read</th><th className={styles.th}>Hear</th><th className={styles.th}>Sleep</th>
              </tr>
            </thead>
            <tbody>
              {currentUser.history.slice().reverse().map((i, idx) => (
                <tr key={idx}>
                  <td className={styles.td}>{new Date(i.date).toLocaleDateString()}</td>
                  <td className={`${styles.td} ${styles.tdScore}`}>{(i.points/50)*100}%</td>
                  <td className={`${styles.td} ${!rules.wake(i) ? styles.tdMissed : ""}`}>{i.wakeH}:{i.wakeM} {i.wakeF}</td>
                  <td className={`${styles.td} ${!rules.chant(i) ? styles.tdMissed : ""}`}>{i.rounds} rds</td>
                  <td className={`${styles.td} ${!rules.read(i) ? styles.tdMissed : ""}`}>{i.readH||0}h {i.readM||0}m</td>
                  <td className={`${styles.td} ${!rules.hear(i) ? styles.tdMissed : ""}`}>{i.hearH||0}h {i.hearM||0}m</td>
                  <td className={`${styles.td} ${!rules.sleep(i) ? styles.tdMissed : ""}`}>{i.sleepH}:{i.sleepM} {i.sleepF}</td>
                </tr>
              ))}
              {currentUser.history.length === 0 && (
                <tr><td colSpan="7" className={styles.emptyRow}>No entries yet. Start your Sadhna!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MainReport;