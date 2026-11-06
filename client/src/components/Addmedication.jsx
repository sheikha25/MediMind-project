import { useEffect, useState } from "react";
import axios from "axios";

import { Container, Row, Col, Card, CardBody, Button, FormGroup, Label, Input, Alert, } from "reactstrap";

import { useSelector } from "react-redux";

import { FaCloudUploadAlt, FaFilePdf, FaImage, FaInfoCircle, } from "react-icons/fa";

import Header from "./Header";
import Footer from "./Footer";
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

const getMedicationDisplayName = (medication) => {
  if (!medication) return "";

  const name = String(medication.name || "").trim();
  const strength = String(medication.strength || "").trim();

  if (!strength || strength.toLowerCase() === "unknown") {
    return name;
  }

  const normalizedStrength = strength
    .replace(/\s+/g, "")
    .toLowerCase();

  const strengthPattern = /(\d+(?:\.\d+)?\s*(?:mg|mcg|µg|μg|g|ml|iu|units?)(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:mg|mcg|µg|μg|g|ml|iu|units?))?)/gi;

  return (
    name
      .replace(strengthPattern, (match) =>
        match.replace(/\s+/g, "").toLowerCase() === normalizedStrength
          ? ""
          : match
      )
      .replace(/\s+/g, " ")
      .trim() || name
  );
};

