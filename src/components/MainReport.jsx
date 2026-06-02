import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MainReport.module.css";
import { 
  FiSun, FiBookOpen, FiHeadphones, FiBriefcase, FiMoon, 
  FiAlertTriangle, FiTarget, FiClipboard, FiCalendar, 
  FiEdit2, FiCamera, FiX, FiTrendingUp, FiAward, 
  FiCheck, FiLogOut, FiPlus, FiChevronDown, FiInfo, FiLock,
  FiSmartphone, FiMonitor 
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { FaOm, FaPrayingHands } from "react-icons/fa";

const translations = {
  en: {
    title: "Sadhna Rules & Points",
    wake: "Wake Up: Before 5:00 AM gives Full Points (10). Before 6:00 AM gives Half Points (5).",
    chant: "Chanting: Complete your target rounds. Before 8:00 AM gives Full Points (10). Before 9:00 AM gives Half Points (5).",
    readHear: "Reading & Hearing: Reaching your full target gives Full Points (10). Reaching half of your target gives Half Points (5).",
    duty: "Duty/Activity: Students: 4+ hours study = 10 Pts, 3+ hours = 5 Pts. Working/Seva: Any amount of time given gets Full 10 Pts.",
    sleep: "Night Sleep: Sleeping by 10 PM (max 7 hrs) = 10 Pts. Sleeping by 11 PM (max 8 hrs) = 5 Pts.",
    penalty: "Minus Points: Day Sleep: Over 1 hour = -5 Pts, Over 2 hours = -10 Pts. Waste Time: Over 2 hours = -5 Pts, Over 3 hours = -10 Pts.",
    targetLock: "Target Lock: Once you set your targets, you cannot lower them for 10 days. But you can always increase them!",
    close: "Close"
  },
  hi: {
    title: "साधना नियम और पॉइंट्स",
    wake: "उठने का समय: सुबह 5:00 बजे से पहले उठने पर पूरे 10 पॉइंट्स। 6:00 बजे तक उठने पर 5 पॉइंट्स।",
    chant: "जप: अपना टारगेट पूरा करें। सुबह 8:00 बजे तक पूरे 10 पॉइंट्स। 9:00 बजे तक 5 पॉइंट्स।",
    readHear: "पढ़ना और सुनना: अपना पूरा टारगेट करने पर 10 पॉइंट्स। आधा टारगेट करने पर 5 पॉइंट्स मिलेंगे।",
    duty: "कार्य / सेवा: छात्र (Student): 4 घंटे पढ़ने पर 10 Pts, 3 घंटे पर 5 Pts। नौकरी या सेवा पर पूरे 10 पॉइंट्स मिलेंगे।",
    sleep: "रात की नींद: रात 10 बजे तक सोने पर (अधिकतम 7 घंटे) 10 पॉइंट्स। 11 बजे तक सोने पर 5 पॉइंट्स।",
    penalty: "माइनस पॉइंट्स (पेनल्टी): दिन में 1 घंटे से ज्यादा सोने पर -5 Pts, 2 घंटे से ज्यादा पर -10 Pts कटेंगे। व्यर्थ समय 2 घंटे से ज्यादा होने पर -5 Pts कटेंगे।",
    targetLock: "टारगेट लॉक: एक बार टारगेट सेट करने के बाद आप उसे 10 दिनों तक कम नहीं कर सकते।",
    close: "बंद करें"
  }
};

const motivationalBios = [
  "Hare Krishna Hare Rama 🙏", 
  "Consistency is the key to devotion.", 
  "Trying to be a better servant daily.",
  "Chanting is my shelter.", 
  "Focusing on spiritual growth ✨", 
  "Radhe Radhe 🌺"
];

const facilitatorList = [
  "Avinashi Govind Prabhuji", "Devash Baldev Prabhuji", "Dev Krishna Prabhuji", 
  "Praneshwar Shyam Prabhuji", "Prajwal Prabhuji", "Thust Madan Mohan Prabhuji", 
  "Digvijay Gourang Prabhuji", "Veerbhadra Prabhuji", "Vishudh Parth Prabhuji", 
  "Mohan Murari Prabhuji", "Hitkar Vaman Prabhuji", "Tribhang Kanai Prabhuji", 
  "Koshal Pati Prabhuji", "Amal Gaur Prabhuji", "Vimal Arjun Prabhuji"
];

const MainReport = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("app_theme") || "light");
  const [view, setView] = useState("Daily");
  const [allUsers, setAllUsers] = useState([]); // Sirf dropdown menu dikhane ke liye
  const [activeEmail, setActiveEmail] = useState("");
  const [loggedInEmails, setLoggedInEmails] = useState([]);
  
  // 🔥 NAYA: Real Backend Database se User ka data yahan aayega
  const [currentUser, setCurrentUser] = useState({ history: [], name: "Loading...", gender: "Male" });

  const [showDropdown, setShowDropdown] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [lang, setLang] = useState("en");
  const dropdownRef = useRef(null);
  
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyOptions, setCopyOptions] = useState({ 
    wake: true, chant: true, readHear: true, duty: true, sleep: true, waste: true 
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", bio: "", photo: "", facilitator: "" });
  const [highlightDate, setHighlightDate] = useState(null);

  const [currentSessionId, setCurrentSessionId] = useState("");
  const [activeDevices, setActiveDevices] = useState([]);

  const getTodayStr = () => {
    const d = new Date(); 
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getMinDateStr = () => {
    const d = new Date(); 
    d.setDate(d.getDate() - 2); 
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  const [reportDate, setReportDate] = useState(getTodayStr());
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetData, setTargetData] = useState({
    targetRounds: "16", targetReadH: "1", targetReadM: "00", targetHearH: "1", targetHearM: "00"
  });

  const [formData, setFormData] = useState({
    role: "Student", wakeH: "", wakeM: "", wakeF: "AM", rounds: "", chantH: "", chantM: "", chantF: "AM",
    readH: "", readM: "", didHear: "No", hearH: "", hearM: "", sleepH: "", sleepM: "", sleepF: "PM",
    daySleepH: "", daySleepM: "", studyH: "", studyM: "", collegeArrH: "", collegeArrM: "", collegeArrF: "AM",
    collegeDepH: "", collegeDepM: "", collegeDepF: "PM", workH: "", workM: "", workArrH: "", workArrM: "", workArrF: "AM", 
    workDepH: "", workDepM: "", workDepF: "PM", sevaH: "", sevaM: "", wasteH: "", wasteM: ""
  });

  // 🔥 NAYA: Backend se Database load karne wala function
  const fetchUserData = async (email) => {
    try {
      const response = await fetch(`https://sadhna-backend-api.onrender.com/api/sadhna/userdata/${email}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data); // Backend ka data save ho gaya
      }
    } catch (error) {
      console.error("Backend fetch error:", error);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("active_user_email");
    const sessionEmails = JSON.parse(localStorage.getItem("logged_in_users")) || [];
    const users = JSON.parse(localStorage.getItem("sadhna_users")) || [];
    if (!email) { navigate("/"); return; }
    
    setActiveEmail(email); 
    setLoggedInEmails(sessionEmails); 
    setAllUsers(users); // Dropdown ke photos ke liye local copy
    
    // 🔥 Backend API call
    fetchUserData(email);

    let sId = localStorage.getItem("my_session_id");
    if (!sId) {
      sId = "sess_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("my_session_id", sId);
    }
    setCurrentSessionId(sId);

    const handleClickOutside = (e) => { 
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); 
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme); 
    localStorage.setItem("app_theme", newTheme);
  };

  const switchUser = (email) => { 
    localStorage.setItem("active_user_email", email); 
    setActiveEmail(email); 
    setShowDropdown(false); 
    fetchUserData(email); // Naye user ka data cloud se lao
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

  const openProfileModal = () => {
    setProfileData({
      name: currentUser.name || "", 
      bio: currentUser.bio || "", 
      photo: currentUser.photo || "", 
      facilitator: currentUser.facilitator || ""
    });

    let sessions = currentUser.activeSessions || [];
    if (sessions.length === 0) {
       sessions = [
         { id: currentSessionId, device: "Windows • Chrome", type: "desktop", lastActive: "Active now" },
         { id: "mock_2", device: "iPhone 13 • Safari", type: "mobile", lastActive: "Yesterday, 4:20 PM" }
       ];
    }
    setActiveDevices(sessions);
    setShowProfileModal(true);
  };

  const handleLogoutDevice = (sessionIdToLogout) => {
    if(window.confirm("Are you sure you want to log out from this specific device?")) {
        const updatedSessions = activeDevices.filter(s => s.id !== sessionIdToLogout);
        setActiveDevices(updatedSessions);
        alert("Device session successfully removed! (Mock)");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 2 * 1024 * 1024) return alert("Image size should be less than 2MB");
      const reader = new FileReader(); 
      reader.onloadend = () => setProfileData({ ...profileData, photo: reader.result }); 
      reader.readAsDataURL(file);
    }
  };

  // 🔥 NAYA: Save Profile API Call
  const saveProfile = async () => {
    const now = new Date().getTime(); 
    const isFacChanged = profileData.facilitator !== currentUser.facilitator;
    const updatePayload = {
      ...profileData,
      facilitatorLastUpdated: isFacChanged ? now : currentUser.facilitatorLastUpdated
    };

    try {
      const response = await fetch("https://sadhna-backend-api.onrender.com/api/sadhna/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeEmail, profileData: updatePayload })
      });

      if(response.ok) {
        setCurrentUser(prev => ({...prev, ...updatePayload}));
        
        // Dropdown menu ke update ke liye local me bhi rakh lete hain
        const updatedUsers = allUsers.map(u => u.email === activeEmail ? { ...u, ...updatePayload } : u);
        setAllUsers(updatedUsers); 
        localStorage.setItem("sadhna_users", JSON.stringify(updatedUsers)); 

        setShowProfileModal(false); 
        alert("Profile Updated Successfully in Cloud!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      alert("Server connection failed!");
    }
  };

  const facLastUpdated = currentUser.facilitatorLastUpdated || 0;
  const daysSinceFacChange = facLastUpdated ? (new Date().getTime() - facLastUpdated) / (1000 * 3600 * 24) : 999;
  const canChangeFacilitator = daysSinceFacChange >= 30;

  const handleCopyYesterday = () => {
    const selectedDateObj = new Date(reportDate); 
    selectedDateObj.setDate(selectedDateObj.getDate() - 1); 
    const prevDateStr = selectedDateObj.toLocaleDateString();
    const yesterdayData = currentUser.history.find(h => new Date(h.date).toLocaleDateString() === prevDateStr);
    
    if (!yesterdayData) { 
      alert("Aapne kal ka form nahi bhara tha!"); 
      setShowCopyModal(false); 
      return; 
    }

    let newData = { ...formData, role: yesterdayData.role || formData.role };
    if (copyOptions.wake) { newData.wakeH = yesterdayData.wakeH; newData.wakeM = yesterdayData.wakeM; newData.wakeF = yesterdayData.wakeF; }
    if (copyOptions.chant) { newData.rounds = yesterdayData.rounds; newData.chantH = yesterdayData.chantH; newData.chantM = yesterdayData.chantM; newData.chantF = yesterdayData.chantF; }
    if (copyOptions.readHear) { newData.readH = yesterdayData.readH; newData.readM = yesterdayData.readM; newData.didHear = yesterdayData.didHear; newData.hearH = yesterdayData.hearH; newData.hearM = yesterdayData.hearM; }
    if (copyOptions.duty) {
        newData.studyH = yesterdayData.studyH; newData.studyM = yesterdayData.studyM; 
        newData.collegeArrH = yesterdayData.collegeArrH; newData.collegeArrM = yesterdayData.collegeArrM; newData.collegeArrF = yesterdayData.collegeArrF; 
        newData.collegeDepH = yesterdayData.collegeDepH; newData.collegeDepM = yesterdayData.collegeDepM; newData.collegeDepF = yesterdayData.collegeDepF;
        newData.workH = yesterdayData.workH; newData.workM = yesterdayData.workM; 
        newData.workArrH = yesterdayData.workArrH; newData.workArrM = yesterdayData.workArrM; newData.workArrF = yesterdayData.workArrF; 
        newData.workDepH = yesterdayData.workDepH; newData.workDepM = yesterdayData.workDepM; newData.workDepF = yesterdayData.workDepF;
        newData.sevaH = yesterdayData.sevaH; newData.sevaM = yesterdayData.sevaM;
    }
    if (copyOptions.sleep) { 
      newData.sleepH = yesterdayData.sleepH; newData.sleepM = yesterdayData.sleepM; newData.sleepF = yesterdayData.sleepF; 
      newData.daySleepH = yesterdayData.daySleepH; newData.daySleepM = yesterdayData.daySleepM; 
    }
    if (copyOptions.waste) { 
      newData.wasteH = yesterdayData.wasteH; newData.wasteM = yesterdayData.wasteM; 
    }

    setFormData(newData); 
    setShowCopyModal(false); 
    alert("Data copied successfully!");
  };

  const getStreakAndBadge = () => {
    let streak = 0; let earlyCount = 0;
    const sortedDates = [...(currentUser.history || [])].sort((a,b) => new Date(b.date) - new Date(a.date));
    let currentDate = new Date(); currentDate.setHours(0,0,0,0); 
    let isEarlyBird = false;

    for (let i=0; i<sortedDates.length; i++) {
        let entryDate = new Date(sortedDates[i].date); entryDate.setHours(0,0,0,0);
        const diffDays = Math.round((currentDate - entryDate)/(1000*60*60*24));
        if (diffDays === 0 || diffDays === 1) { 
            streak++; currentDate = entryDate; 
            let wakeH = parseInt(sortedDates[i].wakeH);
            if (sortedDates[i].wakeF === "AM" && (wakeH < 5 || (wakeH === 12))) earlyCount++; 
            else earlyCount = 0; 
            if (earlyCount >= 7) isEarlyBird = true;
        } else if (diffDays > 1) break; 
    }
    return { streak, isEarlyBird };
  };

  const getChartData = () => {
    const last7 = (currentUser.history || []).slice(-7);
    return last7.map(i => {
      const max = i.maxPoints || 60;
      return { 
        day: new Date(i.date).toLocaleDateString('en-US', {weekday: 'short'}), 
        score: Math.round((i.points/max)*100), 
        fullDate: new Date(i.date).toLocaleDateString() 
      }; 
    });                                                                                                                                                               
  };

  const scrollToHistoryRow = (dateStr) => {
    setHighlightDate(null); 
    setTimeout(() => {
        setHighlightDate(dateStr); 
        const element = document.getElementById(`row-${dateStr}`);
        if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, 10);
    setTimeout(() => { setHighlightDate(null); }, 2500); 
  };

  const getDuration = (h, m) => (parseInt(h) || 0) + (parseInt(m) || 0) / 60;
  
  const getTimeInHours = (h, m, f) => {
    if (!h && h !== "0") return 999; 
    let hh = parseInt(h); let mm = parseInt(m) || 0;
    if (f === "PM" && hh !== 12) hh += 12; 
    if (f === "AM" && hh === 12) hh = 0; 
    return hh + (mm / 60);
  };

  const getSleepDuration = (sh, sm, sf, wh, wm, wf) => {
    let sH = parseInt(sh) || 0, wH = parseInt(wh) || 0;
    if (sf === "PM" && sH !== 12) sH += 12; 
    if (sf === "AM" && sH === 12) sH = 0;
    if (wf === "AM" && wH === 12) wH = 0; 
    if (wf === "PM" && wH !== 12) wH += 12;
    
    let sMins = sH * 60 + (parseInt(sm) || 0), wMins = wH * 60 + (parseInt(wm) || 0);
    if (wMins <= sMins) wMins += 1440; 
    return (wMins - sMins) / 60;
  };

  // 🔥 NAYA: Save Targets API Call
  const saveTargets = async () => {
    const oldRounds = parseInt(currentUser.targetRounds || "16"); 
    const oldRead = getDuration(currentUser.targetReadH || "1", currentUser.targetReadM || "00"); 
    const oldHear = getDuration(currentUser.targetHearH || "1", currentUser.targetHearM || "00");
    
    const newRounds = parseInt(targetData.targetRounds || "0"); 
    const newRead = getDuration(targetData.targetReadH || "0", targetData.targetReadM || "0"); 
    const newHear = getDuration(targetData.targetHearH || "0", targetData.targetHearM || "0");
    
    const isDecreased = (newRounds < oldRounds) || (newRead < oldRead) || (newHear < oldHear);
    const now = new Date().getTime(); 
    const lastUpdated = currentUser.targetLastUpdated || 0; 
    const daysPassed = (now - lastUpdated) / (1000 * 60 * 60 * 24);

    if (isDecreased && lastUpdated !== 0 && daysPassed < 10) { 
      alert(`RULE ALERT: Aap apna target abhi kam nahi kar sakte!\nKripya ${Math.ceil(10 - daysPassed)} din aur wait karein.`); 
      return; 
    }

    const payload = { ...targetData, targetLastUpdated: now };

    try {
      const response = await fetch("https://sadhna-backend-api.onrender.com/api/sadhna/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeEmail, targetData: payload })
      });

      if(response.ok) {
        setCurrentUser(prev => ({...prev, ...payload}));
        setIsEditingTarget(false); 
        alert("Targets Updated in Cloud Database!");
      }
    } catch(err) {
      alert("Target update failed.");
    }
  };

  const evaluateEntry = (data) => {
    let role = data.role || "Student"; 
    let wakeP = 0, chantP = 0, readP = 0, hearP = 0, dutyP = 0, sleepP = 0, penP = 0;
    
    const tRounds = parseInt(data.targetRounds || currentUser.targetRounds || 16); 
    const tRead = getDuration(data.targetReadH || currentUser.targetReadH || 1, data.targetReadM || currentUser.targetReadM || 0); 
    const tHear = getDuration(data.targetHearH || currentUser.targetHearH || 1, data.targetHearM || currentUser.targetHearM || 0);
    
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
    } 
    else if (role === "Working") { 
      if (getDuration(data.workH, data.workM) > 0) dutyP = 10; 
    } 
    else if (role === "Brahmachari") { 
      if (getDuration(data.sevaH, data.sevaM) > 0) dutyP = 10; 
    }
    
    if (role === "Brahmachari") { 
      if (dSleep <= 6.01) sleepP = 10; 
      else if (dSleep <= 7.01) sleepP = 5; 
    } 
    else { 
      if ((tSleep >= 12.0 && tSleep <= 22.0) && dSleep <= 7.01) sleepP = 10; 
      else if ((tSleep >= 12.0 && tSleep <= 23.0) && dSleep <= 8.01) sleepP = 5; 
    }

    const dDaySleep = getDuration(data.daySleepH, data.daySleepM); 
    if (dDaySleep > 2.0) penP -= 10; 
    else if (dDaySleep > 1.0) penP -= 5;
    
    const dWaste = getDuration(data.wasteH, data.wasteM); 
    if (dWaste > 3.0) penP -= 10; 
    else if (dWaste > 2.0) penP -= 5;

    let total = wakeP + chantP + readP + hearP + dutyP + sleepP + penP; 
    if (total < 0) total = 0;
    
    return { wakeP, chantP, readP, hearP, dutyP, sleepP, penP, total };
  };

  const getProgress = () => {
    let filtered = [];
    if (view === "Daily") { 
      const selDate = new Date(reportDate).toLocaleDateString(); 
      filtered = (currentUser.history || []).filter(i => new Date(i.date).toLocaleDateString() === selDate); 
    } 
    else { 
      const days = view === "Weekly" ? 7 : view === "Monthly" ? 30 : 365; 
      filtered = (currentUser.history || []).filter(i => (new Date() - new Date(i.date)) / 86400000 <= days); 
    }
    if (!filtered.length) return 0;
    
    const maxPossPoints = filtered.reduce((s, i) => s + (i.maxPoints || 60), 0);
    const earnedPoints = filtered.reduce((s, i) => s + i.points, 0);
    return maxPossPoints === 0 ? 0 : Math.round((earnedPoints / maxPossPoints) * 100);
  };

  const isReportAlreadyFilled = (currentUser.history || []).some(
    h => new Date(h.date).toLocaleDateString() === new Date(reportDate).toLocaleDateString()
  );

  // 🔥 NAYA: Form Submit karne par data MongoDB mein jayega
  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentTargets = { 
      targetRounds: currentUser.targetRounds || "16", 
      targetReadH: currentUser.targetReadH || "1", 
      targetReadM: currentUser.targetReadM || "00", 
      targetHearH: currentUser.targetHearH || "1", 
      targetHearM: currentUser.targetHearM || "00" 
    };
    const submitData = { ...formData, ...currentTargets }; 
    const evalData = evaluateEntry(submitData);
    const submissionDateStr = new Date(reportDate).toLocaleDateString();
    
    const savedISODate = new Date(reportDate); 
    savedISODate.setHours(23, 59, 59); 
    
    const entryDataPayload = { 
        date: savedISODate.toISOString(), 
        points: evalData.total, 
        maxPoints: 60, 
        ...submitData 
    };

    try {
        const response = await fetch("https://sadhna-backend-api.onrender.com/api/sadhna/entry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: activeEmail, entryData: entryDataPayload })
        });

        if(response.ok) {
            const data = await response.json();
            // Backend ne jo nayi history di, wo set kar li
            setCurrentUser(prev => ({...prev, history: data.history}));
            alert(`${submissionDateStr} Report ${isReportAlreadyFilled ? "Updated" : "Saved"} Successfully in Database!`);
        } else {
            alert("Report save hone me error aayi.");
        }
    } catch(err) {
        alert("Server connect nahi ho paya.");
    }
  };

  const handleInput = (n, v, max) => { 
    if (/^\d*$/.test(v)) { 
      if (v === "") setFormData({...formData, [n]: v}); 
      else if (parseInt(v) >= 0 && parseInt(v) <= max) setFormData({...formData, [n]: v}); 
    } 
  };
  const handleBlur = (n, v) => { 
    if (v.length === 1) setFormData({...formData, [n]: "0" + v}); 
  };

  let displayHistory = (currentUser.history || []).slice();
  
  if (filterMonth) {
    const [year, month] = filterMonth.split("-");
    displayHistory = displayHistory.filter(item => { 
      const d = new Date(item.date); 
      return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month); 
    });
    displayHistory.reverse();
  } else if (filterStart || filterEnd) {
    displayHistory = displayHistory.filter(item => { 
      const d = new Date(item.date).setHours(0,0,0,0); 
      const s = filterStart ? new Date(filterStart).setHours(0,0,0,0) : 0; 
      const e = filterEnd ? new Date(filterEnd).setHours(23,59,59,999) : Infinity; 
      return d >= s && d <= e; 
    });
    displayHistory.reverse();
  } else {
    displayHistory = displayHistory.slice(-7).reverse();
  }

  const availableRoles = currentUser.gender === "Female" ? ["Student", "Working"] : ["Student", "Working", "Brahmachari"];
  const tgtRounds = currentUser.targetRounds || "16"; 
  const tgtReadH = currentUser.targetReadH || "1"; 
  const tgtReadM = currentUser.targetReadM || "00"; 
  const tgtHearH = currentUser.targetHearH || "1"; 
  const tgtHearM = currentUser.targetHearM || "00";
  const { streak, isEarlyBird } = getStreakAndBadge();
  const chartData = getChartData();

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.themeDark : styles.themeLight}`}>

      {/* -------------------- MODALS -------------------- */}

      {/* 1. RULES MODAL */}
      {showRules && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}><FiBookOpen /> {translations[lang].title}</h3>
              <select className={styles.langSelect} value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
            
            <div className={styles.ruleItem}>
              <FiSun className={styles.ruleIcon}/> <span>{translations[lang].wake}</span>
            </div>
            <div className={styles.ruleItem}>
              <FaPrayingHands className={styles.ruleIcon}/> <span>{translations[lang].chant}</span>
            </div>
            <div className={styles.ruleItem}>
              <FiHeadphones className={styles.ruleIcon}/> <span>{translations[lang].readHear}</span>
            </div>
            <div className={styles.ruleItem}>
              <FiBriefcase className={styles.ruleIcon}/> <span>{translations[lang].duty}</span>
            </div>
            <div className={styles.ruleItem}>
              <FiMoon className={styles.ruleIcon}/> <span>{translations[lang].sleep}</span>
            </div>
            <div className={styles.ruleItem} style={{color: "#ef4444", borderColor: "#fed7d7", background: "rgba(239, 68, 68, 0.05)"}}>
              <FiAlertTriangle className={styles.ruleIcon} style={{color: "#ef4444"}}/> <span>{translations[lang].penalty}</span>
            </div>
            <div className={styles.ruleItem} style={{fontWeight: "bold", background: "rgba(14, 165, 233, 0.05)", borderColor: "rgba(14, 165, 233, 0.2)", color: "#0ea5e9"}}>
              <FiLock className={styles.ruleIcon} style={{color: "#0ea5e9"}}/> <span>{translations[lang].targetLock}</span>
            </div>
            
            <button className={styles.closeModalBtn} onClick={() => setShowRules(false)}><FiX /> {translations[lang].close}</button>
          </div>
        </div>
      )}

      {/* 2. COPY PREVIOUS DATA MODAL */}
      {showCopyModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}><FiClipboard/> Copy Previous Data</h3>
            </div>
            <p style={{marginBottom: "15px", fontSize: "14px"}}>Select which details you want to copy from yesterday:</p>
            
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={copyOptions.wake} onChange={e=>setCopyOptions({...copyOptions, wake: e.target.checked})} /> <FiSun/> Wake Up Time
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={copyOptions.chant} onChange={e=>setCopyOptions({...copyOptions, chant: e.target.checked})} /> <FaPrayingHands/> Chanting Rounds & Time
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={copyOptions.readHear} onChange={e=>setCopyOptions({...copyOptions, readHear: e.target.checked})} /> <FiHeadphones/> Reading & Hearing Time
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={copyOptions.duty} onChange={e=>setCopyOptions({...copyOptions, duty: e.target.checked})} /> <FiBriefcase/> Duty (Study/Work/Seva) & Timings
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={copyOptions.sleep} onChange={e=>setCopyOptions({...copyOptions, sleep: e.target.checked})} /> <FiMoon/> Night & Day Sleep
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={copyOptions.waste} onChange={e=>setCopyOptions({...copyOptions, waste: e.target.checked})} /> <FiAlertTriangle/> Waste Time
            </label>
            
            <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
              <button onClick={handleCopyYesterday} className={styles.closeModalBtn} style={{flex: 1, background: "#0d9488", color: "white"}}>
                <FiCheck/> Copy Selected
              </button>
              <button onClick={() => setShowCopyModal(false)} className={styles.closeModalBtn} style={{flex: 1}}>
                <FiX/> Cancel
              </button>                                                                                                                                     </div>
          </div>
        </div>
      )}

      {/* 3. PROFILE & DEVICES MODAL */}
      {showProfileModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}><FiEdit2/> Edit Profile</h3>
                <button onClick={() => setShowProfileModal(false)} style={{background:"transparent", border:"none", fontSize:"20px", cursor:"pointer", color:"var(--text-main)"}}><FiX/></button>
            </div>
            
            <div className={styles.profilePicWrap}>
                <label>
                    <img src={profileData.photo || "https://via.placeholder.com/100"} alt="Profile" className={styles.profilePicPreview} />
                    <div className={styles.uploadOverlay}><FiCamera/> Change</div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className={styles.uploadInput} />
                </label>
            </div>

            <input 
              type="text" 
              placeholder="Your Name" 
              className={styles.profileInputBox} 
              value={profileData.name} 
              onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
            />
            
            <textarea 
              placeholder="Write a short Bio..." 
              className={styles.profileInputBox} 
              rows="2" 
              value={profileData.bio} 
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
            ></textarea>
            
            <p style={{fontSize: "12px", color: "var(--text-sub)", margin: "-10px 0 5px"}}><FiInfo/> Suggestions:</p>
            <div className={styles.bioSuggestions}>
                {motivationalBios.map((b, i) => (
                    <span key={i} className={styles.bioChip} onClick={() => setProfileData({...profileData, bio: b})}>{b}</span>
                ))}
            </div>

            <div style={{marginTop: "20px"}}>
                <p style={{fontSize: "13px", fontWeight: "bold", margin: "0 0 5px", color: "var(--text-sub)"}}>Your Facilitator</p>
                <select className={styles.profileInputBox} value={profileData.facilitator} disabled={!canChangeFacilitator} onChange={(e) => setProfileData({...profileData, facilitator: e.target.value})}>
                    <option value="" disabled>Select Facilitator</option>
                    {facilitatorList.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                {!canChangeFacilitator && (
                    <p style={{fontSize: "12px", color: "#ef4444", marginTop: "-10px", display: "flex", alignItems:"center", gap:"5px"}}><FiLock/> You can change your facilitator after {Math.ceil(30 - daysSinceFacChange)} days.</p>
                )}
            </div>

            {/* DEVICE MANAGER UI */}
            <div style={{marginTop: "25px", borderTop: "1px solid var(--border-color)", paddingTop: "20px"}}>
              <p style={{fontSize: "15px", fontWeight: "800", margin: "0 0 10px", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px"}}>
                <FiSmartphone/> Active Devices
              </p>
              <p style={{fontSize: "12px", color: "var(--text-sub)", marginBottom: "15px"}}>
                Log out from any unrecognizable or old devices.
              </p>
              
              <div className={styles.deviceList}>
                {activeDevices.map(session => (
                    <div key={session.id} className={styles.deviceItem}>
                      <div className={styles.deviceInfo}>
                        {session.type === "mobile" ? <FiSmartphone className={styles.deviceIcon} /> : <FiMonitor className={styles.deviceIcon} />}
                        <div className={styles.deviceDetails}>
                          <h4>
                            {session.device} 
                            {session.id === currentSessionId && <span className={styles.currentDeviceBadge}>This Device</span>}
                          </h4>
                          <p>{session.lastActive}</p>
                        </div>
                      </div>
                      {session.id !== currentSessionId && (
                        <button onClick={() => handleLogoutDevice(session.id)} className={styles.deviceLogoutBtn}>Log out</button>
                      )}
                    </div>
                ))}
              </div>
            </div>

            <button onClick={saveProfile} className={styles.submitBtn} style={{marginTop: "20px"}}>
              <FiCheck/> Save Profile Changes
            </button>
          </div>
        </div>
      )}


      {/* -------------------- MAIN APP UI -------------------- */}

      {/* HEADER TOP BAR */}
      <div ref={dropdownRef} className={styles.header}>
        <div className={styles.userTriggerWrap}>
            <div onClick={() => setShowDropdown(!showDropdown)} className={styles.userTrigger}>
                {currentUser.photo ? (
                  <img src={currentUser.photo} className={styles.avatarMain} alt="avatar" />
                ) : (
                  <div className={styles.avatarMain}>{currentUser.name.charAt(0).toUpperCase()}</div>
                )}
                
                <div className={styles.userInfo}>
                    <div className={styles.userNameWrap}>
                      {currentUser.name}
                      <FiChevronDown className={`${styles.dropdownIcon} ${showDropdown ? styles.dropdownIconOpen : ""}`} />
                    </div>
                    {currentUser.bio && (
                      <div className={styles.userBioText}>✨ {currentUser.bio}</div>
                    )}
                </div>
            </div>
            <button className={styles.editProfileBtn} onClick={openProfileModal}><FiEdit2/> Edit</button>
        </div>

        <div className={styles.headerActions}>
            <button className={styles.themeBtn} onClick={toggleTheme}>
              {theme === 'light' ? <FiMoon/> : <FiSun/>}
            </button>
            <button className={styles.rulesBtn} onClick={() => setShowRules(true)}>
              <FiBookOpen/> Rules
            </button>
        </div>

        {/* DROPDOWN MENU */}
        {showDropdown && (
          <div className={styles.dropdownMenu}>
            <div className={styles.dropdownList}>
              {loggedInEmails.map(email => {
                const u = allUsers.find(user => user.email === email); 
                if (!u) return null; 
                const isActive = email === activeEmail;
                
                return (
                  <div key={email} onClick={() => switchUser(email)} className={`${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ""}`}>
                    {u.photo ? (
                      <img src={u.photo} className={styles.avatarItem} alt="avatar"/>
                    ) : (
                      <div className={styles.avatarItem}>{u.name.charAt(0).toUpperCase()}</div>
                    )}
                    <div className={styles.itemName}>
                      <p className={isActive ? styles.itemActiveName : ""}>{u.name}</p>
                    </div>
                    {isActive && <FiCheck className={styles.checkIcon} />}
                  </div>
                )
              })}
            </div>
            <div onClick={handleAddExisting} className={styles.actionAdd}><FiPlus/> Add Existing Account</div>
            <div onClick={handleLogoutCurrent} className={styles.actionLogout}><FiLogOut/> Log out {currentUser.name}</div>
          </div>
        )}
      </div>

      {/* GRAPH & STATS CARD */}
      <div className={styles.card}>
        <div className={styles.statsRow}>
            {streak > 0 && <div className={styles.statBadge}><FiTrendingUp/> {streak} Day Streak!</div>}
            {isEarlyBird && <div className={styles.earlyBadge}><FiAward/> Early Bird</div>}
        </div>
        
        <div className={styles.btnGroup}>
          {["Daily", "Weekly", "Monthly", "Yearly"].map(t => (
            <button key={t} className={view === t ? styles.activeBtn : styles.inactiveBtn} onClick={() => setView(t)}>{t}</button>
          ))}
        </div>
        
        <div className={styles.progressWrap}>
          <div className={styles.progressCircleBase} style={{background: getProgress() > 0 ? `conic-gradient(#10b981 ${getProgress() * 3.6}deg, var(--bg-hover) 0deg)` : 'var(--bg-hover)'}}>
            <div className={styles.innerCircle}>
              <h1 className={styles.progressH1}>{getProgress()}%</h1>
              <small className={styles.progressLabel}>{view}</small>
            </div>
          </div>
        </div>

        {chartData.length > 0 && view === "Daily" && (
            <div className={styles.chartContainer}>
                {chartData.map((d, i) => (
                    <div key={i} className={styles.barWrap} title={`${d.score}% - Click to view`} onClick={() => scrollToHistoryRow(d.fullDate)}>
                        <div className={styles.bar} style={{ height: `${d.score}%`, background: d.score >= 80 ? '#10b981' : d.score >= 50 ? '#f59e0b' : '#ef4444' }}></div>
                        <span className={styles.barLabel}>{d.day}</span>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* SADHNA FORM CARD */}
      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.formHeaderRow}>
            <h2 className={styles.formHeading}>Daily Sadhna Entry</h2>
            <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
                <div className={styles.dateSelector}>
                    <FiCalendar/> 
                    <input 
                      type="date" 
                      value={reportDate} 
                      onChange={(e) => setReportDate(e.target.value)} 
                      min={getMinDateStr()} 
                      max={getTodayStr()} 
                    />
                </div>
                <button type="button" className={styles.copyBtn} onClick={() => setShowCopyModal(true)}>
                    <FiClipboard/> Copy Prev Data
                </button>
            </div>
        </div>

        <div className={styles.roleContainer}>
          {availableRoles.map(r => (
            <div key={r} onClick={() => setFormData({...formData, role: r})} className={`${styles.roleBox} ${formData.role === r ? styles.roleBoxActive : ""}`}>
              {r === "Student" ? <><MdSchool/> Student</> : r === "Working" ? <><FiBriefcase/> Working</> : <><FaOm/> Brahmachari</>}
            </div>
          ))}
        </div>
        
        {/* Section 1: Wake Up */}
        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}><FiSun/> 1. Wake Up</h4>
          <p className={styles.sectionDesc}>{formData.role !== "Brahmachari" ? "≤ 5:00 AM (10 Pts) | ≤ 6:00 AM (5 Pts)" : "No time limit for Brahmachari"}</p>
          <div className={styles.gridRow}>
            <input type="text" placeholder="HH" maxLength="2" className={styles.inputBox} value={formData.wakeH} onChange={e=>handleInput("wakeH", e.target.value, 12)} onBlur={e=>handleBlur("wakeH", e.target.value)} required />
            <input type="text" placeholder="MM" maxLength="2" className={styles.inputBox} value={formData.wakeM} onChange={e=>handleInput("wakeM", e.target.value, 59)} onBlur={e=>handleBlur("wakeM", e.target.value)} required />
            <select className={styles.inputBox} value={formData.wakeF} onChange={e=>setFormData({...formData, wakeF: e.target.value})}>
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>

        {/* Dynamic Targets Setup */}
        <div className={styles.targetCard}>
          {!isEditingTarget ? (
            <>
              <p className={styles.targetText}>
                <FiTarget/> My Targets: 
                <span className={styles.targetBadge}>{tgtRounds} Rds</span>
                <span className={styles.targetBadge}>Read: {tgtReadH}h {tgtReadM}m</span>
                <span className={styles.targetBadge}>Hear: {tgtHearH}h {tgtHearM}m</span>
              </p>
              <button type="button" onClick={() => { setTargetData({ targetRounds: tgtRounds, targetReadH: tgtReadH, targetReadM: tgtReadM, targetHearH: tgtHearH, targetHearM: tgtHearM }); setIsEditingTarget(true); }} className={styles.editTargetBtn}>
                <FiEdit2/> Update Targets
              </button>
            </>
          ) : (
            <div style={{width: "100%"}}>
              <div style={{fontSize: "13px", color: "#ef4444", background: "rgba(239, 68, 68, 0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "15px", textAlign: "center", fontWeight: "bold"}}>
                <FiAlertTriangle/> Target Rule: Aap agle 10 din tak target kam nahi kar sakte.
              </div>
              
              <div className={styles.gridRowLarge}>
                <input type="text" placeholder="Target Rounds" value={targetData.targetRounds} onChange={e=>setTargetData({...targetData, targetRounds: e.target.value.replace(/\D/g, '')})} className={styles.inputBox} />
              </div>
              
              <div className={styles.gridRowLarge}>
                <input type="text" placeholder="Read Hrs" value={targetData.targetReadH} onChange={e=>setTargetData({...targetData, targetReadH: e.target.value.replace(/\D/g, '')})} className={styles.inputBox} />
                <input type="text" placeholder="Read Mins" value={targetData.targetReadM} onChange={e=>setTargetData({...targetData, targetReadM: e.target.value.replace(/\D/g, '')})} className={styles.inputBox} />
              </div>
              
              <div className={styles.gridRowLarge}>
                <input type="text" placeholder="Hear Hrs" value={targetData.targetHearH} onChange={e=>setTargetData({...targetData, targetHearH: e.target.value.replace(/\D/g, '')})} className={styles.inputBox} />
                <input type="text" placeholder="Hear Mins" value={targetData.targetHearM} onChange={e=>setTargetData({...targetData, targetHearM: e.target.value.replace(/\D/g, '')})} className={styles.inputBox} />
              </div>
              
              <div style={{display: "flex", gap: "10px", marginTop: "10px"}}>
                  <button type="button" onClick={saveTargets} className={styles.editTargetBtn} style={{flex: 1, background: "#10b981"}}><FiCheck/> Save Targets</button>
                  <button type="button" onClick={()=>setIsEditingTarget(false)} className={styles.editTargetBtn} style={{flex: 1, background: "#ef4444", boxShadow:"none"}}><FiX/> Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Chanting */}
        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}><FaPrayingHands/> 2. Chanting (Target: {tgtRounds} Rds)</h4>
          <p className={styles.sectionDesc}>{formData.role !== "Brahmachari" ? "≤ 8:00 AM (10 Pts) | ≤ 9:00 AM (5 Pts)" : "No time limit for Brahmachari"}</p>
          <div className={styles.gridRow}>
            <input type="text" placeholder="Rounds" maxLength="3" className={styles.inputBox} value={formData.rounds} onChange={e=>handleInput("rounds", e.target.value, 999)} required/>
            <input type="text" placeholder="HH" maxLength="2" className={styles.inputBox} value={formData.chantH} onChange={e=>handleInput("chantH", e.target.value, 12)} onBlur={e=>handleBlur("chantH", e.target.value)} />
            <input type="text" placeholder="MM" maxLength="2" className={styles.inputBox} value={formData.chantM} onChange={e=>handleInput("chantM", e.target.value, 59)} onBlur={e=>handleBlur("chantM", e.target.value)} />
            <select className={styles.inputBox} value={formData.chantF} onChange={e=>setFormData({...formData, chantF: e.target.value})}><option>AM</option><option>PM</option></select>
          </div>
        </div>

        {/* Section 3 & 4: Reading and Hearing */}
        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}><FiBookOpen/> 3. Reading (Target: {tgtReadH}h {tgtReadM}m)</h4>
          <p className={styles.sectionDesc}>≥ Target (10 Pts) | ≥ Half Target (5 Pts)</p>
          <div className={styles.gridRow}>
            <input type="text" placeholder="Hours" maxLength="2" className={styles.inputBox} value={formData.readH} onChange={e=>handleInput("readH", e.target.value, 23)} onBlur={e=>handleBlur("readH", e.target.value)} />
            <input type="text" placeholder="Mins" maxLength="2" className={styles.inputBox} value={formData.readM} onChange={e=>handleInput("readM", e.target.value, 59)} onBlur={e=>handleBlur("readM", e.target.value)} />
          </div>
          
          <h4 className={styles.sectionTitle} style={{marginTop: "20px"}}><FiHeadphones/> 4. Hearing (Target: {tgtHearH}h {tgtHearM}m)</h4>
          <p className={styles.sectionDesc}>≥ Target (10 Pts) | ≥ Half Target (5 Pts)</p>         <div className={styles.gridRow}>
            <select className={`${styles.inputBox} ${formData.didHear==="Yes" ? styles.inputBoxGreen : ""}`} value={formData.didHear} onChange={e=>setFormData({...formData, didHear: e.target.value})}>
              <option value="No">Did not hear</option>
              <option value="Yes">Yes, I heard</option>
            </select>
            {formData.didHear === "Yes" && (
              <>
                <input type="text" placeholder="Hours" maxLength="2" className={styles.inputBox} value={formData.hearH} onChange={e=>handleInput("hearH", e.target.value, 23)} onBlur={e=>handleBlur("hearH", e.target.value)} />
                <input type="text" placeholder="Mins" maxLength="2" className={styles.inputBox} value={formData.hearM} onChange={e=>handleInput("hearM", e.target.value, 59)} onBlur={e=>handleBlur("hearM", e.target.value)} />
              </>
            )}
          </div>
        </div>

        {/* Section 5: Role Duties */}
        <div className={styles.sectionCard}>
          {formData.role === "Student" && (
            <>
              <h4 className={styles.sectionTitle}><MdSchool/> 5. Study Info</h4>
              <div className={styles.gridRowLarge}>
                <input type="text" placeholder="Study Hrs" maxLength="2" className={styles.inputBox} value={formData.studyH} onChange={e=>handleInput("studyH", e.target.value, 24)} onBlur={e=>handleBlur("studyH", e.target.value)} />
                <input type="text" placeholder="Study Mins" maxLength="2" className={styles.inputBox} value={formData.studyM} onChange={e=>handleInput("studyM", e.target.value, 59)} onBlur={e=>handleBlur("studyM", e.target.value)} />
              </div>
              <p className={styles.sectionDesc} style={{marginTop: "15px"}}>College Timings</p>
              <div className={styles.gridRow}>
                 <input type="text" placeholder="Arr HH" maxLength="2" className={styles.inputBox} value={formData.collegeArrH} onChange={e=>handleInput("collegeArrH", e.target.value, 12)} onBlur={e=>handleBlur("collegeArrH", e.target.value)} />
                 <input type="text" placeholder="MM" maxLength="2" className={styles.inputBox} value={formData.collegeArrM} onChange={e=>handleInput("collegeArrM", e.target.value, 59)} onBlur={e=>handleBlur("collegeArrM", e.target.value)} />
                 <select className={styles.inputBox} value={formData.collegeArrF} onChange={e=>setFormData({...formData, collegeArrF: e.target.value})}><option>AM</option><option>PM</option></select>
                 
                 <input type="text" placeholder="Dep HH" maxLength="2" className={styles.inputBox} value={formData.collegeDepH} onChange={e=>handleInput("collegeDepH", e.target.value, 12)} onBlur={e=>handleBlur("collegeDepH", e.target.value)} />
                 <input type="text" placeholder="MM" maxLength="2" className={styles.inputBox} value={formData.collegeDepM} onChange={e=>handleInput("collegeDepM", e.target.value, 59)} onBlur={e=>handleBlur("collegeDepM", e.target.value)} />
                 <select className={styles.inputBox} value={formData.collegeDepF} onChange={e=>setFormData({...formData, collegeDepF: e.target.value})}><option>PM</option><option>AM</option></select>
              </div>
            </>
          )}

          {formData.role === "Working" && (
            <>
              <h4 className={styles.sectionTitle}><FiBriefcase/> 5. Working Time</h4>
              <div className={styles.gridRowLarge}>
                <input type="text" placeholder="Work Hrs" maxLength="2" className={styles.inputBox} value={formData.workH} onChange={e=>handleInput("workH", e.target.value, 24)} onBlur={e=>handleBlur("workH", e.target.value)} />
                <input type="text" placeholder="Work Mins" maxLength="2" className={styles.inputBox} value={formData.workM} onChange={e=>handleInput("workM", e.target.value, 59)} onBlur={e=>handleBlur("workM", e.target.value)} />
              </div>
              <p className={styles.sectionDesc} style={{marginTop: "15px"}}>Office Timings</p>
              <div className={styles.gridRow}>
                 <input type="text" placeholder="Arr HH" maxLength="2" className={styles.inputBox} value={formData.workArrH} onChange={e=>handleInput("workArrH", e.target.value, 12)} onBlur={e=>handleBlur("workArrH", e.target.value)} />
                 <input type="text" placeholder="MM" maxLength="2" className={styles.inputBox} value={formData.workArrM} onChange={e=>handleInput("workArrM", e.target.value, 59)} onBlur={e=>handleBlur("workArrM", e.target.value)} />
                 <select className={styles.inputBox} value={formData.workArrF} onChange={e=>setFormData({...formData, workArrF: e.target.value})}><option>AM</option><option>PM</option></select>
                 
                 <input type="text" placeholder="Dep HH" maxLength="2" className={styles.inputBox} value={formData.workDepH} onChange={e=>handleInput("workDepH", e.target.value, 12)} onBlur={e=>handleBlur("workDepH", e.target.value)} />
                 <input type="text" placeholder="MM" maxLength="2" className={styles.inputBox} value={formData.workDepM} onChange={e=>handleInput("workDepM", e.target.value, 59)} onBlur={e=>handleBlur("workDepM", e.target.value)} />
                 <select className={styles.inputBox} value={formData.workDepF} onChange={e=>setFormData({...formData, workDepF: e.target.value})}><option>PM</option><option>AM</option></select>
              </div>
            </>
          )}

          {formData.role === "Brahmachari" && (
            <>
              <h4 className={styles.sectionTitle}><FaOm/> 5. Seva Time</h4>
              <div className={styles.gridRowLarge}>
                <input type="text" placeholder="Seva Hrs" maxLength="2" className={styles.inputBox} value={formData.sevaH} onChange={e=>handleInput("sevaH", e.target.value, 24)} onBlur={e=>handleBlur("sevaH", e.target.value)} />
                <input type="text" placeholder="Seva Mins" maxLength="2" className={styles.inputBox} value={formData.sevaM} onChange={e=>handleInput("sevaM", e.target.value, 59)} onBlur={e=>handleBlur("sevaM", e.target.value)} />
              </div>
            </>
          )}
        </div>

        {/* Section 6: Sleep */}
        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}><FiMoon/> 6. Sleep Details</h4>
          <p className={styles.sectionDesc}>Night Sleep: {formData.role !== "Brahmachari" ? "≤ 10PM & ≤ 7h (10 Pts) | ≤ 11PM & ≤ 8h (5 Pts)" : "Total sleep ≤ 6h (10 Pts) | ≤ 7h (5 Pts)"}</p>
          <div className={styles.gridRow}>
            <input type="text" placeholder="HH" maxLength="2" className={styles.inputBox} value={formData.sleepH} onChange={e=>handleInput("sleepH", e.target.value, 12)} onBlur={e=>handleBlur("sleepH", e.target.value)} required />
            <input type="text" placeholder="MM" maxLength="2" className={styles.inputBox} value={formData.sleepM} onChange={e=>handleInput("sleepM", e.target.value, 59)} onBlur={e=>handleBlur("sleepM", e.target.value)} required />
            <select className={styles.inputBox} value={formData.sleepF} onChange={e=>setFormData({...formData, sleepF: e.target.value})}><option>PM</option><option>AM</option></select>
          </div>

          <p className={styles.sectionDesc} style={{color: "#ef4444", marginTop: "15px"}}>Day Sleep (> 1 Hr = -5 Pts | > 2 Hrs = -10 Pts)</p>
          <div className={styles.gridRowLarge}>
            <input type="text" placeholder="Day HH" maxLength="2" className={styles.inputBox} value={formData.daySleepH} onChange={e=>handleInput("daySleepH", e.target.value, 24)} onBlur={e=>handleBlur("daySleepH", e.target.value)} />
            <input type="text" placeholder="Day MM" maxLength="2" className={styles.inputBox} value={formData.daySleepM} onChange={e=>handleInput("daySleepM", e.target.value, 59)} onBlur={e=>handleBlur("daySleepM", e.target.value)} />
          </div>
        </div>

        {/* Section 7: Waste */}
        <div className={`${styles.sectionCard} ${styles.sectionCardAlert}`}>
          <h4 className={`${styles.sectionTitle} ${styles.sectionTitleAlert}`}><FiAlertTriangle/> 7. Waste Time (> 2 Hrs = -5 Pts | > 3 Hrs = -10 Pts)</h4>
          <div className={styles.gridRowLarge}>
            <input type="text" placeholder="Waste Hrs" maxLength="2" className={styles.inputBox} value={formData.wasteH} onChange={e=>handleInput("wasteH", e.target.value, 24)} onBlur={e=>handleBlur("wasteH", e.target.value)} />
            <input type="text" placeholder="Waste Mins" maxLength="2" className={styles.inputBox} value={formData.wasteM} onChange={e=>handleInput("wasteM", e.target.value, 59)} onBlur={e=>handleBlur("wasteM", e.target.value)} />
          </div>
        </div>
        
        <button type="submit" className={styles.submitBtn}>
          <FiCheck/> {isReportAlreadyFilled ? "Update Report" : "Save Report"}
        </button>
      </form>

      {/* -------------------- HISTORY TABLE BLOCK -------------------- */}
      <div className={styles.card}>
        <div className={styles.historyHeader}>
          <h3 className={styles.historyHeading}><FiClipboard/> History Log</h3>
          
          <div className={styles.filterWrap}>
            <span className={styles.filterLabel}>Month:</span>
            <input 
              type="month" 
              className={styles.dateInput} 
              value={filterMonth} 
              onChange={(e) => {setFilterMonth(e.target.value); setFilterStart(""); setFilterEnd("");}} 
            />
            
            <span className={styles.dividerOr}>OR</span>
            
            <span className={styles.filterLabel}>Date:</span>
            <input type="date" className={styles.dateInput} value={filterStart} onChange={(e) => {setFilterStart(e.target.value); setFilterMonth("");}} />
            <span style={{color: "var(--text-sub)"}}>-</span>
            <input type="date" className={styles.dateInput} value={filterEnd} onChange={(e) => {setFilterEnd(e.target.value); setFilterMonth("");}} />
            
            {(filterStart || filterEnd || filterMonth) && (
              <button className={styles.filterBtn} onClick={() => {setFilterStart(""); setFilterEnd(""); setFilterMonth("");}}>Clear</button>
            )}
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Score</th>
                <th className={styles.th}>WakeUp</th>
                <th className={styles.th}>Chant</th>
                <th className={styles.th}>Read</th>
                <th className={styles.th}>Hear</th>
                <th className={styles.th}>Activity / Task</th>
                <th className={styles.th}>Waste</th>
                <th className={styles.th}>Sleep</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory.map((i, idx) => {
                const max = i.maxPoints || 60; 
                const ev = evaluateEntry(i); 
                const tdColorClass = (points) => { if (points === 10) return ""; if (points === 5) return styles.tdHalf; return styles.tdMissed; };
                
                const rowDateStr = new Date(i.date).toLocaleDateString(); 
                const isHighlighted = highlightDate === rowDateStr;
                
                const wasteDur = (parseInt(i.wasteH) || 0) + (parseInt(i.wasteM) || 0) / 60;
                const daySleepDur = (parseInt(i.daySleepH) || 0) + (parseInt(i.daySleepM) || 0) / 60;
                
                return (
                <tr key={idx} id={`row-${rowDateStr}`} className={isHighlighted ? styles.rowBlink : ""}>
                  <td className={styles.td}>{rowDateStr}</td>
                  <td className={styles.td}>{i.role || "N/A"}</td>
                  <td className={`${styles.td} ${styles.tdScore}`}>{Math.round((i.points/max)*100)}%</td>
                  <td className={`${styles.td} ${tdColorClass(ev.wakeP)}`}>{i.wakeH}:{i.wakeM} {i.wakeF}</td>
                  <td className={`${styles.td} ${tdColorClass(ev.chantP)}`}>{i.rounds} rds</td>
                  <td className={`${styles.td} ${tdColorClass(ev.readP)}`}>{i.readH||0}h {i.readM||0}m</td>
                  <td className={`${styles.td} ${tdColorClass(ev.hearP)}`}>{i.hearH||0}h {i.hearM||0}m</td>
                  
                  <td className={`${styles.td} ${tdColorClass(ev.dutyP)}`}>
                    <div>{i.studyH||i.workH||i.sevaH||0}h {i.studyM||i.workM||i.sevaM||0}m</div>
                    {(i.collegeArrH || i.workArrH) && (
                      <div style={{fontSize: "11px", color: "var(--text-sub)", marginTop: "4px"}}>
                        {i.role === "Student" && i.collegeArrH ? `${i.collegeArrH}:${i.collegeArrM||'00'} ${i.collegeArrF} - ${i.collegeDepH}:${i.collegeDepM||'00'} ${i.collegeDepF}` : ""}
                        {i.role === "Working" && i.workArrH ? `${i.workArrH}:${i.workArrM||'00'} ${i.workArrF} - ${i.workDepH}:${i.workDepM||'00'} ${i.workDepF}` : ""}
                      </div>
                    )}
                  </td>
                  
                  <td className={styles.td} style={{color: wasteDur > 2.0 ? (wasteDur > 3.0 ? "#ef4444" : "#d97706") : "inherit", fontWeight: wasteDur > 2.0 ? "700" : "500"}}>
                    {i.wasteH||0}h {i.wasteM||0}m
                  </td>
                  
                  <td className={`${styles.td} ${tdColorClass(ev.sleepP)}`}>
                    {i.sleepH}:{i.sleepM} {i.sleepF}
                    {(i.daySleepH > 0 || i.daySleepM > 0) && (
                      <div style={{fontSize: "11px", color: daySleepDur > 1.0 ? (daySleepDur > 2.0 ? "#ef4444" : "#d97706") : "var(--text-sub)", marginTop: "4px"}}>
                        Day: {i.daySleepH||0}h {i.daySleepM||0}m
                      </div>
                    )}
                  </td>
                </tr>
              )})}
              {displayHistory.length === 0 && <tr><td colSpan="10" className={styles.emptyRow}>No data found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MainReport;