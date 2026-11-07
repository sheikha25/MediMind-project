
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaBell, FaCheck, FaTimes, FaUser, FaClock } from "react-icons/fa";
import medimindlogo from "../assets/medimindlogo.jpg";
import notificationSound from "../assets/soft_chime.wav";
import { logout } from "../features/UserSlice";

const API = "http://localhost:3002";
const FALLBACK_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const CaregiverHeader = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("medimind-theme") === "dark"
        ? "dark"
        : "light"
  );

  const isArabic = language === "ar";
  const isDark = theme === "dark";
  const t = (en, ar) => (isArabic ? ar : en);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [missedDoseAlerts, setMissedDoseAlerts] = useState([]);
  const [patientRequests, setPatientRequests] = useState([]);
  const [linkedPatients, setLinkedPatients] = useState([]);
  const [readAlertIds, setReadAlertIds] = useState([]);
  const [bellRinging, setBellRinging] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState("");
  const [message, setMessage] = useState("");

  const previousAlertIds = useRef(null);
  const previousRequestIds = useRef(null);
  const bellTimer = useRef(null);
  const notificationRef = useRef(null);
  const dashboardRef = useRef(null);
  const readAlertIdsRef = useRef([]);

  const storageKey = `medimind-caregiver-read-alerts-${
    user?.email || "guest"
  }`;

  useEffect(() => {
    const syncSettings = () => {
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
      setTheme(
        localStorage.getItem("medimind-theme") === "dark"
          ? "dark"
          : "light"
      );
    };

    const events = [
      "storage",
      "medimind-language-change",
      "medimindLanguageChanged",
      "medimind-theme-change",
      "medimindThemeChanged",
    ];

    events.forEach((event) =>
      window.addEventListener(event, syncSettings)
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, syncSettings)
      );
    };
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );
      const ids = Array.isArray(saved) ? saved : [];
      setReadAlertIds(ids);
      readAlertIdsRef.current = ids;
    } catch {
      setReadAlertIds([]);
      readAlertIdsRef.current = [];
    }

    previousAlertIds.current = null;
    previousRequestIds.current = null;
    setMissedDoseAlerts([]);
    setPatientRequests([]);
    setLinkedPatients([]);
  }, [storageKey]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (
        dashboardRef.current &&
        !dashboardRef.current.contains(event.target)
      ) {
        setDashboardOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotificationOpen(false);
        setDashboardOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    return () => clearTimeout(bellTimer.current);
  }, []);

  const getAlertId = (dose) =>
    String(
      dose._id ||
        `${dose.userEmail}-${dose.medicationName}-${dose.scheduledTime}`
    );

  const getPatientInfo = (email) =>
    linkedPatients.find(
      (patient) =>
        String(patient.patientEmail || "").toLowerCase() ===
        String(email || "").toLowerCase()
    );

  const unreadAlerts = missedDoseAlerts.filter(
    (dose) => !readAlertIds.includes(getAlertId(dose))
  );

  const pendingRequests = patientRequests.filter(
    (request) => request.status === "Pending"
  );

  const totalUnreadNotifications =
    unreadAlerts.length + pendingRequests.length;

  const saveReadIds = (ids) => {
    const updated = [...new Set(ids.map(String))];
    readAlertIdsRef.current = updated;
    setReadAlertIds(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const markOneAsRead = (dose) => {
    const id = getAlertId(dose);
    if (readAlertIdsRef.current.includes(id)) return;

    saveReadIds([...readAlertIdsRef.current, id]);
  };

  const markAllAsRead = () => {
    saveReadIds([
      ...readAlertIdsRef.current,
      ...missedDoseAlerts.map(getAlertId),
    ]);
  };

  const playNotificationSound = () => {
    if (localStorage.getItem("caregiverNotificationSound") === "false") {
      return;
    }

    const audio = new Audio(notificationSound);
    audio.volume = 0.7;

    audio.play().catch((error) => {
      console.warn(
        "Caregiver notification sound blocked:",
        error
      );
    });
  };

  const animateBell = () => {
    setBellRinging(false);
    clearTimeout(bellTimer.current);

    requestAnimationFrame(() => {
      setBellRinging(true);
    });

    bellTimer.current = setTimeout(() => {
      setBellRinging(false);
    }, 2200);
  };

  useEffect(() => {
    if (!user?.email) return;

    let active = true;
    let fetching = false;

    const fetchCaregiverNotifications = async () => {
      if (fetching) return;
      fetching = true;

      try {
        const encodedEmail = encodeURIComponent(user.email);

        const [
          requestsResponse,
          patientsResponse,
          dashboardResponse,
        ] = await Promise.all([
          axios.get(
            `${API}/caregiver/patient-requests/${encodedEmail}`
          ),
          axios.get(
            `${API}/caregiver/my-patients/${encodedEmail}`
          ),
          axios.get(
            `${API}/caregiver/dashboard-data/${encodedEmail}`
          ),
        ]);

        if (!active) return;

        const requests = requestsResponse.data?.requests || [];
        const patients = patientsResponse.data?.patients || [];
        const doses = dashboardResponse.data?.doses || [];

        const missed = doses.filter(
          (dose) => dose.status === "Missed"
        );

        setPatientRequests(requests);
        setLinkedPatients(patients);
        setMissedDoseAlerts(missed);

        const currentIds = new Set(
          missed.map(getAlertId)
        );

        // Only pending connection requests count as new request alerts.
        const currentRequestIds = new Set(
          requests
            .filter((request) => request.status === "Pending")
            .map((request) => String(request._id))
        );

        // Ignore existing alerts on the first fetch after opening the page.
        // Announce newly arriving missed doses OR patient link requests.
        if (
          previousAlertIds.current !== null &&
          previousRequestIds.current !== null
        ) {
          const hasNewMissedDose = [...currentIds].some(
            (id) =>
              !previousAlertIds.current.has(id) &&
              !readAlertIdsRef.current.includes(id)
          );

          const hasNewPatientRequest = [...currentRequestIds].some(
            (id) => !previousRequestIds.current.has(id)
          );

          if (hasNewMissedDose || hasNewPatientRequest) {
            // Visual alert remains active even when sound is muted.
            animateBell();
            playNotificationSound();
          }
        }

        previousAlertIds.current = currentIds;
        previousRequestIds.current = currentRequestIds;
      } catch (error) {
        if (active) {
          console.error(
            "Caregiver notification error:",
            error
          );
        }
      } finally {
        fetching = false;
      }
    };

    fetchCaregiverNotifications();

    const interval = setInterval(
      fetchCaregiverNotifications,
      5000
    );

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user?.email]);

  const handlePatientRequest = async (requestId, status) => {
    if (!user?.email || processingRequestId) return;

    try {
      setProcessingRequestId(requestId);
      setMessage("");

      const response = await axios.put(
        `${API}/caregiver/patient-request/${requestId}`,
        {
          caregiverEmail: user.email,
          status,
        }
      );

      if (response.data?.success) {
        setPatientRequests((previous) =>
          previous.filter(
            (request) => request._id !== requestId
          )
        );

        setMessage(
          status === "Accepted"
            ? t(
                "Patient request accepted successfully!",
                "تم قبول طلب المريض بنجاح!"
              )
            : t(
                "Patient request rejected successfully!",
                "تم رفض طلب المريض بنجاح!"
              )
        );

        if (status === "Accepted") {
          try {
            const patientsResponse = await axios.get(
              `${API}/caregiver/my-patients/${encodeURIComponent(
                user.email
              )}`
            );

            setLinkedPatients(
              patientsResponse.data?.patients || []
            );
          } catch (refreshError) {
            console.error(
              "Refresh linked patients error:",
              refreshError
            );
          }
        }
      } else {
        setMessage(
          response.data?.message ||
            t(
              "Unable to update patient request.",
              "تعذر تحديث طلب المريض."
            )
        );
      }
    } catch (error) {
      console.error("Patient request error:", error);

      setMessage(
        error.response?.data?.message ||
          t(
            "Unable to update patient request.",
            "تعذر تحديث طلب المريض."
          )
      );
    } finally {
      setProcessingRequestId("");
    }
  };

  const handleLogout = () => {
    if (
      window.confirm(
        t(
          "Are you sure you want to logout from MediMind?",
          "هل أنت متأكد من تسجيل الخروج من MediMind؟"
        )
      )
    ) {
      dispatch(logout());
      navigate("/Splashscreen");
    }
  };

  const formatTime = (value) => {
    if (!value) {
      return t("Not scheduled", "غير مجدول");
    }

    const match = String(value).match(
      /^(\d{1,2}):(\d{2})$/
    );

    if (!match) return String(value);

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    if (hour > 23 || minute > 59) {
      return String(value);
    }

    const hour12 = String(hour % 12 || 12).padStart(2, "0");
    const minuteText = String(minute).padStart(2, "0");

    return `${hour12}:${minuteText} ${
      isArabic
        ? hour < 12
          ? "ص"
          : "م"
        : hour < 12
        ? "AM"
        : "PM"
    }`;
  };

  const formatDosage = (value) => {
    if (value === null || value === undefined) {
      return "-";
    }

    const dosage = String(value);

    if (!isArabic) return dosage;

    const units = {
      tablet: "قرص",
      tablets: "أقراص",
      capsule: "كبسولة",
      capsules: "كبسولات",
      pill: "حبة",
      pills: "حبات",
      mg: "ملغ",
      mcg: "ميكروغرام",
      ml: "مل",
      g: "غرام",
      drop: "قطرة",
      drops: "قطرات",
    };

    return dosage.replace(
      /\b(tablets?|capsules?|pills?|mcg|mg|ml|g|drops?)\b/gi,
      (match) => units[match.toLowerCase()] || match
    );
  };

  const getAvatar = (path) => {
    if (!path) return FALLBACK_AVATAR;

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `${API}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const viewPatient = (email) => {
    setNotificationOpen(false);

    navigate("/caregiver-home", {
      state: {
        openPatientEmail: email,
      },
    });
  };

  const selectDashboard = (email) => {
    setDashboardOpen(false);

    navigate("/caregiver-home", {
      state: {
        dashboardPatientEmail: email,
      },
    });
  };

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

    
const [notificationSoundEnabled, setNotificationSoundEnabled] =
  useState(() => {
    return localStorage.getItem("caregiverNotificationSound") !== "false";
  });

useEffect(() => {
  const syncNotificationSound = () => {
    setNotificationSoundEnabled(
      localStorage.getItem("caregiverNotificationSound") !== "false"
    );
  };

  window.addEventListener(
    "caregiver-notification-sound-change",
    syncNotificationSound
  );

  return () => {
    window.removeEventListener(
      "caregiver-notification-sound-change",
      syncNotificationSound
    );
  };
}, []);


  return (
    <>
      <style>{`
        @keyframes mmCaregiverBellShake {
          0%, 100% { transform: rotate(0deg); }
          20%, 60% { transform: rotate(-12deg); }
          40%, 80% { transform: rotate(12deg); }
        }

        .mm-caregiver-header {
          --cg-bg: #ffffff;
          --cg-text: #233e64;
          --cg-muted: #526579;
          --cg-border: #dbe4ee;
          --cg-section: #f5f8fc;
          --cg-panel: #ffffff;
          --cg-unread: #edf5ff;
          --cg-shadow: 0 12px 35px rgba(15, 23, 42, 0.16);

          position: relative;
          z-index: 100;
          width: 100%;
          background: var(--cg-bg);
          color: var(--cg-text);
          border-bottom: 1px solid var(--cg-border);
          box-shadow: 0 3px 12px rgba(0,0,0,0.06);
          box-sizing: border-box;
        }

        .mm-caregiver-header.mm-caregiver-header-dark {
          --cg-bg: #182338;
          --cg-text: #f1f5f9;
          --cg-muted: #cbd5e1;
          --cg-border: #41566e;
          --cg-section: #243a51;
          --cg-panel: #1b2d42;
          --cg-unread: #294362;
          --cg-shadow: 0 12px 35px rgba(0,0,0,0.35);
        }

        .mm-caregiver-header *,
        .mm-caregiver-header *::before,
        .mm-caregiver-header *::after {
          box-sizing: border-box;
        }

        .mm-caregiver-header .cg-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 12px 25px;
          min-height: 88px;
          width: 100%;
        }

        .mm-caregiver-header .cg-main {
          display: flex;
          align-items: center;
          flex: 1 1 auto;
          min-width: 0;
          gap: 22px;
        }

        .mm-caregiver-header .cg-logo {
          width: 115px;
          height: auto;
          object-fit: contain;
          flex-shrink: 0;
        }

        .mm-caregiver-header .cg-nav {
          display: flex;
          align-items: center;
          gap: 18px;
          min-width: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .mm-caregiver-header .cg-nav::-webkit-scrollbar {
          display: none;
        }

        .mm-caregiver-header .cg-nav-link {
          color: var(--cg-text) !important;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 9px 3px;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.5;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
        }

        .mm-caregiver-header .cg-nav-link:hover,
        .mm-caregiver-header .cg-nav-link.active {
          color: #3986e8 !important;
          border-bottom-color: #3986e8;
        }

        .mm-caregiver-header .cg-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-shrink: 0;
          gap: 14px;
        }

        .mm-caregiver-header .cg-profile {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--cg-border);
          background: var(--cg-section);
        }

        .mm-caregiver-header .cg-logout {
          border: 1px solid #dc3545;
          border-radius: 10px;
          padding: 10px 15px;
          background: #dc3545;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }

        .mm-caregiver-header .cg-logout:hover {
          background: #bb2d3b;
        }

        .mm-caregiver-header .cg-bell-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .mm-caregiver-header .cg-bell-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: var(--cg-text);
          cursor: pointer;
          font-size: 23px;
        }

        .mm-caregiver-header .cg-bell-button:hover {
          background: var(--cg-section);
        }

        .mm-caregiver-header .cg-bell-ringing {
          display: inline-flex;
          transform-origin: top center;
          animation: mmCaregiverBellShake 0.7s ease-in-out 3;
        }

        .mm-caregiver-header .cg-badge-count {
          position: absolute;
          top: -2px;
          inset-inline-end: -5px;
          min-width: 19px;
          height: 19px;
          padding: 0 4px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dc3545;
          color: white;
          font-size: 11px;
          font-weight: 700;
        }

        .mm-caregiver-header .cg-panel {
          position: absolute;
          top: calc(100% + 12px);
          inset-inline-end: 0;
          width: min(420px, calc(100vw - 24px));
          max-height: min(540px, calc(100vh - 115px));
          overflow-y: auto;
          overflow-x: hidden;
          padding: 18px;
          background: var(--cg-panel);
          color: var(--cg-text);
          border: 1px solid var(--cg-border);
          border-radius: 15px;
          box-shadow: var(--cg-shadow);
          z-index: 2000;
          text-align: start;
          scrollbar-width: thin;
        }

        .mm-caregiver-header .cg-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding-bottom: 15px;
          margin-bottom: 15px;
          border-bottom: 1px solid var(--cg-border);
        }

        .mm-caregiver-header .cg-panel-title {
          margin: 0;
          color: var(--cg-text);
          font-size: 21px;
          font-weight: 700;
        }

        .mm-caregiver-header .cg-section-title {
          margin: 18px 0 12px;
          color: var(--cg-text);
          font-size: 18px;
          font-weight: 700;
        }

        .mm-caregiver-header .cg-notification-card {
          padding: 15px;
          margin-bottom: 12px;
          border: 1px solid var(--cg-border);
          border-radius: 12px;
          background: var(--cg-section);
          color: var(--cg-text);
          overflow-wrap: anywhere;
        }

        .mm-caregiver-header .cg-notification-card.unread {
          background: var(--cg-unread);
          border-inline-start: 3px solid #3986e8;
        }

        .mm-caregiver-header .cg-person {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          margin-bottom: 12px;
        }

        .mm-caregiver-header .cg-person-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--cg-border);
          flex-shrink: 0;
        }

        .mm-caregiver-header .cg-person-name {
          color: var(--cg-text);
          font-size: 17px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .mm-caregiver-header .cg-notification-text {
          color: var(--cg-text);
          font-size: 16px;
          line-height: 1.7;
          margin: 8px 0;
          overflow-wrap: anywhere;
        }

        .mm-caregiver-header .cg-muted {
          color: var(--cg-muted) !important;
          font-size: 14px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .mm-caregiver-header .cg-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 7px;
          background: #fee2e2;
          color: #991b1b;
          font-size: 13px;
          font-weight: 700;
        }

        .mm-caregiver-header .cg-actions-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          margin-top: 13px;
        }

        .mm-caregiver-header .cg-action-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid transparent;
          border-radius: 9px;
          padding: 9px 13px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          line-height: 1.4;
        }

        .mm-caregiver-header .cg-accept {
          background: #198754;
          color: #ffffff;
        }

        .mm-caregiver-header .cg-reject {
          background: #dc3545;
          color: #ffffff;
        }

        .mm-caregiver-header .cg-view {
          background: #e6f0ff;
          color: #155cb5;
          border-color: #bfd7ff;
        }

        .mm-caregiver-header .cg-read {
          background: transparent;
          border: 1px solid var(--cg-border);
          color: var(--cg-text);
        }

        .mm-caregiver-header .cg-action-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .mm-caregiver-header .cg-empty {
          padding: 20px 12px;
          text-align: center;
          color: var(--cg-muted);
          font-size: 15px;
          line-height: 1.7;
        }

        .mm-caregiver-header .cg-dashboard-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
        }

        .mm-caregiver-header .cg-dashboard-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 6px;
          padding: 9px 5px;
          background: transparent;
          color: var(--cg-text);
          font-size: 15px;
          cursor: pointer;
        }

        .mm-caregiver-header .cg-dashboard-toggle:hover {
          color: #3986e8;
          background: var(--cg-section);
        }

        .mm-caregiver-header .cg-dashboard-toggle:focus-visible {
          outline: 2px solid #3986e8;
          outline-offset: 2px;
        }

        .mm-caregiver-header .cg-dashboard-menu {
          position: absolute;
          top: calc(100% + 10px);
          inset-inline-start: 0;
          width: 235px;
          max-height: 300px;
          overflow-y: auto;
          padding: 7px;
          border-radius: 12px;
          border: 1px solid var(--cg-border);
          background: var(--cg-panel);
          box-shadow: var(--cg-shadow);
          z-index: 2100;
        }

        .mm-caregiver-header .cg-dashboard-item {
          display: block;
          width: 100%;
          padding: 11px 12px;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: var(--cg-text);
          text-align: start;
          font-size: 15px;
          cursor: pointer;
          overflow-wrap: anywhere;
        }

        .mm-caregiver-header .cg-dashboard-item:hover {
          background: var(--cg-section);
        }

        .mm-caregiver-header .cg-dashboard-divider {
          height: 1px;
          margin: 6px 0;
          background: var(--cg-border);
        }

        .mm-caregiver-header .cg-feedback {
          padding: 10px 12px;
          margin-bottom: 12px;
          border-radius: 9px;
          background: var(--cg-section);
          color: var(--cg-text);
          border: 1px solid var(--cg-border);
          font-size: 14px;
          line-height: 1.6;
        }

        .mm-caregiver-header .cg-panel button:focus-visible,
        .mm-caregiver-header .cg-nav button:focus-visible {
          outline: 2px solid #3986e8;
          outline-offset: 2px;
        }

        @media (max-width: 1050px) {
          .mm-caregiver-header .cg-inner {
            padding: 12px 15px;
            gap: 12px;
          }

          .mm-caregiver-header .cg-main {
            gap: 12px;
          }

          .mm-caregiver-header .cg-nav {
            gap: 11px;
          }

          .mm-caregiver-header .cg-nav-link {
            font-size: 14px;
          }

          .mm-caregiver-header .cg-logo {
            width: 95px;
          }

          .mm-caregiver-header .cg-actions {
            gap: 9px;
          }
        }

        @media (max-width: 760px) {
          .mm-caregiver-header .cg-inner {
            flex-wrap: wrap;
          }

          .mm-caregiver-header .cg-main {
            width: 100%;
            flex-basis: 100%;
          }

          .mm-caregiver-header .cg-nav {
            flex: 1;
          }

          .mm-caregiver-header .cg-actions {
            margin-inline-start: auto;
          }

          .mm-caregiver-header .cg-profile {
            width: 38px;
            height: 38px;
          }

          .mm-caregiver-header .cg-logout {
            padding: 8px 11px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .mm-caregiver-header .cg-panel {
            position: fixed;
            top: 110px;
            left: 12px;
            right: 12px;
            width: auto;
            max-height: calc(100dvh - 125px);
            padding: 14px;
          }

          .mm-caregiver-header .cg-panel-title {
            font-size: 19px;
          }

          .mm-caregiver-header .cg-notification-card {
            padding: 12px;
          }

          .mm-caregiver-header .cg-notification-text {
            font-size: 15px;
          }

          .mm-caregiver-header .cg-logo {
            width: 80px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mm-caregiver-header .cg-bell-ringing {
            animation: none;
          }
        }
          
/* White header like the patient side */
.mm-caregiver-header,
.mm-caregiver-header.mm-caregiver-header-dark {
  --cg-bg: #ffffff;
  --cg-text: #233e64;
  --cg-border: #e5e7eb;

  background: #ffffff !important;
  color: #233e64 !important;
  border-bottom: 1px solid #e5e7eb !important;
}

/* Make header cover the entire viewport */
.mm-caregiver-header {
  width: 100vw !important;
  max-width: none !important;
  margin-left: calc(50% - 50vw) !important;
  margin-right: calc(50% - 50vw) !important;
  box-sizing: border-box;
}

/* Header content */
.mm-caregiver-header .cg-inner {
  width: 100%;
  max-width: none;
  padding-left: 30px;
  padding-right: 30px;
  box-sizing: border-box;
}

/* Navigation links */
.mm-caregiver-header .cg-nav-link {
  color: #233e64 !important;
}

/* Bell icon */
.mm-caregiver-header .cg-bell-button {
  color: #172b48 !important;
}

/* Keep notification panel dark in dark mode */
.mm-caregiver-header.mm-caregiver-header-dark .cg-panel,
.mm-caregiver-header.mm-caregiver-header-dark .cg-dashboard-menu {
  --cg-text: #f1f5f9;
  --cg-muted: #cbd5e1;
  --cg-border: #41566e;
  --cg-section: #243a51;
  --cg-panel: #1b2d42;
  --cg-unread: #294362;
}


/* ==========================================
   CAREGIVER NOTIFICATIONS - ALWAYS LIGHT
   ========================================== */

/* White notification dropdown in every theme */
.mm-caregiver-header .cg-panel,
.mm-caregiver-header.mm-caregiver-header-dark .cg-panel {
  --cg-panel: #ffffff;
  --cg-text: #20334a;
  --cg-muted: #526579;
  --cg-border: #dbe4ee;
  --cg-section: #f5f8fc;
  --cg-unread: #edf5ff;

  background: #ffffff !important;
  color: #20334a !important;
  border: 1px solid #dbe4ee !important;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

/* Notification headings */
.mm-caregiver-header .cg-panel-title,
.mm-caregiver-header .cg-section-title,
.mm-caregiver-header.mm-caregiver-header-dark .cg-panel-title,
.mm-caregiver-header.mm-caregiver-header-dark .cg-section-title {
  color: #20334a !important;
}

/* Notification cards */
.mm-caregiver-header .cg-notification-card,
.mm-caregiver-header.mm-caregiver-header-dark .cg-notification-card {
  background: #f5f8fc !important;
  color: #20334a !important;
  border-color: #dbe4ee !important;
}

/* Unread notifications */
.mm-caregiver-header .cg-notification-card.unread,
.mm-caregiver-header.mm-caregiver-header-dark .cg-notification-card.unread {
  background: #edf5ff !important;
  border-inline-start: 3px solid #3986e8 !important;
}

/* Patient names and medication details */
.mm-caregiver-header .cg-panel .cg-person-name,
.mm-caregiver-header .cg-panel .cg-notification-text,
.mm-caregiver-header .cg-panel .cg-notification-text strong {
  color: #20334a !important;
}

/* Secondary text */
.mm-caregiver-header .cg-panel .cg-muted {
  color: #526579 !important;
}

/* Mark as Read buttons */
.mm-caregiver-header .cg-panel .cg-read {
  color: #233e64 !important;
  background: #ffffff !important;
  border-color: #cbd5e1 !important;
}

/* Patient request feedback */
.mm-caregiver-header .cg-panel .cg-feedback {
  background: #eff6ff !important;
  color: #20334a !important;
  border-color: #bfdbfe !important;
}

/* Missed dose badge */
.mm-caregiver-header .cg-panel .cg-status {
  background: #fee2e2 !important;
  color: #991b1b !important;
}

/* View Patient button */
.mm-caregiver-header .cg-panel .cg-view {
  background: #e6f0ff !important;
  color: #155cb5 !important;
  border-color: #bfd7ff !important;
}

      `}</style>

      <header
        className={`mm-caregiver-header ${
          isDark ? "mm-caregiver-header-dark" : ""
        }`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="cg-inner">
          <div className="cg-main">
            <img
              src={medimindlogo}
              alt="MediMind logo"
              className="cg-logo"
            />

            <nav
              className="cg-nav"
              aria-label={t(
                "Caregiver navigation",
                "تنقل مقدم الرعاية"
              )}
            >
              <div
                className="cg-dashboard-wrapper"
                ref={dashboardRef}
              >
                <Link
                  to="/caregiver-home"
                  className={`cg-nav-link ${
                    isActive("/caregiver-home")
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setDashboardOpen(false)}
                >
                  {t("Dashboard", "لوحة التحكم")}
                </Link>

                <button
                  type="button"
                  className="cg-dashboard-toggle"
                  onClick={() =>
                    setDashboardOpen((current) => !current)
                  }
                  aria-label={t(
                    "Choose a patient dashboard",
                    "اختيار لوحة تحكم المريض"
                  )}
                  aria-expanded={dashboardOpen}
                  aria-haspopup="true"
                >
                  ▾
                </button>

                {dashboardOpen && (
                  <div className="cg-dashboard-menu">
                    <button
                      type="button"
                      className="cg-dashboard-item"
                      onClick={() => selectDashboard("")}
                    >
                      {t("All Patients", "جميع المرضى")}
                    </button>

                    {linkedPatients.length > 0 && (
                      <div className="cg-dashboard-divider" />
                    )}

                    {linkedPatients.map((patient) => (
                      <button
                        type="button"
                        className="cg-dashboard-item"
                        key={
                          patient._id ||
                          patient.patientEmail
                        }
                        onClick={() =>
                          selectDashboard(
                            patient.patientEmail
                          )
                        }
                      >
                        {patient.patientName ||
                          patient.patientEmail}
                      </button>
                    ))}

                    {linkedPatients.length === 0 && (
                      <div className="cg-empty">
                        {t(
                          "No linked patients",
                          "لا يوجد مرضى مرتبطون"
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link
                to="/caregiver-reports"
                className={`cg-nav-link ${
                  isActive("/caregiver-reports")
                    ? "active"
                    : ""
                }`}
              >
                {t("Reports", "التقارير")}
              </Link>

              <Link
                to="/caregiver-analytics"
                className={`cg-nav-link ${
                  isActive("/caregiver-analytics")
                    ? "active"
                    : ""
                }`}
              >
                {t("Analytics", "التحليلات")}
              </Link>

              <Link
                to="/caregiver-settings"
                className={`cg-nav-link ${
                  isActive("/caregiver-settings")
                    ? "active"
                    : ""
                }`}
              >
                {t("Settings", "الإعدادات")}
              </Link>
            </nav>
          </div>

          <div className="cg-actions">
            <div
              className="cg-bell-wrapper"
              ref={notificationRef}
            >
              <button
                type="button"
                className="cg-bell-button"
                onClick={() =>
                  setNotificationOpen((current) => !current)
                }
                aria-label={t(
                  "Notifications",
                  "الإشعارات"
                )}
                aria-expanded={notificationOpen}
                title={t(
                  "Notifications",
                  "الإشعارات"
                )}
              >
                <span
                  className={
                    bellRinging
                      ? "cg-bell-ringing"
                      : ""
                  }
                >
                  <FaBell />
                </span>

                {totalUnreadNotifications > 0 && (
                  <span className="cg-badge-count">
                    {totalUnreadNotifications > 99
                      ? "99+"
                      : totalUnreadNotifications}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  className="cg-panel"
                  dir={isArabic ? "rtl" : "ltr"}
                  role="region"
                  aria-label={t(
                    "Caregiver notifications",
                    "إشعارات مقدم الرعاية"
                  )}
                >
                  <div className="cg-panel-header">
                    <h5 className="cg-panel-title">
                      {t(
                        "Notifications",
                        "الإشعارات"
                      )}
                    </h5>

                    {unreadAlerts.length > 0 && (
                      <button
                        type="button"
                        className="cg-action-button cg-read"
                        onClick={markAllAsRead}
                      >
                        <FaCheck size={12} />
                        {t(
                          "Mark All as Read",
                          "تحديد الكل كمقروء"
                        )}
                      </button>
                    )}
                  </div>

                  {message && (
                    <div
                      className="cg-feedback"
                      role="status"
                    >
                      {message}
                    </div>
                  )}

                  {pendingRequests.length > 0 && (
                    <section>
                      <h6 className="cg-section-title">
                        {t(
                          "New Patient Requests",
                          "طلبات المرضى الجديدة"
                        )}
                      </h6>

                      {pendingRequests.map((request) => (
                        <div
                          className="cg-notification-card unread"
                          key={request._id}
                        >
                          <div className="cg-person">
                            <img
                              src={getAvatar(
                                request.patientProfilePicture
                              )}
                              alt={t(
                                "Patient",
                                "المريض"
                              )}
                              className="cg-person-avatar"
                              onError={(event) => {
                                event.currentTarget.src =
                                  FALLBACK_AVATAR;
                              }}
                            />

                            <div>
                              <div className="cg-person-name">
                                {request.patientName ||
                                  request.patientEmail ||
                                  t(
                                    "Patient",
                                    "المريض"
                                  )}
                              </div>

                              {request.patientEmail && (
                                <div className="cg-muted">
                                  {request.patientEmail}
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="cg-notification-text">
                            {t(
                              "Wants to connect with you as their caregiver.",
                              "يرغب في ربط حسابه بك بصفتك مقدم الرعاية."
                            )}
                          </p>

                          <div className="cg-actions-row">
                            <button
                              type="button"
                              className="cg-action-button cg-accept"
                              disabled={
                                processingRequestId ===
                                request._id
                              }
                              onClick={() =>
                                handlePatientRequest(
                                  request._id,
                                  "Accepted"
                                )
                              }
                            >
                              <FaCheck size={12} />
                              {processingRequestId ===
                              request._id
                                ? t(
                                    "Processing...",
                                    "جارٍ المعالجة..."
                                  )
                                : t("Accept", "قبول")}
                            </button>

                            <button
                              type="button"
                              className="cg-action-button cg-reject"
                              disabled={
                                processingRequestId ===
                                request._id
                              }
                              onClick={() =>
                                handlePatientRequest(
                                  request._id,
                                  "Rejected"
                                )
                              }
                            >
                              <FaTimes size={12} />
                              {t("Reject", "رفض")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </section>
                  )}

                  <section>
                    <h6 className="cg-section-title">
                      {t(
                        "Missed Medication Alerts",
                        "تنبيهات الجرعات الفائتة"
                      )}
                    </h6>

                    {missedDoseAlerts.length === 0 ? (
                      <div className="cg-empty">
                        <FaBell
                          style={{
                            fontSize: "24px",
                            marginBottom: "10px",
                            opacity: 0.55,
                          }}
                        />

                        <div>
                          {t(
                            "No missed-dose alerts.",
                            "لا توجد تنبيهات جرعات فائتة."
                          )}
                        </div>
                      </div>
                    ) : (
                      missedDoseAlerts
                        .slice(0, 5)
                        .map((dose) => {
                          const patient = getPatientInfo(
                            dose.userEmail
                          );

                          const isRead =
                            readAlertIds.includes(
                              getAlertId(dose)
                            );

                          return (
                            <div
                              key={getAlertId(dose)}
                              className={`cg-notification-card ${
                                !isRead ? "unread" : ""
                              }`}
                            >
                              <div className="cg-person">
                                <img
                                  src={getAvatar(
                                    patient?.patientProfilePicture
                                  )}
                                  alt={t(
                                    "Patient",
                                    "المريض"
                                  )}
                                  className="cg-person-avatar"
                                  onError={(event) => {
                                    event.currentTarget.src =
                                      FALLBACK_AVATAR;
                                  }}
                                />

                                <div
                                  style={{
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  <div className="cg-person-name">
                                    {patient?.patientName ||
                                      dose.userEmail ||
                                      t(
                                        "Patient",
                                        "المريض"
                                      )}
                                  </div>

                                  <span className="cg-status">
                                    {t(
                                      "Missed Dose",
                                      "جرعة فائتة"
                                    )}
                                  </span>
                                </div>
                              </div>

                              <p className="cg-notification-text">
                                {t(
                                  "Missed medication:",
                                  "الدواء الفائت:"
                                )}{" "}
                                <strong>
                                  {dose.medicationName}
                                </strong>

                                {dose.dosage && (
                                  <>
                                    {" "}
                                    (
                                    {formatDosage(
                                      dose.dosage
                                    )}
                                    )
                                  </>
                                )}
                              </p>

                              <div className="cg-muted">
                                <FaClock
                                  size={12}
                                  style={{
                                    marginInlineEnd: "6px",
                                  }}
                                />
                                {t(
                                  "Scheduled at",
                                  "الموعد المحدد"
                                )}{" "}
                                {formatTime(
                                  dose.scheduledTime
                                )}
                              </div>

                              <div className="cg-actions-row">
                                <button
                                  type="button"
                                  className="cg-action-button cg-view"
                                  onClick={() =>
                                    viewPatient(
                                      dose.userEmail
                                    )
                                  }
                                >
                                  <FaUser size={12} />
                                  {t(
                                    "View Patient",
                                    "عرض المريض"
                                  )}
                                </button>

                                {!isRead && (
                                  <button
                                    type="button"
                                    className="cg-action-button cg-read"
                                    onClick={() =>
                                      markOneAsRead(dose)
                                    }
                                  >
                                    <FaCheck size={12} />
                                    {t(
                                      "Mark as Read",
                                      "تحديد كمقروء"
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </section>

                  {pendingRequests.length === 0 &&
                    missedDoseAlerts.length === 0 && (
                      <p className="cg-muted">
                        {t(
                          "You're all caught up!",
                          "لا توجد إشعارات جديدة!"
                        )}
                      </p>
                    )}
                </div>
              )}
            </div>

            <img
              src={getAvatar(user?.profilepic)}
              alt={t(
                "Profile",
                "الصورة الشخصية"
              )}
              className="cg-profile"
              onError={(event) => {
                event.currentTarget.src =
                  FALLBACK_AVATAR;
              }}
            />

            <button
              type="button"
              className="cg-logout"
              onClick={handleLogout}
            >
              {t(
                "Logout",
                "تسجيل الخروج"
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default CaregiverHeader;
