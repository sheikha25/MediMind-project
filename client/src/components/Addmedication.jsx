import { useState } from "react";
import axios from "axios";

import {Container,Row,Col,Card,CardBody,Button,FormGroup,Label,Input,Alert,} from "reactstrap";

import { useSelector } from "react-redux";

import {FaCloudUploadAlt,FaFilePdf,FaImage,FaInfoCircle,} from "react-icons/fa";

import Header from "./Header";
import Footer from "./footer";
import omanMedications from "../data/omanmedications.json";


const today = new Date().toLocaleDateString("en-CA");

const medicationOptions = omanMedications
  .filter(
    (medication) =>
      typeof medication.tradeName === "string" &&
      medication.tradeName.trim() !== ""
  )
  .map((medication) => ({
  id: medication.id,
  name: medication.tradeName.trim(),
  strength: medication.medicationStrength,
  form: medication.dosageForm,
  activeIngredient1: medication.activeIngredient1 || "",
  activeIngredient2: medication.activeIngredient2 || "",
  needsReview: medication.dataQualityNeedsReview,
}));


const medicationDosageUnits = {
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
  Other: [
    "mg", "g", "mcg", "ml", "units",
    "tablet", "tablets",
    "capsule", "capsules",
    "drop", "drops",
    "puff", "puffs",
    "patch", "patches",
    "application", "applications",
    "suppository", "suppositories"
  ],
};

const Addmedication = () => {

  const now = new Date();

const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
].join("-");

  const user = useSelector(
    (state) => state.user.user
  );

  const dailyRoutine = user?.dailyRoutine || null;
    const [medicationSearch, setMedicationSearch] = useState("");
const [showMedicationSuggestions, setShowMedicationSuggestions] = useState(false);

  const [dosageAmount, setDosageAmount] =
    useState("");

  const [dosageUnit, setDosageUnit] =
    useState("mg");

    const [medicationForm, setMedicationForm] = useState("");
    
const [selectedMedication, setSelectedMedication] = useState(null);

    const [topicalDosage, setTopicalDosage] = useState("");

  const [frequency, setFrequency] =
    useState("");

   const [weeklyDay, setWeeklyDay] = useState([]);

  const [customFrequency, setCustomFrequency] =
    useState("");
    const [customInterval, setCustomInterval] = useState("");
const [customUnit, setCustomUnit] = useState("Hours");

  const [timing, setTiming] =
    useState("Before Meal");

  const [
    timingOffsetHours,
    setTimingOffsetHours,
  ] = useState("");

  const [
    timingOffsetMinutes,
    setTimingOffsetMinutes,
  ] = useState("");

  const [reminderTimes, setReminderTimes] =
    useState([]);

  const [startDate, setStartDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    const [endDate, setEndDate] = useState("");

  const [instructions, setInstructions] =
    useState("");

  const [
    prescriptionFile,
    setPrescriptionFile,
  ] = useState(null);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("danger");

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    showUploadHelp,
    setShowUploadHelp,
  ] = useState(false);

  const allowedFileTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setMessage("");

    if (!file) {
      setPrescriptionFile(null);
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      setPrescriptionFile(null);
      event.target.value = "";

      setMessage(
        "Please upload a PDF, JPG, JPEG, or PNG prescription file."
      );

      setMessageType("danger");
      return;
    }

    const maximumSize =
      5 * 1024 * 1024;

    if (file.size > maximumSize) {
      setPrescriptionFile(null);
      event.target.value = "";

      setMessage(
        "The prescription file must be smaller than 5 MB."
      );

      setMessageType("danger");
      return;
    }

    setPrescriptionFile(file);
  };

  const getFinalFrequency = () => {
  if (frequency === "Other") {
    const interval = Number(customInterval);

    if (
      !Number.isInteger(interval) ||
      interval <= 0 ||
      !["Hours", "Days", "Weeks"].includes(customUnit)
    ) {
      return "";
    }

   const unit =
  interval === 1
    ? customUnit.toLowerCase().slice(0, -1)
    : customUnit.toLowerCase();

return `Every ${interval} ${unit}`;
  }

  return frequency;
};

  const getRequiredTimeCount = (
    selectedFrequency
  ) => {
    switch (selectedFrequency) {
      case "Once daily":
        return 1;

      case "Twice daily":
        return 2;

      case "Three times daily":
        return 3;

      case "Every 6 hours":
        return 4;

      case "Every 8 hours":
        return 3;

      case "Every 12 hours":
        return 2;

      case "Weekly":
        return 1;

      case "As needed":
        return 0;

      case "Other": {
  const interval = Number(customInterval);

  if (!Number.isInteger(interval) || interval <= 0) {
    return 0;
  }

  if (customUnit === "Hours") {
    return 24 % interval === 0 ? 24 / interval : 0;
  }

  if (customUnit === "Days" || customUnit === "Weeks") {
    return 1;
  }

  return 0;
}

      default:
        return 0;
    }
  };

  const updateReminderTimeCount = (
    selectedFrequency
  ) => {
    const requiredCount =
      getRequiredTimeCount(
        selectedFrequency
      );

    if (requiredCount === 0) {
      setReminderTimes([]);
      return;
    }

    setReminderTimes(
      (currentTimes) =>
        Array.from(
          {
            length: requiredCount,
          },
          (_, index) =>
            currentTimes[index] || ""
        )
    );
  };


  const adjustRoutineTime = (time, offsetMinutes = 0) => {
  if (!time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return "";
  }

  const [hours, minutes] = time.split(":").map(Number);

  const totalMinutes =
    ((hours * 60 + minutes + offsetMinutes) % 1440 + 1440) % 1440;

  return [
    String(Math.floor(totalMinutes / 60)).padStart(2, "0"),
    String(totalMinutes % 60).padStart(2, "0"),
  ].join(":");
};