const Addmedication = () => {

const [language, setLanguage] = useState(
  () => localStorage.getItem("medimindLanguage") || "en"
);

const isArabic = language === "ar";

const t = (english, arabic) =>
  isArabic ? arabic : english;

useEffect(() => {
  const handleLanguageChange = () => {
    setLanguage(
      localStorage.getItem("medimindLanguage") || "en"
    );
  };

  window.addEventListener(
    "medimind-language-change",
    handleLanguageChange
  );

  return () => {
    window.removeEventListener(
      "medimind-language-change",
      handleLanguageChange
    );
  };
}, []);


const translateDosageUnit = (unit) => {
  if (!isArabic) return unit;

  const units = {
    tablet: "قرص",
    tablets: "أقراص",
    capsule: "كبسولة",
    capsules: "كبسولات",
    mg: "ملغ",
    mcg: "ميكروغرام",
    IU: "وحدة دولية",
    ml: "مل",
    g: "غرام",
    units: "وحدات",
    application: "مرة استخدام",
    applications: "مرات استخدام",
    puff: "بخة",
    puffs: "بخات",
    drop: "قطرة",
    drops: "قطرات",
    patch: "لصقة",
    patches: "لصقات",
    suppository: "تحميلة",
    suppositories: "تحاميل",
  };

  return units[unit] || unit;
};


const translateWeekday = (day) => {
  if (!isArabic) return day;

  const days = {
    Sunday: "الأحد",
    Monday: "الاثنين",
    Tuesday: "الثلاثاء",
    Wednesday: "الأربعاء",
    Thursday: "الخميس",
    Friday: "الجمعة",
    Saturday: "السبت",
  };

  return days[day] || day;
};


const translateDoseLabel = (label) => {
  const translations = {
    "Morning Dose": "جرعة الصباح",
    "Afternoon Dose": "جرعة الظهر",
    "Evening Dose": "جرعة المساء",
    "Night Dose": "جرعة الليل",
  };

  if (!isArabic) return label;

  if (/^Dose \d+$/.test(label)) {
    return label.replace("Dose ", "الجرعة ");
  }

  return translations[label] || label;
};


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


const routineTimeOptions = [
  { id: "wake", label: t("Wake Up", "الاستيقاظ"), time: dailyRoutine?.wake },
  { id: "breakfast", label: t("Breakfast", "الإفطار"), time: dailyRoutine?.breakfast },
  { id: "lunch", label: t("Lunch", "الغداء"), time: dailyRoutine?.lunch },
  { id: "dinner", label: t("Dinner", "العشاء"), time: dailyRoutine?.dinner },
  { id: "sleep", label: t("Sleep", "النوم"), time: dailyRoutine?.sleep },
];


  const [medicationSearch, setMedicationSearch] = useState("");
  const [showMedicationSuggestions, setShowMedicationSuggestions] = useState(false);

  const [dosageAmount, setDosageAmount] =
    useState("");

  const [dosageUnit, setDosageUnit] =
    useState("mg");

  const [medicationForm, setMedicationForm] = useState("");

  const [selectedMedication, setSelectedMedication] = useState(null);
const [isManualEntry, setIsManualEntry] = useState(false);
  // Stores a possible duplicate medication warning
const [duplicateWarning, setDuplicateWarning] = useState(null);

const [duplicateConfirmed, setDuplicateConfirmed] = useState(false);
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

  const [reminderTimes, setReminderTimes] = useState([]);

  const [showRoutineTimeSelector, setShowRoutineTimeSelector] = useState(false);
const [selectedRoutineActivities, setSelectedRoutineActivities] = useState([]);

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
setIsManualEntry(false);
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
    setSelectedRoutineActivities([]);

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
    const supportedUnits = [
      "tablet", "tablets",
      "capsule", "capsules",
      "ml",
      "drop", "drops",
      "puff", "puffs",
      "patch", "patches",
      "suppository", "suppositories",
      "application", "applications",
      "units",
    ];

    if (!supportedUnits.includes(dosageUnit)) {
      return null;
    }

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

 const saveMedication = async (confirmDuplicate = false) => {
    if (!isManualEntry && !selectedMedication) {
  setMessage(
  t(
    "Please select a medication from the Oman database, or choose 'Other Medication — enter manually'.",
    "يرجى اختيار دواء من قاعدة بيانات الأدوية العُمانية، أو اختيار «دواء آخر — إدخال يدوي»."
  )
);
  setMessageType("danger");
  return;
}
  const finalFrequency =
      getFinalFrequency();

    if (frequency === "Other") {
      const interval = Number(customInterval);

      if (
        !Number.isSafeInteger(interval) ||
        interval < 1 ||
        !["Hours", "Days", "Weeks"].includes(customUnit)
      ) {
       setMessage(
  t(
    "Please enter a valid custom frequency.",
    "يرجى إدخال تكرار مخصص صحيح."
  )
);
        setMessageType("danger");
        return;
      }

      if (
        customUnit === "Hours" &&
        (interval > 24 || 24 % interval !== 0)
      ) {
       setMessage(
  t(
    "For hourly reminders, choose an interval that divides evenly into 24 hours.",
    "للتذكيرات المتكررة بالساعات، اختر فترة زمنية تقسم 24 ساعة دون باقٍ."
  )
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
  t(
    `Invalid medication form. The selected medication is listed as ${recognizedForm} in the medication database.`,
    `الشكل الدوائي غير صحيح. الدواء المحدد مُسجل في قاعدة البيانات بالشكل التالي: ${recognizedForm}.`
  )
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
      setMessage(
  t(
    "Please select a valid medication form.",
    "يرجى اختيار شكل دوائي صحيح."
  )
);
      setMessageType("danger");
      return;
    }

    if (
      !medicationDosageUnits[medicationForm].includes(dosageUnit)
    ) {
      setMessage(
  t(
    "Please select a dosage unit appropriate for the medication form.",
    "يرجى اختيار وحدة جرعة مناسبة للشكل الدوائي."
  )
);
      setMessageType("danger");
      return;
    }

    if (!user?.email) {
      setMessage(
  t(
    "Please log in before adding a medication.",
    "يرجى تسجيل الدخول قبل إضافة دواء."
  )
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
  t(
    "Please complete all required medication fields.",
    "يرجى تعبئة جميع حقول الدواء المطلوبة."
  )
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
  t(
    "Please enter a valid timing offset.",
    "يرجى إدخال مدة زمنية صحيحة."
  )
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
  t(
    "Please enter how long before or after the meal this medication should be taken.",
    "يرجى تحديد المدة التي يجب تناول الدواء قبل الوجبة أو بعدها."
  )
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
  t(
    "Please enter a valid dosage amount.",
    "يرجى إدخال كمية جرعة صحيحة."
  )
);

      setMessageType("danger");
      return;
    }



    if (
      frequency === "Weekly" &&
      (!Array.isArray(weeklyDay) || weeklyDay.length === 0)
    ) {
      setMessage(
  t(
    "Please select at least one day for weekly medication.",
    "يرجى اختيار يوم واحد على الأقل للدواء الأسبوعي."
  )
);
      setMessageType("danger");
      return;
    }

    if (!startDate) {
     setMessage(
  t(
    "Please select the medication start date.",
    "يرجى اختيار تاريخ بدء الدواء."
  )
);
      setMessageType("danger");
      return;
    }

    if (startDate < today) {
      setMessage(
  t(
    "Medication start date cannot be in the past.",
    "لا يمكن أن يكون تاريخ بدء الدواء في الماضي."
  )
);

      setMessageType("danger");
      return;
    }

    if (!endDate) {
     setMessage(
  t(
    "Please select the medication end date.",
    "يرجى اختيار تاريخ انتهاء الدواء."
  )
);
      setMessageType("danger");
      return;
    }

    if (endDate < startDate) {
     setMessage(
  t(
    "Medication end date cannot be earlier than start date.",
    "لا يمكن أن يكون تاريخ انتهاء الدواء قبل تاريخ البدء."
  )
);
      setMessageType("danger");
      return;
    }

    if (
      frequency !== "As needed" &&
      reminderTimes.length === 0
    ) {
      setMessage(
  t(
    "Please select at least one reminder time.",
    "يرجى اختيار وقت تذكير واحد على الأقل."
  )
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
  t(
    "Please select all required reminder times.",
    "يرجى تحديد جميع أوقات التذكير المطلوبة."
  )
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
  t(
    "Please select a different time for each dose.",
    "يرجى اختيار وقت مختلف لكل جرعة."
  )
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

// Reference the selected medication in the Oman database.
// Manual entries have no catalog ID.
formData.append(
  "medicationCatalogId",
  selectedMedication?.id || ""
);

formData.append(
  "confirmSimilarMedication",
  String(confirmDuplicate)
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
  t(
    "Medication saved successfully.",
    "تم حفظ الدواء بنجاح."
  )
);

        setMessageType("success");

        clearForm();
      } else {
        setMessage(
  response.data?.message ||
  t(
    "The medication could not be saved.",
    "تعذر حفظ الدواء."
  )
);

        setMessageType("danger");
      }
    } catch (error) {
      const warningData = error.response?.data;

if (
  error.response?.status === 409 &&
  warningData?.requiresConfirmation === true
) {
  setDuplicateConfirmed(false);
setDuplicateWarning(warningData);
  return;
}
      console.error(
        "Medication save error:",
        error
      );

     setMessage(
  error.response?.data?.message ||
  t(
    "An error occurred while saving the medication.",
    "حدث خطأ أثناء حفظ الدواء."
  )
);

      setMessageType("danger");
    } finally {
      setIsSaving(false);
    }
  };

  return (
  <Container
  fluid
  className="dashboard-page add-medication-page"
  dir={isArabic ? "rtl" : "ltr"}
>
    {duplicateWarning && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: "20px",
    }}
  >
    <div className="duplicate-medication-dialog"
dir={isArabic ? "rtl" : "ltr"}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="duplicate-warning-title"
      style={{
        borderRadius: "16px",
        padding: "24px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
      }}
    >
     
<h3 id="duplicate-warning-title">
  {duplicateWarning.warningType === "MULTIPLE_WARNINGS"
    ? t(
        "Multiple Medication Safety Warnings",
        "تحذيرات متعددة تتعلق بسلامة الدواء"
      )
    : duplicateWarning.warningType === "SIMILAR_NAME"
      ? t(
          "Similar Medication Name",
          "تشابه في اسم الدواء"
        )
      : t(
          "Possible Duplicate Medication",
          "احتمال تكرار الدواء"
        )}
</h3>



      
<div className="duplicate-medication-comparison">
  <p>
    <strong>{t("Adding:", "الدواء الجديد:")}</strong>{" "}
    

{selectedMedication
  ? getMedicationDisplayName(selectedMedication)
  : medicationSearch}


  </p>
</div>


      {duplicateWarning.matches?.map((match, index) => (
        <div
          key={index}
          style={{
             backgroundColor: "#FFF3DC",
  color: "#253047",
  padding: "12px",
  borderRadius: "8px",
          }}
        >
        
<p style={{ marginBottom: "6px", color: "#253047" }}>
  <strong>{t("Existing:", "الدواء المسجل:")}</strong>{" "}
  <span style={{ color: "#253047" }}>
    {match.medicationName}
  </span>
</p>


          {match.sharedIngredients?.length > 0 ? (
  <p style={{ marginBottom: 0 , color: "#253047"}}>
    {t("Shared ingredients:", "المواد الفعالة المشتركة:")}{" "}

<span style={{ color: "#253047" }}>
  {match.sharedIngredients.join(", ")}
</span>

  </p>
) : (
  <p style={{ marginBottom: 0 }}>
    {t(
  "Possible similar medication name. Please verify that you selected the correct medication.",
  "قد يكون اسم هذا الدواء مشابهًا لاسم دواء آخر. يرجى التأكد من اختيار الدواء الصحيح."
)}
  </p>
)}
        </div>
      ))}

    


<p style={{ color: "#FFFFFF", lineHeight: "1.7" }}>
  {duplicateWarning.warningType === "MULTIPLE_WARNINGS"
    ? t(
        "This medication may share an active ingredient with an existing medication and has a similar name. Please review both warnings before continuing.",
        "قد يحتوي هذا الدواء على مادة فعالة مشتركة مع دواء مسجل مسبقًا، كما أن اسمه مشابه له. يُرجى مراجعة التحذيرين قبل المتابعة."
      )
    : duplicateWarning.warningType === "DUPLICATE_INGREDIENT"
      ? t(
          "This medication may contain an active ingredient already present in your medication list. Please review before continuing.",
          "قد يحتوي هذا الدواء على مادة فعالة موجودة بالفعل في قائمة أدويتك. يُرجى مراجعة التحذير قبل المتابعة."
        )
      : duplicateWarning.warningType === "SIMILAR_NAME"
        ? t(
            "This medication has a name similar to an existing medication. Please verify that you selected the correct medication.",
            "اسم هذا الدواء مشابه لاسم دواء مسجل مسبقًا. يُرجى التأكد من اختيار الدواء الصحيح."
          )
        : duplicateWarning.message}
</p>

<label style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
  <input
    type="checkbox"
    checked={duplicateConfirmed}
    onChange={(e) => setDuplicateConfirmed(e.target.checked)}
  />
  {t(
  "I confirm that I have checked this medication with my doctor or pharmacist.",
  "أؤكد أنني راجعت هذا الدواء مع الطبيب أو الصيدلي."
)}
</label>
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <button
          type="button"
          onClick={() => {
  setDuplicateWarning(null);
  setDuplicateConfirmed(false);
}}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #cccccc",
            backgroundColor: "#ffffff",
            color: "#222222",
            cursor: "pointer",
          }}
        >
          {t("Cancel", "إلغاء")}
        </button>

        <button
  type="button"
  disabled={isSaving || !duplicateConfirmed}
  onClick={() => {
    setDuplicateWarning(null);
    setDuplicateConfirmed(false);
    saveMedication(true);
  }}
  style={{
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor:
      duplicateConfirmed ? "#1e3a8a" : "#a9b9c9",
    color: "#ffffff",
    cursor:
      isSaving || !duplicateConfirmed
        ? "not-allowed"
        : "pointer",
  }}
>
 {t("Confirm and Add", "تأكيد وإضافة")}
</button>
      </div>
    </div>
  </div>
)}
    
      <Header />

      <Row className="py-5 px-3 justify-content-center">
        <Col lg="8" xl="7">
         
