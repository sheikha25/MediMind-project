import { useEffect, useState, } from "react";
import omanMedications from "../data/omanmedications.json";
import { Container, Row, Col, Card, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Progress, } from "reactstrap";

import { useSelector, } from "react-redux";

import { useNavigate, useLocation, } from "react-router-dom";
import Footer from "./Footer";
import axios from "axios";

import CaregiverHeader from "./CaregiverHeader";
import { FiEdit2, FiTrash2 } from "react-icons/fi";


const caregiverMessages = [
  {
    text: "Your care makes a meaningful difference every day.",
    ar: "رعايتك تصنع فرقًا حقيقيًا في حياة الآخرين كل يوم.",
  },
  {
    text: "Small acts of care can change someone's entire day.",
    ar: "قد يكون اهتمامك البسيط سببًا في جعل يوم أحدهم أجمل.",
  },
  {
    text: "Every dose given on time is another step toward healing.",
    ar: "كل جرعة تُؤخذ في موعدها هي خطوة أخرى نحو التعافي.",
  },
  {

    text: "Behind every reminder is someone who depends on you.",
    ar: "خلف كل تذكير شخص يعتمد على اهتمامك ورعايتك.",
  },
  {
    text: "A few moments of your time can bring someone peace of mind.",
    ar: "بضع لحظات من وقتك قد تمنح أحدهم راحة البال.",
  },
  {
    text: "Kindness is a form of medicine that costs nothing.",
    ar: "اللطف دواء لا يكلّف شيئًا، لكنه يترك أثرًا عميقًا.",
  },
  {
    text: "Compassion is at the heart of every great caregiver.",
    ar: "الرحمة هي جوهر كل رعاية عظيمة.",
  },
  {
    text: "Healing begins with someone who cares.",
    ar: "يبدأ التعافي حين يجد الإنسان من يهتم لأمره.",
  },
  {
    text: "Your patience and compassion make every day better for your patients.",
    ar: "صبرك ورحمتك يجعلان أيام مرضاك أفضل.",
  },
  {
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



const normalizeMedicineName = (value) =>
  String(value || "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const caregiverMedicationOptions = omanMedications.filter(
  (medication) =>
    typeof medication.tradeName === "string" &&
    medication.tradeName.trim() !== ""
);

const caregiverDosageUnits = {
  Tablet: ["tablet", "tablets", "mg", "mcg", "IU"],
  Capsule: ["capsule", "capsules", "mg", "mcg", "IU"],
  Injection: ["units", "ml", "mg", "mcg"],
  "Cream/Ointment": ["g", "mg", "application", "applications"],
  Inhaler: ["puff", "puffs"],
  "Eye Drops": ["drop", "drops"],
  "Ear Drops": ["drop", "drops"],
  "Liquid/Syrup": ["ml", "mg"],
  Patch: ["patch", "patches"],
  Suppository: ["suppository", "suppositories"],
  Other: ["mg", "g", "mcg", "ml", "units", "tablet", "capsule"],
};

const detectCaregiverMedicationForm = (medication) => {
  const form = String(
    medication?.dosageForm || medication?.form || ""
  ).toLowerCase();

  if (form.includes("ophthalmic") || form.includes("eye drop")) return "Eye Drops";
  if (form.includes("otic") || form.includes("ear drop")) return "Ear Drops";
  if (form.includes("tablet")) return "Tablet";
  if (form.includes("capsule")) return "Capsule";
  if (form.includes("injection") || form.includes("injectable")) return "Injection";
  if (form.includes("cream") || form.includes("ointment")) return "Cream/Ointment";
  if (form.includes("inhaler")) return "Inhaler";
  if (form.includes("syrup") || form.includes("oral solution")) return "Liquid/Syrup";
  if (form.includes("patch")) return "Patch";
  if (form.includes("suppository")) return "Suppository";

  return "";
};

const caregiverRequiredTimes = (frequency) => ({
  "Once daily": 1,
  "Twice daily": 2,
  "Three times daily": 3,
  "Every 6 hours": 4,
  "Every 8 hours": 3,
  "Every 12 hours": 2,
  Weekly: 1,
  "As needed": 0,
}[frequency] ?? 0);

const CaregiverHome = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const [theme, setTheme] = useState(() => localStorage.getItem("medimind-theme") === "dark" ? "dark" : "light");
  const isArabic = language === "ar";
  useEffect(() => {
    const syncTheme = () => setTheme(localStorage.getItem("medimind-theme") === "dark" ? "dark" : "light");
    window.addEventListener("medimind-theme-change", syncTheme);
    window.addEventListener("medimindThemeChanged", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("medimind-theme-change", syncTheme);
      window.removeEventListener("medimindThemeChanged", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const t = (english, arabic) =>
    isArabic ? arabic : english;

  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
    };

    window.addEventListener("medimind-language-change", updateLanguage);
    window.addEventListener("medimindLanguageChanged", updateLanguage);
    window.addEventListener("storage", updateLanguage);

    return () => {
      window.removeEventListener("medimind-language-change", updateLanguage);
      window.removeEventListener("medimindLanguageChanged", updateLanguage);
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
      return t("Not scheduled", "غير مجدول");
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
      isArabic ? "ar-OM" : "en-GB",
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

        const response = await axios.get(
          `http://localhost:3002/caregiver/my-patients/${encodeURIComponent(
            user.email
          )}`
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
          t("Unable to load linked patients.", "تعذّر تحميل المرضى المرتبطين.")
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

        const response = await axios.get(
          `http://localhost:3002/caregiver/dashboard-data/${encodeURIComponent(user.email)}`
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
          t("Unable to load medication activity.", "تعذّر تحميل نشاط الأدوية.")
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

        const response = await axios.get(
          `http://localhost:3002/caregiver/patient-medications/${encodeURIComponent(
            user.email
          )}/${encodeURIComponent(
            patient.patientEmail
          )}`
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
          t("Unable to load patient medications.", "تعذّر تحميل أدوية المريض.")
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
      isArabic ? `هل تريد إلغاء ربط ${patient.patientName || "هذا المريض"}؟ ستفقد إمكانية الوصول إلى معلومات أدويته.` : `Disconnect from ${patient.patientName || "this patient"}? You will lose access to their medication information.`
    );

    if (!confirmed) return;

    try {

      await axios.delete(
        "http://localhost:3002/caregiver-links/disconnect",
        {
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

      alert(t("Patient disconnected successfully.", "تم إلغاء ربط المريض بنجاح."));
    } catch (error) {
      console.error("Disconnect patient error:", error);

      alert(
        error.response?.data?.message ||
        t("Unable to disconnect patient.", "تعذّر إلغاء ربط المريض.")
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
      alert(t("Patient has not allowed medication management.", "المريض لم يسمح بإدارة أدويته."));
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this medication?"
    );

    if (!confirmed) return;

    try {

      await axios.delete(
        `http://localhost:3002/caregiver/patient-medications/${encodeURIComponent(
          user.email
        )}/${encodeURIComponent(
          selectedPatient.patientEmail
        )}/${medicationId}`
      );

      setPatientMedications((currentMedications) =>
        currentMedications.filter(
          (medication) => medication._id !== medicationId
        )
      );

      alert(t("Medication deleted successfully.", "تم حذف الدواء بنجاح."));
    } catch (error) {
      alert(
        error.response?.data?.message ||
        t("Unable to delete medication.", "تعذّر حذف الدواء.")
      );
    }
  };


  const handleCaregiverUpdateMedication = async () => {
    if (!editMedication) return;

    try {

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

      alert(t("Medication updated successfully.", "تم تحديث الدواء بنجاح."));
    } catch (error) {
      alert(
        error.response?.data?.message ||
        t("Unable to update medication.", "تعذّر تحديث الدواء.")
      );
    }
  };


  const handleCaregiverAddMedication = async () => {
    const fail = (english, arabic) => {
      alert(t(english, arabic));
    };

    if (!user?.email || !selectedPatient?.patientEmail) {
      return fail(
        "Please select a patient.",
        "يرجى اختيار المريض."
      );
    }

    if (!selectedPatient.medicationManagementPermission) {
      return fail(
        "Patient has not allowed medication management.",
        "المريض لم يسمح بإدارة أدويته."
      );
    }

    const medicationName = newMedication.medicationName.trim();
    const medicationForm = newMedication.medicationForm;
    const dosage = newMedication.dosage.trim();
    const frequency = newMedication.frequency;
    const reminderTimes =
      frequency === "As needed" ? [] : newMedication.reminderTimes;

    // Required fields
    if (
      !medicationName ||
      !medicationForm ||
      !dosage ||
      !frequency ||
      !newMedication.timing ||
      !newMedication.startDate ||
      !newMedication.endDate
    ) {
      return fail(
        "Please complete all required medication fields.",
        "يرجى إكمال جميع حقول الدواء المطلوبة."
      );
    }

    // Check medication form against Oman dataset
    const catalogMedicine = caregiverMedicationOptions.find(
      (medicine) =>
        normalizeMedicineName(medicine.tradeName) ===
        normalizeMedicineName(medicationName)
    );

    if (catalogMedicine) {
      const expectedForm =
        detectCaregiverMedicationForm(catalogMedicine);

      if (expectedForm && medicationForm !== expectedForm) {
        return fail(
          `Invalid medication form. Expected: ${expectedForm}.`,
          `الشكل الدوائي غير صحيح. الشكل المتوقع: ${expectedForm}.`
        );
      }
    }

    // Validate dosage amount and unit
    const dosageMatch = dosage.match(
      /^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)$/
    );

    if (!dosageMatch) {
      return fail(
        "Please enter a valid dosage amount and unit.",
        "يرجى إدخال كمية جرعة ووحدة صحيحتين."
      );
    }

    const dosageAmount = Number(dosageMatch[1]);
    const dosageUnit = dosageMatch[2];

    if (!Number.isFinite(dosageAmount) || dosageAmount <= 0) {
      return fail(
        "Dosage must be greater than zero.",
        "يجب أن تكون الجرعة أكبر من صفر."
      );
    }

    if (
      !caregiverDosageUnits[medicationForm]?.includes(dosageUnit)
    ) {
      return fail(
        "Invalid dosage unit for this medication form.",
        "وحدة الجرعة غير مناسبة للشكل الدوائي."
      );
    }

    // Validate dates
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    if (newMedication.startDate < today) {
      return fail(
        "Start date cannot be in the past.",
        "لا يمكن أن يكون تاريخ البدء في الماضي."
      );
    }

    if (newMedication.endDate < newMedication.startDate) {
      return fail(
        "End date cannot be earlier than start date.",
        "لا يمكن أن يكون تاريخ الانتهاء قبل تاريخ البدء."
      );
    }

    // Weekly medication requires a weekday
    const weeklyDays = Array.isArray(newMedication.weeklyDay)
      ? newMedication.weeklyDay
      : newMedication.weeklyDay
        ? [newMedication.weeklyDay]
        : [];

    if (frequency === "Weekly" && weeklyDays.length === 0) {
      return fail(
        "Please select a day for weekly medication.",
        "يرجى اختيار يوم للدواء الأسبوعي."
      );
    }

    // Validate reminder count and times
    const requiredCount = caregiverRequiredTimes(frequency);

    if (reminderTimes.length !== requiredCount) {
      return fail(
        `This frequency requires ${requiredCount} reminder time(s).`,
        `هذا التكرار يتطلب ${requiredCount} وقت/أوقات للتذكير.`
      );
    }

    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (reminderTimes.some((time) => !validTime.test(time))) {
      return fail(
        "Please select all required reminder times.",
        "يرجى اختيار جميع أوقات التذكير."
      );
    }

    // Prevent repeated reminder times
    if (new Set(reminderTimes).size !== reminderTimes.length) {
      return fail(
        "Reminder times must be different.",
        "يجب أن تكون أوقات التذكير مختلفة."
      );
    }

    // Validate fixed hourly intervals
    const fixedIntervals = {
      "Every 6 hours": 6,
      "Every 8 hours": 8,
      "Every 12 hours": 12,
    };

    if (fixedIntervals[frequency]) {
      const requiredMinutes = fixedIntervals[frequency] * 60;

      const sortedTimes = reminderTimes
        .map((time) => {
          const [hours, minutes] = time.split(":").map(Number);
          return hours * 60 + minutes;
        })
        .sort((a, b) => a - b);

      for (let i = 0; i < sortedTimes.length; i++) {
        const currentTime = sortedTimes[i];
        const nextTime = sortedTimes[(i + 1) % sortedTimes.length];

        const difference =
          (nextTime - currentTime + 1440) % 1440;

        if (difference !== requiredMinutes) {
          return fail(
            `Reminders must be exactly ${fixedIntervals[frequency]} hours apart.`,
            `يجب أن تكون التذكيرات بفاصل ${fixedIntervals[frequency]} ساعات.`
          );
        }
      }
    }

    try {
      // Get this patient's current medications
      const existingResponse = await axios.get(
        `http://localhost:3002/caregiver/patient-medications/${encodeURIComponent(
          user.email
        )}/${encodeURIComponent(selectedPatient.patientEmail)}`
      );

      const existingMedications =
        existingResponse.data?.medications || [];

      // STRICT DUPLICATE NAME CHECK
      const duplicate = existingMedications.some(
        (medication) =>
          normalizeMedicineName(medication.medicationName) ===
          normalizeMedicineName(medicationName)
      );

      if (duplicate) {
        return fail(
          "This medication is already added. Please edit the existing medication instead.",
          "هذا الدواء موجود مسبقًا. يرجى تعديل الدواء الحالي بدلًا من إضافته مرة أخرى."
        );
      }

      // Add medication for the selected patient
      const response = await axios.post(
        `http://localhost:3002/caregiver/patient-medications/${encodeURIComponent(
          user.email
        )}/${encodeURIComponent(selectedPatient.patientEmail)}`,
        {
          ...newMedication,
          medicationName,
          dosage,
          reminderTimes,
          weeklyDay: frequency === "Weekly" ? weeklyDays : [],
        }
      );

      // Update the caregiver medication list
      if (response.data?.medication) {
        setPatientMedications((current) => [
          ...current,
          response.data.medication,
        ]);
      }

      setAddMedicationOpen(false);

      // Reset form
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
        startDate: today,
        endDate: "",
        instructions: "",
      });

      await fetchDashboardData();

      alert(
        t(
          "Medication added successfully.",
          "تمت إضافة الدواء بنجاح."
        )
      );
    } catch (error) {
      console.error("Caregiver Add Medication Error:", error);

      alert(
        error.response?.data?.message ||
        t(
          "Unable to add medication.",
          "تعذرت إضافة الدواء."
        )
      );
    }
  };




  return (
    <Container
      fluid
      className={`dashboard-page mm-caregiver-home ${theme === "dark" ? "mm-ch-dark" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .mm-caregiver-home { min-height:100vh; background:#f4f7fc; color:#20304a; }
        .mm-caregiver-home .dashboard-card { background:#fff; color:inherit; border:1px solid #e2e8f0; border-radius:14px; }
        .mm-caregiver-home .dashboard-table { width:100%; min-width:560px; }
        .mm-caregiver-home .dashboard-table th, .mm-caregiver-home .dashboard-table td { padding:10px; }
        .mm-caregiver-home .text-muted { color:#66758a !important; }
        .mm-caregiver-home.mm-ch-dark { background:#101827; color:#e8edf6; }
        .mm-caregiver-home.mm-ch-dark .dashboard-card { background:#1d293b; border-color:#35445b; }
        .mm-caregiver-home.mm-ch-dark .text-muted { color:#b5c2d5 !important; }
        .mm-caregiver-home.mm-ch-dark .dashboard-table, .mm-caregiver-home.mm-ch-dark .table { color:#e8edf6; }
        .mm-caregiver-home.mm-ch-dark .dashboard-table th, .mm-caregiver-home.mm-ch-dark .dashboard-table td, .mm-caregiver-home.mm-ch-dark .table th, .mm-caregiver-home.mm-ch-dark .table td { background:#1d293b; color:#e8edf6; border-color:#43516a; }
        .mm-caregiver-home.mm-ch-dark .badge.bg-light { background:#34445b !important; color:#fff !important; border-color:#5b6a81 !important; }
        .mm-caregiver-modal.mm-ch-dark .modal-content { background:#1d293b; color:#e8edf6; border-color:#43516a; }
        .mm-caregiver-modal.mm-ch-dark .modal-header, .mm-caregiver-modal.mm-ch-dark .modal-footer { border-color:#43516a; }
        .mm-caregiver-modal.mm-ch-dark .form-control, .mm-caregiver-modal.mm-ch-dark .form-select { background:#111b2b; color:#f1f5f9; border-color:#4b5c74; }
        .mm-caregiver-modal.mm-ch-dark .table { --bs-table-bg:#1d293b; --bs-table-color:#e8edf6; --bs-table-border-color:#43516a; }
        .mm-caregiver-modal.mm-ch-dark .text-muted { color:#b5c2d5 !important; }
        .mm-caregiver-modal.mm-ch-dark .btn-close { filter:invert(1); }
        @media(max-width:768px) { .mm-caregiver-home > .row { padding-left:12px !important; padding-right:12px !important; } .mm-caregiver-home h2 { font-size:1.45rem; } .mm-caregiver-modal .modal-dialog { margin:10px; } }

        
/* Fix caregiver dashboard empty-state text */

.mm-caregiver-home .cg-empty-state {
  background-color: #f8f9fa !important;
  color: #20334a !important;
  border: 1px dashed #ced4da;
  border-radius: 10px;
}

.mm-caregiver-home .cg-empty-state h5 {
  color: #20334a !important;
  font-weight: 600;
}

.mm-caregiver-home .cg-empty-state p,
.mm-caregiver-home.mm-ch-dark .cg-empty-state .text-muted {
  color: #526579 !important;
}

        
/* CAREGIVER DASHBOARD TEXT READABILITY */

/* Small descriptions under dashboard statistics */
.mm-caregiver-home .dashboard-card .text-muted {
  font-size: 15px !important;
  line-height: 1.8 !important;
  font-weight: 500 !important;
  color: #526579 !important;
}

/* Dark mode: brighter, more readable descriptions */
.mm-caregiver-home.mm-ch-dark .dashboard-card .text-muted {
  color: #d5e5ff !important;
}

/* Descriptions outside cards */
.mm-caregiver-home .row > .col .text-muted,
.mm-caregiver-home .row > [class*="col-"] .text-muted {
  font-size: 15px;
  line-height: 1.8;
}

/* Dark mode descriptions outside cards */
.mm-caregiver-home.mm-ch-dark .text-muted {
  color: #d5e5ff !important;
}

/* Keep light empty-state cards readable */
.mm-caregiver-home.mm-ch-dark .cg-empty-state .text-muted {
  color: #526579 !important;
}

/* Improve Arabic text readability */
.mm-caregiver-home[dir="rtl"] .dashboard-card .text-muted {
  font-size: 16px !important;
  line-height: 1.9 !important;
  font-weight: 500 !important;
}

/* My Patients section description */
.mm-caregiver-home[dir="rtl"] .text-muted {
  font-size: 16px;
  line-height: 1.9;
}


/* Keep caregiver dashboard dropdown above page content */
.mm-caregiver-header {
  position: relative !important;
  z-index: 9999 !important;
  overflow: visible !important;
}

.mm-caregiver-header .cg-inner,
.mm-caregiver-header .cg-main,
.mm-caregiver-header .cg-nav,
.mm-caregiver-header .cg-dashboard-wrapper {
  overflow: visible !important;
}

.mm-caregiver-header .cg-dashboard-wrapper {
  position: relative !important;
}

.mm-caregiver-header .cg-dashboard-menu {
  position: absolute !important;
  top: calc(100% + 8px) !important;
  inset-inline-start: 0 !important;
  z-index: 10000 !important;
  min-width: 230px;
  background: #ffffff !important;
  color: #233e64 !important;
  border: 1px solid #dbe4ee !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.mm-caregiver-header .cg-dashboard-item {
  color: #233e64 !important;
}


      `}</style>
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
              color: theme === "dark" ? "#e0edff" : "#0b3d91",
              fontSize: isArabic ? "21px" : "20px",
              fontWeight: "700",
              lineHeight: "1.9",
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

          <p
            className="mb-0"
            style={{
              color: theme === "dark" ? "#d5e5ff" : "#405775",
              fontSize: isArabic ? "18px" : "17px",
              fontWeight: "500",
              lineHeight: "1.9",
            }}
          >
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
                backgroundColor: theme === "dark" ? "#26354a" : "#eef5ff",
                borderRadius: "10px",
                border: "1px solid #d6e6ff",
              }}
            >
              <strong style={{
                color: theme === "dark" ? "#ffffff" : "#0b3d91",
                fontWeight: "700",
              }}>
                {isArabic
                  ? `أنت تعرض ملخص الأدوية وإحصائيات الالتزام للمريض: ${selectedDashboardPatient.patientName || "المريض"}`
                  : `Viewing medication summary and adherence statistics for ${selectedDashboardPatient.patientName || "Patient"}`}
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
                  : `${dashboardPatientEmail
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
      {!dashboardPatientEmail && (
        <Row className="px-4 pt-4">
          <Col md="12">
            <div className="mb-3">

              <h4
                className="mb-1"
                style={{
                  color: theme === "dark" ? "#ffffff" : "#20304a",
                  fontSize: isArabic ? "26px" : "25px",
                  fontWeight: "700",
                  lineHeight: "1.7",
                }}
              >
                {t("My Patients", "مرضاي")}
              </h4>

              <p
                className="mb-0"
                style={{
                  color: theme === "dark" ? "#d5e5ff" : "#405775",
                  fontSize: isArabic ? "18px" : "17px",
                  fontWeight: "500",
                  lineHeight: "1.9",
                }}
              >
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
                  <CardBody className="cg-empty-state text-center py-5">
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


                          <div className="cg-patient-actions">

                            <Button
                              type="button"
                              color="primary"
                              className="cg-patient-action-btn"
                              onClick={() => handleOpenMedications(patient)}
                            >
                              {t("Medications", "الأدوية")}
                            </Button>

                            <Button
                              type="button"
                              color="danger"
                              className="cg-patient-action-btn"
                              onClick={() => handleDisconnectPatient(patient)}
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
      )}

      <Row className="px-4 pb-4">
        <Col
          md="8"
          className="mb-4 mb-md-0"
        >
          <Card className="dashboard-card h-100">
            <CardBody>



              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h4 className="mb-0">
                  {t("Patient Medication Overview", "نظرة عامة على أدوية المريض")}
                </h4>

                {dashboardPatientEmail &&
                  selectedDashboardPatient?.medicationManagementPermission && (
                    <Button
                      color="primary"
                      onClick={() => {
                        setSelectedPatient(selectedDashboardPatient);
                        setAddMedicationOpen(true);
                      }}
                    >
                      {t("+ Add Medication", "+ إضافة دواء")}
                    </Button>
                  )}
              </div>




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
                    className="cg-empty-state text-center py-5"
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
                      {t(
                        "No medication activity available today",
                        "لا يوجد نشاط للأدوية اليوم"
                      )}
                    </h5>

                    <p className="text-muted mb-0">
                      {t(
                        "Dose activity will appear here after linked patients have scheduled medications.",
                        "سيظهر نشاط الجرعات هنا بعد أن يقوم المرضى المرتبطون بجدولة أدويتهم."
                      )}
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
                            {t("Patient", 'المريض')}
                          </th>

                          <th>
                            {t("Medication", 'الدواء')}
                          </th>

                          <th>
                            {t("Dosage", 'الجرعة')}
                          </th>

                          <th>
                            {t("Time", 'الوقت')}
                          </th>

                          <th>
                            {t("Status", 'الحالة')}
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
                                  className={getStatusBadgeClass(dose.status)}
                                >
                                  {
                                    (isArabic ? ({ Taken: "تم تناولها", Missed: "فائتة", Skipped: "تم تخطيها", Upcoming: "قادمة" }[dose.status] || dose.status) : dose.status)
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
                {t("Caregiver Alerts", 'تنبيهات مقدم الرعاية')}
              </h4>

              {isLoadingDashboardData && (
                <Alert color="info">
                  {t("Loading alerts...", 'جارٍ تحميل التنبيهات...')}
                </Alert>
              )}

              {!isLoadingDashboardData &&
                visibleMissedDoseAlerts.length ===
                0 &&
                visibleUpcomingDoseAlerts.length ===
                0 && (
                  <div
                    className="cg-empty-state text-center py-5"
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
                      {t(
                        "No alerts at the moment",
                        "لا توجد تنبيهات في الوقت الحالي"
                      )}
                    </h5>

                    <p className="text-muted mb-0">
                      {t(
                        "Missed-dose and upcoming reminder alerts will appear here.",
                        "ستظهر هنا تنبيهات الجرعات الفائتة والتذكيرات القادمة."
                      )}
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
                        {t("Missed Dose", 'جرعة فائتة')}
                      </strong>

                      <div className="mt-1">
                        {getPatientName(
                          dose.userEmail
                        )}{" "}
                        {t("missed", "فاتته جرعة من")} {" "}
                        {
                          dose.medicationName
                        }{" "}
                        {t("at", "الساعة")} {" "}
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
                        {t("Upcoming Medication", "دواء قادم")}
                      </strong>

                      <div className="mt-1">
                        {getPatientName(
                          dose.userEmail
                        )}{" "}
                        {t("should take", "ينبغي أن يتناول")} {" "}
                        {
                          dose.medicationName
                        }{" "}
                        {t("at", "الساعة")} {" "}
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

      <Modal dir={isArabic ? "rtl" : "ltr"} className={`mm-caregiver-modal ${theme === "dark" ? "mm-ch-dark" : ""}`}
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
          {t("Patient Profile", 'ملف المريض')}
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
                  {t("Relationship:", "العلاقة:")}{" "}
                  {selectedPatient.relationship ||
                    t("Not provided", "غير محدد")}
                </p>
              </div>

              <hr />

              <Row>
                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    {t("Phone Number", 'رقم الهاتف')}
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.patientPhoneNumber ||
                      t("Not provided", "غير محدد")}
                  </p>
                </Col>

                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    {t("Age", 'العمر')}
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.age ||
                      t("Not provided", "غير محدد")}
                  </p>
                </Col>

                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    {t("Height", 'الطول')}
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.height
                      ? `${selectedPatient.height} cm`
                      : t("Not provided", "غير محدد")}
                  </p>
                </Col>

                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    {t("Weight", 'الوزن')}
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.weight
                      ? `${selectedPatient.weight} kg`
                      : t("Not provided", "غير محدد")}
                  </p>
                </Col>

                <Col
                  md="6"
                  className="mb-3"
                >
                  <strong>
                    {t("Blood Type", 'فصيلة الدم')}
                  </strong>

                  <p className="text-muted mb-0">
                    {selectedPatient.bloodType ||
                      t("Not provided", "غير محدد")}
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
                      t("Not provided", "غير محدد")}
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
                    {t("Not provided", "غير محدد")}
                  </p>
                )}
              </div>

              <div>
                <strong>
                  {t("Allergies", 'الحساسية')}
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
                    {t("Not provided", "غير محدد")}
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
            {t("Close", 'إغلاق')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal dir={isArabic ? "rtl" : "ltr"} className={`mm-caregiver-modal ${theme === "dark" ? "mm-ch-dark" : ""}`}
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
          {isArabic ? `أدوية ${selectedPatient?.patientName || "المريض"}` : `${selectedPatient?.patientName || "Patient"}'s Medications`}
        </ModalHeader>

        <ModalBody>
          {isLoadingMedications && (
            <Alert color="info">
              {t("Loading medications...", "جارٍ تحميل الأدوية...")}
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
                {t("+ Add Medication", '+ إضافة دواء')}
              </Button>
            </div>
          )}

          {!isLoadingMedications &&
            !medicationMessage &&
            patientMedications.length ===
            0 && (
              <div className="text-center py-5">
                <h5>
                  {t("No medications found", 'لا توجد أدوية')}
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
                  <th>{t("Medication", 'الدواء')}</th>
                  <th>{t("Dosage", 'الجرعة')}</th>
                  <th>{t("Frequency", 'التكرار')}</th>
                  <th>{t("Timing", 'التوقيت')}</th>
                  <th>{t("Reminder", 'التذكير')}</th>
                  <th>{t("Instructions", 'التعليمات')}</th>
                  <th>{t("Prescription", 'الوصفة الطبية')}</th>
                  <th>{t("Actions", 'الإجراءات')}</th>
                </tr>
              </thead>

              <tbody>
                {patientMedications.map((medication) => (
                  <tr key={medication._id}>
                    <td>
                      <strong>{medication.medicationName}</strong>
                    </td>

                    <td>{medication.dosage}</td>

                    <td>{isArabic ? ({ "Once daily": "مرة يوميًا", "Twice daily": "مرتين يوميًا", "Three times daily": "ثلاث مرات يوميًا", "Weekly": "أسبوعيًا", "As needed": "عند الحاجة" }[medication.frequency] || medication.frequency) : medication.frequency}</td>

                    <td>{isArabic ? ({ "Specific Time": "وقت محدد", "Before Meal": "قبل الأكل", "After Meal": "بعد الأكل" }[medication.timing] || medication.timing) : medication.timing}</td>

                    <td>
                      {medication.reminderTimes?.length > 0
                        ? medication.reminderTimes.map(formatTime).join(", ")
                        : t("Not provided", "غير محدد")}
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
                          {t("View", 'عرض')}
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
                            title={t("Edit Medication", "تعديل الدواء")}
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
                            title={t("Delete Medication", "حذف الدواء")}
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
            {t("Close", 'إغلاق')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal dir={isArabic ? "rtl" : "ltr"} className={`mm-caregiver-modal ${theme === "dark" ? "mm-ch-dark" : ""}`}
        isOpen={editMedicationOpen}
        toggle={() => setEditMedicationOpen(false)}
      >
        <ModalHeader
          toggle={() => setEditMedicationOpen(false)}
        >
          {t("Edit Medication", 'تعديل الدواء')}
        </ModalHeader>

        <ModalBody>
          {editMedication && (
            <>
              <label className="mb-1">{t("Medication Name", 'اسم الدواء')}</label>
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

              <label className="mb-1">{t("Dosage", 'الجرعة')}</label>
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
              <label className="mb-1">{t("Instructions", 'التعليمات')}</label>
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
            {t("Save Changes", 'حفظ التغييرات')}
          </Button>

          <Button
            color="secondary"
            onClick={() => setEditMedicationOpen(false)}
          >
            {t("Cancel", 'إلغاء')}
          </Button>
        </ModalFooter>
      </Modal>
      <Modal dir={isArabic ? "rtl" : "ltr"} className={`mm-caregiver-modal ${theme === "dark" ? "mm-ch-dark" : ""}`}
        isOpen={addMedicationOpen}
        toggle={() => setAddMedicationOpen(false)}
      >
        <ModalHeader
          toggle={() => setAddMedicationOpen(false)}
        >
          {t("Add Medication", 'إضافة دواء')}
        </ModalHeader>

        <ModalBody>

          <label className="mb-1">
            {t("Medication Name", "اسم الدواء")} *
          </label>

          <input
            type="text"
            list="caregiver-medicine-list"
            className="form-control mb-2"
            placeholder={t(
              "Search medication name...",
              "ابحث عن اسم الدواء..."
            )}
            autoComplete="off"
            value={newMedication.medicationName}
            onChange={(e) => {
              const name = e.target.value;

              const matchingMedicine = caregiverMedicationOptions.find(
                (medicine) =>
                  normalizeMedicineName(medicine.tradeName) ===
                  normalizeMedicineName(name)
              );

              const detectedForm = matchingMedicine
                ? detectCaregiverMedicationForm(matchingMedicine)
                : "";

              setNewMedication((current) => ({
                ...current,
                medicationName: name,
                medicationForm: matchingMedicine
                  ? detectedForm
                  : current.medicationForm,
                dosage: matchingMedicine ? "" : current.dosage,
              }));
            }}
          />

          <datalist id="caregiver-medicine-list">
            {[...new Set(
              caregiverMedicationOptions.map((medicine) => medicine.tradeName)
            )].map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <small className="text-muted d-block mb-3">
            {t(
              "Select a medication from the Oman dataset or enter it manually.",
              "اختر دواء من قاعدة بيانات الأدوية العُمانية أو أدخله يدويًا."
            )}
          </small>

          <label className="mb-1">{t("Medication Form", "شكل الدواء")}</label>
          <select className="form-select mb-3" value={newMedication.medicationForm}
            onChange={(e) => setNewMedication({ ...newMedication, medicationForm: e.target.value, dosage: "" })}>
            <option value="">{t("Select medication form", "اختر شكل الدواء")}</option>
            {[
              ["Tablet", "قرص"], ["Capsule", "كبسولة"], ["Injection", "حقنة"],
              ["Cream/Ointment", "كريم / مرهم"], ["Inhaler", "بخاخ"],
              ["Eye Drops", "قطرة عين"], ["Ear Drops", "قطرة أذن"],
              ["Liquid/Syrup", "شراب"], ["Patch", "لصقة"],
              ["Suppository", "تحميلة"], ["Other", "أخرى"]
            ].map(([value, ar]) => <option key={value} value={value}>{isArabic ? ar : value}</option>)}
          </select>


          <label className="mb-1">{t("Dosage Amount", 'كمية الجرعة')}</label>
          <div className="d-flex gap-2 mb-3">
            <input
              type="number"
              className="form-control"
              placeholder={t("Amount", "الكمية")}
              min="0.01"
              step="any"
              value={newMedication.dosage.split(" ")[0] || ""}
              onChange={(e) =>
                setNewMedication({
                  ...newMedication,
                  dosage: `${e.target.value} ${newMedication.dosage.split(" ")[1] || ""
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
                  dosage: `${newMedication.dosage.split(" ")[0] || ""
                    } ${e.target.value}`.trim(),
                })
              }
            >
              <option value="">{t("Unit", "الوحدة")}</option>
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


          <label className="mb-1">
            {t("Frequency", "التكرار")}
          </label>

          <select
            className="form-select mb-3"
            value={newMedication.frequency}
            onChange={(e) => {
              const selectedFrequency = e.target.value;
              const requiredCount = caregiverRequiredTimes(selectedFrequency);

              setNewMedication((current) => ({
                ...current,
                frequency: selectedFrequency,
                weeklyDay: "",
                reminderTimes: Array(requiredCount).fill(""),
              }));
            }}
          >
            <option value="Once daily">
              {t("Once daily", "مرة يوميًا")}
            </option>

            <option value="Twice daily">
              {t("Twice daily", "مرتين يوميًا")}
            </option>

            <option value="Three times daily">
              {t("Three times daily", "ثلاث مرات يوميًا")}
            </option>

            <option value="Every 6 hours">
              {t("Every 6 hours", "كل 6 ساعات")}
            </option>

            <option value="Every 8 hours">
              {t("Every 8 hours", "كل 8 ساعات")}
            </option>

            <option value="Every 12 hours">
              {t("Every 12 hours", "كل 12 ساعة")}
            </option>

            <option value="Weekly">
              {t("Weekly", "أسبوعيًا")}
            </option>

            <option value="As needed">
              {t("As needed", "عند الحاجة")}
            </option>
          </select>

          {newMedication.frequency === "Weekly" && (
            <>
              <label className="mb-1">{t("Day of the Week", 'يوم الأسبوع')}</label>
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
                <option value="">{t("Select a day", "اختر يومًا")}</option>
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
                    {isArabic ? ({ Sunday: "الأحد", Monday: "الاثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت" }[day] || day) : day}
                  </option>
                ))}
              </select>
            </>
          )}

          {newMedication.frequency !== "As needed" && (
            <>
              <label className="mb-1">
                {t("Reminder Times", "أوقات التذكير")}
              </label>

              {newMedication.reminderTimes.map((time, index) => (
                <div key={index} className="mb-2">
                  <label className="small">
                    {t("Dose", "الجرعة")} {index + 1}
                  </label>

                  <input
                    type="time"
                    className="form-control"
                    value={time}
                    onChange={(e) => {
                      setNewMedication((current) => {
                        const updatedTimes = [...current.reminderTimes];
                        updatedTimes[index] = e.target.value;

                        return {
                          ...current,
                          reminderTimes: updatedTimes,
                        };
                      });
                    }}
                  />
                </div>
              ))}
            </>
          )}


          <label className="mb-1">{t("Start Date", 'تاريخ البدء')}</label>
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
          <label className="mb-1">{t("End Date", "تاريخ الانتهاء")}</label>
          <input type="date" className="form-control mb-3" min={newMedication.startDate}
            value={newMedication.endDate}
            onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })} />


          <label className="mb-1">{t("Instructions", 'التعليمات')}</label>
          <textarea
            className="form-control"
            placeholder={t("Optional", "اختياري")}
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
            {t("Add Medication", 'إضافة دواء')}
          </Button>

          <Button
            color="secondary"
            onClick={() => setAddMedicationOpen(false)}
          >
            {t("Cancel", 'إلغاء')}
          </Button>
        </ModalFooter>
      </Modal>

      <Footer />
    </Container>
  );
};

export default CaregiverHome;