const getSuggestedReminderTimes = () => {
  if (!dailyRoutine || !frequency || frequency === "As needed") {
    return [];
  }

  const requiredCount = getRequiredTimeCount(frequency);

  if (requiredCount === 0) {
    return [];
  }

  // Generate evenly spaced reminders for hourly frequencies.
const hourlyInterval =
  frequency === "Every 6 hours"
    ? 6
    : frequency === "Every 8 hours"
    ? 8
    : frequency === "Every 12 hours"
    ? 12
    : frequency === "Other" && customUnit === "Hours"
    ? Number(customInterval)
    : null;

if (hourlyInterval !== null) {
  if (
    !Number.isInteger(hourlyInterval) ||
    hourlyInterval < 1 ||
    hourlyInterval > 24 ||
    24 % hourlyInterval !== 0
  ) {
    return [];
  }

  const wakeTime = dailyRoutine.wake;

  if (!wakeTime) {
    return [];
  }

  const suggestedTimes = Array.from(
    { length: 24 / hourlyInterval },
    (_, index) =>
      adjustRoutineTime(wakeTime, index * hourlyInterval * 60)
  );

  if (
    suggestedTimes.some((time) => !time) ||
    new Set(suggestedTimes).size !== suggestedTimes.length
  ) {
    return [];
  }

  return suggestedTimes;
}

  const offset =
    (Number(timingOffsetHours) || 0) * 60 +
    (Number(timingOffsetMinutes) || 0);

  const mealKeys = ["breakfast", "lunch", "dinner"];

  let suggestions = [];

  // Individual meal: Before Breakfast, After Lunch, etc.
  const individualMealMatch = timing.match(
    /^(Before|With|After) (Breakfast|Lunch|Dinner)$/
  );

  if (individualMealMatch) {
    // Individual meal timings provide one reminder only.
    if (requiredCount !== 1) {
      return [];
    }

    const relation = individualMealMatch[1];
    const mealName = individualMealMatch[2].toLowerCase();
    const meal = dailyRoutine[mealName];

    if (!meal) return [];

    if (relation === "Before") {
      suggestions = [adjustRoutineTime(meal, -offset)];
    } else if (relation === "After") {
      suggestions = [adjustRoutineTime(meal, offset)];
    } else {
      suggestions = [adjustRoutineTime(meal)];
    }
  }

  // Multiple meal timings
  else if (["Before Meal", "With Meal", "After Meal"].includes(timing)) {
    // Once daily: breakfast
    // Twice daily: breakfast and dinner
    // Three times daily: breakfast, lunch and dinner
    const selectedMeals =
      requiredCount === 1
        ? ["breakfast"]
        : requiredCount === 2
        ? ["breakfast", "dinner"]
        : requiredCount === 3
        ? mealKeys
        : [];

    if (selectedMeals.length === 0) {
      return [];
    }

    suggestions = selectedMeals.map((mealName) => {
      const meal = dailyRoutine[mealName];

      if (!meal) return "";

      if (timing === "Before Meal") {
        return adjustRoutineTime(meal, -offset);
      }

      if (timing === "After Meal") {
        return adjustRoutineTime(meal, offset);
      }

      return adjustRoutineTime(meal);
    });
  }

  
  // Morning: use the patient's saved wake-up time
  else if (timing === "Morning") {
    if (requiredCount !== 1) {
      return [];
    }

    suggestions = [
      adjustRoutineTime(dailyRoutine.wake)
    ];
  }

  // Wake and sleep
  else if (timing === "At Wake Time" || timing === "Before Sleep") {
    if (requiredCount !== 1) {
      return [];
    }

    const routineTime =
      timing === "At Wake Time"
        ? dailyRoutine.wake
        : dailyRoutine.sleep;

    suggestions = [adjustRoutineTime(routineTime)];
  } else {
    return [];
  }

  // Never fill incomplete or duplicate suggestions.
  if (
    suggestions.length !== requiredCount ||
    suggestions.some((time) => !time) ||
    new Set(suggestions).size !== suggestions.length
  ) {
    return [];
  }

  return suggestions;
};

  const getDoseLabel = (time, index) => {
  if (!time) return `Dose ${index + 1}`;

  const hour = Number(time.split(":")[0]);

  if (hour >= 5 && hour < 12) {
    return "Morning Dose";
  }

  if (hour >= 12 && hour < 17) {
    return "Afternoon Dose";
  }

  if (hour >= 17 && hour < 21) {
    return "Evening Dose";
  }

  return "Night Dose";
};

  const handleReminderTimeChange = (
    index,
    value
  ) => {
    setReminderTimes(
      (currentTimes) =>
        currentTimes.map(
          (
            currentTime,
            timeIndex
          ) =>
            timeIndex === index
              ? value
              : currentTime
        )
    );
  };

  const clearForm = () => {
    setMedicationSearch("");
    
setSelectedMedication(null);

setShowMedicationSuggestions(false);
    setDosageAmount("");
    setDosageUnit("mg");
    setFrequency("");
    setCustomFrequency("");
    setTiming("Before Meal");
    setMedicationForm("");
setTopicalDosage("");
setCustomInterval("");
setCustomUnit("Hours");
    setTimingOffsetHours("");
    setTimingOffsetMinutes("");
setWeeklyDay([]);
    setReminderTimes([]);

    setStartDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );
    setEndDate("");
    setInstructions("");
    setPrescriptionFile(null);
    setShowUploadHelp(false);

    const fileInput =
      document.getElementById(
        "prescriptionFile"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Estimate the number of tablets/capsules required over the selected dates.
  // Date strings are parsed in UTC to avoid daylight-saving/timezone shifts.
  const getTotalUnitsNeeded = () => {
    if (!['Tablet', 'Capsule'].includes(medicationForm)) return null;
    if (!['tablet', 'tablets', 'capsule', 'capsules'].includes(dosageUnit)) return null;

    const perDose = Number(dosageAmount);
    if (!Number.isInteger(perDose) || perDose <= 0) return null;
    if (!startDate || !endDate) return null;

    const start = Date.parse(`${startDate}T00:00:00Z`);
    const end = Date.parse(`${endDate}T00:00:00Z`);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;

    const days = Math.round((end - start) / 86400000) + 1;
    let doses = 0;

    const dailyCounts = {
      'Once daily': 1,
      'Twice daily': 2,
      'Three times daily': 3,
      'Every 6 hours': 4,
      'Every 8 hours': 3,
      'Every 12 hours': 2,
    };

    if (Object.prototype.hasOwnProperty.call(dailyCounts, frequency)) {
      doses = days * dailyCounts[frequency];
    

} else if (frequency === "Weekly") {
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  if (!Array.isArray(weeklyDay) || weeklyDay.length === 0) {
    return null;
  }

  const selectedDays = new Set(
    weeklyDay.map((day) => weekdays.indexOf(day))
  );

  if (selectedDays.has(-1)) return null;

  doses = 0;

  // Count every selected weekday, including start and end dates.
  for (let day = start; day <= end; day += 86400000) {
    const currentWeekday = new Date(day).getUTCDay();

    if (selectedDays.has(currentWeekday)) {
      doses += 1;
    }
  }


} else if (frequency === 'Other') {
      const interval = Number(customInterval);
      if (!Number.isSafeInteger(interval) || interval <= 0) return null;
      if (customUnit === 'Hours') {
        if (interval > 24 || 24 % interval !== 0) return null;
        doses = days * (24 / interval);
      } else if (customUnit === 'Days') {
        doses = Math.ceil(days / interval);
      } else if (customUnit === 'Weeks') {
        doses = Math.ceil(days / (interval * 7));
      } else return null;
    } else {
      // PRN cannot be predicted; unsupported schedules must not be guessed.
      return null;
    }

   console.log("TOTAL UNITS DEBUG:", {
  medicationForm,
  dosageAmount,
  dosageUnit,
  frequency,
  weeklyDay,
  startDate,
  endDate,
  days,
  doses,
  perDose,
  total: doses * perDose,
});

return doses * perDose;
  };

  const totalUnitsNeeded = getTotalUnitsNeeded();

  const saveMedication = async () => {
    const finalFrequency =
      getFinalFrequency();

      if (frequency === "Other") {
  const interval = Number(customInterval);

  if (
    !Number.isSafeInteger(interval) ||
    interval < 1 ||
    !["Hours", "Days", "Weeks"].includes(customUnit)
  ) {
    setMessage("Please enter a valid custom frequency.");
    setMessageType("danger");
    return;
  }

  if (
    customUnit === "Hours" &&
    (interval > 24 || 24 % interval !== 0)
  ) {
    setMessage(
      "For hourly reminders, choose an interval that divides evenly into 24 hours."
    );
    setMessageType("danger");
    return;
  }
}

    const dosage =
      `${dosageAmount.trim()} ${dosageUnit}`.trim();

      
if (selectedMedication) {
  const rawForm = String(selectedMedication.form || "")
    .toLowerCase()
    .trim();

  const knownForms = {
    Tablet: ["tablet"],
    Capsule: ["capsule"],
    Injection: ["injection", "injectable"],
    "Cream/Ointment": ["cream", "ointment"],
    Inhaler: ["inhaler"],
    "Eye Drops": ["ophthalmic", "eye drop"],
    "Ear Drops": ["otic", "ear drop"],
    "Liquid/Syrup": ["syrup", "oral liquid", "oral solution"],
    Patch: ["patch"],
    Suppository: ["suppository"],
  };

  const recognizedForm = Object.entries(knownForms).find(
    ([, keywords]) =>
      keywords.some((keyword) => rawForm.includes(keyword))
  )?.[0];

  if (recognizedForm && medicationForm !== recognizedForm) {
    setMessage(
      `Invalid medication form. The selected medication is listed as ${recognizedForm} in the medication database.`
    );
    setMessageType("danger");
    return;
  }
}

    setMessage("");

    if (
  !medicationForm ||
  !medicationDosageUnits[medicationForm]
) {
  setMessage("Please select a valid medication form.");
  setMessageType("danger");
  return;
}

if (
  !medicationDosageUnits[medicationForm].includes(dosageUnit)
) {
  setMessage(
    "Please select a dosage unit appropriate for the medication form."
  );
  setMessageType("danger");
  return;
}

    if (!user?.email) {
      setMessage(
        "Please log in before adding a medication."
      );

      setMessageType("danger");
      return;
    }

    if (
      !medicationSearch.trim() ||
      !dosageAmount.trim() ||
      !finalFrequency ||
      !timing
    ) {
      setMessage(
        "Please complete all required medication fields."
      );

      setMessageType("danger");
      return;
    }

    const isMealTiming = [
      "Before Meal",
      "With Meal",
      "After Meal",
    ].includes(timing);

    const needsTimingOffset =
  timing.startsWith("Before ") &&
  (timing.includes("Meal") ||
    timing.includes("Breakfast") ||
    timing.includes("Lunch") ||
    timing.includes("Dinner")) ||
  timing.startsWith("After ") &&
  (timing.includes("Meal") ||
    timing.includes("Breakfast") ||
    timing.includes("Lunch") ||
    timing.includes("Dinner"));

    let totalTimingOffsetMinutes = 0;

    if (needsTimingOffset) {
      const hours =
        timingOffsetHours === ""
          ? 0
          : Number(
              timingOffsetHours
            );

      const minutes =
        timingOffsetMinutes === ""
          ? 0
          : Number(
              timingOffsetMinutes
            );

      if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        minutes < 0 ||
        minutes > 59
      ) {
        setMessage(
          "Please enter a valid timing offset."
        );

        setMessageType("danger");
        return;
      }

      totalTimingOffsetMinutes =
        hours * 60 + minutes;

      if (
        totalTimingOffsetMinutes === 0
      ) {
        setMessage(
          "Please enter how long before or after the meal this medication should be taken."
        );

        setMessageType("danger");
        return;
      }
    }

    if (
      Number.isNaN(
        Number(dosageAmount)
      ) ||
      Number(dosageAmount) <= 0
    ) {
      setMessage(
        "Please enter a valid dosage amount."
      );

      setMessageType("danger");
      return;
    }


    
if (
  frequency === "Weekly" &&
  (!Array.isArray(weeklyDay) || weeklyDay.length === 0)
) {
  setMessage("Please select at least one day for weekly medication.");
  setMessageType("danger");
  return;
}

    if (!startDate) {
  setMessage("Please select the medication start date.");
  setMessageType("danger");
  return;
}

if (startDate < today) {
  setMessage("Medication start date cannot be in the past.");
  setMessageType("danger");
  return;
}

if (!endDate) {
  setMessage("Please select the medication end date.");
  setMessageType("danger");
  return;
}

if (endDate < startDate) {
  setMessage("Medication end date cannot be earlier than start date.");
  setMessageType("danger");
  return;
}

    if (
      frequency !== "As needed" &&
      reminderTimes.length === 0
    ) {
      setMessage(
        "Please select at least one reminder time."
      );

      setMessageType("danger");
      return;
    }

    if (
      frequency !== "As needed" &&
      reminderTimes.some(
        (reminderTime) =>
          !reminderTime
      )
    ) {
      setMessage(
        "Please select all required reminder times."
      );

      setMessageType("danger");
      return;
    }

    const duplicateTimes =
      new Set(reminderTimes).size !==
      reminderTimes.length;

    if (
      frequency !== "As needed" &&
      duplicateTimes
    ) {
      setMessage(
        "Please select a different time for each dose."
      );

      setMessageType("danger");
      return;
    }

    try {
      setIsSaving(true);

      const formData =
        new FormData();

      formData.append(
        "userEmail",
        user.email
      );

      formData.append(
  "medicationName",
  medicationSearch.trim()
);

      formData.append(
        "dosage",
        dosage
      );

      formData.append("medicationForm", medicationForm);

      if (medicationForm === "Cream/Ointment") {
  formData.append("topicalDosage", topicalDosage.trim());
}

      formData.append(
        "frequency",
        finalFrequency
      );

      
if (frequency === "Weekly") {
  formData.append("weeklyDay", JSON.stringify(weeklyDay));
}

      formData.append(
        "timing",
        timing
      );


      formData.append(
        "timingOffsetMinutes",
        String(
          totalTimingOffsetMinutes
        )
      );

      formData.append(
        "reminderTimes",
        JSON.stringify(
          reminderTimes
        )
      );

      formData.append(
        "startDate",
        startDate
      );

      formData.append("endDate", endDate);


      formData.append(
        "isActive",
        "true"
      );

      formData.append(
        "instructions",
        instructions.trim()
      );

      if (prescriptionFile) {
        formData.append(
          "prescription",
          prescriptionFile
        );
      }

      const response =
        await axios.post(
          "http://localhost:3002/medications",
          formData
        );

      if (
        response.data?.message ===
        "Medication saved successfully"
      ) {
        setMessage(
          "Medication saved successfully."
        );

        setMessageType("success");

        clearForm();
      } else {
        setMessage(
          response.data?.message ||
            "The medication could not be saved."
        );

        setMessageType("danger");
      }
    } catch (error) {
      console.error(
        "Medication save error:",
        error
      );

      setMessage(
        error.response?.data
          ?.message ||
          "An error occurred while saving the medication."
      );

      setMessageType("danger");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container
      fluid
      className="dashboard-page"
    >
      <Header />

      <Row className="py-5 px-3 justify-content-center">
        <Col lg="8" xl="7">
          <div className="mb-4">
            <h2
              style={{
                color: "#1e3a8a",
                fontWeight: "700",
              }}
            >
              Add New Medication
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginBottom: 0,
              }}
            >
              Enter the medication details
              manually or upload a
              prescription for AI-assisted
              entry.
            </p>
          </div>

          <Card
            className="medication-card"
            style={{
              border:
                "1px solid #e5e7eb",
              borderRadius: "16px",
              boxShadow:
                "0 8px 24px rgba(30, 58, 138, 0.08)",
            }}
          >
            <CardBody className="p-4">
              {message && (
                <Alert color={messageType}>
                  {message}
                </Alert>
              )}

              <FormGroup>
  <Label for="medicationName">
    Medication Name{" "}
    <span style={{ color: "#dc3545" }}>*</span>
  </Label>

  <Input
    id="medicationName"
    type="text"
    placeholder="Type medication name..."
    autoComplete="off"
    value={medicationSearch}
    onChange={(event) => {
      const value = event.target.value;

      
setMedicationSearch(value);
setSelectedMedication(null);

setShowMedicationSuggestions(
  value.trim().length >= 2
);

      setMessage("");
    }}
  />

  
{showMedicationSuggestions && (() => {
 const normalizeMedicationSearch = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const query = normalizeMedicationSearch(medicationSearch);


const matches = medicationOptions
  .filter((medication) => {
    const searchableFields = [
      medication.name,
      medication.activeIngredient1,
      medication.activeIngredient2,
    ];

    return searchableFields.some((field) =>
      normalizeMedicationSearch(field).includes(query)
    );
  })
  .sort((a, b) => {
    const getRank = (medication) => {
      const name = normalizeMedicationSearch(medication.name);

      if (name === query) return 0;
      if (name.startsWith(query)) return 1;
      if (name.includes(query)) return 2;

      // Prioritize single-ingredient medications.
      if (!String(medication.activeIngredient2 || "").trim()) {
        return 3;
      }

      // Combination medications appear afterward.
      return 4;
    };

    return getRank(a) - getRank(b) ||
      a.name.localeCompare(b.name);
  })
  .slice(0, 20);


  return (
    <div
      style={{
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        marginTop: "5px",
        maxHeight: "180px",
        overflowY: "auto",
        backgroundColor: "white",
      }}
    >
      {matches.map((medication) => (
        <div
          key={medication.id}
          
onClick={() => {
  setMedicationSearch(medication.name);
  
setSelectedMedication(medication);

  setShowMedicationSuggestions(false);
  setMessage("");

  // Automatically select the medication form.
 const rawForm = (medication.form || "").toLowerCase();
const rawName = (medication.name || "").toLowerCase();

  let selectedForm = "";

  
if (
  rawName.includes("ophthalmic") ||
  rawName.includes("eye drops") ||
  rawForm.includes("ophthalmic")
) {
  selectedForm = "Eye Drops";
} else if (
  rawName.includes("otic") ||
  rawName.includes("ear drops") ||
  rawForm.includes("otic")
) {
  selectedForm = "Ear Drops";
} else if (rawForm.includes("tablet")) {
  selectedForm = "Tablet";
}

  else if (rawForm.includes("capsule")) selectedForm = "Capsule";
  else if (rawForm.includes("injection")) selectedForm = "Injection";
  else if (rawForm.includes("cream") || rawForm.includes("ointment"))
    selectedForm = "Cream/Ointment";
  else if (rawForm.includes("inhaler")) selectedForm = "Inhaler";
  else if (rawForm.includes("eye drop")) selectedForm = "Eye Drops";
  else if (rawForm.includes("ear drop")) selectedForm = "Ear Drops";
  else if (rawForm.includes("syrup") || rawForm.includes("oral liquid"))
    selectedForm = "Liquid/Syrup";
  else if (rawForm.includes("patch")) selectedForm = "Patch";
  else if (rawForm.includes("suppository")) selectedForm = "Suppository";
  else selectedForm = "Other";

  setMedicationForm(selectedForm);

  // Detect the product strength unit, not the prescribed dose.
  const strength = String(medication.strength || "").toLowerCase();
  const unitMatch = strength.match(
    /(?:^|[^a-z])(mcg|µg|μg|mg|iu|ml|g|units?)(?=$|[^a-z])/i
  );

  const detectedUnit = unitMatch?.[1]
    ?.toLowerCase()
    .replace("µg", "mcg")
    .replace("μg", "mcg");

  const allowedUnits = medicationDosageUnits[selectedForm] || [];

  setDosageUnit(
    detectedUnit && allowedUnits.includes(detectedUnit)
      ? detectedUnit
      : allowedUnits[0] || ""
  );

  // Dosage amount stays manual.
  setDosageAmount("");
}}

          style={{
            padding: "10px 12px",
            cursor: "pointer",
            borderBottom: "1px solid #f1f1f1",
            color: "#212529",
          }}
        >
          
<div style={{ fontWeight: "600" }}>
  {medication.name}
</div>

{(medication.activeIngredient1 ||
  medication.activeIngredient2) && (
  <div
    style={{
      fontSize: "12px",
      color: "#495057",
      marginTop: "3px",
      marginBottom: "3px",
    }}
  >
    Active Ingredient:{" "}
    {[
      medication.activeIngredient1,
      medication.activeIngredient2,
    ]
      .filter(Boolean)
      .join(" + ")}
  </div>
)}

<small style={{ color: "#6c757d" }}>

            {medication.strength &&
            medication.strength !== "Unknown"
              ? `Strength: ${medication.strength}`
              : "Strength not listed"}

            {medication.form &&
              medication.form !== "Unknown" &&
              ` | Form: ${medication.form}`}
          </small>
        </div>
      ))}

      {matches.length === 0 && (
        <div style={{ padding: "10px 12px", color: "#6c757d" }}>
          No matching medication found.
        </div>
      )}

      <div
        onClick={() => {
          setShowMedicationSuggestions(false);
          setMessage("");
        }}
        style={{
          padding: "10px 12px",
          cursor: "pointer",
          color: "#0d6efd",
          fontWeight: "600",
        }}
      >
        Other Medication — enter manually
      </div>
    </div>
   );
})()}