<div className="mb-4">
  <h2 className="add-medication-title">
    {t("Add New Medication", "إضافة دواء جديد")}
  </h2>

  <p className="add-medication-description">
    {t(
      "Enter the medication details manually or upload a prescription for AI-assisted entry.",
      "أدخل تفاصيل الدواء يدويًا أو ارفع الوصفة الطبية للمساعدة في إدخال البيانات باستخدام الذكاء الاصطناعي."
    )}
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
  {t("Medication Name", "اسم الدواء")}{" "}
  <span style={{ color: "#dc3545" }}>*</span>
</Label>

                <Input
                  id="medicationName"
                  type="text"
                  placeholder={t(
  "Type medication name...",
  "اكتب اسم الدواء بالإنجليزية..."
)}
                  autoComplete="off"
                  value={
                    selectedMedication
                      ? getMedicationDisplayName(selectedMedication)
                      : medicationSearch
                  }
                  onChange={(event) => {
                    const value = event.target.value;


                    setMedicationSearch(value);
setSelectedMedication(null);
setIsManualEntry(false);

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
setIsManualEntry(false);

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
                            {getMedicationDisplayName(medication)}
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
                               {t("Active Ingredient:", "المادة الفعالة:")}{" "}
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
  ? `${t("Strength:", "التركيز:")} ${medication.strength}`
  : t("Strength not listed", "التركيز غير مذكور")}

                           {medication.form &&
  medication.form !== "Unknown" &&
  ` | ${t("Form:", "الشكل الدوائي:")} ${medication.form}`}
                          </small>
                        </div>
                      ))}

                      {matches.length === 0 && (
                        <div style={{ padding: "10px 12px", color: "#6c757d" }}>
                         {t(
  "No matching medication found.",
  "لم يتم العثور على دواء مطابق."
)}
                        </div>
                      )}

                      <div
                       onClick={() => {
  setIsManualEntry(true);
  setSelectedMedication(null);
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
                       {t(
  "Other Medication — enter manually",
  "دواء آخر — إدخال يدوي"
)}
                      </div>
                    </div>
                  );
                })()}

              </FormGroup>

              <FormGroup>
                <Label for="medicationForm">
  {t("Medication Form", "الشكل الدوائي")}{" "}
  <span className="text-danger">*</span>
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
                  
