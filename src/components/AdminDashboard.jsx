import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashboard.module.css";

const facilitatorList = [
  "Avinashi Govind Prabhuji", "Devash Baldev Prabhuji", "Dev Krishna Prabhuji", 
  "Praneshwar Shyam Prabhuji", "Prajwal Prabhuji", "Thust Madan Mohan Prabhuji", 
  "Digvijay Gourang Prabhuji", "Veerbhadra Prabhuji", "Vishudh Parth Prabhuji", 
  "Mohan Murari Prabhuji", "Hitkar Vaman Prabhuji", "Tribhang Kanai Prabhuji", 
  "Koshal Pati Prabhuji", "Amal Gaur Prabhuji", "Vimal Arjun Prabhuji"
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("app_theme") || "light");
  const [facilitatorName, setFacilitatorName] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [students, setStudents] = useState([]);
  const [timeFilter, setTimeFilter] = useState("Weekly");
  const [expandedStudent, setExpandedStudent] = useState(null); 

  const [expMonth, setExpMonth] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");

  useEffect(() => {
    const savedAdmin = localStorage.getItem("active_admin");
    if (savedAdmin) {
      setFacilitatorName(savedAdmin);
      setIsLogged(true);
      loadStudents(savedAdmin);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("app_theme", newTheme);
  };

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

  // --- NAYA: COLOR PARITY VALIDATION LOGIC FOR ADMIN PANELS ---
  const getDuration = (h, m) => (parseInt(h) || 0) + (parseInt(m) || 0) / 60;
  
  const getTimeInHours = (h, m, f) => {
    if (!h && h !== "0") return 999; 
    let hh = parseInt(h); let mm = parseInt(m) || 0;
    if (f === "PM" && hh !== 12) hh += 12; if (f === "AM" && hh === 12) hh = 0;
    return hh + (mm / 60);
  };

  const getSleepDuration = (sh, sm, sf, wh, wm, wf) => {
    let sH = parseInt(sh) || 0, wH = parseInt(wh) || 0;
    if (sf === "PM" && sH !== 12) sH += 12; if (sf === "AM" && sH === 12) sH = 0;
    if (wf === "AM" && wH === 12) wH = 0; if (wf === "PM" && wH !== 12) wH += 12;
    let sMins = sH * 60 + (parseInt(sm) || 0), wMins = wH * 60 + (parseInt(wm) || 0);
    if (wMins <= sMins) wMins += 1440; return (wMins - sMins) / 60;
  };

  const evaluateEntry = (data, student) => {
    let role = data.role || "Student";
    let wakeP = 0, chantP = 0, readP = 0, hearP = 0, dutyP = 0, sleepP = 0, penP = 0;

    const tRounds = parseInt(data.targetRounds || student.targetRounds || 16); 
    const tRead = getDuration(data.targetReadH || student.targetReadH || 1, data.targetReadM || student.targetReadM || 0); 
    const tHear = getDuration(data.targetHearH || student.targetHearH || 1, data.targetHearM || student.targetHearM || 0);

    const tWake = getTimeInHours(data.wakeH, data.wakeM, data.wakeF);
    const tChant = getTimeInHours(data.chantH, data.chantM, data.chantF);
    const tSleep = getTimeInHours(data.sleepH, data.sleepM, data.sleepF);
    
    const dRead = getDuration(data.readH, data.readM);
    const dHear = data.didHear === "Yes" ? getDuration(data.hearH, data.hearM) : 0;
    const dSleep = getSleepDuration(data.sleepH, data.sleepM, data.sleepF, data.wakeH, data.wakeM, data.wakeF);

    if (role === "Brahmachari") wakeP = 10;
    else if (tWake <= 5.0) wakeP = 10;
    else if (tWake <= 6.0) wakeP = 5;

    if (parseInt(data.rounds) >= tRounds) {
        if (role === "Brahmachari") chantP = 10;
        else {
           if (tChant <= 8.0) chantP = 10;
           else if (tChant <= 9.0) chantP = 5;
        }
    }

    if (dRead >= tRead) readP = 10;
    else if (dRead >= tRead / 2 && tRead > 0) readP = 5;

    if (data.didHear === "Yes") {
       if (dHear >= tHear) hearP = 10;
       else if (dHear >= tHear / 2 && tHear > 0) hearP = 5;
    }

    if (role === "Student") {
      const studyHrs = getDuration(data.studyH, data.studyM);
      if (studyHrs >= 4) dutyP = 10;
      else if (studyHrs >= 3) dutyP = 5;
    } else if (role === "Working") {
      if (getDuration(data.workH, data.workM) > 0) dutyP = 10;
    } else if (role === "Brahmachari") {
      if (getDuration(data.sevaH, data.sevaM) > 0) dutyP = 10;
    }

    if (role === "Brahmachari") {
      if (dSleep <= 6.01) sleepP = 10; else if (dSleep <= 7.01) sleepP = 5;
    } else {
      if ((tSleep >= 12.0 && tSleep <= 22.0) && dSleep <= 7.01) sleepP = 10;
      else if ((tSleep >= 12.0 && tSleep <= 23.0) && dSleep <= 8.01) sleepP = 5;
    }

    const dDaySleep = getDuration(data.daySleepH, data.daySleepM); if (dDaySleep > 2.0) penP -= 10; else if (dDaySleep > 1.0) penP -= 5;
    const dWaste = getDuration(data.wasteH, data.wasteM); if (dWaste > 3.0) penP -= 10; else if (dWaste > 2.0) penP -= 5;

    let total = wakeP + chantP + readP + hearP + dutyP + sleepP + penP; if (total < 0) total = 0;
    return { wakeP, chantP, readP, hearP, dutyP, sleepP, penP, total };
  };

  const getStudentProgress = (history) => {
    if (!history || history.length === 0) return 0;
    const now = new Date(); let filtered = [];
    if (timeFilter === "Daily") filtered = history.filter(i => new Date(i.date).toLocaleDateString() === now.toLocaleDateString());
    else {
      const days = timeFilter === "Weekly" ? 7 : timeFilter === "Monthly" ? 30 : 365;
      filtered = history.filter(i => (now - new Date(i.date)) / 86400000 <= days);
    }
    if (!filtered.length) return 0;
    const maxPossPoints = filtered.reduce((s, i) => s + (i.maxPoints || 60), 0);
    const earnedPoints = filtered.reduce((s, i) => s + i.points, 0);
    return maxPossPoints === 0 ? 0 : Math.round((earnedPoints / maxPossPoints) * 100);
  };

  const getExpandedHistory = (history) => {
    let display = history.slice();
    if (expMonth) {
        const [year, month] = expMonth.split("-");
        display = display.filter(item => { const d = new Date(item.date); return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month); });
        display.reverse();
    } else if (expStart || expEnd) {
        display = display.filter(item => { const d = new Date(item.date).setHours(0,0,0,0); const s = expStart ? new Date(expStart).setHours(0,0,0,0) : 0; const e = expEnd ? new Date(expEnd).setHours(23,59,59,999) : Infinity; return d >= s && d <= e; });
        display.reverse();
    } else {
        display = display.slice(-7).reverse();
    }
    return display;
  };

  const handleShare = async (student, displayHistory) => {
    if(displayHistory.length === 0) return alert("Sadhna data filter khali hai!");
    
    let text = `*Sadhna Tracker Report for ${student.name}*\n------------------\n`;
    displayHistory.forEach(h => {
        const max = h.maxPoints || 60; const score = Math.round((h.points / max) * 100);
        text += `📅 *Date:* ${new Date(h.date).toLocaleDateString()} | *Score:* ${score}%\n`;
        text += `🌅 WakeUp: ${h.wakeH}:${h.wakeM} ${h.wakeF}\n`;
        text += `📿 Chant: ${h.rounds} rds\n`;
        text += `📖 Read: ${h.readH||0}h ${h.readM||0}m | 🎧 Hear: ${h.hearH||0}h ${h.hearM||0}m\n`;
        text += `💼 Activity: ${h.studyH||h.workH||h.sevaH||0}h ${h.studyM||h.workM||h.sevaM||0}m\n`;
        text += `😴 Sleep: ${h.sleepH}:${h.sleepM} ${h.sleepF}\n`;
        if (h.wasteH > 0) text += `⚠️ Waste: ${h.wasteH}h ${h.wasteM}m\n`;
        text += `------------------\n`;
    });

    if (navigator.share) {
        try { await navigator.share({ title: `Report - ${student.name}`, text: text }); } catch (err) { console.log(err); }
    } else {
        navigator.clipboard.writeText(text);
        alert("Report Details successfully copied! Aap WhatsApp par direct paste karke send kar sakte hain.");
    }
  };

  const handleExpand = (email) => {
      if(expandedStudent === email) setExpandedStudent(null);
      else { setExpandedStudent(email); setExpMonth(""); setExpStart(""); setExpEnd(""); }
  };

  if (!isLogged) {
    return (
      <div className={`${styles.container} ${theme === 'dark' ? styles.themeDark : styles.themeLight}`}>
        <div className={styles.loginCard}>
          <h2 className={styles.heading}>Admin Panel</h2>
          <form onSubmit={handleAdminLogin}>
            <select className={styles.inputBox} onChange={(e) => setFacilitatorName(e.target.value)} defaultValue="" required>
              <option value="" disabled>Select Your Name</option>
              {facilitatorList.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <button type="submit" className={styles.enterBtn}>Enter Dashboard</button>
          </form>
          <button onClick={() => navigate("/")} className={styles.backBtn}>← Back to User Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.dashContainer} ${theme === 'dark' ? styles.themeDark : styles.themeLight}`}>
      <div className={styles.header}>
        <div><h2 className={styles.headerTitle}>Dashboard</h2><p className={styles.headerSub}>Facilitator: {facilitatorName}</p></div>
        <div className={styles.headerActions}>
            <button className={styles.themeBtn} onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
            <button onClick={handleAdminLogout} className={styles.logoutBtn}>Logout Admin</button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeaderWrap}>
          <h3 className={styles.tableTitle}>Currently Active Students</h3>
          <select className={styles.selectFilter} value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
            <option value="Daily">Daily Score</option><option value="Weekly">Weekly Average</option><option value="Monthly">Monthly Average</option><option value="Yearly">Yearly Average</option>
          </select>
        </div>

        {students.length === 0 ? (
          <p className={styles.emptyMessage}>Abhi aapka koi bhi student logged in nahi hai.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Student Name</th><th>Email</th><th>Phone</th><th style={{textAlign: 'center'}}>Total Entries</th><th style={{textAlign: 'center'}}>{timeFilter} Score</th></tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const score = getStudentProgress(student.history);
                  const scoreClass = score >= 80 ? styles.scoreGreen : score >= 50 ? styles.scoreOrange : styles.scoreRed;
                  const isExpanded = expandedStudent === student.email;
                  const expHistory = isExpanded ? getExpandedHistory(student.history) : [];
                  
                  return (
                    <React.Fragment key={student.email}>
                        <tr className={styles.tr} onClick={() => handleExpand(student.email)}>
                        <td className={`${styles.td} ${styles.tdName}`}><span className={styles.activeDot}></span>{student.name} {isExpanded ? '▲' : '▼'}</td>
                        <td className={styles.td}>{student.email}</td><td className={styles.td}>{student.phone}</td>
                        <td className={styles.badgeWrap}><span className={styles.badge}>{student.history?.length || 0}</span></td>
                        <td className={styles.badgeWrap}><span className={scoreClass}>{score}%</span></td>
                        </tr>

                        {isExpanded && (
                            <tr className={styles.expandedRow}>
                                <td colSpan="5" className={styles.expandedContent}>
                                    <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", marginBottom:"15px", gap:"10px"}}>
                                        <h4 className={styles.expandedTitle}>Log Analysis for {student.name.split(' ')[0]}:</h4>
                                        <button className={styles.shareBtn} onClick={() => handleShare(student, expHistory)}>📤 Share Report Details</button>
                                    </div>
                                    <div className={styles.expandedFilters}>
                                        <span style={{fontSize:"13px", fontWeight:"bold"}}>Month:</span>
                                        <input type="month" value={expMonth} onChange={(e) => {setExpMonth(e.target.value); setExpStart(""); setExpEnd("");}} style={{padding:"6px", borderRadius:"6px"}}/>
                                        <span style={{fontSize:"12px", margin:"0 5px"}}>OR</span>
                                        <span style={{fontSize:"13px", fontWeight:"bold"}}>Date:</span>
                                        <input type="date" value={expStart} onChange={(e) => {setExpStart(e.target.value); setExpMonth("");}} style={{padding:"6px", borderRadius:"6px"}}/> - <input type="date" value={expEnd} onChange={(e) => {setExpEnd(e.target.value); setExpMonth("");}} style={{padding:"6px", borderRadius:"6px"}}/>
                                    </div>
                                    <div style={{overflowX: 'auto'}}>
                                        <table className={styles.innerTable}>
                                            <thead>
                                                <tr><th>Date</th><th>Score</th><th>WakeUp</th><th>Chant</th><th>Read</th><th>Hear</th><th>Duty</th><th>Waste</th><th>Sleep</th></tr>
                                            </thead>
                                            <tbody>
                                                {expHistory.map((h, i) => {
                                                    const ev = evaluateEntry(h, student);
                                                    const tdColorClass = (points) => { if (points === 10) return ""; if (points === 5) return styles.tdHalf; return styles.tdMissed; };
                                                    
                                                    // 🔥 NAYA FIX: Total Duration check
                                                    const wasteDur = (parseInt(h.wasteH) || 0) + (parseInt(h.wasteM) || 0) / 60;
                                                    const daySleepDur = (parseInt(h.daySleepH) || 0) + (parseInt(h.daySleepM) || 0) / 60;

                                                    return (
                                                    <tr key={i}>
                                                        <td>{new Date(h.date).toLocaleDateString()}</td>
                                                        <td className={styles.tdScore}>{Math.round((h.points/(h.maxPoints||60))*100)}%</td>
                                                        
                                                        <td className={tdColorClass(ev.wakeP)}>{h.wakeH}:{h.wakeM} {h.wakeF}</td>
                                                        <td className={tdColorClass(ev.chantP)}>{h.rounds} rds</td>
                                                        <td className={tdColorClass(ev.readP)}>{h.readH||0}h {h.readM||0}m</td>
                                                        <td className={tdColorClass(ev.hearP)}>{h.hearH||0}h {h.hearM||0}m</td>
                                                        <td className={tdColorClass(ev.dutyP)}>{h.studyH||h.workH||h.sevaH||0}h {h.studyM||h.workM||h.sevaM||0}m</td>
                                                        
                                                        {/* 🔥 UPDATED WASTE TIME COLOR LOGIC */}
                                                        <td style={{color: wasteDur > 2.0 ? (wasteDur > 3.0 ? "#ef4444" : "#d97706") : "inherit", fontWeight: wasteDur > 2.0 ? '700' : 'normal'}}>
                                                            {h.wasteH||0}h {h.wasteM||0}m
                                                        </td>
                                                        
                                                        {/* 🔥 UPDATED SLEEP & DAY SLEEP COLOR LOGIC */}
                                                        <td className={tdColorClass(ev.sleepP)}>
                                                            {h.sleepH}:{h.sleepM} {h.sleepF}
                                                            {(h.daySleepH > 0 || h.daySleepM > 0) && (
                                                                <div style={{fontSize: "11px", color: daySleepDur > 1.0 ? (daySleepDur > 2.0 ? "#ef4444" : "#d97706") : "var(--text-sub)", marginTop: "4px"}}>
                                                                    Day: {h.daySleepH||0}h {h.daySleepM||0}m
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )})}
                                                {expHistory.length === 0 && <tr><td colSpan="9">No data found for this filter.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
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