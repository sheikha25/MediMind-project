import { useEffect, useState } from "react";
import axios from "axios";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Alert,
  Progress,
} from "reactstrap";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const Home = () => {
  const [language, setLanguage] = useState(
  () => localStorage.getItem("medimindLanguage") || "en"
);

const isArabic = language === "ar";

const t = (english, arabic) =>
  isArabic ? arabic : english;
  useEffect(() => {
    const syncLanguage = () =>
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
    window.addEventListener("medimind-language-change", syncLanguage);
    window.addEventListener("storage", syncLanguage);
    return () => {
      window.removeEventListener("medimind-language-change", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const user = useSelector(
    (state) => state.user.user
  );

  const navigate = useNavigate();

  const [todayDoses, setTodayDoses] =
    useState([]);

  const [isLoadingDoses, setIsLoadingDoses] =
    useState(false);

  const [doseMessage, setDoseMessage] =
    useState("");

  const [
    doseMessageType,
    setDoseMessageType,
  ] = useState("info");

  const [
    processingDoseId,
    setProcessingDoseId,
  ] = useState("");

  const [myCaregiver, setMyCaregiver] =
  useState(null);

const [
  isLoadingCaregiver,
  setIsLoadingCaregiver,
] = useState(false);
  


const formatDosage = (dosage) => {
  if (dosage === null || dosage === undefined) {
    return "-";
  }

  const value = String(dosage).trim();

  if (!isArabic) return value;

  const units = {
    tablet: "قرص",
    tablets: "أقراص",
    capsule: "كبسولة",
    capsules: "كبسولات",
    pill: "حبة",
    pills: "حبات",
    mg: "ملغ",
    g: "غرام",
    mcg: "ميكروغرام",
    ml: "مل",
    drops: "قطرات",
    drop: "قطرة",
    tsp: "ملعقة صغيرة",
    tbsp: "ملعقة كبيرة",
  };

  // Translate units only, preserving numbers.
  return value.replace(
    /\b(tablets?|capsules?|pills?|mg|mcg|g|ml|drops?|tsp|tbsp)\b/gi,
    (match) => units[match.toLowerCase()] || match
  );
};

  
const formatTime = (time) => {
  if (!time) {
    return t("Not scheduled", "غير مجدول");
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 || hours > 23 ||
    minutes < 0 || minutes > 59
  ) {
    return time;
  }

  const formattedHour = String(hours % 12 || 12).padStart(2, "0");
  const formattedMinute = String(minutes).padStart(2, "0");

  if (isArabic) {
    return `${formattedHour}:${formattedMinute} ${hours < 12 ? "ص" : "م"}`;
  }

  return `${formattedHour}:${formattedMinute} ${hours < 12 ? "AM" : "PM"}`;
};


  const loadTodayDoses = async () => {
    if (!user?.email) {
      return;
    }

    try {
      setIsLoadingDoses(true);
      setDoseMessage("");

      await axios.post(
        "http://localhost:3002/patient/generate-today-doses",
        {
          userEmail: user.email,
        }
      );

      const response = await axios.get(
        `http://localhost:3002/patient/today-doses/${encodeURIComponent(
          user.email
        )}`
      );

      setTodayDoses(
        response.data?.doses || []
      );
    } catch (error) {
      console.error(
        "Load today doses error:",
        error
      );

      setDoseMessage(
        error.response?.data?.message ||
          "Unable to load today's medications."
      );

      setDoseMessageType("danger");
    } finally {
      setIsLoadingDoses(false);
    }
  };

  const loadMyCaregiver = async () => {
  if (!user?.email) {
    return;
  }

  try {
    setIsLoadingCaregiver(true);

    const response = await axios.get(
      `http://localhost:3002/patient/my-caregiver/${encodeURIComponent(
        user.email
      )}`
    );

    setMyCaregiver(
      response.data?.caregiver || null
    );
  } catch (error) {
    console.error(
      "Load caregiver error:",
      error
    );

    setMyCaregiver(null);
  } finally {
    setIsLoadingCaregiver(false);
  }
};



  useEffect(() => {
  loadTodayDoses();
  loadMyCaregiver();
}, [user?.email]);

  const handleDoseStatus = async (
    doseId,
    status
  ) => {
    if (!user?.email) {
      setDoseMessage(
        "Please log in again."
      );

      setDoseMessageType("danger");
      return;
    }

    try {
      setProcessingDoseId(doseId);
      setDoseMessage("");

      const response = await axios.put(
        `http://localhost:3002/patient/dose/${doseId}/status`,
        {
          userEmail: user.email,
          status,
        }
      );

      setTodayDoses((currentDoses) =>
        currentDoses.map((dose) =>
          dose._id === doseId
            ? response.data.dose
            : dose
        )
      );

      setDoseMessage(
        response.data?.message ||
          "Dose updated successfully."
      );

      setDoseMessageType("success");
    } catch (error) {
      console.error(
        "Update dose status error:",
        error
      );

      setDoseMessage(
        error.response?.data?.message ||
          "Unable to update the dose."
      );

      setDoseMessageType("danger");
    } finally {
      setProcessingDoseId("");
    }
  };

  const totalDoseCount = todayDoses.length;

  const takenDoses = todayDoses.filter(
    (dose) => dose.status === "Taken"
  );

  const upcomingDoses = todayDoses.filter(
    (dose) => dose.status === "Upcoming"
  );

  const missedDoses = todayDoses.filter(
    (dose) => dose.status === "Missed"
  );

  const skippedDoses = todayDoses.filter(
    (dose) => dose.status === "Skipped"
  );

  const adherencePercentage =
    totalDoseCount === 0
      ? 0
      : Math.round(
          (takenDoses.length /
            totalDoseCount) *
            100
        );

  const groupedUpcomingReminders = Object.values(
  upcomingDoses
    .slice()
    .sort((firstDose, secondDose) =>
      firstDose.scheduledTime.localeCompare(
        secondDose.scheduledTime
      )
    )
    .reduce((groups, dose) => {
      const key = `${dose.medicationName}-${dose.dosage}`;

      if (!groups[key]) {
        groups[key] = {
          medicationName: dose.medicationName,
          dosage: dose.dosage,
          doses: [],
        };
      }

      groups[key].doses.push(dose);

      return groups;
    }, {})
);

const nextReminders = groupedUpcomingReminders.slice(0, 2);

  const getStatusClass = (status) => {
    switch (status) {
      case "Taken":
        return "badge bg-success";

      case "Missed":
        return "badge bg-danger";

      case "Skipped":
        return "badge bg-secondary";

      default:
        return "badge bg-warning text-dark";
    }
  };

  return (
   <Container
  fluid
  className="dashboard-page patient-home-page"
  dir={isArabic ? "rtl" : "ltr"}
>
      <Header />

      

<style>{`
  /* Statistics cards */
  .dashboard-page .dashboard-card .text-muted {
    font-size: 17px !important;
    color: #475569 !important;
    line-height: 1.8 !important;
  }

  /* Statistics numbers */
  .dashboard-page .dashboard-card h3 {
    font-size: 30px !important;
    font-weight: 700 !important;
  }

  /* Caregiver heading */
  .dashboard-page .dashboard-card h4 {
    font-size: 25px !important;
    font-weight: 700 !important;
  }

  /* Caregiver details */
  .dashboard-page .dashboard-card h5 {
    font-size: 20px !important;
    line-height: 1.7 !important;
  }

  /* Welcome description */
  .dashboard-page > .row .text-muted {
    font-size: 17px !important;
    line-height: 1.8 !important;
  }

  /* Dark mode */
  body.dark-mode .dashboard-page .dashboard-card .text-muted,
  body.dark-theme .dashboard-page .dashboard-card .text-muted,
  [data-theme="dark"] .dashboard-page .dashboard-card .text-muted {
    color: #cbd5e1 !important;
  }

        .patient-home-page .dashboard-card {
          border-radius: 16px;
        }
        .patient-home-page .dashboard-card .text-muted {
          font-size: 16px !important;
          line-height: 1.65;
        }
        .patient-home-page .dashboard-card h4 {
          font-size: 23px;
          font-weight: 700;
          line-height: 1.5;
        }
        .patient-home-page .dashboard-card h5 {
          font-size: 19px;
          line-height: 1.5;
        }
        .patient-home-page .dashboard-card .badge {
          font-size: 14px;
          padding: 7px 10px;
          white-space: normal;
          line-height: 1.4;
        }
        .patient-home-page .dashboard-card .btn {
          font-size: 15px;
          line-height: 1.45;
          padding: 9px 12px;
          white-space: normal;
        }
        .patient-home-page .dashboard-table {
          width: 100%;
          min-width: 740px;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: auto;
          font-size: 16px;
        }
        .patient-home-page .dashboard-table th,
        .patient-home-page .dashboard-table td {
          padding: 14px 12px;
          vertical-align: middle;
          line-height: 1.6;
          text-align: start;
          overflow-wrap: anywhere;
        }
        .patient-home-page .dashboard-table th {
          font-size: 16px;
          font-weight: 700;
          white-space: nowrap;
        }
        .patient-home-page .dashboard-table td:first-child {
          min-width: 150px;
          max-width: 250px;
          font-weight: 600;
        }
        .patient-home-page .dashboard-table td:last-child {
          min-width: 155px;
        }
        .patient-home-page .dashboard-table td .d-flex {
          align-items: center;
        }
        .patient-home-page .reminder-box {
          padding: 16px;
          border-radius: 13px;
          line-height: 1.7;
          font-size: 17px;
        }
        .patient-home-page .reminder-box h5 {
          overflow-wrap: anywhere;
          font-size: 19px;
        }
        .patient-home-page .reminder-box .text-muted {
          font-size: 16px !important;
        }
        .patient-home-page > .row:first-of-type h4 {
          font-size: 26px;
          line-height: 1.5;
          font-weight: 700;
        }
        .patient-home-page > .row:first-of-type p {
          font-size: 17px;
        }
        .patient-home-page[dir="rtl"] .dashboard-table {
          direction: rtl;
        }
        body.dark-mode .patient-home-page .dashboard-table td,
        body.dark-theme .patient-home-page .dashboard-table td,
        [data-theme="dark"] .patient-home-page .dashboard-table td {
          color: #f1f5f9;
        }
        @media (max-width: 768px) {
          .patient-home-page .dashboard-card h4 { font-size: 21px; }
          .patient-home-page .dashboard-table { font-size: 15px; }
        }
          /* All statistics cards */
.patient-home-page .dashboard-card p,
.patient-home-page .dashboard-card small,
.patient-home-page .dashboard-card .text-muted {
font-size: 20px !important;
line-height: 1.8 !important;
}

/* Make secondary text darker */
.patient-home-page .dashboard-card .text-muted {
color: #334155 !important;
}

/* Statistics numbers */
.patient-home-page .dashboard-card h3 {
font-size: 36px !important;
font-weight: 800 !important;
}

/* Section headings */
.patient-home-page .dashboard-card h4 {
font-size: 27px !important;
font-weight: 700 !important;
}

/* Caregiver information */
.patient-home-page .dashboard-card h5 {
font-size: 22px !important;
}

/* Buttons */
.patient-home-page .dashboard-card .btn {
font-size: 18px !important;
font-weight: 600 !important;
}

/* Dark mode */
body.dark-mode .patient-home-page .dashboard-card .text-muted,
body.dark-theme .patient-home-page .dashboard-card .text-muted,
[data-theme="dark"] .patient-home-page .dashboard-card .text-muted {
color: #cbd5e1 !important;
}

/* Welcome description */
.patient-home-page > .row:first-of-type p.text-muted {
  font-size: 21px !important;
  line-height: 1.8 !important;
  color: #334155 !important;
}

/* Dashboard buttons */
.patient-home-page > .row:first-of-type .btn,
.patient-home-page .dashboard-card .btn {
  font-size: 19px !important;
  font-weight: 600 !important;
  padding: 13px 22px !important;
  line-height: 1.5 !important;
}

/* Dark mode welcome text */
body.dark-mode .patient-home-page > .row:first-of-type p.text-muted,
body.dark-theme .patient-home-page > .row:first-of-type p.text-muted,
[data-theme="dark"] .patient-home-page > .row:first-of-type p.text-muted {
  color: #cbd5e1 !important;
}


/* Medication overview action buttons */
.patient-home-page .dashboard-table td:last-child .btn {
  font-size: 17px !important;
  font-weight: 600 !important;
  padding: 10px 12px !important;
  line-height: 1.5 !important;
  white-space: normal !important;
  max-width: 190px;
  overflow-wrap: anywhere;
}

/* Medication table status badges */
.patient-home-page .dashboard-table .badge {
  font-size: 16px !important;
  padding: 8px 10px !important;
}

/* Reminder alerts */
.patient-home-page .reminder-box,
.patient-home-page .alert {
  font-size: 18px !important;
  line-height: 1.8 !important;
}

/* Dosage column */
.patient-home-page .dashboard-table .medication-dosage {
  font-size: 19px !important;
  font-weight: 600 !important;
  color: #1e293b;
  min-width: 115px;
  text-align: center;
}

/* Action column */
.patient-home-page .dashboard-table th:last-child,
.patient-home-page .dashboard-table td:last-child {
  min-width: 200px;
  text-align: center;
}

/* Action buttons */
.patient-home-page .dashboard-table td:last-child .btn {
  font-size: 17px !important;
  font-weight: 600 !important;
  padding: 10px 14px !important;
  border-radius: 9px;
  line-height: 1.5 !important;
  white-space: normal !important;
}

/* Button alignment */
.patient-home-page .dashboard-table td:last-child .d-flex {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

/* Dark mode dosage */
body.dark-mode .patient-home-page .medication-dosage,
body.dark-theme .patient-home-page .medication-dosage,
[data-theme="dark"] .patient-home-page .medication-dosage {
  color: #f1f5f9 !important;
}

      `}</style>


      <Row className="p-4 align-items-center justify-content-between">
        <Col md="6">
          <h4 className="mt-3">
           {t("Welcome Back,", "مرحبًا بعودتك،")}{" "}
{user?.name || t("User", "مستخدم")}
          </h4>

         <p
  className="text-muted mb-0"
  style={{
    fontSize: "21px",
    fontWeight: "500",
    lineHeight: "1.8",
    color: "#334155",
  }}
>
           {t(
  "Here is your medication schedule for today.",
  "إليك جدول أدويتك لهذا اليوم."
)}
          </p>
        </Col>

        <Col
          md="6"
         className="mt-3 mt-md-0 d-flex justify-content-end"
        >
          <button
            className="btn btn-primary"
           style={{
  borderRadius: "10px",
  padding: "13px 24px",
  fontSize: "19px",
  fontWeight: "600",
  lineHeight: "1.5",
}}
            onClick={() =>
              navigate("/medications/add")
            }
          >
           {t("+ Add Medication", "+ إضافة الدواء")}
          </button>
        </Col>
      </Row>

      {doseMessage && (
        <Row className="px-4">
          <Col>
            <Alert color={doseMessageType}>
              {doseMessage}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="px-4 g-3">
        <Col md="3" className="mb-3">
          <Card className="dashboard-card h-100">
            <CardBody
              style={{
                padding: "14px 18px",
              }}
            >
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                {t("Today's Doses", "جرعات اليوم")}
              </p>

              <div className="d-flex align-items-end justify-content-between">
                <h3
                  className="mb-0"
                  style={{
                    fontWeight: "700",
                  }}
                >
                  {isLoadingDoses
                    ? "..."
                    : totalDoseCount}
                </h3>

                <small className="text-muted">
                  {t("Scheduled today", "المجدولة اليوم")}
                </small>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md="3" className="mb-3">
          <Card className="dashboard-card h-100">
            <CardBody
              style={{
                padding: "14px 18px",
              }}
            >
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
               {t("Upcoming Reminder", "التذكيرات القادمة")}
              </p>

              <div className="d-flex align-items-end justify-content-between">
                <h3
                  className="mb-0"
                  style={{
                    fontWeight: "700",
                  }}
                >
                  {isLoadingDoses
                    ? "..."
                    : upcomingDoses.length}
                </h3>

                <small className="text-muted">
                 {t("Remaining", "المتبقية")}
                </small>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md="3" className="mb-3">
          <Card className="dashboard-card missed-card h-100">
            <CardBody
              style={{
                padding: "14px 18px",
              }}
            >
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                {t("Missed Doses", "الجرعات الفائتة")}
              </p>

              <div className="d-flex align-items-end justify-content-between">
                <h3
                  className="mb-0"
                  style={{
                    fontWeight: "700",
                  }}
                >
                  {isLoadingDoses
                    ? "..."
                    : missedDoses.length}
                </h3>

                <small className="text-muted">
                 {t("Today", "اليوم")}
                </small>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md="3" className="mb-3">
          <Card className="dashboard-card adherence-card h-100">
            <CardBody
              style={{
                padding: "14px 18px",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-1">
                <p
                  className="text-muted mb-0"
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                {t("Adherence", "الالتزام بالأدوية")}
                </p>

                <strong
                  style={{
                    fontSize: "18px",
                  }}
                >
                  {isLoadingDoses
                    ? "..."
                    : `${adherencePercentage}%`}
                </strong>
              </div>

              <Progress
                value={adherencePercentage}
                className="mt-2"
                style={{
                  height: "8px",
                  borderRadius: "10px",
                }}
              />

              <p
                className="text-muted mt-2 mb-0"
                style={{
                  fontSize: "17px",
                }}
              >
               {isArabic
  ? `تم تناول ${takenDoses.length} من أصل ${totalDoseCount} جرعة`
  : `${takenDoses.length} of ${totalDoseCount} doses taken`}
              </p>
            </CardBody>
          </Card>
        </Col>
      </Row>

<Row className="px-4 pb-2">
  <Col>
    <Card className="dashboard-card">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h4 className="mb-2">
            {t("My Caregiver", "مقدم الرعاية الخاص بي")}
            </h4>

            {isLoadingCaregiver ? (
              <p className="text-muted mb-0">
                {t("Loading caregiver...", "جارٍ تحميل بيانات مقدم الرعاية...")}
              </p>
            ) : myCaregiver ? (
              <>
                <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                  <h5 className="mb-0">
                    {myCaregiver.name}
                  </h5>

                  {myCaregiver.professionalVerificationStatus ===
                    "Verified" && (
                    <span className="badge bg-primary">
                     {t("✓ Verified", "✓ موثّق")}
                    </span>
                  )}
                </div>

                {myCaregiver.relationship && (
                  <p className="text-muted mb-1">
                    {t("Relationship:", "صلة القرابة:")}{" "}
                    {myCaregiver.relationship}
                  </p>
                )}

                {myCaregiver.email && (
                  <p className="text-muted mb-1">
                    {t("Email:", "البريد الإلكتروني:")} {myCaregiver.email}
                  </p>
                )}

                {myCaregiver.phoneNumber && (
                  <p className="text-muted mb-0">
                    {t("Phone:", "رقم الهاتف:")}{" "}
                    {myCaregiver.phoneNumber}
                  </p>
                )}
                <div
  className="mt-3 d-flex align-items-center gap-2"
>
  <span
    className="text-muted"
    style={{
      fontSize: "14px",
      fontWeight: "500",
    }}
  >
  {t("Medication Management:", "إدارة الأدوية:")}
  </span>

  {myCaregiver.medicationManagementPermission ? (
    <span className="badge bg-success">
     {t("✓ Allowed", "✓ مسموح")}
    </span>
  ) : (
    <span className="badge bg-secondary">
     {t("Not Allowed", "غير مسموح")}
    </span>
  )}
</div>
              </>
            ) : (
              <>
                <h5 className="mb-1">
                 {t("No caregiver connected yet", "لا يوجد مقدم رعاية مرتبط حاليًا")}
                </h5>

                <p className="text-muted mb-0">
                 {t(
  "Connect with a caregiver to receive additional support.",
  "ارتبط بمقدم رعاية للحصول على دعم إضافي."
)}
                </p>
              </>
            )}
          </div>

          {!isLoadingCaregiver && (
            <Button style={{
  fontSize: "19px",
  fontWeight: "600",
  padding: "13px 22px",
  borderRadius: "10px",
  lineHeight: "1.5",
}}
color="primary"
              outline={Boolean(myCaregiver)}
              onClick={() =>
                navigate("/caregiver")
              }
            >
              {myCaregiver
                ? t("View Caregiver", "عرض مقدم الرعاية")
                : t("Find a Caregiver", "البحث عن مقدم رعاية")}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  </Col>
</Row>

      <Row className="p-4 pt-2">
        <Col md="8" className="mb-4">
          <Card className="dashboard-card h-100">
            <CardBody>
              <h4 className="mb-3">
                {t("Today's Medication Overview", "نظرة عامة على أدوية اليوم")}
              </h4>

              {isLoadingDoses && (
                <Alert color="info">
                  {t("Loading today's medications...", "جارٍ تحميل أدوية اليوم...")}
                </Alert>
              )}

              {!isLoadingDoses &&
                todayDoses.length === 0 && (
                  <div className="text-center py-5">
                    <h5>
                     {t("No medications scheduled today", "لا توجد أدوية مجدولة اليوم")}
                    </h5>

                    <p className="text-muted mb-3">
                     {t(
  "Add a medication and choose its reminder time to see it here.",
  "أضف دواءً وحدد وقت التذكير ليظهر هنا."
)}
                    </p>

                    <Button
                      color="primary"
                      onClick={() =>
                        navigate(
                          "/medications/add"
                        )
                      }
                    >
                    {t("Add Medication", "إضافة دواء")}
                    </Button>
                  </div>
                )}

              {!isLoadingDoses &&
                todayDoses.length > 0 && (
                  <div
                    style={{
                      overflowX: "auto",
                    }}
                  >
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>{t("Name", "اسم الدواء")}</th>
                          <th>{t("Dosage", "الجرعة")}</th>
                          <th>{t("Time", "الوقت")}</th>
                          <th>{t("Status", "الحالة")}</th>
                          <th>{t("Action", "الإجراء")}</th>
                        </tr>
                      </thead>

                      <tbody>
                        {todayDoses.map(
                          (dose) => (
                            <tr key={dose._id}>
                              <td>
                                {
                                  dose.medicationName
                                }
                              </td>

                              

<td className="medication-dosage">
  <span dir="auto">
    {formatDosage(dose.dosage)}
  </span>
</td>



                              <td>
                                {formatTime(
                                  dose.scheduledTime
                                )}
                              </td>

                              <td>
                                <span
                                  className={getStatusClass(
                                    dose.status
                                  )}
                                >
                                  {isArabic
  ? ({
      Taken: "تم تناوله",
      Missed: "فائت",
      Upcoming: "قادم",
      Skipped: "تم تخطيه"
    }[dose.status] || dose.status)
  : dose.status}
                                </span>
                              </td>

                              <td>
                                {dose.status ===
                                  "Upcoming" ||
                                dose.status ===
                                  "Missed" ? (
                                  <div className="d-flex flex-wrap gap-2">
                                    <Button
                                      color="success"
                                      size="sm"
                                      disabled={
                                        processingDoseId ===
                                        dose._id
                                      }
                                      onClick={() =>
                                        handleDoseStatus(
                                          dose._id,
                                          "Taken"
                                        )
                                      }
                                    >
                                      {processingDoseId ===
                                      dose._id
                                        ? t("Updating...", "جارٍ التحديث...")

: dose.status === "Missed"
  ? t("Taken Late", "تناولتها متأخرًا")
  : t("Mark as Taken", "تم التناول")}

                                    </Button>

                                    {dose.status ===
                                      "Upcoming" && (
                                      <Button
                                        color="secondary"
                                        outline
                                        size="sm"
                                        disabled={
                                          processingDoseId ===
                                          dose._id
                                        }
                                        onClick={() =>
                                          handleDoseStatus(
                                            dose._id,
                                            "Skipped"
                                          )
                                        }
                                      >
                                        {t("Skip", "تخطي")}
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted">
                                    {dose.status ===
                                    "Taken"
                                      ? t("Dose completed", "تم إكمال الجرعة")
: t("Dose updated", "تم تحديث الجرعة")}
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
            </CardBody>
          </Card>
        </Col>

        <Col md="4" className="mb-4">
          <Card className="dashboard-card h-100">
            <CardBody>
              <h4 className="mb-3">
               {t("Today's Reminder", "تذكيرات اليوم")}
              </h4>

              {isLoadingDoses && (
                <Alert color="info">
                 {t("Loading reminders...", "جارٍ تحميل التذكيرات...")}
                </Alert>
              )}

              {!isLoadingDoses &&
                nextReminders.length === 0 && (
                  <div className="text-center py-5">
                    <h5>
                      {t("No upcoming reminders", "لا توجد تذكيرات قادمة")}
                    </h5>

                    <p className="text-muted mb-0">
                     {t(
  "You have no remaining scheduled doses today.",
  "ليس لديك أي جرعات متبقية مجدولة لهذا اليوم."
)}
                    </p>
                  </div>
                )}

              {nextReminders.map((reminder, index) => (
  <div
    key={`${reminder.medicationName}-${reminder.dosage}`}
    className={
      index > 0
        ? "reminder-box mt-3"
        : "reminder-box"
    }
  >
    <h5>{reminder.medicationName}</h5>

    
<p className="mb-2">
  {formatDosage(reminder.dosage)}
</p>


    {reminder.doses.map((dose) => (
      <div
        key={dose._id}
        className="d-flex justify-content-between align-items-center mb-2"
      >
        <span className="text-muted">
          {formatTime(dose.scheduledTime)}
        </span>

        <span className="badge bg-warning text-dark">
         {t("Upcoming", "قادم")}
        </span>
      </div>
    ))}
  </div>
))}

              {missedDoses.length > 0 && (
                <Alert
                  color="danger"
                  className="mt-3 mb-0"
                >
                 {isArabic
  ? `لديك ${missedDoses.length} جرعة فائتة. لا يزال بإمكانك تسجيلها كجرعات تم تناولها متأخرًا من جدول الأدوية.`
  : `You have ${missedDoses.length} missed dose${missedDoses.length !== 1 ? "s" : ""}. You can still mark them as taken late from the medication overview.`}
                </Alert>
              )}

              {skippedDoses.length > 0 && (
                <Alert
                  color="secondary"
                  className="mt-3 mb-0"
                >
                 {isArabic
  ? `لقد تخطيت ${skippedDoses.length} جرعة اليوم.`
  : `You skipped ${skippedDoses.length} dose${skippedDoses.length !== 1 ? "s" : ""} today.`}
                </Alert>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Footer />
    </Container>
  );
};

export default Home;
