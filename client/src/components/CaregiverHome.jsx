import { useEffect, useState,} from "react";

import { Container,Row,Col,Card,CardBody,Button,Modal,ModalHeader,ModalBody,ModalFooter,Alert,Progress,} from "reactstrap";

import {useSelector,} from "react-redux";

import {useNavigate, useLocation,} from "react-router-dom";

import axios from "axios";

import CaregiverHeader from "./CaregiverHeader";
import { FiEdit2, FiTrash2 } from "react-icons/fi";


const caregiverMessages = [
  {
    icon: "🌿",
    text: "Your care makes a meaningful difference every day.",
    ar: "رعايتك تصنع فرقًا حقيقيًا في حياة الآخرين كل يوم.",
  },
  {
    icon: "💙",
    text: "Small acts of care can change someone's entire day.",
    ar: "قد يكون اهتمامك البسيط سببًا في جعل يوم أحدهم أجمل.",
  },
  {
    icon: "✨",
    text: "Every dose given on time is another step toward healing.",
    ar: "كل جرعة تُؤخذ في موعدها هي خطوة أخرى نحو التعافي.",
  },
  {
    icon: "🤝",
    text: "Behind every reminder is someone who depends on you.",
    ar: "خلف كل تذكير شخص يعتمد على اهتمامك ورعايتك.",
  },
  {
    icon: "🌸",
    text: "A few moments of your time can bring someone peace of mind.",
    ar: "بضع لحظات من وقتك قد تمنح أحدهم راحة البال.",
  },
  {
    icon: "🌱",
    text: "Kindness is a form of medicine that costs nothing.",
    ar: "اللطف دواء لا يكلّف شيئًا، لكنه يترك أثرًا عميقًا.",
  },
  {
    icon: "❤️",
    text: "Compassion is at the heart of every great caregiver.",
    ar: "الرحمة هي جوهر كل رعاية عظيمة.",
  },
  {
    icon: "🕊️",
    text: "Healing begins with someone who cares.",
    ar: "يبدأ التعافي حين يجد الإنسان من يهتم لأمره.",
  },
  {
    icon: "💚",
    text: "Your patience and compassion make every day better for your patients.",
    ar: "صبرك ورحمتك يجعلان أيام مرضاك أفضل.",
  },
  {
    icon: "📖",
    text: '"Is the reward for goodness anything but goodness?" — Qur\'an 55:60',
    ar: "﴿هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ﴾ — سورة الرحمن، الآية ٦٠",
  },
];


const getTimeGreeting = () => {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
};