</FormGroup>

<FormGroup>
  <Label for="medicationForm">
    Medication Form <span className="text-danger">*</span>
  </Label>

  <Input
    id="medicationForm"
    type="select"
    value={medicationForm}
    onChange={(event) => {
  const selectedForm = event.target.value;

  setMedicationForm(selectedForm);
  setDosageUnit(
    medicationDosageUnits[selectedForm]?.[0] || ""
  );
  setMessage("");
}}
  >
    <option value="">Select medication form</option>
    <option value="Tablet">Tablet</option>
    <option value="Capsule">Capsule</option>
    <option value="Injection">Injection</option>
    <option value="Cream/Ointment">Cream / Ointment</option>
    <option value="Inhaler">Inhaler</option>
    <option value="Eye Drops">Eye Drops</option>
    <option value="Ear Drops">Ear Drops</option>
    <option value="Liquid/Syrup">Liquid / Syrup</option>
    <option value="Patch">Patch</option>
    <option value="Suppository">Suppository</option>
    <option value="Other">Other</option>
  </Input>
</FormGroup>

{medicationForm === "Cream/Ointment" && (
  <FormGroup>
    <Label for="topicalDosage">
      Application Instructions
    </Label>

    <Input
      id="topicalDosage"
      type="text"
      placeholder="e.g. Apply a thin layer to the affected area"
      value={topicalDosage}
      onChange={(event) => {
        setTopicalDosage(event.target.value);
        setMessage("");
      }}
    />
  </FormGroup>
)}

              <FormGroup>
                <Label>
                  Dosage{" "}
                  <span
                    style={{
                      color: "#dc3545",
                    }}
                  >
                    *
                  </span>
                </Label>

                <Row>
                  <Col
                    sm="7"
                    className="mb-2 mb-sm-0"
                  >
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="For example, 500"
                      value={
                        dosageAmount
                      }
                      onChange={(
                        event
                      ) => {
                        setDosageAmount(
                          event.target
                            .value
                        );

                        setMessage("");
                      }}
                    />
                  </Col>

                  <Col sm="5">
                    <Input
                      type="select"
                      value={
                        dosageUnit
                      }
                      onChange={(
                        event
                      ) => {
                        setDosageUnit(
                          event.target
                            .value
                        );

                        setMessage("");
                      }}
                    >
                    {(medicationDosageUnits[medicationForm] || medicationDosageUnits.Other).map(
  (unit) => (
    <option key={unit} value={unit}>
      {unit}
    </option>
  )
)}
                    </Input>
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Label for="frequency">
                  Frequency{" "}
                  <span
                    style={{
                      color: "#dc3545",
                    }}
                  >
                    *
                  </span>
                </Label>

                <Input
                  id="frequency"
                  type="select"
                  value={frequency}
                  onChange={(event) => {
                    const selectedFrequency =
                      event.target.value;

                    setFrequency(
                      selectedFrequency
                    );

                    if (
                      selectedFrequency !==
                      "Other"
                    ) {
                      setCustomFrequency(
                        ""
                      );
                    }

                    updateReminderTimeCount(
                      selectedFrequency
                    );

                    setMessage("");
                  }}
                >
                  <option value="">
                    Select frequency
                  </option>

                  <option value="Once daily">
                    Once daily
                  </option>

                  <option value="Twice daily">
                    Twice daily
                  </option>

                  <option value="Three times daily">
                    Three times daily
                  </option>

                  <option value="Every 6 hours">
                    Every 6 hours
                  </option>

                  <option value="Every 8 hours">
                    Every 8 hours
                  </option>

                  <option value="Every 12 hours">
                    Every 12 hours
                  </option>

                  <option value="Weekly">
                    Weekly
                  </option>

                  <option value="As needed">
                    As needed
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </Input>
              </FormGroup>
{frequency === "Weekly" && (
  
<FormGroup>
  <Label>
    Days of the Week <span className="text-danger">*</span>
  </Label>

  <div className="d-flex flex-wrap gap-3">
    {[
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ].map((day) => (
      
<label
  key={day}
  className="d-flex align-items-center gap-2"
  style={{ cursor: "pointer" }}
>
  <Input
    type="checkbox"
    checked={weeklyDay.includes(day)}
    onChange={(event) => {
      if (event.target.checked) {
        setWeeklyDay((previous) => [...previous, day]);
      } else {
        setWeeklyDay((previous) =>
          previous.filter((selected) => selected !== day)
        );
      }
      setMessage("");
    }}
  />
  <span>{day}</span>
</label>

    ))}
  </div>
</FormGroup>
)}
              {frequency === "Other" && (
               <>
  <FormGroup>
    <Label for="customInterval">
      Repeat Every <span className="text-danger">*</span>
    </Label>

    <Input
      id="customInterval"
      type="number"
      min="1"
      step="1"
      placeholder="Enter a number"
      value={customInterval}
      onChange={(event) => {
        setCustomInterval(event.target.value);
        setMessage("");
      }}
    />
  </FormGroup>

  <FormGroup>
    <Label for="customUnit">
      Time Unit <span className="text-danger">*</span>
    </Label>

    <Input
      id="customUnit"
      type="select"
      value={customUnit}
      onChange={(event) => {
        setCustomUnit(event.target.value);
        setMessage("");
      }}
    >
      <option value="Hours">Hours</option>
      <option value="Days">Days</option>
      <option value="Weeks">Weeks</option>
    </Input>
  </FormGroup>
</>
              )}

              <FormGroup>
                <Label for="timing">
                  Timing{" "}
                  <span
                    style={{
                      color: "#dc3545",
                    }}
                  >
                    *
                  </span>
                </Label>

                <Input
                  id="timing"
                  type="select"
                  value={timing}
                  onChange={(event) => {
                    const selectedTiming =
                      event.target.value;

                    setTiming(
                      selectedTiming
                    );

                   const needsOffset =
  /^(Before|After) (Meal|Breakfast|Lunch|Dinner)$/.test(
    selectedTiming
  );

if (!needsOffset) {
  setTimingOffsetHours("");
  setTimingOffsetMinutes("");
}

                    setMessage("");
                  }}
                >
                  <option value="Before Meal">Before Meals (Multiple Doses)</option>
