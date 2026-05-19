import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  container: { padding: "20px", maxWidth: "900px", margin: "0 auto" },
  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  switcher: {
    background: "#2c3e50",
    color: "white",
    padding: "15px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  dropdown: {
    position: "absolute",
    top: "60px",
    width: "100%",
    background: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    borderRadius: "12px",
    zIndex: 10,
    border: "1px solid #eee",
    left: 0,
  },
  dropItem: {
    padding: "12px 20px",
    borderBottom: "1px solid #eee",
    color: "#333",
    cursor: "pointer",
  },
  inputBox: {
    width: "65px",
    padding: "10px",
    textAlign: "center",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
  },
  flexRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    margin: "10px 0",
    flexWrap: "wrap",
  },
  progressCircle: (perc) => ({
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    margin: "0 auto",
    background:
      perc > 0
        ? `conic-gradient(#4caf50 ${perc * 3.6}deg, #e0e0e0 0deg)`
        : "#e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.4s",
  }),
  innerCircle: {
    width: "120px",
    height: "120px",
    background: "#fff",
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  td: (isRed) => ({
    padding: "10px",
    border: "1px solid #eee",
    textAlign: "center",
    fontSize: "11px",
    backgroundColor: isRed ? "#fff0f0" : "transparent",
    color: isRed ? "#d32f2f" : "#333",
    fontWeight: isRed ? "bold" : "normal",
  }),
};