const CaregiverHome = () => {
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

  const user = useSelector(
    (state) => state.user.user
  );

  const navigate = useNavigate();
  const location = useLocation();

  const [
    patients,
    setPatients,
  ] = useState([]);

  const [
  dashboardPatientEmail,
  setDashboardPatientEmail,
] = useState("");

  const [
    isLoadingPatients,
    setIsLoadingPatients,
  ] = useState(false);

  const [
    patientsMessage,
    setPatientsMessage,
  ] = useState("");

  const [
    selectedPatient,
    setSelectedPatient,
  ] = useState(null);

  const [
    isPatientModalOpen,
    setIsPatientModalOpen,
  ] = useState(false);

  const [
    patientMedications,
    setPatientMedications,
  ] = useState([]);

  const [
    isMedicationModalOpen,
    setIsMedicationModalOpen,
  ] = useState(false);

  const [
    isLoadingMedications,
    setIsLoadingMedications,
  ] = useState(false);

  const [
    medicationMessage,
    setMedicationMessage,
  ] = useState("");

  const [
    dashboardSummary,
    setDashboardSummary,
  ] = useState({
    upcomingCount: 0,
    missedCount: 0,
    adherenceRate: 0,
  });

  const [
    dashboardDoses,
    setDashboardDoses,
  ] = useState([]);

  const [
    isLoadingDashboardData,
    setIsLoadingDashboardData,
  ] = useState(false);

  const [
    dashboardDataMessage,
    setDashboardDataMessage,
  ] = useState("");

  const [editMedication, setEditMedication] = useState(null);
const [editMedicationOpen, setEditMedicationOpen] = useState(false);

const [addMedicationOpen, setAddMedicationOpen] = useState(false);

const [newMedication, setNewMedication] = useState({
  medicationName: "",
  medicationForm: "",
  dosage: "",
  topicalDosage: "",
  frequency: "Once daily",
  weeklyDay: "",
  timing: "Specific Time",
  timingOffsetMinutes: 0,
  reminderTimes: ["08:00"],
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  instructions: "",
});

  const [
    caregiverMessage,
  ] = useState(() => {
    const index =
      Math.floor(
        Math.random() *
          caregiverMessages.length
      );

    return caregiverMessages[
      index
    ];
  });

  const greeting =
    getTimeGreeting();

  const formatTime = (
    time
  ) => {
    if (!time) {
      return "Not scheduled";
    }

    const [
      hours,
      minutes,
    ] = time
      .split(":")
      .map(Number);

    const date =
      new Date();

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const fetchLinkedPatients =
    async () => {
      if (!user?.email) {
        return;
      }

      try {
        setIsLoadingPatients(
          true
        );

        setPatientsMessage(
          ""
        );

       const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

const response = await axios.get(
  `http://localhost:3002/caregiver/my-patients/${encodeURIComponent(
    user.email
  )}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
console.log("MY PATIENTS API:", response.data);
        setPatients(
          response.data
            ?.patients ||
            []
        );
      } catch (error) {
        console.error(
          "Fetch linked patients error:",
          error
        );

        setPatientsMessage(
          error.response?.data
            ?.message ||
            "Unable to load linked patients."
        );
      } finally {
        setIsLoadingPatients(
          false
        );
      }
    };

  const fetchDashboardData =
    async () => {
      if (!user?.email) {
        return;
      }

      try {
        setIsLoadingDashboardData(
          true
        );

        setDashboardDataMessage(
          ""
        );

        const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

const response = await axios.get(
  `http://localhost:3002/caregiver/dashboard-data/${encodeURIComponent(user.email)}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        setDashboardSummary({
          upcomingCount:
            response.data
              ?.summary
              ?.upcomingCount ||
            0,

          missedCount:
            response.data
              ?.summary
              ?.missedCount ||
            0,

          adherenceRate:
            response.data
              ?.summary
              ?.adherenceRate ||
            0,
        });

        setDashboardDoses(
          response.data
            ?.doses ||
            []
        );
      } catch (error) {
        console.error(
          "Fetch caregiver dashboard data error:",
          error
        );

        setDashboardDataMessage(
          error.response?.data
            ?.message ||
            "Unable to load medication activity."
        );
      } finally {
        setIsLoadingDashboardData(
          false
        );
      }
    };

  useEffect(() => {
  fetchLinkedPatients();
  fetchDashboardData();

  const interval = setInterval(() => {
    fetchDashboardData();
  }, 30000);

  return () => clearInterval(interval);
}, [user?.email]);

useEffect(() => {
  const patientEmail =
    location.state?.openPatientEmail;

  if (!patientEmail || patients.length === 0) {
    return;
  }

  const patient = patients.find(
    (item) =>
      item.patientEmail === patientEmail
  );

  if (patient) {
    setSelectedPatient(patient);
    setIsPatientModalOpen(true);

    navigate("/caregiver-home", {
      replace: true,
      state: {},
    });
  }
}, [
  location.state,
  patients,
  navigate,
]);

useEffect(() => {
  if (
    location.state &&
    Object.prototype.hasOwnProperty.call(
      location.state,
      "dashboardPatientEmail"
    )
  ) {
    setDashboardPatientEmail(
      location.state.dashboardPatientEmail || ""
    );
  }
}, [location.state]);

  const handleOpenPatient = (
    patient
  ) => {
    setSelectedPatient(
      patient
    );

    setIsPatientModalOpen(
      true
    );
  };

  const handleClosePatient =
    () => {
      setIsPatientModalOpen(
        false
      );

      setSelectedPatient(
        null
      );
    };

  const handleOpenMedications =
    async (patient) => {
      if (
        !user?.email ||
        !patient?.patientEmail
      ) {
        return;
      }

      setSelectedPatient(
        patient
      );

      setPatientMedications(
        []
      );

      setMedicationMessage(
        ""
      );

      setIsMedicationModalOpen(
        true
      );

      try {
        setIsLoadingMedications(
          true
        );

       const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

const response = await axios.get(
  `http://localhost:3002/caregiver/patient-medications/${encodeURIComponent(
    user.email
  )}/${encodeURIComponent(
    patient.patientEmail
  )}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        setPatientMedications(
          response.data
            ?.medications ||
            []
        );
      } catch (error) {
        console.error(
          "Fetch patient medications error:",
          error
        );

        setMedicationMessage(
          error.response?.data
            ?.message ||
            "Unable to load patient medications."
        );
      } finally {
        setIsLoadingMedications(
          false
        );
      }
    };

  const handleCloseMedications =
    () => {
      setIsMedicationModalOpen(
        false
      );

      setPatientMedications(
        []
      );

      setMedicationMessage(
        ""
      );
    };

    const handleDisconnectPatient = async (patient) => {
  if (!user?.email || !patient?.patientEmail) return;

  const confirmed = window.confirm(
    `Disconnect from ${patient.patientName || "this patient"}? You will lose access to their medication information.`
  );

  if (!confirmed) return;

  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      alert("Please log in again.");
      return;
    }

    await axios.delete(
      "http://localhost:3002/caregiver-links/disconnect",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          caregiverEmail: user.email,
          patientEmail: patient.patientEmail,
        },
      }
    );

    setPatients((current) =>
      current.filter(
        (item) => item.patientEmail !== patient.patientEmail
      )
    );

    setDashboardPatientEmail((current) =>
      current === patient.patientEmail ? "" : current
    );

    setDashboardDoses((current) =>
      current.filter(
        (dose) => dose.userEmail !== patient.patientEmail
      )
    );

    setSelectedPatient(null);
    setIsPatientModalOpen(false);
    setIsMedicationModalOpen(false);
    setPatientMedications([]);

    await fetchDashboardData();

    alert("Patient disconnected successfully.");
  } catch (error) {
    console.error("Disconnect patient error:", error);

    alert(
      error.response?.data?.message ||
        "Unable to disconnect patient."
    );
  }
};

  const handleOpenReports = (
    patient
  ) => {
    if (
      !patient?.patientEmail
    ) {
      return;
    }

    navigate(
      `/caregiver-reports?patient=${encodeURIComponent(
        patient.patientEmail
      )}`
    );
  };

  const getPatientName = (
    email
  ) => {
    const patient =
      patients.find(
        (item) =>
          item.patientEmail ===
          email
      );

    return (
      patient?.patientName ||
      email ||
      "Patient"
    );
  };

  const getStatusBadgeClass =
    (status) => {
      if (
        status === "Taken"
      ) {
        return "badge bg-success";
      }

      if (
        status === "Missed"
      ) {
        return "badge bg-danger";
      }

      if (
        status === "Skipped"
      ) {
        return "badge bg-secondary";
      }

      return "badge bg-warning text-dark";
    };


    const selectedDashboardPatient = patients.find(
  (patient) => patient.patientEmail === dashboardPatientEmail
);

const selectedPatientDoses = dashboardDoses.filter(
  (dose) => dose.userEmail === dashboardPatientEmail
);

const selectedPatientTaken = selectedPatientDoses.filter(
  (dose) => dose.status === "Taken"
).length;

const selectedPatientMissed = selectedPatientDoses.filter(
  (dose) => dose.status === "Missed"
).length;

const selectedPatientUpcoming = selectedPatientDoses.filter(
  (dose) => dose.status === "Upcoming"
).length;

const selectedPatientCompleted =
  selectedPatientTaken + selectedPatientMissed;

const selectedPatientAdherence =
  selectedPatientCompleted > 0
    ? Math.round(
        (selectedPatientTaken / selectedPatientCompleted) * 100
      )
    : 0;

    const visibleDashboardDoses = dashboardPatientEmail
  ? selectedPatientDoses
  : dashboardDoses;

const visibleMissedDoseAlerts = visibleDashboardDoses.filter(
  (dose) => dose.status === "Missed"
);

const visibleUpcomingDoseAlerts = visibleDashboardDoses.filter(
  (dose) => dose.status === "Upcoming"
);
    

const handleCaregiverDeleteMedication = async (medicationId) => {
  if (!selectedPatient?.medicationManagementPermission) {
    alert("Patient has not allowed medication management.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this medication?"
  );

  if (!confirmed) return;

  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    await axios.delete(
      `http://localhost:3002/caregiver/patient-medications/${encodeURIComponent(
        user.email
      )}/${encodeURIComponent(
        selectedPatient.patientEmail
      )}/${medicationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPatientMedications((currentMedications) =>
      currentMedications.filter(
        (medication) => medication._id !== medicationId
      )
    );

    alert("Medication deleted successfully.");
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Unable to delete medication."
    );
  }
};