<option value="With Meal">With Meals (Multiple Doses)</option>
<option value="After Meal">After Meals (Multiple Doses)</option>

<option value="Before Breakfast">Before Breakfast</option>
<option value="With Breakfast">With Breakfast</option>
<option value="After Breakfast">After Breakfast</option>

<option value="Before Lunch">Before Lunch</option>
<option value="With Lunch">With Lunch</option>
<option value="After Lunch">After Lunch</option>

<option value="Before Dinner">Before Dinner</option>
<option value="With Dinner">With Dinner</option>
<option value="After Dinner">After Dinner</option>

                  <option value="Morning">
                    Morning
                  </option>
                  <option value="At Wake Time">
  At Wake Time
</option>

                  <option value="Afternoon">
                    Afternoon
                  </option>

                  <option value="Evening">
                    Evening
                  </option>

                  <option value="Before Sleep">
                    Before Sleep
                  </option>

                  <option value="Any Time">
                    Any Time
                  </option>
                </Input>
              </FormGroup>

              {[
  "Before Meal", "With Meal", "After Meal",
  "Before Breakfast", "With Breakfast", "After Breakfast",
  "Before Lunch", "With Lunch", "After Lunch",
  "Before Dinner", "With Dinner", "After Dinner",
].includes(timing) && (
                <>
                  

                  {!timing.startsWith("With ") && (
  <FormGroup>
                      <Label>
                        How long{" "}
                        {timing.startsWith("After ")
  ? "after"
  : "before"}{" "}
                        the meal?{" "}
                        <span
                          style={{
                            color:
                              "#dc3545",
                          }}
                        >
                          *
                        </span>
                      </Label>

                      <Row>
                        <Col
                          md="6"
                          className="mb-2 mb-md-0"
                        >
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Hours"
                            value={
                              timingOffsetHours
                            }
                            onChange={(
                              event
                            ) => {
                              setTimingOffsetHours(
                                event
                                  .target
                                  .value
                              );

                              setMessage(
                                ""
                              );
                            }}
                          />
                        </Col>

                        <Col md="6">
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            step="1"
                            placeholder="Minutes"
                            value={
                              timingOffsetMinutes
                            }
                            onChange={(
                              event
                            ) => {
                              setTimingOffsetMinutes(
                                event
                                  .target
                                  .value
                              );

                              setMessage(
                                ""
                              );
                            }}
                          />
                        </Col>
                      </Row>

                      <small className="text-muted">
                        Enter the timing given
                        in the medication
                        instructions or by your
                        healthcare provider.
                      </small>
                    </FormGroup>
                  )}
                </>
              )}

              <FormGroup>
                <Label for="startDate">
                  Medication Start Date{" "}
                  <span
                    style={{
                      color: "#dc3545",
                    }}
                  >
                    *
                  </span>
                </Label>

                <Input
  id="startDate"
  type="date"
  min={today}
  value={startDate}
  onChange={(event) => {
    setStartDate(event.target.value);
    setMessage("");
  }}
