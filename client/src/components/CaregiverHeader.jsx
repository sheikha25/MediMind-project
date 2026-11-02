import { useEffect, useRef, useState } from "react";
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import medimindlogo from "../assets/medimindlogo.jpg";
import { logout } from "../features/UserSlice";
import { FaBell } from "react-icons/fa";
import notificationSound from "../assets/soft_chime.wav";

const CaregiverHeader = () => {
  const [language, setLanguage] = useState(
  () => localStorage.getItem("medimindLanguage") || "en"
);

const isArabic = language === "ar";

const t = (english, arabic) =>
  isArabic ? arabic : english;

useEffect(() => {
  const updateLanguage = () => {
    setLanguage(localStorage.getItem("medimindLanguage") || "en");
  };

  window.addEventListener("medimind-language-change", updateLanguage);
  window.addEventListener("storage", updateLanguage);

  return () => {
    window.removeEventListener("medimind-language-change", updateLanguage);
    window.removeEventListener("storage", updateLanguage);
  };
}, []);

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [missedDoseAlerts, setMissedDoseAlerts] = useState([]);
  const [patientRequests, setPatientRequests] = useState([]);
  const [linkedPatients, setLinkedPatients] = useState([]);
 const [dashboardOpen, setDashboardOpen] = useState(false);
 
const [readAlertIds, setReadAlertIds] = useState([]);
const [bellRinging, setBellRinging] = useState(false);
 
const previousAlertIds = useRef(null);
const playNotificationSound = () => {
  const audio = new Audio(notificationSound);

  audio.volume = 0.7;

  audio.play().catch((error) => {
    console.warn("Notification sound could not play:", error);
  });
};

const bellTimer = useRef(null);
 

const getAlertId = (dose) =>
  String(dose._id || `${dose.userEmail}-${dose.medicationName}-${dose.scheduledTime}`);
 
const storageKey = `medimind-caregiver-read-alerts-${user?.email || "guest"}`;
 
useEffect(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    setReadAlertIds(Array.isArray(saved) ? saved : []);
  } catch {
    setReadAlertIds([]);
  }
}, [storageKey]);
 
useEffect(() => {
  return () => clearTimeout(bellTimer.current);
}, []);
 
const unreadAlerts = missedDoseAlerts.filter(
  (dose) => !readAlertIds.includes(getAlertId(dose))
);
 
const pendingRequests = patientRequests.filter(
  (request) => request.status === "Pending"
);

const totalUnreadNotifications =
  unreadAlerts.length + pendingRequests.length;

const markAllAsRead = () => {
  const ids = missedDoseAlerts.map(getAlertId);
  const updated = [...new Set([...readAlertIds, ...ids])];
 
  setReadAlertIds(updated);
  localStorage.setItem(storageKey, JSON.stringify(updated));
};
 
const markOneAsRead = (dose) => {
  const id = getAlertId(dose);
 
  if (readAlertIds.includes(id)) return;
 
  const updated = [...readAlertIds, id];
  setReadAlertIds(updated);
  localStorage.setItem(storageKey, JSON.stringify(updated));
};
 
const getPatientInfo = (email) => {
  return linkedPatients.find(
    (patient) => patient.patientEmail === email
  );
};
 
