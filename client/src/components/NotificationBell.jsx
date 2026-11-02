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

  const [connectionResults, setConnectionResults] = useState([]);
  const [readConnectionIds, setReadConnectionIds] = useState([]);
  const previousConnectionIds = useRef(null);
 const previousDoseIds = useRef(null);
 const alarmedDoseKeys = useRef(new Set());
const alarmAudioRef = useRef(null);
const alarmTimeoutRef = useRef(null);
const alarmIntervalRef = useRef(null);

const [activeAlarmDose, setActiveAlarmDose] = useState(null);
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


const startMedicationAlarm = (dose) => {
  // Stop any previous alarm before starting a new one.
  stopMedicationAlarm();

  setActiveAlarmDose(dose);

  const audio = new Audio(notificationSound);
  audio.volume = 0.8;
  audio.loop = true;

  alarmAudioRef.current = audio;

  audio.play().catch((error) => {
    console.warn(
      "Browser prevented automatic alarm sound:",
      error
    );
  });

  // Stop ringing after 60 seconds.
  alarmTimeoutRef.current = setTimeout(() => {
    stopMedicationAlarm();

    // Close the alarm popup after one minute.
    setActiveAlarmDose(null);
  }, 60 * 1000);
};


const handleAlarmAction = async (action) => {
  if (!activeAlarmDose || !user?.email || isProcessingAlarm) {
    return;
  }

  const doseId = activeAlarmDose._id;

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

    stopMedicationAlarm();
    setActiveAlarmDose(null);

    // Remove the old notification from the screen.
    setDoseNotifications((current) =>
      current.filter((dose) => dose._id !== doseId)
    );

    // Refresh notifications after the update.
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

useEffect(() => {
  if (
    !user?.email ||
    user?.role !== "patient" ||
    user?.notificationsEnabled === false
  ) {
    return;
  }

  if (!doseNotifications.length) return;

  const now = Date.now();

  const dueDoses = doseNotifications.filter(
    (dose) => dose.status === "Upcoming"
  );

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

    alarmedDoseKeys.current.add(alarmKey);
    startMedicationAlarm(dose);
    break;
  }
}, [
  doseNotifications,
  user?.email,
  user?.role,
  user?.notificationsEnabled,
]);

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
    if (user?.notificationsEnabled === false) {
      setDoseNotifications([]);

      return () => clearInterval(connectionInterval);
    }

    fetchDoseNotifications();

    const interval =
  setInterval(() => {
    fetchDoseNotifications();
  }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(connectionInterval);
    };
  }, [
    user?.email,
    user?.role,
    user?.notificationsEnabled,
  ]);

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
      <div
        style={{
          position: "relative",
        }}
      >
        <button
          type="button"
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
          aria-label="Notifications"
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
            style={{
              position:
                "absolute",
              right: "0",
              top: "45px",
              width: "360px",
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
                <h5 className="mb-0">Notifications</h5>

                {unreadConnectionResults.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0"
                    onClick={markAllConnectionsAsRead}
                  >
                    Mark All as Read
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
                    Connection Request Updates
                  </h6>

                  {unreadConnectionResults.map((request) => (
                    <div
                      key={`connection-${request._id}`}
                      className="border-bottom pb-3 mb-3"
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <strong>
                          {request.caregiverName ||
                            request.caregiverEmail ||
                            "Caregiver"}
                        </strong>

                        <span
                          className={
                            request.status === "Accepted"
                              ? "badge bg-success"
                              : "badge bg-danger"
                          }
                        >
                          {request.status}
                        </span>
                      </div>

                      <p className="small mb-0">
                        {request.status === "Accepted"
                          ? "Your caregiver has accepted your connection request."
                          : "Your caregiver has rejected your connection request."}
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={() => markConnectionAsRead(request._id)}
                      >
                        Mark as Read
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
                          className="border-bottom pb-3 mb-3"
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
                            aria-label="Dismiss notification"
                            title="Dismiss"
                            style={{
                              position:
                                "absolute",

                              top: "-2px",
                              right: "0",

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
                                paddingRight:
                                  "8px",
                              }}
                            >
                              <strong>
                                {
                                  dose.medicationName
                                }
                              </strong>

                              <p className="mb-1 small">
                                Dosage:{" "}
                                {
                                  dose.dosage
                                }
                              </p>

                              <p className="mb-1 small">
                                Scheduled
                                time:{" "}
                                {
                                  dose.scheduledTime
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
                                marginRight:
                                  "6px",
                              }}
                            >
                              {dose.status ===
                                "Missed"
                                ? "Missed"
                                : "Due Now"}
                            </span>
                          </div>

                          <p className="mb-0 mt-2">
                            {dose.status ===
                              "Missed"
                              ? `You missed your ${dose.medicationName} dose scheduled for ${dose.scheduledTime}.`
                              : `It's time to take ${dose.medicationName}.`}
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
    No new notifications.
  </p>
) : (
  notifications.map((notification) => (
                    <div
                      key={
                        notification._id
                      }
                      className="border-bottom pb-3 mb-3"
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

                            marginRight:
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
                              "Caregiver"}
                          </strong>

                          <p className="mb-0 small text-muted">
                            {
                              notification.caregiverEmail
                            }
                          </p>
                        </div>
                      </div>

                      <p className="mb-2">
                        Wants
                        permission to
                        access your
                        medication
                        information.
                      </p>

                      <p className="small mb-2">
                        <strong>
                          Relationship:
                        </strong>{" "}
                        {
                          notification.relationship
                        }
                      </p>

                      <span
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
                        View Profile
                      </span>

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
                            ? "Processing..."
                            : "Accept"}
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
                          Reject
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
        isOpen={
          isProfileModalOpen
        }
        toggle={
          handleCloseProfile
        }
        size="lg"
        centered
        scrollable
      >
        <ModalHeader
          toggle={
            handleCloseProfile
          }
        >
          Caregiver Profile
        </ModalHeader>

        <ModalBody>
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
                    "Caregiver"}
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
                    Degree or
                    Qualification
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedCaregiver.caregiverDegree ||
                      "Not provided"}
                  </p>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>
                    Years of
                    Experience
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedCaregiver.caregiverExperience !==
                      undefined &&
                      selectedCaregiver.caregiverExperience !==
                      null
                      ? `${selectedCaregiver.caregiverExperience} year(s)`
                      : "Not provided"}
                  </p>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>
                    Location
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedCaregiver.caregiverLocation ||
                      "Not provided"}
                  </p>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>
                    Relationship
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedCaregiver.relationship ||
                      "Not provided"}
                  </p>
                </div>
              </Row>

              <div className="mb-4">
                <strong>
                  About
                </strong>

                <p
                  className="text-muted mt-2 mb-0"
                  style={{
                    lineHeight:
                      "1.7",
                  }}
                >
                  {selectedCaregiver.caregiverBio ||
                    "No biography has been provided."}
                </p>
              </div>

              <div className="mb-4">
                <strong>
                  Languages Spoken
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
                    Not provided
                  </p>
                )}
              </div>

              <div className="mb-4">
                <strong>
                  Available Days
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
                    Not provided
                  </p>
                )}
              </div>

              <div className="mb-4">
                <strong>
                  Preferred Times
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
                    Not provided
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
                            title="View Certificate"
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
                    No certificates
                    uploaded.
                  </p>
                )}
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter>
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
  isOpen={Boolean(activeAlarmDose)}
  centered
  backdrop="static"
  keyboard={false}