<option value="">
  {t("Select medication form", "اختر الشكل الدوائي")}
</option>
<option value="Tablet">{t("Tablet", "أقراص")}</option>
<option value="Capsule">{t("Capsule", "كبسولات")}</option>
<option value="Injection">{t("Injection", "حقن")}</option>
<option value="Cream/Ointment">
  {t("Cream / Ointment", "كريم / مرهم")}
</option>
<option value="Inhaler">{t("Inhaler", "بخاخ")}</option>
<option value="Eye Drops">{t("Eye Drops", "قطرة عين")}</option>
<option value="Ear Drops">{t("Ear Drops", "قطرة أذن")}</option>
<option value="Liquid/Syrup">
  {t("Liquid / Syrup", "سائل / شراب")}
</option>
<option value="Patch">{t("Patch", "لصقة طبية")}</option>
<option value="Suppository">
  {t("Suppository", "تحاميل")}
</option>
<option value="Other">{t("Other", "أخرى")}</option>

                </Input>
              </FormGroup>

              {medicationForm === "Cream/Ointment" && (
                <FormGroup>
                  <Label for="topicalDosage">
  {t("Application Instructions", "تعليمات الاستخدام")}
</Label>

                  <Input
                    id="topicalDosage"
                    type="text"
                   placeholder={t(
  "e.g. Apply a thin layer to the affected area",
  "مثال: ضع طبقة رقيقة على المنطقة المصابة"
)}
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
                 {t("Dosage", "الجرعة")}{" "}
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
                      placeholder={t("For example, 500", "مثال: 500")}
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
  {translateDosageUnit(unit)}
</option>
                        )
                      )}
                    </Input>
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Label for="frequency">
                 {t("Frequency", "التكرار")}{" "}
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
                    setSelectedRoutineActivities([]);

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
  {t("Select frequency", "اختر التكرار")}