const handleCaregiverUpdateMedication = async () => {
  if (!editMedication) return;

  try {
    const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

    const response = await axios.put(
      `http://localhost:3002/caregiver/patient-medications/${encodeURIComponent(
        user.email
      )}/${encodeURIComponent(
        selectedPatient.patientEmail
      )}/${editMedication._id}`,
      {
        medicationName: editMedication.medicationName,
        dosage: editMedication.dosage,
        frequency: editMedication.frequency,
        timing: editMedication.timing,
        mealType: editMedication.mealType || "",
        timingOffsetMinutes:
          editMedication.timingOffsetMinutes || 0,
        reminderTimes:
          editMedication.reminderTimes || [],
        startDate: editMedication.startDate,
        isActive: editMedication.isActive,
        instructions:
          editMedication.instructions || "",
        prescriptionImage:
          editMedication.prescriptionImage || "",
      },
      {
  headers: {
    Authorization: `Bearer ${token}`,
  },
}
    );

    setPatientMedications((current) =>
      current.map((medication) =>
        medication._id === editMedication._id
          ? response.data.medication
          : medication
      )
    );

    setEditMedicationOpen(false);
    setEditMedication(null);

    alert("Medication updated successfully.");
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Unable to update medication."
    );
  }
};

const handleCaregiverAddMedication = async () => {
  if (!selectedPatient?.medicationManagementPermission) {
    alert("Patient has not allowed medication management.");
    return;
  }

 if (
  !newMedication.medicationName.trim() ||
  !newMedication.medicationForm ||
  !newMedication.dosage.trim() ||
  !newMedication.startDate ||
  !newMedication.endDate
) {
  alert("Please complete all required medication fields.");
  return;
}

if (newMedication.endDate < newMedication.startDate) {
  alert("End date cannot be earlier than start date.");
  return;
}

if (
  newMedication.frequency === "Weekly" &&
  !newMedication.weeklyDay
) {
  alert("Please select a day of the week.");
  return;
}

const dosageAmount = Number(
  newMedication.dosage.trim().split(/\s+/)[0]
);

if (!Number.isFinite(dosageAmount) || dosageAmount <= 0) {
  alert("Dosage must be greater than zero.");
  return;
}

  try {
    const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

const response = await axios.post(
  `http://localhost:3002/caregiver/patient-medications/${encodeURIComponent(
    user.email
  )}/${encodeURIComponent(
    selectedPatient.patientEmail
  )}`,
  newMedication,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    setPatientMedications((current) => [
      ...current,
      response.data.medication,
    ]);

    setAddMedicationOpen(false);

    setNewMedication({
  medicationName: "",
  medicationForm: "",
  dosage: "",
  topicalDosage: "",
  frequency: "Once daily",
  weeklyDay: "",
  timing: "Specific Time",
  timingOffsetMinutes: 0,
  reminderTimes: ["08:00"],
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  instructions: "",
});

    alert("Medication added successfully.");
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Unable to add medication."
    );
  }
};

  return (
    <Container
  fluid
  className="dashboard-page"
  dir={isArabic ? "rtl" : "ltr"}
>
      <CaregiverHeader />

      <Row className="p-4">
        <Col>
          <h2 className="mb-2">
           {isArabic
  ? ({
      "Good morning": "صباح الخير",
      "Good afternoon": "مساء الخير",
      "Good evening": "مساء الخير"
    }[greeting] || greeting)
  : greeting}
{isArabic ? "، " : ", "}
{user?.name || t("Caregiver", "مقدم الرعاية")}!
          </h2>

          <p
  className="mb-2"
  style={{
    color: "#0b3d91",
    fontSize: "19px",
    fontWeight: "700",
  }}
>
            <span
              style={{
marginInlineEnd: "7px",
              }}
            >
              {
                caregiverMessage.icon
              }
            </span>

           {isArabic ? caregiverMessage.ar : caregiverMessage.text}
          </p>

          <p className="text-muted mb-0">
            {t(
  "Monitor your patients' medications and adherence.",
  "تابع أدوية مرضاك ومدى التزامهم بتناولها."
)}
          </p>
          {dashboardPatientEmail && selectedDashboardPatient && (
  <div
    className="mt-3"
    style={{
      padding: "12px 16px",
      backgroundColor: "#eef5ff",
      borderRadius: "10px",
      border: "1px solid #d6e6ff",
    }}
  >
    <strong style={{ color: "#0b3d91" }}>
      Viewing: {selectedDashboardPatient.patientName || "Patient"}'s Dashboard
    </strong>
  </div>
)}
        </Col>
      </Row>

      {dashboardDataMessage && (
        <Row className="px-4">
          <Col>
            <Alert color="danger">
              {
                dashboardDataMessage
              }
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="px-4">
        <Col
          md="3"
          className="mb-3"
        >
          <Card className="dashboard-card h-100">
            <CardBody>
  <h5>
    {dashboardPatientEmail ? t("Today's Doses", "جرعات اليوم") : t("Linked Patients", "مرضاك ")}
  </h5>

  <h2>
    {isLoadingPatients || isLoadingDashboardData
      ? "..."
      : dashboardPatientEmail
      ? selectedPatientDoses.length
      : patients.length}
  </h2>

  <p className="text-muted mb-0">
    {dashboardPatientEmail
      ? selectedDashboardPatient?.patientName || t("Selected patient", "المريض المحدد")
      : t("Accepted patient links", "طلبات الربط المقبولة")}
  </p>
</CardBody>
          </Card>
        </Col>

        <Col
          md="3"
          className="mb-3"
        >
          <Card className="dashboard-card h-100">
            <CardBody>
              <h5>
  {t("Upcoming Medications", "الأدوية القادمة")}
</h5>

              <h2>
  {isLoadingDashboardData
    ? "..."
    : dashboardPatientEmail
    ? selectedPatientUpcoming
    : dashboardSummary.upcomingCount}
</h2>

              <p className="text-muted mb-0">
                {t("Remaining doses today", "الجرعات المتبقية اليوم")}
              </p>
            </CardBody>
          </Card>
        </Col>

        <Col
          md="3"
          className="mb-3"
        >
          <Card className="dashboard-card missed-card h-100">
            <CardBody>
              <h5>
               {t("Missed Doses", "الجرعات الفائتة")}
              </h5>

              <h2>
  {isLoadingDashboardData
    ? "..."
    : dashboardPatientEmail
    ? selectedPatientMissed
    : dashboardSummary.missedCount}
</h2>

              <p className="text-muted mb-0">
  {dashboardPatientEmail
  ? isArabic
    ? `الجرعات التي فاتت ${selectedDashboardPatient?.patientName || "المريض"} اليوم`
    : `Missed by ${selectedDashboardPatient?.patientName || "patient"} today`
  : t(
      "Missed across linked patients today",
      "الجرعات الفائتة لجميع المرضى المرتبطين اليوم"
    )}
</p>
            </CardBody>
          </Card>
        </Col>

        <Col
          md="3"
          className="mb-3"
        >
          <Card className="dashboard-card adherence-card h-100">
            <CardBody>
              <h5>
                {t("Adherence Rate", "نسبة الالتزام")}
              </h5>

              <h2>
  {isLoadingDashboardData
    ? "..."
    : `${
        dashboardPatientEmail
          ? selectedPatientAdherence
          : dashboardSummary.adherenceRate
      }%`}
</h2>

<Progress
  value={
    dashboardPatientEmail
      ? selectedPatientAdherence
      : dashboardSummary.adherenceRate
  }
  className="mt-2"
/>

              <p className="text-muted mt-2 mb-0">
               {t(
  "Based on completed doses today",
  "بناءً على الجرعات المكتملة اليوم"
)}
              </p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="px-4 pt-4">
        <Col md="12">
          <div className="mb-3">
           <h4 className="mb-1">
  {t("My Patients", "مرضاي")}
</h4>

            <p className="text-muted mb-0">
            {t(
  "View and manage your linked patients.",
  "عرض وإدارة المرضى المرتبطين بحسابك."
)}
            </p>
          </div>

          {isLoadingPatients && (
            <Alert color="info">
             {t("Loading linked patients...", "جارٍ تحميل المرضى المرتبطين...")}
            </Alert>
          )}

          {patientsMessage && (
            <Alert color="danger">
              {
                patientsMessage
              }
            </Alert>
          )}

          {!isLoadingPatients &&
            !patientsMessage &&
            patients.length ===
              0 && (
              <Card className="dashboard-card">
                <CardBody className="text-center py-5">
                  <h5>
                  {t("No linked patients yet", "لا يوجد مرضى مرتبطون بعد")}
                  </h5>

                  <p className="text-muted mb-0">
                  {t("Accepted patients will appear here.", "سيظهر هنا المرضى الذين تم قبول طلبات ربطهم.")}
                  </p>
                </CardBody>
              </Card>
            )}

          <Row>
            {patients.map(
              (patient) => (
                <Col
                  md="6"
                  lg="4"
                  className="mb-4"
                  key={
                    patient._id ||
                    patient.patientEmail
                  }
                >
                  <Card
                    className="dashboard-card h-100"
                    style={{
                      borderRadius:
                        "14px",
                    }}
                  >
                    <CardBody>
                      <div className="d-flex align-items-center mb-3">
                        <img
                          src={
                            patient.patientProfilePicture
                              ? `http://localhost:3002${patient.patientProfilePicture}`
                              : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                          }
                          alt={
                            patient.patientName ||
                            "Patient"
                          }
                          style={{
                            width:
                              "64px",

                            height:
                              "64px",

                            borderRadius:
                              "50%",

                            objectFit:
                              "cover",

                           marginInlineEnd: "14px",

                            border:
                              "2px solid #dee2e6",
                          }}
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                          }}
                        />

                        <div>
                          <h5 className="mb-1">
                            {patient.patientName ||
                              "Patient"}
                          </h5>

                          <p className="text-muted small mb-0">
 {t("Patient", "مريض")}
</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <small
                          className="text-muted d-block mb-2"
                          style={{
                            fontWeight:
                              "600",
                          }}
                        >
                        {t("MEDICAL CONDITIONS", "الحالات الطبية")}
                        </small>

                        {patient
                          .medicalConditions
                          ?.length >
                        0 ? (
                          <div
                            style={{
                              display:
                                "flex",

                              flexWrap:
                                "wrap",

                              gap:
                                "7px",
                            }}
                          >
                            {patient.medicalConditions.map(
                              (
                                condition
                              ) => (
                                <span
                                  key={
                                    condition
                                  }
                                  className="badge bg-light text-dark border"
                                  style={{
                                    padding:
                                      "7px 10px",
                                  }}
                                >
                                  {
                                    condition
                                  }
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-muted mb-0">
                           {t("Not provided", "غير محدد")}
                          </p>
                        )}
                      </div>

                      <div
                        className="pt-3"
                        style={{
                          borderTop:
                            "1px solid #e9ecef",
                        }}
                      >
                        <span
                          onClick={() =>
                            handleOpenPatient(
                              patient
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
                          }}
                        >
                          {t("View Profile", "عرض الملف الشخصي")}
                        </span>

                        <div className="mt-3">
                          <Button
                            color="primary"
                            outline
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              handleOpenMedications(
                                patient
                              )
                            }
                          >
                          {t("Medications", "الأدوية")}
                          </Button>

                          <Button
                            color="secondary"
                            outline
                            size="sm"
                            onClick={() =>
                              handleOpenReports(
                                patient
                              )
                            }
                          >
                          {t("Reports", "التقارير")}
                          </Button>
                        </div>
                        <div className="mt-3 text-end">
  <Button
    color="danger"
    outline
    size="sm"
    onClick={() => handleDisconnectPatient(patient)}
    style={{
      borderRadius: "10px",
      padding: "8px 14px",
      fontWeight: "600",
    }}
  >
    {t("Disconnect Patient", "إلغاء الارتباط بالمريض")}
  </Button>
</div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              )
            )}
          </Row>
        </Col>
      </Row>

      <Row className="px-4 pb-4">
        <Col
          md="8"
          className="mb-4 mb-md-0"
        >
          <Card className="dashboard-card h-100">
            <CardBody>
              <h4 className="mb-3">
                Patient Medication
                Overview
              </h4>

              {isLoadingDashboardData && (
                <Alert color="info">
                  Loading
                  medication
                  activity...
                </Alert>
              )}

              {!isLoadingDashboardData &&
                visibleDashboardDoses.length === 0 && (
                  <div
                    className="text-center py-5"
                    style={{
                      border:
                        "1px dashed #ced4da",

                      borderRadius:
                        "10px",

                      backgroundColor:
                        "#f8f9fa",

                      paddingLeft:
                        "20px",

                      paddingRight:
                        "20px",
                    }}
                  >
                    <h5 className="mb-2">
                      No medication
                      activity
                      available today
                    </h5>

                    <p className="text-muted mb-0">
                      Dose activity
                      will appear here
                      after linked
                      patients have
                      scheduled
                      medications.
                    </p>
                  </div>
                )}

              {!isLoadingDashboardData &&
                visibleDashboardDoses.length > 0 && (
                  <div
                    style={{
                      overflowX:
                        "auto",
                    }}
                  >
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>
                            Patient
                          </th>

                          <th>
                            Medication
                          </th>

                          <th>
                            Dosage
                          </th>

                          <th>
                            Time
                          </th>

                          <th>
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {visibleDashboardDoses.map(
                          (
                            dose
                          ) => (
                            <tr
                              key={
                                dose._id
                              }
                            >
                              <td>
                                {getPatientName(
                                  dose.userEmail
                                )}
                              </td>

                              <td>
                                {
                                  dose.medicationName
                                }
                              </td>

                              <td>
                                {
                                  dose.dosage
                                }
                              </td>

                              <td>
                                {formatTime(
                                  dose.scheduledTime
                                )}
                              </td>

                              <td>
                                <span
                                  className={getStatusBadgeClass(
                                    dose.status
                                  )}
                                >
                                  {
                                    dose.status
                                  }
                                </span>
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

        <Col md="4">
          <Card className="dashboard-card h-100">
            <CardBody>
              <h4 className="mb-3">
                Caregiver Alerts
              </h4>

              {isLoadingDashboardData && (
                <Alert color="info">
                  Loading alerts...
                </Alert>
              )}

              {!isLoadingDashboardData &&
                visibleMissedDoseAlerts.length ===
                  0 &&
                visibleUpcomingDoseAlerts.length ===
                  0 && (
                  <div
                    className="text-center py-5"
                    style={{
                      border:
                        "1px dashed #ced4da",

                      borderRadius:
                        "10px",

                      backgroundColor:
                        "#f8f9fa",

                      paddingLeft:
                        "15px",

                      paddingRight:
                        "15px",
                    }}
                  >
                    <h5 className="mb-2">
                      No alerts at the
                      moment
                    </h5>

                    <p className="text-muted mb-0">
                      Missed-dose and
                      upcoming reminder
                      alerts will appear
                      here.
                    </p>
                  </div>
                )}

              {visibleMissedDoseAlerts
                .slice(0, 3)
                .map(
                  (dose) => (
                    <Alert
                      color="danger"
                      key={
                        dose._id
                      }
                    >
                      <strong>
                        Missed Dose
                      </strong>

                      <div className="mt-1">
                        {getPatientName(
                          dose.userEmail
                        )}{" "}
                        missed{" "}
                        {
                          dose.medicationName
                        }{" "}
                        at{" "}
                        {formatTime(
                          dose.scheduledTime
                        )}
                        .
                      </div>
                    </Alert>
                  )
                )}

              {visibleUpcomingDoseAlerts
                .slice(0, 3)
                .map(
                  (dose) => (
                    <Alert
                      color="warning"
                      key={
                        dose._id
                      }
                    >
                      <strong>
                        Upcoming
                        Medication
                      </strong>

                      <div className="mt-1">
                        {getPatientName(
                          dose.userEmail
                        )}{" "}
                        should take{" "}
                        {
                          dose.medicationName
                        }{" "}
                        at{" "}
                        {formatTime(
                          dose.scheduledTime
                        )}
                        .
                      </div>
                    </Alert>
                  )
                )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal
        isOpen={
          isPatientModalOpen
        }
        toggle={
          handleClosePatient
        }
        centered
        size="lg"
      >
        <ModalHeader
          toggle={
            handleClosePatient
          }
        >
          Patient Profile
        </ModalHeader>

        <ModalBody>
          {selectedPatient && (
            <>
              <div className="text-center mb-4">
                <img
                  src={
                    selectedPatient.patientProfilePicture
                      ? `http://localhost:3002${selectedPatient.patientProfilePicture}`
                      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt={
                    selectedPatient.patientName ||
                    "Patient"
                  }
                  style={{
                    width:
                      "105px",

                    height:
                      "105px",

                    borderRadius:
                      "50%",

                    objectFit:
                      "cover",

                    border:
                      "3px solid #dee2e6",

                    marginBottom:
                      "12px",
                  }}
                  onError={(
                    event
                  ) => {
                    event.currentTarget.src =
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                  }}
                />

                <h4 className="mb-1">
                  {selectedPatient.patientName ||
                    "Patient"}
                </h4>

                <p className="text-muted mb-0">
                  Relationship:{" "}
                  {selectedPatient.relationship ||
                    "Not provided"}
                </p>
              </div>

              <hr />

              <Row>
                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    Phone Number
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.patientPhoneNumber ||
                      "Not provided"}
                  </p>
                </Col>

                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    Age
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.age ||
                      "Not provided"}
                  </p>
                </Col>

                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    Height
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.height
                      ? `${selectedPatient.height} cm`
                      : "Not provided"}
                  </p>
                </Col>

                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    Weight
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.weight
                      ? `${selectedPatient.weight} kg`
                      : "Not provided"}
                  </p>
                </Col>

                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    Blood Type
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.bloodType ||
                      "Not provided"}
                  </p>
                </Col>

                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    Emergency
                    Contact
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.emergencyContact ||
                      "Not provided"}
                  </p>
                </Col>
              </Row>

              <div className="mb-3">
                <strong>
                  Medical
                  Conditions
                </strong>

                {selectedPatient
                  .medicalConditions
                  ?.length >
                0 ? (
                  <div
                    className="mt-2"
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap:
                        "8px",
                    }}
                  >
                    {selectedPatient.medicalConditions.map(
                      (
                        condition
                      ) => (
                        <span
                          key={
                            condition
                          }
                          className="badge bg-light text-dark border"
                        >
                          {
                            condition
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

              <div>
                <strong>
                  Allergies
                </strong>

                {selectedPatient
                  .allergies
                  ?.length >
                0 ? (
                  <div
                    className="mt-2"
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap:
                        "8px",
                    }}
                  >
                    {selectedPatient.allergies.map(
                      (
                        allergy
                      ) => (
                        <span
                          key={
                            allergy
                          }
                          className="badge bg-warning text-dark"
                        >
                          {
                            allergy
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
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="secondary"
            onClick={
              handleClosePatient
            }
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={
          isMedicationModalOpen
        }
        toggle={
          handleCloseMedications
        }
        centered
        size="lg"
      >
        <ModalHeader
          toggle={
            handleCloseMedications
          }
        >
          {selectedPatient?.patientName ||
            "Patient"}
          's Medications
        </ModalHeader>

        <ModalBody>
          {isLoadingMedications && (
            <Alert color="info">
              Loading
              medications...
            </Alert>
          )}

          {medicationMessage && (
            <Alert color="danger">
              {
                medicationMessage
              }
            </Alert>
          )}

{selectedPatient?.medicationManagementPermission && (
  <div className="d-flex justify-content-end mb-4">
    <Button
      color="primary"
      onClick={() => setAddMedicationOpen(true)}
      style={{
        borderRadius: "10px",
        padding: "10px 18px",
        fontWeight: "600",
        backgroundColor: "#0b5ed7",
        border: "none",
      }}
    >
      + Add Medication
    </Button>
  </div>
)}

          {!isLoadingMedications &&
            !medicationMessage &&
            patientMedications.length ===
              0 && (
              <div className="text-center py-5">
                <h5>
                  No medications
                  found
                </h5>

                <p className="text-muted mb-0">
                  This patient has
                  not added any
                  medications yet.
                </p>
              </div>
            )}

          <div style={{ overflowX: "auto" }}>
  <table className="table table-hover align-middle">
    <thead style={{ backgroundColor: "#eef5ff" }}>
      <tr>
        <th>Medication</th>
        <th>Dosage</th>
        <th>Frequency</th>
        <th>Timing</th>
        <th>Reminder</th>
        <th>Instructions</th>
        <th>Prescription</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {patientMedications.map((medication) => (
        <tr key={medication._id}>
          <td>
            <strong>{medication.medicationName}</strong>
          </td>

          <td>{medication.dosage}</td>

          <td>{medication.frequency}</td>

          <td>{medication.timing}</td>

          <td>
            {medication.reminderTimes?.length > 0
              ? medication.reminderTimes.map(formatTime).join(", ")
              : "Not provided"}
          </td>

          <td style={{ minWidth: "140px" }}>
            {medication.instructions || "—"}
          </td>

          <td>
            {medication.prescriptionImage ? (
              <a
                href={`http://localhost:3002${medication.prescriptionImage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
            ) : (
              "—"
            )}
          </td>

          <td>
  {selectedPatient?.medicationManagementPermission && (
    <div className="d-flex align-items-center gap-3">
      <FiEdit2
        size={17}
        color="#8b5cf6"
        style={{ cursor: "pointer" }}
        title="Edit Medication"
        onClick={() => {
          setEditMedication({
            ...medication,
            startDate: medication.startDate
              ? medication.startDate.split("T")[0]
              : "",
          });
          setEditMedicationOpen(true);
        }}
      />

      <FiTrash2
        size={17}
        color="#ef4444"
        style={{ cursor: "pointer" }}
        title="Delete Medication"
        onClick={() =>
          handleCaregiverDeleteMedication(medication._id)
        }
      />
    </div>
  )}
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="secondary"
            onClick={
              handleCloseMedications
            }
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
  isOpen={editMedicationOpen}
  toggle={() => setEditMedicationOpen(false)}
>
  <ModalHeader
    toggle={() => setEditMedicationOpen(false)}
  >
    Edit Medication
  </ModalHeader>

  <ModalBody>
    {editMedication && (
      <>
        <label className="mb-1">Medication Name</label>
        <input
          className="form-control mb-3"
          value={editMedication.medicationName || ""}
          onChange={(e) =>
            setEditMedication({
              ...editMedication,
              medicationName: e.target.value,
            })
          }
        />

        <label className="mb-1">Dosage</label>
        <input
          className="form-control mb-3"
          value={editMedication.dosage || ""}
          onChange={(e) =>
            setEditMedication({
              ...editMedication,
              dosage: e.target.value,
            })
          }
        />
        <label className="mb-1">Instructions</label>
        <textarea
          className="form-control"
          value={editMedication.instructions || ""}
          onChange={(e) =>
            setEditMedication({
              ...editMedication,
              instructions: e.target.value,
            })
          }
        />
      </>
    )}
  </ModalBody>


    
<ModalFooter>
    <Button
      color="primary"
      onClick={handleCaregiverUpdateMedication}
    >
      Save Changes
    </Button>

    <Button
      color="secondary"
      onClick={() => setEditMedicationOpen(false)}
    >
      Cancel
    </Button>
  </ModalFooter>
</Modal>
<Modal
  isOpen={addMedicationOpen}
  toggle={() => setAddMedicationOpen(false)}
>
  <ModalHeader
    toggle={() => setAddMedicationOpen(false)}
  >
    Add Medication
  </ModalHeader>

  <ModalBody>
    <label className="mb-1">Medication Name</label>
    <input
      className="form-control mb-3"
      value={newMedication.medicationName}
      onChange={(e) =>
        setNewMedication({
          ...newMedication,
          medicationName: e.target.value,
        })
      }
    />

    <label className="mb-1">Dosage Amount</label>
<div className="d-flex gap-2 mb-3">
  <input
    type="number"
    className="form-control"
    placeholder="Amount"
    min="0.01"
    step="any"
    value={newMedication.dosage.split(" ")[0] || ""}
    onChange={(e) =>
      setNewMedication({
        ...newMedication,
        dosage: `${e.target.value} ${
          newMedication.dosage.split(" ")[1] || ""
        }`.trim(),
      })
    }
  />

  <select
    className="form-select"
    value={newMedication.dosage.split(" ")[1] || ""}
    onChange={(e) =>
      setNewMedication({
        ...newMedication,
        dosage: `${
          newMedication.dosage.split(" ")[0] || ""
        } ${e.target.value}`.trim(),
      })
    }
  >
    <option value="">Unit</option>
    {(
  {
    Tablet: ["mg", "g", "mcg", "tablet"],
    Capsule: ["mg", "g", "mcg", "capsule"],
    Injection: ["mg", "mcg", "mL"],
    "Cream/Ointment": ["g", "mg"],
    Inhaler: ["puff"],
    "Eye Drops": ["drop"],
    "Ear Drops": ["drop"],
    "Liquid/Syrup": ["mL"],
    Patch: ["patch"],
    Suppository: ["mg", "g", "suppository"],
    Other: ["mg", "g", "mcg", "mL"],
  }[newMedication.medicationForm] || []
).map((unit) => (
  <option key={unit} value={unit}>
    {unit}
  </option>
))}
  </select>
</div>

<label className="mb-1">Frequency</label>
<select
  className="form-select mb-3"
  value={newMedication.frequency}
  onChange={(e) =>
    setNewMedication({
      ...newMedication,
      frequency: e.target.value,
      weeklyDay: "",
    })
  }
>
  <option value="Once daily">Once daily</option>
  <option value="Twice daily">Twice daily</option>
  <option value="Three times daily">Three times daily</option>
  <option value="Weekly">Weekly</option>
  <option value="As needed">As needed</option>
</select>
{newMedication.frequency === "Weekly" && (
  <>
    <label className="mb-1">Day of the Week</label>
    <select
      className="form-select mb-3"
      value={newMedication.weeklyDay}
      onChange={(e) =>
        setNewMedication({
          ...newMedication,
          weeklyDay: e.target.value,
        })
      }
      required
    >
      <option value="">Select a day</option>
      {[
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ].map((day) => (
        <option key={day} value={day}>
          {day}
        </option>
      ))}
    </select>
  </>
)}
    <label className="mb-1">Reminder Time</label>
    <input
      type="time"
      className="form-control mb-3"
      value={newMedication.reminderTimes[0]}
      onChange={(e) =>
        setNewMedication({
          ...newMedication,
          reminderTimes: [e.target.value],
        })
      }
    />

    <label className="mb-1">Start Date</label>
    <input
      type="date"
      className="form-control mb-3"
      value={newMedication.startDate}
      onChange={(e) =>
        setNewMedication({
          ...newMedication,
          startDate: e.target.value,
        })
      }
    />

    <label className="mb-1">Instructions</label>
    <textarea
      className="form-control"
      placeholder="Optional"
      value={newMedication.instructions}
      onChange={(e) =>
        setNewMedication({
          ...newMedication,
          instructions: e.target.value,
        })
      }
    />
  </ModalBody>

  <ModalFooter>
    <Button
      color="primary"
      onClick={handleCaregiverAddMedication}
    >
      Add Medication
    </Button>

    <Button
      color="secondary"
      onClick={() => setAddMedicationOpen(false)}
    >
      Cancel
    </Button>
  </ModalFooter>
</Modal>
    </Container>
  );
};

export default CaregiverHome;