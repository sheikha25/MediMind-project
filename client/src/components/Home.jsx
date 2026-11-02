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

import Header from "./Header";

const Home = () => {
  const [language, setLanguage] = useState(
  () => localStorage.getItem("medimindLanguage") || "en"
);

const isArabic = language === "ar";

const t = (english, arabic) =>
  isArabic ? arabic : english;
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
  


  const formatTime = (time) => {
    if (!time) {
      return "Not scheduled";
    }

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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
  className="dashboard-page"
  dir={isArabic ? "rtl" : "ltr"}
>
      <Header />

      <Row className="p-4 align-items-center justify-content-between">
        <Col md="6">
          <h4 className="mt-3">
           {t("Welcome Back,", "مرحبًا بعودتك،")}{" "}
{user?.name || t("User", "مستخدم")}
          </h4>

          <p className="text-muted mb-0">
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
              padding: "10px 20px",
              fontWeight: "500",
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
                  fontSize: "12px",
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
            <Button
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
  "أضيفي دواءً وحددي وقت التذكير ليظهر هنا."
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

                              <td>
                                {dose.dosage}
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
? t("Mark as Taken Late", "تسجيل الجرعة كمتناولة متأخرًا")
: t("Mark as Taken", "تم تناول الجرعة")}
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
                                        Skip
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
      {reminder.dosage}
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
    </Container>
  );
};

export default Home;