</option>

<option value="Once daily">
  {t("Once daily", "مرة واحدة يوميًا")}
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

<option value="Other">
  {t("Other", "أخرى")}
</option>

                </Input>
              </FormGroup>
              {frequency === "Weekly" && (

                <FormGroup>
                  <Label>
                   {t("Days of the Week", "أيام الأسبوع")}{" "}
<span className="text-danger">*</span>
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
                        <span>{translateWeekday(day)}</span>
                      </label>

                    ))}
                  </div>
                </FormGroup>
              )}
              {frequency === "Other" && (
                <>
                  <FormGroup>
                    <Label for="customInterval">
                     {t("Repeat Every", "التكرار كل")}{" "}
<span className="text-danger">*</span>
                    </Label>

                    <Input
                      id="customInterval"
                      type="number"
                      min="1"
                      step="1"
                      placeholder={t("Enter a number", "أدخل رقمًا")}
                      value={customInterval}
                      onChange={(event) => {
                        setCustomInterval(event.target.value);
                        setMessage("");
                      }}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="customUnit">
                     {t("Time Unit", "وحدة الوقت")}{" "}
<span className="text-danger">*</span>
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
                      <option value="Hours">{t("Hours", "ساعات")}</option>
<option value="Days">{t("Days", "أيام")}</option>
<option value="Weeks">{t("Weeks", "أسابيع")}</option>
                    </Input>
                  </FormGroup>
                </>
              )}

              <FormGroup>
                <Label for="timing">
                  {t("Timing", "وقت التناول")}{" "}
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

                   setTiming(selectedTiming);