>
  <ModalHeader>
     Medication Reminder
  </ModalHeader>

  <ModalBody className="text-center">
    <h4 className="mb-3">
      Time to take your medication!
    </h4>

    <h5 className="text-primary">
      {activeAlarmDose?.medicationName}
    </h5>

    <p className="mb-1">
      <strong>Dosage:</strong>{" "}
      {activeAlarmDose?.dosage}
    </p>

    <p className="mb-3">
      <strong>Scheduled Time:</strong>{" "}
      {activeAlarmDose?.scheduledTime}
    </p>

    <p className="text-muted small">
      The alarm will stop ringing after 60 seconds.
    </p>
  </ModalBody>

  <ModalFooter className="justify-content-center">
    <Button
      color="success"
      disabled={isProcessingAlarm}
      onClick={() => handleAlarmAction("Taken")}
    >
      Taken
    </Button>

    <Button
      color="warning"
      disabled={
        isProcessingAlarm ||
        (activeAlarmDose?.snoozeCount || 0) >= 2
      }
      onClick={() => handleAlarmAction("Snooze")}
    >
      Snooze (5 min)
    </Button>

    <Button
      color="danger"
      disabled={isProcessingAlarm}
      onClick={() => handleAlarmAction("Skipped")}
    >
      Skip
    </Button>
  </ModalFooter>
</Modal>

    </>
  );
};

export default NotificationBell;