const fetchCaregiverNotifications = async () => {
  if (!user?.email) {
    return;
  }
 
  try {
    const requestsResponse = await axios.get(
  `http://localhost:3002/caregiver/patient-requests/${encodeURIComponent(user.email)}`
);

setPatientRequests(requestsResponse.data?.requests || []);
    
const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

const [patientsResponse, dashboardResponse] =
  await Promise.all([
    axios.get(
      `http://localhost:3002/caregiver/my-patients/${encodeURIComponent(
        user.email
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
    axios.get(
      `http://localhost:3002/caregiver/dashboard-data/${encodeURIComponent(
        user.email
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
  ]);

 
    setLinkedPatients(
      patientsResponse.data?.patients || []
    );
 
    const doses =
      dashboardResponse.data?.doses || [];
    const missed = doses.filter(
      (dose) => dose.status === "Missed"
    );
   console.table(
  missed.map(dose => ({
    patient: dose.userEmail,
    medication: dose.medicationName,
    time: dose.scheduledTime,
    status: dose.status,
    id: dose._id
  }))
);
setMissedDoseAlerts(missed);
 
const currentIds = new Set(missed.map(getAlertId));
 
if (previousAlertIds.current !== null) {
  const hasNewAlert = [...currentIds].some(
    (id) => !previousAlertIds.current.has(id)
  );
 
  if (hasNewAlert) {
    console.log("🔔 NEW MISSED DOSE DETECTED!");
     playNotificationSound();
    setBellRinging(false);
    clearTimeout(bellTimer.current);
 
    requestAnimationFrame(() => {
      setBellRinging(true);
    });
 
    bellTimer.current = setTimeout(() => {
      setBellRinging(false);
    }, 2200);
  }
}
 
previousAlertIds.current = currentIds;
 
  } catch (error) {
    console.error(
      "Caregiver notification error:",
      error
    );
  }
};
 
useEffect(() => {
  fetchCaregiverNotifications();
 
  const interval = setInterval(() => {
    fetchCaregiverNotifications();
  }, 5000);
 
  return () => clearInterval(interval);
}, [user?.email]);


const handlePatientRequest = async (requestId, status) => {
  try {
    const response = await axios.put(
      `http://localhost:3002/caregiver/patient-request/${requestId}`,
      {
        caregiverEmail: user.email,
        status,
      }
    );

    if (response.data.success) {
      setPatientRequests((previous) =>
        previous.filter((request) => request._id !== requestId)
      );

      alert(
        status === "Accepted"
          ? "Patient request accepted successfully!"
          : "Patient request rejected successfully!"
      );
    }
  } catch (error) {
    console.error("Patient request error:", error);

    alert(
      error.response?.data?.message ||
        "Unable to update patient request."
    );
  }
};

 
  const handleLogout = () => {
    if (window.confirm(
  t(
    "Are you sure you want to logout from MediMind?",
    "هل أنت متأكد من تسجيل الخروج من MediMind؟"
  )
)) {
      dispatch(logout());
      navigate("/Splashscreen");
    }
  };
 
 return (
  <>
    <style>{`
      @keyframes caregiverBellShake {
        0%, 100% { transform: rotate(0deg); }
        20%, 60% { transform: rotate(-12deg); }
        40%, 80% { transform: rotate(12deg); }
      }
 
      .caregiver-bell-ringing {
        display: inline-block;
        transform-origin: top center;
        animation: caregiverBellShake 0.7s ease-in-out 3;
      }
 
      @media (prefers-reduced-motion: reduce) {
        .caregiver-bell-ringing {
          animation: none;
        }
      }
    `}</style>
 
    <Row
  dir={isArabic ? "rtl" : "ltr"}
  className="align-items-center px-4 py-3"
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <Col md="12" className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <img src={medimindlogo} width="120px" alt="MediMind logo" />
 
          <div
            className="d-flex align-items-center"
           style={{ marginInlineStart: "30px", gap: "10px" }}
          >
 
            <Dropdown
  isOpen={dashboardOpen}
  toggle={() => setDashboardOpen(!dashboardOpen)}
>
  <DropdownToggle
    tag="span"
    className="nav-link"
    style={{
      cursor: "pointer",
      background: "transparent",
      border: "none",
    }}
  >
    {t("Dashboard", "لوحة التحكم")} ▾
  </DropdownToggle>
 
  <DropdownMenu
    style={{
      minWidth: "230px",
      borderRadius: "10px",
      padding: "8px 0",
    }}
  >
    <DropdownItem
      onClick={() => {
        navigate("/caregiver-home", {
          state: {
            dashboardPatientEmail: "",
          },
        });
      }}
    >
     {t("All Patients", "جميع المرضى")}
    </DropdownItem>
 
    {linkedPatients.length > 0 && (
      <DropdownItem divider />
    )}
 
    {linkedPatients.map((patient) => (
      <DropdownItem
        key={patient._id || patient.patientEmail}
        onClick={() => {
          navigate("/caregiver-home", {
            state: {
              dashboardPatientEmail:
                patient.patientEmail,
            },
          });
        }}
      >
        {patient.patientName || patient.patientEmail}
      </DropdownItem>
    ))}
 
    {linkedPatients.length === 0 && (
      <DropdownItem disabled>
       {t("No linked patients", "لا يوجد مرضى مرتبطون")}
      </DropdownItem>
    )}
  </DropdownMenu>
</Dropdown>
 
<Link to="/caregiver-reports" className="nav-link">
  {t("Reports", "التقارير")}
</Link>
 
<Link to="/caregiver-analytics" className="nav-link">
 {t("Analytics", "التحليلات")}
</Link>
 
<Link to="/caregiver-settings" className="nav-link">
  {t("Settings", "الإعدادات")}
</Link>
          </div>
        </div>
 
        <div className="d-flex align-items-center" style={{ gap: "15px" }}>
          <div className="d-flex align-items-center">
            <Dropdown
  isOpen={notificationOpen}
  toggle={() => setNotificationOpen(!notificationOpen)}
>
 
<DropdownToggle
  color="light"
  style={{
    position: "relative",
    border: "none",
    background: "transparent",
    fontSize: "22px",
    padding: "6px 10px",
  }}
>
  <span
    className={bellRinging ? "caregiver-bell-ringing" : ""}
    style={{
      display: "inline-block",
      color: "#000000",
    }}
  >
    <FaBell size={23} color="#000000" />
  </span>

  {totalUnreadNotifications > 0 && (
    <span
      style={{
        position: "absolute",
        top: "0",
        right: "0",
        backgroundColor: "#dc3545",
        color: "#ffffff",
        borderRadius: "12px",
        minWidth: "18px",
        height: "18px",
        padding: "0 4px",
        fontSize: "11px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
      }}
    >
      {totalUnreadNotifications > 99
  ? "99+"
  : totalUnreadNotifications}
    </span>
  )}
</DropdownToggle>

 
  <DropdownMenu
    end
    style={{
      minWidth: "350px",
      maxHeight: "420px",
      overflowY: "auto",
    }}
  >
   
<div
  style={{
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  }}
>
  <strong>Notifications</strong>
 
  {unreadAlerts.length > 0 && (
    <button
      type="button"
      className="btn btn-link btn-sm p-0"
      onClick={markAllAsRead}
    >
      Mark all as read
    </button>
  )}
</div>
 
 
    <DropdownItem divider />
 {pendingRequests.length > 0 && (
  <>
    <div
      style={{
        padding: "10px 16px",
        fontWeight: "700",
        color: "#0b3d91",
        fontSize: "14px",
      }}
    >
      New Patient Requests
    </div>

    {pendingRequests.map((request) => (
      <div
        key={request._id}
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
          backgroundColor: "#eef5ff",
        }}
      >
        <strong>
          {request.patientName || request.patientEmail || "Patient"}
        </strong>

        <div
          style={{
            fontSize: "13px",
            color: "#555",
            marginTop: "5px",
          }}
        >
          Wants to connect with you as their caregiver.
        </div>
        
<div className="d-flex gap-2 mt-3">
  <button
    type="button"
    className="btn btn-success btn-sm"
    onClick={() =>
      handlePatientRequest(request._id, "Accepted")
    }
  >
    ✓ Accept
  </button>

  <button
    type="button"
    className="btn btn-danger btn-sm"
    onClick={() =>
      handlePatientRequest(request._id, "Rejected")
    }
  >
    ✕ Reject
  </button>
</div>

      </div>
    ))}

    <DropdownItem divider />
  </>
)}
    {missedDoseAlerts.length === 0 ? (
      <div
        className="text-muted text-center"
        style={{ padding: "20px" }}
      >
        No missed-dose alerts
      </div>
    ) : (
      missedDoseAlerts.slice(0, 5).map((dose) => {
        const patient =
          getPatientInfo(dose.userEmail);
 
        return (
          <div
  key={dose._id}
  onClick={() => markOneAsRead(dose)}
  style={{
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    backgroundColor: readAlertIds.includes(getAlertId(dose))
      ? "#ffffff"
      : "#eef5ff",
  }}
>
            <div className="d-flex align-items-center">
              <img
                src={
                  patient?.patientProfilePicture
                    ? `http://localhost:3002${patient.patientProfilePicture}`
                    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                alt="Patient"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: "10px",
                }}
              />
 
              <div>
                <strong>
                  {patient?.patientName || "Patient"}
                </strong>
 
                <div
                  style={{
                    color: "#dc3545",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Missed Dose
                </div>
              </div>
            </div>
 
            <div
              style={{
                marginTop: "10px",
                fontSize: "14px",
              }}
            >
              Missed{" "}
              <strong>
                {dose.medicationName}
              </strong>
 
              {dose.dosage && (
                <>
                  {" "}
                  ({dose.dosage})
                </>
              )}
            </div>
 
            <div
              className="text-muted"
              style={{
                fontSize: "13px",
                marginTop: "3px",
              }}
            >
              Scheduled at{" "}
              {dose.scheduledTime
                ? new Date(
                    `2000-01-01T${dose.scheduledTime}`
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Not scheduled"}
            </div>
 
            <button
              type="button"
              className="btn btn-link p-0 mt-2"
              style={{
                fontSize: "13px",
                textDecoration: "none",
              }}
             onClick={() => {
  setNotificationOpen(false);
 
  navigate("/caregiver-home", {
    state: {
      openPatientEmail: dose.userEmail,
    },
  });
}}
            >
              View Patient →
            </button>
          </div>
        );
      })
    )}
  </DropdownMenu>
</Dropdown>
            <img
  src={
    user?.profilepic
      ? `http://localhost:3002${user.profilepic}`
      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  }
  alt="Profile"
  style={{
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #ddd",
  }}
  onError={(event) => {
    event.currentTarget.src =
      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  }}
/>
 
           
          </div>

          <button
            className="btn btn-danger"
            style={{ borderRadius: "8px", padding: "6px 15px" }}
            onClick={handleLogout}
          >
           {t("Logout", "تسجيل الخروج")}
          </button>
        </div>
      </Col>
       </Row>
  </>
);
};
 
export default CaregiverHeader