setSelectedRoutineActivities([]);
setReminderTimes((currentTimes) =>
  currentTimes.map(() => "")
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
                 
<option value="Before Meal">
  {t("Before Meals (Multiple Doses)", "قبل الوجبات (جرعات متعددة)")}
</option>
<option value="With Meal">
  {t("With Meals (Multiple Doses)", "مع الوجبات (جرعات متعددة)")}
</option>
<option value="After Meal">
  {t("After Meals (Multiple Doses)", "بعد الوجبات (جرعات متعددة)")}
</option>

<option value="Before Breakfast">
  {t("Before Breakfast", "قبل الإفطار")}
</option>
<option value="With Breakfast">
  {t("With Breakfast", "مع الإفطار")}
</option>
<option value="After Breakfast">
  {t("After Breakfast", "بعد الإفطار")}
</option>

<option value="Before Lunch">
  {t("Before Lunch", "قبل الغداء")}
</option>
<option value="With Lunch">
  {t("With Lunch", "مع الغداء")}
</option>
<option value="After Lunch">
  {t("After Lunch", "بعد الغداء")}
</option>

<option value="Before Dinner">
  {t("Before Dinner", "قبل العشاء")}
</option>
<option value="With Dinner">
  {t("With Dinner", "مع العشاء")}
</option>
<option value="After Dinner">
  {t("After Dinner", "بعد العشاء")}
</option>

<option value="Morning">
  {t("Morning", "الصباح")}
</option>
<option value="At Wake Time">
  {t("At Wake Time", "عند الاستيقاظ")}
</option>
<option value="Afternoon">
  {t("Afternoon", "بعد الظهر")}
</option>
<option value="Evening">
  {t("Evening", "المساء")}
</option>
<option value="Before Sleep">
  {t("Before Sleep", "قبل النوم")}
</option>
<option value="Any Time">
  {t("Any Time", "في أي وقت")}
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
  {timing.startsWith("After ")
    ? t("How long after the meal?", "بعد كم من الوقت من الوجبة؟")
    : t("How long before the meal?", "قبل كم من الوقت من الوجبة؟")}{" "}
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
                              placeholder={t("Hours", "الساعات")}
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
                             placeholder={t("Minutes", "الدقائق")}
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
  {t(
    "Enter the timing given in the medication instructions or by your healthcare provider.",
    "أدخل الوقت المحدد في تعليمات الدواء أو من قِبل مقدم الرعاية الصحية."
  )}
</small>
                      </FormGroup>
                    )}
                  </>
                )}

              <FormGroup>
                <Label for="startDate">
                  {t("Medication Start Date", "تاريخ بدء الدواء")}{" "}
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
                 {t("Medication End Date", "تاريخ انتهاء الدواء")}{" "}
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
  {reminderTimes.length > 1
    ? t("Reminder Times", "أوقات التذكير")
    : t("Reminder Time", "وقت التذكير")}{" "}
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
                     {t(
  "Choose the time for each scheduled dose.",
  "اختر وقت كل جرعة مجدولة."
)}
                    </p>

                    {timing !== "Any Time" && (
  <div className="mb-3">
    <Button
                          type="button"
                          color="primary"
                          outline
                          size="sm"
                          onClick={() => {
  if (!dailyRoutine) {
    setMessage(
  t(
    "Please set up your Daily Routine in Settings first.",
    "يرجى إعداد روتينك اليومي في الإعدادات أولًا."
  )
);
    setMessageType("warning");
    return;
  }

  const suggestedTimes = getSuggestedReminderTimes();

  if (
    suggestedTimes.length === 0 ||
    suggestedTimes.length !== reminderTimes.length
  ) {
    setMessage(
  t(
    "No suitable Daily Routine times are available for this frequency and timing. You can enter reminder times manually.",
    "لا توجد أوقات مناسبة في روتينك اليومي لهذا التكرار ووقت التناول. يمكنك إدخال أوقات التذكير يدويًا."
  )
    );
    setMessageType("warning");
    return;
  }

  setReminderTimes(suggestedTimes);
  setMessage("");
}}
                        >
                          {t(
  "Use Daily Routine Times",
  "استخدام أوقات الروتين اليومي"
)}
                        </Button>

                        <small className="d-block text-muted mt-2">
                          {t(
  "Suggestions are based on your saved Daily Routine. You can adjust the reminder times before saving.",
  "تعتمد الاقتراحات على روتينك اليومي المحفوظ. يمكنك تعديل أوقات التذكير قبل الحفظ."
)}
                        </small>
                      </div>

                    )}