/>
              </FormGroup>

<FormGroup>
  <Label for="endDate">
    Medication End Date <span className="text-danger">*</span>
  </Label>

  <Input
    id="endDate"
    type="date"
    min={startDate}
    value={endDate}
    onChange={(event) => {
      setEndDate(event.target.value);
      setMessage("");
    }}
  />
</FormGroup>

              {frequency &&
                frequency !==
                  "As needed" && (
                  <FormGroup>
                    <Label>
                      Reminder Time
                      {reminderTimes.length >
                      1
                        ? "s"
                        : ""}{" "}
                      <span
                        style={{
                          color:
                            "#dc3545",
                        }}
                      >
                        *
                      </span>
                    </Label>

                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      Choose the time for
                      each scheduled dose.
                    </p>

{getSuggestedReminderTimes().length > 0 && (
  <div className="mb-3">
    <Button
      type="button"
      color="primary"
      outline
      size="sm"
      onClick={() => {
        const suggestedTimes = getSuggestedReminderTimes();

        if (suggestedTimes.length !== reminderTimes.length) {
          setMessage(
            "Suggested times do not match the required number of doses."
          );
          setMessageType("danger");
          return;
        }

        setReminderTimes(suggestedTimes);
        setMessage("");
      }}
    >
      Use Suggested Times
    </Button>

    <small className="d-block text-muted mt-2">
      Suggestions are based on your saved Daily Routine.
      You can adjust the reminder times before saving.
    </small>
  </div>
)}

                    <Row>
                      {reminderTimes.map(
                        (
                          time,
                          index
                        ) => (
                          <Col
                            md="6"
                            key={index}
                            className="mb-3"
                          >
                            <Label>
  {getDoseLabel(time, index)}
</Label>

                            <Input
                              type="time"
                              value={time}
                              onChange={(
                                event
                              ) => {
                                handleReminderTimeChange(
                                  index,
                                  event
                                    .target
                                    .value
                                );

                                setMessage(
                                  ""
                                );
                              }}
                            />
                          </Col>
                        )
                      )}
                    </Row>
                  </FormGroup>
                )}

              {frequency ===
                "As needed" && (
                <Alert color="info">
                  Reminder times are
                  optional for medications
                  taken only when needed.
                </Alert>
              )}

              {totalUnitsNeeded !== null && (
                <Alert color="info" className="mb-3">
                  <strong>Estimated total {medicationForm === 'Capsule' ? 'capsules' : 'tablets'} needed:</strong>{' '}
                  {totalUnitsNeeded}
                  <div className="small mt-1">
                    Calculated from the selected dose, frequency, and treatment dates (including both dates).
                  </div>
                </Alert>
              )}

              <FormGroup>
                <Label for="instructions">
                  Additional Instructions
                </Label>

                <Input
                  id="instructions"
                  type="textarea"
                  rows="4"
                  placeholder="For example, take with a full glass of water"
                  value={instructions}
                  onChange={(event) => {
                    setInstructions(
                      event.target.value
                    );

                    setMessage("");
                  }}
                />
              </FormGroup>

              <div
                style={{
                  marginTop: "26px",
                  marginBottom: "10px",
                }}
              >
                <div
                  className="d-flex align-items-center"
                  style={{
                    gap: "8px",
                  }}
                >
                  <Label
                    style={{
                      marginBottom: 0,
                      fontWeight: "600",
                    }}
                  >
                    Upload Prescription — AI
                    Assisted
                  </Label>

                  <button
                    type="button"
                    onClick={() =>
                      setShowUploadHelp(
                        (
                          previousValue
                        ) =>
                          !previousValue
                      )
                    }
                    aria-label="Show prescription upload information"
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color: "#1e3a8a",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <FaInfoCircle
                      size={18}
                    />
                  </button>
                </div>

                <small
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Optional
                </small>
              </div>

              {showUploadHelp && (
                <Alert color="info">
                  Upload a PDF or a clear
                  photo of the prescription.
                  MediMind will use AI to
                  extract medication details.
                  Always review the extracted
                  information before saving.
                </Alert>
              )}

              <label
                htmlFor="prescriptionFile"
                style={{
                  width: "100%",
                  border:
                    "2px dashed #93a8d9",
                  borderRadius: "14px",
                  padding: "28px 20px",
                  textAlign: "center",
                  backgroundColor:
                    "#f8faff",
                  cursor: "pointer",
                  marginBottom: "16px",
                }}
              >
                <FaCloudUploadAlt
                  size={42}
                  color="#1e3a8a"
                  style={{
                    marginBottom: "10px",
                  }}
                />

                <div
                  style={{
                    color: "#1e3a8a",
                    fontWeight: "700",
                    fontSize: "17px",
                  }}
                >
                  Choose a prescription file
                </div>

                <div
                  style={{
                    color: "#6b7280",
                    marginTop: "5px",
                  }}
                >
                  PDF, JPG, JPEG or PNG —
                  maximum 5 MB
                </div>
              </label>

              <input
                id="prescriptionFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={
                  handleFileChange
                }
                style={{
                  display: "none",
                }}
              />

              {prescriptionFile && (
                <div
                  style={{
                    border:
                      "1px solid #c8d8ff",
                    backgroundColor:
                      "#eef4ff",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {prescriptionFile.type ===
                  "application/pdf" ? (
                    <FaFilePdf
                      size={25}
                      color="#dc3545"
                    />
                  ) : (
                    <FaImage
                      size={25}
                      color="#1e3a8a"
                    />
                  )}

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#1e3a8a",
                        overflow: "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {
                        prescriptionFile.name
                      }
                    </div>

                    <small
                      style={{
                        color: "#198754",
                      }}
                    >
                      Ready to upload
                    </small>
                  </div>
                </div>
              )}

              <Button
                color="primary"
                className="w-100"
                type="button"
                onClick={
                  saveMedication
                }
                disabled={isSaving}
                style={{
                  minHeight: "48px",
                  fontWeight: "600",
                  fontSize: "16px",
                }}
              >
                {isSaving
                  ? "Saving Medication..."
                  : "Save Medication"}
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Footer />
    </Container>
  );
};

export default Addmedication;