const MainReport = () => {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showSwitch, setShowSwitch] = useState(false);
  const [view, setView] = useState("Daily");
  const [formData, setFormData] = useState({
    wakeH: "",
    wakeM: "",
    wakeF: "AM",
    rounds: "",
    chantH: "",
    chantM: "",
    chantF: "AM",
    readH: "",
    readM: "",
    didHear: "No",
    hearH: "",
    hearM: "",
    sleepH: "",
    sleepM: "",
    sleepF: "PM",
  });

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("active_session"));
    const users = JSON.parse(localStorage.getItem("sadhna_users")) || [];
    if (!session) return navigate("/");
    setActiveSession(session);
    setAllUsers(users);
  }, [navigate]);

  const currentUser = allUsers.find(
    (u) => u.email === activeSession?.email,
  ) || { history: [] };

  // --- STRICT RULES LOGIC ---
  const getSleepDur = (d) => {
    let sH = parseInt(d.sleepH),
      wH = parseInt(d.wakeH);
    if (d.sleepF === "PM" && sH !== 12) sH += 12;
    if (d.wakeF === "AM" && wH === 12) wH = 0;
    else if (d.wakeF === "PM" && wH !== 12) wH += 12;
    let sM = sH * 60 + (parseInt(d.sleepM) || 0),
      wM = wH * 60 + (parseInt(d.wakeM) || 0);
    if (wM <= sM) wM += 1440;
    return (wM - sM) / 60;
  };

  const rules = {
    wake: (d) =>
      d.wakeF === "AM" &&
      (parseInt(d.wakeH) < 5 ||
        (parseInt(d.wakeH) === 5 && (parseInt(d.wakeM) || 0) === 0) ||
        parseInt(d.wakeH) === 12),
    chant: (d) =>
      parseInt(d.rounds) >= 16 &&
      d.chantF === "AM" &&
      (parseInt(d.chantH) < 8 ||
        (parseInt(d.chantH) === 8 && (parseInt(d.chantM) || 0) === 0) ||
        parseInt(d.chantH) === 12),
    read: (d) =>
      (parseInt(d.readH) || 0) >= 1 || (parseInt(d.readM) || 0) >= 60,
    hear: (d) =>
      d.didHear === "Yes" &&
      ((parseInt(d.hearH) || 0) >= 1 || (parseInt(d.hearM) || 0) >= 60),
    sleep: (d) =>
      d.sleepF === "PM" &&
      (parseInt(d.sleepH) === 10 ||
        (parseInt(d.sleepH) < 10 && parseInt(d.sleepH) !== 12)) &&
      getSleepDur(d) <= 7.01,
  };

  const getProgress = () => {
    const now = new Date();
    const days =
      view === "Daily"
        ? 0
        : view === "Weekly"
          ? 7
          : view === "Monthly"
            ? 30
            : 365;
    const filtered = currentUser.history.filter((i) => {
      const diff = (now - new Date(i.date)) / 86400000;
      return view === "Daily"
        ? new Date(i.date).toLocaleDateString() === now.toLocaleDateString()
        : diff <= days;
    });
    if (!filtered.length) return 0;
    return Math.round(
      (filtered.reduce((s, i) => s + i.points, 0) / (filtered.length * 50)) *
        100,
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let pts = 0;
    if (rules.wake(formData)) pts += 10;
    if (rules.chant(formData)) pts += 10;
    if (rules.read(formData)) pts += 10;
    if (rules.hear(formData)) pts += 10;
    if (rules.sleep(formData)) pts += 10;
    const updatedUsers = allUsers.map((u) => {
      if (u.email === activeSession.email) {
        const cleanHist = u.history.filter(
          (h) =>
            new Date(h.date).toLocaleDateString() !==
            new Date().toLocaleDateString(),
        );
        return {
          ...u,
          history: [
            ...cleanHist,
            { date: new Date().toISOString(), points: pts, ...formData },
          ],
        };
      }
      return u;
    });
    localStorage.setItem("sadhna_users", JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    alert("Sadhna Submitted Successfully!");
  };

  const handleInput = (n, v, max) => {
    if (/^\d*$/.test(v) && (v === "" || parseInt(v) <= max))
      setFormData({ ...formData, [n]: v });
  };
  const handleBlur = (n, v) => {
    if (v.length === 1) setFormData({ ...formData, [n]: "0" + v });
  };

  return (
    <div style={styles.container}>
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <div style={styles.switcher} onClick={() => setShowSwitch(!showSwitch)}>
          <span>
            Active User: <strong>{activeSession?.name}</strong>
          </span>
          <span>{showSwitch ? "▲" : "▼"}</span>
        </div>
        {showSwitch && (
          <div style={styles.dropdown}>
            {allUsers.map((u) => (
              <div
                key={u.email}
                style={styles.dropItem}
                onClick={() => {
                  localStorage.setItem(
                    "active_session",
                    JSON.stringify({
                      email: u.email,
                      name: u.name,
                      role: "user",
                    }),
                  );
                  window.location.reload();
                }}
              >
                {u.name} <small>({u.email})</small>
              </div>
            ))}
            <div
              style={{ ...styles.dropItem, color: "green", fontWeight: "bold" }}
              onClick={() => navigate("/sign-up")}
            >
              + Add New Account
            </div>
            <div
              style={{ ...styles.dropItem, color: "red" }}
              onClick={() => {
                localStorage.removeItem("active_session");
                navigate("/");
              }}
            >
              Logout All
            </div>
          </div>
        )}
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {["Daily", "Weekly", "Monthly", "Yearly"].map((t) => (
            <button
              key={t}
              onClick={() => setView(t)}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background: view === t ? "#4caf50" : "#eee",
                color: view === t ? "white" : "#666",
                fontWeight: "bold",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={styles.progressCircle(getProgress())}>
          <div style={styles.innerCircle}>
            <h1 style={{ margin: 0, color: "#4caf50" }}>{getProgress()}%</h1>
            <small>{view} Progress</small>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
          Daily Sadhna Card
        </h3>
        <h4>1. Wake Up ($\le$ 5:00 AM)</h4>
        <div style={styles.flexRow}>
          <input
            type="text"
            placeholder="HH"
            style={styles.inputBox}
            value={formData.wakeH}
            onChange={(e) => handleInput("wakeH", e.target.value, 12)}
            onBlur={(e) => handleBlur("wakeH", e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="MM"
            style={styles.inputBox}
            value={formData.wakeM}
            onChange={(e) => handleInput("wakeM", e.target.value, 59)}
            onBlur={(e) => handleBlur("wakeM", e.target.value)}
            required
          />
          <select
            style={styles.inputBox}
            value={formData.wakeF}
            onChange={(e) =>
              setFormData({ ...formData, wakeF: e.target.value })
            }
          >
            <option>AM</option>
            <option>PM</option>
          </select>
        </div>
        <h4>2. Chanting (16 Rds by $\le$ 8:00 AM)</h4>
        <div style={styles.flexRow}>
          <input
            type="text"
            placeholder="Rds"
            style={styles.inputBox}
            value={formData.rounds}
            onChange={(e) => handleInput("rounds", e.target.value, 108)}
          />
          <input
            type="text"
            placeholder="HH"
            style={styles.inputBox}
            value={formData.chantH}
            onChange={(e) => handleInput("chantH", e.target.value, 12)}
            onBlur={(e) => handleBlur("chantH", e.target.value)}
          />
          <select
            style={styles.inputBox}
            value={formData.chantF}
            onChange={(e) =>
              setFormData({ ...formData, chantF: e.target.value })
            }
          >
            <option>AM</option>
            <option>PM</option>
          </select>
        </div>
        <h4>3. Reading & Hearing (1 Hr+ each)</h4>
        <div style={styles.flexRow}>
          <input
            type="text"
            placeholder="Read Hr"
            style={styles.inputBox}
            value={formData.readH}
            onChange={(e) => handleInput("readH", e.target.value, 23)}
          />
          <select
            style={{ padding: "10px", borderRadius: "8px" }}
            value={formData.didHear}
            onChange={(e) =>
              setFormData({ ...formData, didHear: e.target.value })
            }
          >
            <option value="No">No Hearing</option>
            <option value="Yes">Hear 1hr+</option>
          </select>
          {formData.didHear === "Yes" && (
            <input
              type="text"
              placeholder="Hear Hr"
              style={styles.inputBox}
              value={formData.hearH}
              onChange={(e) => handleInput("hearH", e.target.value, 23)}
            />
          )}
        </div>
        <h4>4. Sleep (By 10 PM & $\le$ 7h sleep)</h4>
        <div style={styles.flexRow}>
          <input
            type="text"
            placeholder="HH"
            style={styles.inputBox}
            value={formData.sleepH}
            onChange={(e) => handleInput("sleepH", e.target.value, 12)}
            onBlur={(e) => handleBlur("sleepH", e.target.value)}
            required
          />
          <select
            style={styles.inputBox}
            value={formData.sleepF}
            onChange={(e) =>
              setFormData({ ...formData, sleepF: e.target.value })
            }
          >
            <option>PM</option>
            <option>AM</option>
          </select>
        </div>
        <button
          type="submit"
          style={{
            background: "#ff9800",
            color: "white",
            width: "100%",
            padding: "15px",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "20px",
          }}
        >
          Save Report
        </button>
      </form>

      <div style={styles.card}>
        <h3>Sadhna History Log (Red = Missed)</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Score</th>
                <th style={styles.th}>WakeUp</th>
                <th style={styles.th}>Chant</th>
                <th style={styles.th}>Read</th>
                <th style={styles.th}>Hear</th>
                <th style={styles.th}>Sleep</th>
              </tr>
            </thead>
            <tbody>
              {currentUser.history
                .slice()
                .reverse()
                .map((i, idx) => (
                  <tr key={idx}>
                    <td style={styles.td(false)}>
                      {new Date(i.date).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        ...styles.td(false),
                        color: "#4caf50",
                        fontWeight: "bold",
                      }}
                    >
                      {(i.points / 50) * 100}%
                    </td>
                    <td style={styles.td(!rules.wake(i))}>
                      {i.wakeH}:{i.wakeM} {i.wakeF}
                    </td>
                    <td style={styles.td(!rules.chant(i))}>
                      {i.rounds}rds @ {i.chantH} {i.chantF}
                    </td>
                    <td style={styles.td(!rules.read(i))}>{i.readH}h</td>
                    <td style={styles.td(!rules.hear(i))}>{i.hearH || 0}h</td>
                    <td style={styles.td(!rules.sleep(i))}>
                      {i.sleepH} {i.sleepF}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MainReport;