{timing === "Any Time" &&
  ["Once daily", "Twice daily", "Three times daily", "Weekly"].includes(frequency) &&
  reminderTimes.length > 0 && (
  <div className="mb-3">
    <Label className="fw-semibold">
      {t(
  "Choose from Your Daily Routine (Optional)",
  "اختر من روتينك اليومي (اختياري)"
)}
    </Label>

    <div className="d-flex flex-wrap gap-2">
      {routineTimeOptions.map((option) => {
        const isSelected = selectedRoutineActivities.includes(option.id);

        return (
          <Button
            key={option.id}
            type="button"
            size="sm"
            color={isSelected ? "primary" : "secondary"}
            outline={!isSelected}
            disabled={!option.time}
            onClick={() => {
              const nextSelected = isSelected
                ? selectedRoutineActivities.filter(
                    (id) => id !== option.id
                  )
                : selectedRoutineActivities.length < reminderTimes.length
                ? [...selectedRoutineActivities, option.id]
                : selectedRoutineActivities;

              setSelectedRoutineActivities(nextSelected);

             const times = routineTimeOptions
  .filter((item) => nextSelected.includes(item.id))
  .map((item) => item.time)
  .sort();

setReminderTimes(
  Array.from(
    { length: reminderTimes.length },
    (_, index) => times[index] || ""
  )
);
            }}
          >
            {option.label} ({option.time || t("Not set", "غير محدد")})
          </Button>
        );
      })}
    </div>
    <small className="text-muted d-block mt-2">
      {t("Select up to", "اختر حتى")} {reminderTimes.length}{" "}
{t(
  "routine time(s), or enter your reminder times manually.",
  "من أوقات الروتين اليومي، أو أدخل أوقات التذكير يدويًا."
)}
    </small>
  </div>
)}
                    <Row>
                      {reminderTimes.map((time,index) => (
                          <Col
                            md="6"
                            key={index}
                            className="mb-3"
                          >
                            <Label>
  {(() => {
    const label = getDoseLabel(time, index);

   if (!time) return translateDoseLabel(label);

    const matchingTimes = reminderTimes.filter(
      (reminderTime, reminderIndex) =>
        reminderTime &&
        getDoseLabel(reminderTime, reminderIndex) === label
    );

    if (matchingTimes.length <= 1) {
  return translateDoseLabel(label);
}

    const position = reminderTimes
      .slice(0, index + 1)
      .filter(
        (reminderTime, reminderIndex) =>
          reminderTime &&
          getDoseLabel(reminderTime, reminderIndex) === label
      ).length;

   return `${translateDoseLabel(label)} ${position}`;
  })()}
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
  <strong>
    {t(
      "Estimated Total Quantity Required:",
      "إجمالي الكمية المطلوبة المتوقعة:"
    )}
  </strong>{" "}
  {totalUnitsNeeded}{" "}
  {isArabic
    ? ({
        tablet: "قرص",
        tablets: "أقراص",
        capsule: "كبسولة",
        capsules: "كبسولات",
        ml: "مل",
        mg: "ملغ",
        mcg: "ميكروغرام",
        g: "غرام",
        drop: "قطرة",
        drops: "قطرات",
        puff: "بخة",
        puffs: "بخات",
        patch: "لصقة",
        patches: "لصقات",
        unit: "وحدة",
        units: "وحدات",
        application: "استخدام",
        applications: "استخدامات",
        suppository: "تحميلة",
        suppositories: "تحاميل",
      }[String(dosageUnit || "").toLowerCase()] || dosageUnit)
    : dosageUnit}

  <div className="small mt-1">
    {t(
      "Calculated from the selected dose, frequency, and treatment dates (including both dates)",
      "تم حسابها بناءً على الجرعة المحددة، وتكرار تناول الدواء، وتواريخ العلاج (بما في ذلك تاريخ البداية والنهاية)"
    )}
  </div>
</Alert>

              )}

              <FormGroup>
                <Label for="instructions">
                  {t("Additional Instructions", "تعليمات إضافية")}
                </Label>

                <Input
                  id="instructions"
                  type="textarea"
                  rows="4"
                 placeholder={t(
  "Enter any additional instructions...",
  "أدخل أي تعليمات إضافية حول استخدام الدواء..."
)}
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
                    {t(
  "Upload Prescription - AI Assisted ",
  "رفع الوصفة الطبية بمساعدة الذكاء الاصطناعي"
)}
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
                  {t("Optional","اختياري")}
                </small>
              </div>

              {showUploadHelp && (
                <Alert color="info">
                 {t(
      "Upload a PDF or a clear photo of the prescription. MediMind will use AI to extract medication details. Always review the extracted information before saving.",
      "ارفع ملف PDF أو صورة واضحة للوصفة الطبية. سيستخدم MediMind الذكاء الاصطناعي لاستخراج تفاصيل الأدوية. تأكد دائمًا من مراجعة المعلومات المستخرجة قبل الحفظ."
    )}
                </Alert>
              )}

              <label  className="prescription-upload-box"
                htmlFor="prescriptionFile"
                style={{
                  width: "100%",
                  borderRadius: "14px",
                  padding: "28px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  marginBottom: "16px",
                }}
              >
                <FaCloudUploadAlt
                  size={42}
                  style={{
                    marginBottom: "10px",
                  }}
                />

                <div className="prescription-upload-title"
                  style={{
                    fontWeight: "700",
                    fontSize: "17px",
                  }}
                >
                  {t(
  "Choose a prescription file",
  "اختر ملف الوصفة الطبية"
)}
                </div>

                <div className="prescription-upload-hint"
                  style={{
                    marginTop: "5px",
                  }}
                >
                  {t(
  "PDF, JPG, JPEG or PNG — maximum 5 MB",
  "PDF أو JPG أو JPEG أو PNG — الحد الأقصى 5 ميجابايت"
)}
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
                <div className="prescription-selected-file"
                  style={{
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
                    <div className="prescription-file-name"
                      style={{
                        fontWeight: "600",
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
                     {t("Ready to upload", "جاهز للرفع")}
                    </small>
                  </div>
                </div>
              )}

              <Button
                color="primary"
                className="w-100"
                type="button"
                onClick={() => {saveMedication(false);}}
                disabled={isSaving}
                style={{
                  minHeight: "48px",
                  fontWeight: "600",
                  fontSize: "16px",
                }}
              >
               {isSaving
  ? t("Saving Medication...", "جارٍ حفظ الدواء...")
  : t("Save Medication", "حفظ الدواء")}
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
