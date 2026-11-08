import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import {
  Button,
  Card,
  CardBody,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import {
  FaBell,
  FaEye,
  FaFilePdf,
  FaImage,
} from "react-icons/fa";

import axios from "axios";

import notificationSound from "../assets/soft_chime.wav";
const NotificationBell = () => {

  const user = useSelector(
    (state) => state.user.user
  );

  const [language, setLanguage] = useState(() => localStorage.getItem("medimindLanguage") || "en");
  const isArabic = language === "ar";
  const t = (en, ar) => (isArabic ? ar : en);

  useEffect(() => {
    const syncLanguage = () => setLanguage(localStorage.getItem("medimindLanguage") || "en");
    window.addEventListener("medimind-language-change", syncLanguage);
    window.addEventListener("storage", syncLanguage);
    return () => {
      window.removeEventListener("medimind-language-change", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const formatDosage = (value) => {
    if (value === null || value === undefined) return "-";
    const dosage = String(value);
    if (!isArabic) return dosage;
    const units = {
      tablet: "قرص", tablets: "أقراص", capsule: "كبسولة", capsules: "كبسولات",
      pill: "حبة", pills: "حبات", mg: "ملغ", mcg: "ميكروغرام",
      g: "غرام", ml: "مل", drop: "قطرة", drops: "قطرات"
    };
    return dosage.replace(/\b(tablets?|capsules?|pills?|mcg|mg|ml|g|drops?)\b/gi,
      (match) => units[match.toLowerCase()] || match);
  };

  const formatTime = (value) => {
    if (!value) return "-";
    const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return value;
    const hour = Number(match[1]);
    if (hour > 23 || Number(match[2]) > 59) return value;
    const h12 = String(hour % 12 || 12).padStart(2, "0");
    return `${h12}:${match[2]} ${isArabic ? (hour < 12 ? "ص" : "م") : (hour < 12 ? "AM" : "PM")}`;
  };

  const [connectionResults, setConnectionResults] = useState([]);
  const [readConnectionIds, setReadConnectionIds] = useState([]);
  const previousConnectionIds = useRef(null);
 const previousDoseIds = useRef(null);
const alarmedDoseKeys = useRef(
  new Set(
    JSON.parse(
      sessionStorage.getItem("medimindAlarmedDoses") || "[]"
    )
  )
);
const alarmAudioRef = useRef(null);
const alarmTimeoutRef = useRef(null);
const alarmIntervalRef = useRef(null);

const [activeAlarmDoses, setActiveAlarmDoses] = useState([]);
const [isProcessingAlarm, setIsProcessingAlarm] = useState(false);
const playedDoseIds = useRef(new Set());


const stopMedicationAlarm = () => {
  if (alarmTimeoutRef.current) {
    clearTimeout(alarmTimeoutRef.current);
    alarmTimeoutRef.current = null;
  }

  if (alarmIntervalRef.current) {
    clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = null;
  }

  if (alarmAudioRef.current) {
    alarmAudioRef.current.pause();
    alarmAudioRef.current.currentTime = 0;
    alarmAudioRef.current = null;
  }
};




  const startMedicationAlarm = (doses) => {
  stopMedicationAlarm();

  setActiveAlarmDoses(doses);

 

const audio = new Audio(notificationSound);

audio.volume = 0.8;

audio.loop = true;

  alarmAudioRef.current = audio;

audio.play()
  .then(() => {
    console.log("Medication alarm playback started");
  })
  .catch((error) => {
    console.error(
      "Medication alarm playback failed:",
      error.name,
      error.message
    );
  });

  // Stop ringing after 60 seconds.
 alarmTimeoutRef.current = setTimeout(() => {
  stopMedicationAlarm();

  // Close the popup after 60 seconds.
  setActiveAlarmDoses([]);
}, 60 * 1000);
};


const handleAlarmAction = async (action, doseId) => {
  if (!doseId || !user?.email || isProcessingAlarm) {
    return;
  }

  try {
    setIsProcessingAlarm(true);

    const endpoint =
      action === "Snooze"
        ? `http://localhost:3002/patient/dose/${doseId}/snooze`
        : `http://localhost:3002/patient/dose/${doseId}/status`;

    await axios.put(endpoint, {
      userEmail: user.email,
      ...(action !== "Snooze" && { status: action }),
    });

const remaining = activeAlarmDoses.filter(
  (dose) => String(dose._id) !== String(doseId)
);

setActiveAlarmDoses(remaining);

if (remaining.length === 0) {
  stopMedicationAlarm();
}

    // Remove the old notification from the screen.
   setDoseNotifications((current) =>
  current.filter(
    (dose) => String(dose._id) !== String(doseId)
  )
);

await fetchDoseNotifications();
  } catch (error) {
    console.error("Medication alarm action error:", error);

    setMessage(
      error.response?.data?.message ||
        "Unable to update medication reminder."
    );
  } finally {
    setIsProcessingAlarm(false);
  }
};

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    doseNotifications,
    setDoseNotifications,
  ] = useState([]);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    processingRequestId,
    setProcessingRequestId,
  ] = useState("");

  const [
    dismissingDoseId,
    setDismissingDoseId,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    isProfileModalOpen,
    setIsProfileModalOpen,
  ] = useState(false);

  const [
    selectedCaregiver,
    setSelectedCaregiver,
  ] = useState(null);



  const readStorageKey = `medimind-patient-read-connections-${user?.email || "guest"}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(readStorageKey) || "[]"
      );

      setReadConnectionIds(
        Array.isArray(saved) ? saved : []
      );
    } catch {
      setReadConnectionIds([]);
    }
  }, [readStorageKey]);

  
useEffect(() => {
  if (!user?.email || user?.role !== "patient") {
    previousConnectionIds.current = null;
    return;
  }

  const currentIds = connectionResults
    .filter(
      (request) =>
        !readConnectionIds.includes(String(request._id))
    )
    .map((request) => String(request._id));

  // First load: remember existing notifications without playing sound.
  if (previousConnectionIds.current === null) {
    previousConnectionIds.current = currentIds;
    return;
  }

  const hasNewNotification = currentIds.some(
    (id) => !previousConnectionIds.current.includes(id)
  );

  previousConnectionIds.current = currentIds;

  if (
  hasNewNotification &&
  localStorage.getItem("medimindSoundMuted") !== "true"
) {
    const audio = new Audio(notificationSound);
    audio.volume = 0.6;

    audio.play().catch((error) => {
      console.log("Notification sound blocked:", error);
    });
  }
}, [connectionResults, readConnectionIds, user?.email, user?.role]);

  const unreadConnectionResults = connectionResults.filter(
    (request) => !readConnectionIds.includes(String(request._id))
  );

  
useEffect(() => {
  if (
    user?.role !== "patient" ||
    user?.notificationsEnabled === false
  ) {
    previousDoseIds.current = null;
    return;
  }

  const currentIds = doseNotifications.map(
    (dose) => String(dose._id)
  );

  // Do not play sounds for notifications
  // already present when the page first loads.
  if (previousDoseIds.current === null) {
    previousDoseIds.current = currentIds;
    return;
  }

  const hasNewDoseNotification = currentIds.some(
    (id) => !previousDoseIds.current.includes(id)
  );

  previousDoseIds.current = currentIds;

  if (
    hasNewDoseNotification &&
    localStorage.getItem("medimindSoundMuted") !== "true"
  ) {
    const audio = new Audio(notificationSound);
    audio.volume = 0.5;

    audio.play().catch((error) => {
      console.warn(
        "Medication notification sound blocked:",
        error
      );
    });
  }
}, [
  doseNotifications,
  user?.role,
  user?.notificationsEnabled,
  user?.email,
]);


  const markConnectionAsRead = (requestId) => {
    const updated = [
      ...new Set([
        ...readConnectionIds,
        String(requestId),
      ]),
    ];

    setReadConnectionIds(updated);
    localStorage.setItem(readStorageKey, JSON.stringify(updated));
  };

  const markAllConnectionsAsRead = () => {
    const updated = [
      ...new Set([
        ...readConnectionIds,
        ...connectionResults.map((request) => String(request._id)),
      ]),
    ];

    setReadConnectionIds(updated);
    localStorage.setItem(readStorageKey, JSON.stringify(updated));
  };

  const fetchConnectionResults = async () => {
    if (!user?.email || user?.role !== "patient") return;

    try {
      const response = await axios.get(
        `http://localhost:3002/patient/connection-request-results/${encodeURIComponent(user.email)}`
      );

      setConnectionResults(response.data?.requests || []);
    } catch (error) {
      console.error("Connection results error:", error);
    }
  };

  const fetchNotifications =
    async () => {
      if (
        !user?.email ||
        user?.role !== "patient"
      ) {
        return;
      }

      try {
        const response =
          await axios.get(
            `http://localhost:3002/patient/caregiver-requests/${encodeURIComponent(
              user.email
            )}`
          );

        console.log(
          "Caregiver notification response:",
          response.data
        );

        setNotifications(
          response.data?.requests ||
          []
        );
      } catch (error) {
        console.error(
          "Notification fetch error:",
          error
        );
      }
    };

const [alarmCheckTick, setAlarmCheckTick] = useState(0);

useEffect(() => {
  if (!user?.email || user?.role !== "patient") return;

  const interval = setInterval(() => {
    setAlarmCheckTick((tick) => tick + 1);
  }, 1000);

  return () => clearInterval(interval);
}, [user?.email, user?.role]);

useEffect(() => {
if (
  !user?.email ||
  user?.role !== "patient"
) {
  return;
}

  if (!doseNotifications.length) return;

  const now = Date.now();

const dueDoses = doseNotifications.filter((dose) => {
  if (dose.status !== "Upcoming") return false;

  const nowOman = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Muscat",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

  const [currentHour, currentMinute] = nowOman.split(":").map(Number);
  const [doseHour, doseMinute] = dose.scheduledTime.split(":").map(Number);

  const currentMinutes = currentHour * 60 + currentMinute;
  const scheduledMinutes = doseHour * 60 + doseMinute;

 if (dose.snoozedUntil) {
  const snoozeDueTime = new Date(dose.snoozedUntil).getTime();

  return Number.isFinite(snoozeDueTime) && Date.now() >= snoozeDueTime;
}

return currentMinutes >= scheduledMinutes;
});

dueDoses.sort((a, b) => {
  const getAlarmTime = (dose) => {
    if (dose.snoozedUntil) {
      return new Date(dose.snoozedUntil).getTime();
    }

    const [hours, minutes] = dose.scheduledTime
      .split(":")
      .map(Number);

    return hours * 60 * 60000 + minutes * 60000;
  };

  return getAlarmTime(b) - getAlarmTime(a);
});

  for (const dose of dueDoses) {
    const snoozeTime = dose.snoozedUntil
      ? new Date(dose.snoozedUntil).getTime()
      : null;

    if (snoozeTime && snoozeTime > now) {
      continue;
    }

    const alarmKey =
      `${dose._id}-${snoozeTime || "original"}`;

    if (alarmedDoseKeys.current.has(alarmKey)) {
      continue;
    }

   const sameTimeDoses = dueDoses.filter((item) => {
  const itemSnoozeTime = item.snoozedUntil
    ? new Date(item.snoozedUntil).getTime()
    : null;

  if (itemSnoozeTime && itemSnoozeTime > now) {
    return false;
  }

  if (snoozeTime || itemSnoozeTime) {
  return (
    snoozeTime !== null &&
    itemSnoozeTime === snoozeTime
  );
}

return item.scheduledTime === dose.scheduledTime;
});

sameTimeDoses.forEach((item) => {
  const itemSnoozeTime = item.snoozedUntil
    ? new Date(item.snoozedUntil).getTime()
    : null;

  alarmedDoseKeys.current.add(
    `${item._id}-${itemSnoozeTime || "original"}`
  );
});

sessionStorage.setItem(
  "medimindAlarmedDoses",
  JSON.stringify([...alarmedDoseKeys.current])
);

startMedicationAlarm(sameTimeDoses);
break;
  }
}, [doseNotifications, alarmCheckTick, user?.email, user?.role]);

  const fetchDoseNotifications =
    async () => {
      if (
        !user?.email ||
        user?.role !== "patient"
      ) {
        return;
      }

      try {
      const now = new Date();

const omanDateTime = new Intl.DateTimeFormat(
  "en-GB",
  {
    timeZone: "Asia/Muscat",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }
).formatToParts(now);

const getPart = (type) =>
  omanDateTime.find((part) => part.type === type)?.value;

const date = `${getPart("year")}-${getPart("month")}-${getPart("day")}`;

const time = `${getPart("hour")}:${getPart("minute")}`;

await axios.post(
  "http://localhost:3002/patient/generate-today-doses",
  {
    userEmail: user.email,
  }
);
        const response =
          await axios.get(
            `http://localhost:3002/patient/dose-notifications/${encodeURIComponent(
              user.email
            )}`,
            {
              params: {
                date,
                time,
              },
            }
          );

        console.log(
          "Dose notification response:",
          response.data
        );

        setDoseNotifications(
          response.data
            ?.notifications || []
        );
      } catch (error) {
        console.error(
          "Dose notification fetch error:",
          error
        );
      }
    };

  useEffect(() => {
    if (
      !user?.email ||
      user?.role !== "patient"
    ) {
      return;
    }

    fetchNotifications();
    fetchConnectionResults();

    const connectionInterval = setInterval(() => {
      fetchConnectionResults();
    }, 5000);

    fetchDoseNotifications();

    const interval = setInterval(fetchDoseNotifications, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(connectionInterval);
    };
  }, [user?.email, user?.role]);

  const handleOpenProfile = (
    notification
  ) => {
    setSelectedCaregiver(
      notification
    );

    setIsProfileModalOpen(true);
  };

  const handleCloseProfile =
    () => {
      setIsProfileModalOpen(false);
      setSelectedCaregiver(null);
    };

  const handleRequest = async (
    requestId,
    status
  ) => {
    try {
      setProcessingRequestId(
        requestId
      );

      setMessage("");

      const response =
        await axios.put(
          `http://localhost:3002/patient/caregiver-request/${requestId}`,
          {
            patientEmail:
              user.email,

            status,
          }
        );

      setNotifications(
        (
          currentNotifications
        ) =>
          currentNotifications.filter(
            (
              notification
            ) =>
              notification._id !==
              requestId
          )
      );

      setMessage(
        response.data?.message ||
        `Request ${status.toLowerCase()}.`
      );

      if (
        selectedCaregiver?._id ===
        requestId
      ) {
        handleCloseProfile();
      }
    } catch (error) {
      console.error(
        "Notification update error:",
        error
      );

      setMessage(
        error.response?.data
          ?.message ||
        "Unable to update request."
      );
    } finally {
      setProcessingRequestId("");
    }
  };

  const handleDismissDoseNotification =
    async (doseId) => {
      if (
        !user?.email ||
        !doseId
      ) {
        return;
      }

      try {
        setDismissingDoseId(
          doseId
        );

        setMessage("");

        const response =
          await axios.put(
            `http://localhost:3002/patient/dose-notification/${doseId}/dismiss`,
            {
              userEmail:
                user.email,
            }
          );

        setDoseNotifications(
          (
            currentNotifications
          ) =>
            currentNotifications.filter(
              (
                notification
              ) =>
                notification._id !==
                doseId
            )
        );

        if (
          response.data?.message
        ) {
          setMessage(
            response.data.message
          );
        }
      } catch (error) {
        console.error(
          "Dismiss dose notification error:",
          error
        );

        setMessage(
          error.response?.data
            ?.message ||
          "Unable to dismiss notification."
        );
      } finally {
        setDismissingDoseId("");
      }
    };

  const getCertificateIcon = (
    certificateFile
  ) => {
    const fileName =
      certificateFile
        ?.toLowerCase() || "";

    if (
      fileName.endsWith(
        ".jpg"
      ) ||
      fileName.endsWith(
        ".jpeg"
      ) ||
      fileName.endsWith(
        ".png"
      )
    ) {
      return (
        <FaImage
          style={{
            color: "#198754",
            fontSize: "20px",
          }}
        />
      );
    }

    return (
      <FaFilePdf
        style={{
          color: "#dc3545",
          fontSize: "20px",
        }}
      />
    );
  };

  const totalNotifications =
    notifications.length +
    doseNotifications.length +
    unreadConnectionResults.length;

  if (
    user?.role !== "patient"
  ) {
    return null;
  }

  return (
    <>
      <style>{`
        .medimind-bell { position: relative; --bell-bg: #fff; --bell-text: #20334a; --bell-muted: #526579; --bell-border: #dbe4ee; --bell-section: #f5f8fc; }
        body.dark-mode .medimind-bell, body.dark-theme .medimind-bell,
        [data-theme="dark"] .medimind-bell, .dark-mode .medimind-bell, .dark-theme .medimind-bell {
          --bell-bg: #1b2d42; --bell-text: #f1f5f9; --bell-muted: #cbd5e1; --bell-border: #41566e; --bell-section: #243a51;
        }
        .medimind-bell .bell-panel { background: var(--bell-bg) !important; color: var(--bell-text) !important; border: 1px solid var(--bell-border); }
        .medimind-bell .bell-panel h5 { font-size: 21px; font-weight: 700; }
        .medimind-bell .bell-panel h6 { font-size: 18px; font-weight: 700; }
        .medimind-bell .bell-panel p, .medimind-bell .bell-panel strong,
        .medimind-bell .bell-panel .small { font-size: 16px !important; line-height: 1.75; }
        .medimind-bell .bell-panel .text-muted { color: var(--bell-muted) !important; }
        .medimind-bell .bell-panel .border-bottom { border-color: var(--bell-border) !important; }
        .medimind-bell .bell-panel .btn { font-size: 15px; padding: 8px 12px; }
        .medimind-bell .bell-panel .badge { font-size: 13px; white-space: normal; }
        .medimind-bell .bell-panel .bell-link { font-size: 16px !important; }
        .medimind-bell .bell-panel .bell-dismiss { color: var(--bell-muted) !important; }
        .medimind-bell .bell-panel .bell-section { background: var(--bell-section); border-radius: 10px; padding: 12px; }
        .medimind-bell .bell-panel .bell-section .border-bottom:last-child { border-bottom: 0 !important; }
        .medimind-bell .bell-panel { scrollbar-width: thin; }
        .medimind-bell .bell-panel .btn-link { color: #3986e8; }
        .medimind-bell .bell-panel[dir="rtl"] { text-align: right; }
        .medimind-bell .bell-panel[dir="ltr"] { text-align: left; }
        .medimind-bell .bell-trigger,
        .medimind-bell .bell-trigger svg {color: #172b48 !important;}
        .medimind-bell .bell-panel .bell-user-photo { margin-inline-end: 12px; }
        .medimind-bell .bell-panel .bell-dose-text { padding-inline-end: 28px; }
        .medimind-bell .bell-panel .bell-dismiss { inset-inline-end: 0; inset-inline-start: auto; }
        .medimind-bell .bell-panel .bell-link { cursor: pointer; }
        .medimind-bell .bell-panel .bell-link:focus-visible { outline: 2px solid #3986e8; }
        .medimind-bell .bell-panel .bell-section strong { overflow-wrap: anywhere; }
        .medimind-bell .bell-panel .bell-section p { overflow-wrap: anywhere; }
        .medimind-bell .bell-panel .bell-section .badge { margin-inline-start: 6px; }
        .medimind-bell .bell-panel .bell-section .btn { margin-inline-end: 8px; }
        .medimind-bell .bell-panel .bell-section .btn:last-child { margin-inline-end: 0; }
        .medimind-bell .bell-panel .bell-section .bell-profile-button { color: #3986e8; font-size: 16px; font-weight: 600; text-decoration: underline; background: none; border: 0; padding: 0; cursor: pointer; }
        .medimind-bell .bell-panel .bell-section .bell-profile-button:focus-visible { outline: 2px solid #3986e8; }
        .medimind-bell .bell-panel .bell-section .bell-profile-button:hover { color: #79b4ff; }
        .medimind-profile-modal { --profile-bg: #fff; --profile-text: #20334a; --profile-muted: #526579; --profile-border: #dbe4ee; }
        body.dark-mode .medimind-profile-modal, body.dark-theme .medimind-profile-modal,
        [data-theme="dark"] .medimind-profile-modal, .dark-mode .medimind-profile-modal, .dark-theme .medimind-profile-modal {
          --profile-bg: #1b2d42; --profile-text: #f1f5f9; --profile-muted: #cbd5e1; --profile-border: #41566e;
        }
        .medimind-profile-modal .modal-content { background: var(--profile-bg); color: var(--profile-text); border: 1px solid var(--profile-border); border-radius: 15px; }
        .medimind-profile-modal .text-muted { color: var(--profile-muted) !important; }
        .medimind-profile-modal .modal-header, .medimind-profile-modal .modal-footer { border-color: var(--profile-border); }
        .medimind-profile-modal .modal-body { font-size: 17px; line-height: 1.7; }
        .medimind-profile-modal .modal-body strong { font-size: 18px; }
        .medimind-profile-modal .modal-body .badge { font-size: 15px !important; }
        body.dark-mode .medimind-profile-modal .btn-close, body.dark-theme .medimind-profile-modal .btn-close, [data-theme="dark"] .medimind-profile-modal .btn-close { filter: invert(1); }
        .medimind-profile-modal .modal-header { display: flex; flex-direction: row; justify-content: space-between; align-items: center; }
        .medimind-profile-modal .modal-header .btn-close { margin: 0 !important; }
        .medimind-profile-modal .modal-body p { overflow-wrap: anywhere; }
        .medimind-profile-modal .modal-header[dir="rtl"] { flex-direction: row; }
        .medimind-profile-modal .modal-header[dir="rtl"] .btn-close { order: 2; }
        .medimind-profile-modal .modal-header[dir="rtl"] .modal-title { order: 1; }
        .medimind-profile-modal .modal-body .text-primary { color: #6da7ff !important; }
        .medimind-profile-modal .modal-body .btn { font-size: 17px; padding: 10px 14px; }
            `}</style>
      <div className="medimind-bell" style={{ position: "relative" }}>
        <button
          type="button"
          className="bell-trigger"
          onClick={() =>
            setShowNotifications(
              (
                currentValue
              ) =>
                !currentValue
            )
          }
          style={{
            position: "relative",
            border: "none",
            background:
              "transparent",
            fontSize: "22px",
            cursor: "pointer",
            padding: "5px",
          }}
          aria-label={t("Notifications", "الإشعارات")}
        >
          <FaBell />

          {totalNotifications >
            0 && (
              <span
                style={{
                  position:
                    "absolute",
                  top: "-2px",
                  right: "-5px",
                  backgroundColor:
                    "#dc3545",
                  color: "white",
                  borderRadius:
                    "50%",
                  minWidth:
                    "18px",
                  height: "18px",
                  fontSize: "11px",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  padding: "2px",
                }}
              >
                {
                  totalNotifications
                }
              </span>
            )}
        </button>

        {showNotifications && (
          <Card
            className="bell-panel"
            dir={isArabic ? "rtl" : "ltr"}
            style={{
              position:
                "absolute",
              right: isArabic ? "auto" : "0",
              left: isArabic ? "0" : "auto",
              top: "45px",
              width: "min(420px, calc(100vw - 24px))",
              zIndex: 1000,
              boxShadow:
                "0 5px 20px rgba(0,0,0,0.15)",
              maxHeight:
                "520px",
              overflowY:
                "auto",
              borderRadius:
                "14px",
            }}
          >
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{t("Notifications", "الإشعارات")}</h5>

                {unreadConnectionResults.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0"
                    onClick={markAllConnectionsAsRead}
                  >
                    {t("Mark All as Read", "تحديد الكل كمقروء")}
                  </button>
                )}
              </div>

              {message && (
                <div className="alert alert-info py-2">
                  {message}
                </div>
              )}

              {unreadConnectionResults.length > 0 && (
                <div className="mb-3">
                  <h6 className="mb-3">
                    {t("Connection Request Updates", "تحديثات طلبات الارتباط")}
                  </h6>

                  {unreadConnectionResults.map((request) => (
                    <div
                      key={`connection-${request._id}`}
                      className="bell-section border-bottom pb-3 mb-3"
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <strong>
                          {request.caregiverName ||
                            request.caregiverEmail ||
                            t("Caregiver", "مقدم رعاية")}
                        </strong>

                        <span
                          className={
                            request.status === "Accepted"
                              ? "badge bg-success"
                              : "badge bg-danger"
                          }
                        >
                          {t(request.status, request.status === "Accepted" ? "مقبول" : "مرفوض")}
                        </span>
                      </div>

                      <p className="small mb-0">
                        {request.status === "Accepted"
                          ? t("Your caregiver has accepted your connection request.", "وافق مقدم الرعاية على طلب الارتباط الخاص بك.")
                          : t("Your caregiver has rejected your connection request.", "رفض مقدم الرعاية طلب الارتباط الخاص بك.")}
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={() => markConnectionAsRead(request._id)}
                      >
                        {t("Mark as Read", "تحديد كمقروء")}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {doseNotifications.length >
                0 && (
                  <div className="mb-3">
                    <h6 className="mb-3">
                      Medication
                      Reminders
                    </h6>

                    {doseNotifications.map(
                      (dose) => (
                        <div
                          key={`dose-${dose._id}`}
                          className="bell-section border-bottom pb-3 mb-3"
                          style={{
                            position:
                              "relative",

                            paddingRight:
                              "28px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleDismissDoseNotification(
                                dose._id
                              )
                            }
                            disabled={
                              dismissingDoseId ===
                              dose._id
                            }
                            aria-label={t("Dismiss notification", "إخفاء الإشعار")}
                            title={t("Dismiss", "إخفاء")}
                            style={{
                              position:
                                "absolute",

                              top: "-2px",
                              insetInlineEnd: "0",

                              border:
                                "none",

                              background:
                                "transparent",

                              color:
                                "#6b7280",

                              fontSize:
                                "21px",

                              lineHeight:
                                "1",

                              cursor:
                                dismissingDoseId ===
                                  dose._id
                                  ? "not-allowed"
                                  : "pointer",

                              padding:
                                "0 4px",

                              opacity:
                                dismissingDoseId ===
                                  dose._id
                                  ? 0.45
                                  : 1,
                            }}
                          >
                            ×
                          </button>

                          <div className="d-flex justify-content-between align-items-start">
                            <div
                              style={{
                                paddingInlineEnd:
                                  "8px",
                              }}
                            >
                              <strong>
                                {
                                  dose.medicationName
                                }
                              </strong>

                              <p className="mb-1 small">
                                {t("Dosage:", "الجرعة:")}{" "}
                                {
                                  formatDosage(dose.dosage)
                                }
                              </p>

                              <p className="mb-1 small">
                                {t("Scheduled time:", "الوقت المحدد:")}{" "}
                                {
                                  formatTime(dose.scheduledTime)
                                }
                              </p>
                            </div>

                            <span
                              className={
                                dose.status ===
                                  "Missed"
                                  ? "badge bg-danger"
                                  : "badge bg-warning text-dark"
                              }
                              style={{
                                marginInlineStart:
                                  "6px",
                              }}
                            >
                              {dose.status ===
                                "Missed"
                                ? t("Missed", "فاتت الجرعة")
                                : t("Due Now", "حان الموعد")}
                            </span>
                          </div>

                          <p className="mb-0 mt-2">
                            {dose.status ===
                              "Missed"
                              ? t(`You missed your ${dose.medicationName} dose scheduled for ${formatTime(dose.scheduledTime)}.`, `فاتتك جرعة ${dose.medicationName} المحددة في ${formatTime(dose.scheduledTime)}.`)
                              : t(`It's time to take ${dose.medicationName}.`, `حان وقت تناول ${dose.medicationName}.`)}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}

              {notifications.length === 0 &&
doseNotifications.length === 0 &&
unreadConnectionResults.length === 0 ? (
  <p className="text-muted mb-0">
    {t("No new notifications.", "لا توجد إشعارات جديدة.")}
  </p>
) : (
  notifications.map((notification) => (
                    <div
                      key={
                        notification._id
                      }
                      className="bell-section border-bottom pb-3 mb-3"
                    >
                      <div className="d-flex align-items-center mb-2">
                        <img
                          src={
                            notification.caregiverProfilePicture
                              ? `http://localhost:3002${notification.caregiverProfilePicture}`
                              : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                          }
                          alt={
                            notification.caregiverName ||
                            "Caregiver"
                          }
                          style={{
                            width:
                              "45px",

                            height:
                              "45px",

                            borderRadius:
                              "50%",

                            objectFit:
                              "cover",

                            marginInlineEnd:
                              "12px",
                          }}
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                          }}
                        />

                        <div>
                          <strong>
                            {notification.caregiverName ||
                              t("Caregiver", "مقدم رعاية")}
                          </strong>

                          <p className="mb-0 small text-muted">
                            {
                              notification.caregiverEmail
                            }
                          </p>
                        </div>
                      </div>

                      <p className="mb-2">
                        {t("Wants permission to access your medication information.", "يرغب في الحصول على إذن للوصول إلى معلومات أدويتك.")}
                      </p>

                      <p className="small mb-2">
                        <strong>
                          {t("Relationship", "صلة العلاقة")}:
                        </strong>{" "}
                        {
                          notification.relationship
                        }
                      </p>

                      <button
                        type="button"
                        className="bell-profile-button"
                        onClick={() =>
                          handleOpenProfile(
                            notification
                          )
                        }
                        style={{
                          color:
                            "#0d6efd",

                          cursor:
                            "pointer",

                          textDecoration:
                            "underline",

                          fontSize:
                            "14px",

                          fontWeight:
                            "500",

                          display:
                            "inline-block",

                          marginBottom:
                            "14px",
                        }}
                      >
                        {t("View Profile", "عرض الملف الشخصي")}
                      </button>

                      <div>
                        <Button
                          color="success"
                          size="sm"
                          className="me-2"
                          disabled={
                            processingRequestId ===
                            notification._id
                          }
                          onClick={() =>
                            handleRequest(
                              notification._id,
                              "Accepted"
                            )
                          }
                        >
                          {processingRequestId ===
                            notification._id
                            ? t("Processing...", "جارٍ المعالجة...")
                            : t("Accept", "قبول")}
                        </Button>

                        <Button
                          color="danger"
                          outline
                          size="sm"
                          disabled={
                            processingRequestId ===
                            notification._id
                          }
                          onClick={() =>
                            handleRequest(
                              notification._id,
                              "Rejected"
                            )
                          }
                        >
                          {t("Reject", "رفض")}
                        </Button>
                      </div>
                    </div>
                  )
                )
              )}
            </CardBody>
          </Card>
        )}
      </div>

      <Modal
        className="medimind-profile-modal"
        isOpen={
          isProfileModalOpen
        }
        toggle={
          handleCloseProfile
        }
        size="lg"
        centered
        scrollable
        contentClassName="medimind-modal-content"
      >
        <ModalHeader
          dir={isArabic ? "rtl" : "ltr"}
          toggle={
            handleCloseProfile
          }
        >
          {t("Caregiver Profile", "ملف مقدم الرعاية")}
        </ModalHeader>

        <ModalBody dir={isArabic ? "rtl" : "ltr"}>
          {selectedCaregiver && (
            <>
              <div className="text-center mb-4">
                <img
                  src={
                    selectedCaregiver.caregiverProfilePicture
                      ? `http://localhost:3002${selectedCaregiver.caregiverProfilePicture}`
                      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt={
                    selectedCaregiver.caregiverName ||
                    "Caregiver"
                  }
                  style={{
                    width:
                      "110px",

                    height:
                      "110px",

                    borderRadius:
                      "50%",

                    objectFit:
                      "cover",

                    border:
                      "3px solid #dee2e6",

                    marginBottom:
                      "14px",
                  }}
                />

                <h4 className="mb-1">
                  {selectedCaregiver.caregiverName ||
                    t("Caregiver", "مقدم رعاية")}
                </h4>

                <p className="text-muted mb-0">
                  {
                    selectedCaregiver.caregiverEmail
                  }
                </p>

                {selectedCaregiver.caregiverPhoneNumber && (
                  <p className="text-muted mb-0">
                    {
                      selectedCaregiver.caregiverPhoneNumber
                    }
                  </p>
                )}
              </div>

              <hr />

              <Row>
                <div className="col-md-6 mb-3">
                  <strong>
                    {t("Degree or Qualification", "الدرجة العلمية أو المؤهل")}
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedCaregiver.caregiverDegree ||
                      t("Not provided", "غير متوفر")}
                  </p>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>
                    {t("Years of Experience", "سنوات الخبرة")}
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedCaregiver.caregiverExperience !==
                      undefined &&
                      selectedCaregiver.caregiverExperience !==
                      null
                      ? t(`${selectedCaregiver.caregiverExperience} year(s)`, `${selectedCaregiver.caregiverExperience} سنة`)
                      : t("Not provided", "غير متوفر")}
                  </p>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>
                    {t("Location", "الموقع")}
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedCaregiver.caregiverLocation ||
                      t("Not provided", "غير متوفر")}
                  </p>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>
                    {t("Relationship", "صلة العلاقة")}
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedCaregiver.relationship ||
                      t("Not provided", "غير متوفر")}
                  </p>
                </div>
              </Row>

              <div className="mb-4">
                <strong>
                  {t("About", "نبذة تعريفية")}
                </strong>

                <p
                  className="text-muted mt-2 mb-0"
                  style={{
                    lineHeight:
                      "1.7",
                  }}
                >
                  {selectedCaregiver.caregiverBio ||
                    t("No biography has been provided.", "لم تتم إضافة نبذة تعريفية.")}
                </p>
              </div>

              <div className="mb-4">
                <strong>
                  {t("Languages Spoken", "اللغات المتحدث بها")}
                </strong>

                {selectedCaregiver
                  .caregiverLanguages
                  ?.length > 0 ? (
                  <div
                    className="mt-2"
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap: "8px",
                    }}
                  >
                    {selectedCaregiver.caregiverLanguages.map(
                      (
                        language
                      ) => (
                        <span
                          key={
                            language
                          }
                          className="badge bg-light text-dark border"
                          style={{
                            padding:
                              "8px 12px",

                            fontSize:
                              "13px",
                          }}
                        >
                          {
                            language
                          }
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted mt-2 mb-0">
                    {t("Not provided", "غير متوفر")}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <strong>
                  {t("Available Days", "أيام التوفر")}
                </strong>

                {selectedCaregiver
                  .caregiverAvailability
                  ?.length > 0 ? (
                  <div
                    className="mt-2"
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap: "8px",
                    }}
                  >
                    {selectedCaregiver.caregiverAvailability.map(
                      (
                        day
                      ) => (
                        <span
                          key={day}
                          className="badge bg-success"
                          style={{
                            padding:
                              "8px 12px",

                            fontSize:
                              "13px",
                          }}
                        >
                          {day}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted mt-2 mb-0">
                    {t("Not provided", "غير متوفر")}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <strong>
                  {t("Preferred Times", "الأوقات المفضلة")}
                </strong>

                {selectedCaregiver
                  .caregiverAvailableTimes
                  ?.length > 0 ? (
                  <div
                    className="mt-2"
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap: "8px",
                    }}
                  >
                    {selectedCaregiver.caregiverAvailableTimes.map(
                      (
                        time
                      ) => (
                        <span
                          key={
                            time
                          }
                          className="badge bg-primary"
                          style={{
                            padding:
                              "8px 12px",

                            fontSize:
                              "13px",
                          }}
                        >
                          {time}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted mt-2 mb-0">
                    {t("Not provided", "غير متوفر")}
                  </p>
                )}
              </div>

              <div className="mb-2">
                <strong>
                  Professional
                  Certificates
                </strong>

                {selectedCaregiver
                  .caregiverCertificates
                  ?.length > 0 ? (
                  <div className="mt-3">
                    {selectedCaregiver.caregiverCertificates.map(
                      (
                        certificate
                      ) => (
                        <div
                          key={
                            certificate._id ||
                            certificate.certificateFile
                          }
                          style={{
                            display:
                              "flex",

                            justifyContent:
                              "space-between",

                            alignItems:
                              "center",

                            border:
                              "1px solid #dee2e6",

                            borderRadius:
                              "10px",

                            padding:
                              "12px 15px",

                            marginBottom:
                              "10px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap: "10px",
                            }}
                          >
                            {getCertificateIcon(
                              certificate.certificateFile
                            )}

                            <span>
                              {
                                certificate.certificateName
                              }
                            </span>
                          </div>

                          <a
                            href={`http://localhost:3002${certificate.certificateFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t("View Certificate", "عرض الشهادة")}
                            style={{
                              color:
                                "#0d6efd",

                              fontSize:
                                "20px",
                            }}
                          >
                            <FaEye />
                          </a>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted mt-2 mb-0">
                    {t("No certificates uploaded.", "لم تُرفع أي شهادات.")}
                  </p>
                )}
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter dir={isArabic ? "rtl" : "ltr"}>
          <Button
            color="secondary"
            onClick={
              handleCloseProfile
            }
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      
<Modal
  className="medimind-profile-modal"
  isOpen={activeAlarmDoses.length > 0}
  centered
  backdrop="static"
  keyboard={false}
>
  <ModalHeader dir={isArabic ? "rtl" : "ltr"}>
     {t("Medication Reminder", "تذكير الدواء")}
  </ModalHeader>

  <ModalBody className="text-center" dir={isArabic ? "rtl" : "ltr"}>
    <h4 className="mb-3">
      {t("Time to take your medication!", "حان وقت تناول دوائك!")}
    </h4>

{activeAlarmDoses.map((dose) => (
  <div key={dose._id} className="rounded p-3 mb-3" style={{ border: "1px solid var(--profile-border)" }}>
    <h5 className="text-primary">
      {dose.medicationName}
    </h5>

    <p className="mb-1">
      <strong>{t("Dosage:", "الجرعة:")}</strong> {formatDosage(dose.dosage)}
    </p>

    <p className="mb-3">
      <strong>{t("Scheduled Time:", "الوقت المحدد:")}</strong> {formatTime(dose.scheduledTime)}
    </p>

    <div className="d-flex justify-content-center flex-wrap gap-2">
      <Button
        color="success"
        disabled={isProcessingAlarm}
        onClick={() => handleAlarmAction("Taken", dose._id)}
      >
        {t("Taken", "تم التناول")}
      </Button>

      <Button
        color="warning"
        disabled={
          isProcessingAlarm || (dose.snoozeCount || 0) >= 2
        }
        onClick={() => handleAlarmAction("Snooze", dose._id)}
      >
        {t("Snooze (5 min)", "تأجيل 5 دقائق")}
      </Button>

      <Button
        color="danger"
        disabled={isProcessingAlarm}
        onClick={() => handleAlarmAction("Skipped", dose._id)}
      >
        {t("Skip", "تخطي")}
      </Button>
    </div>
  </div>
))}

    <p className="text-muted small">
      {t("The alarm will stop ringing after 60 seconds.", "سيتوقف صوت المنبّه بعد 60 ثانية.")}
    </p>
  </ModalBody>
</Modal>

    </>
  );
};

export default NotificationBell;
