import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Alert,
  Input,
} from "reactstrap";

import {
  useSelector,
} from "react-redux";

import {
  jsPDF,
} from "jspdf";

import {
  autoTable,
} from "jspdf-autotable";

import {
  useSearchParams,
} from "react-router-dom";

import CaregiverHeader from "./CaregiverHeader";
import Footer from "./Footer";

const CaregiverReports = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );
  const isArabic = language === "ar";
  const [isDark, setIsDark] = useState(() => localStorage.getItem("medimind-theme") === "dark");
  useEffect(() => {
    const syncTheme = () => setIsDark(localStorage.getItem("medimind-theme") === "dark");
    ["medimind-theme-change", "medimindThemeChanged", "storage"].forEach((event) => window.addEventListener(event, syncTheme));
    return () => ["medimind-theme-change", "medimindThemeChanged", "storage"].forEach((event) => window.removeEventListener(event, syncTheme));
  }, []);

  useEffect(() => {
    const syncLanguage = () =>
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
    window.addEventListener("medimind-language-change", syncLanguage);
    window.addEventListener("medimindLanguageChanged", syncLanguage);
    window.addEventListener("storage", syncLanguage);
    return () => {
      window.removeEventListener("medimind-language-change", syncLanguage);
      window.removeEventListener("medimindLanguageChanged", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);


  const user = useSelector(
    (state) => state.user.user
  );

  const [
    searchParams,
  ] = useSearchParams();

  const patientFromURL =
    searchParams.get(
      "patient"
    );

  const [
    patients,
    setPatients,
  ] = useState([]);

  const [
    selectedPatientEmail,
    setSelectedPatientEmail,
  ] = useState("");

  const [
    selectedReport,
    setSelectedReport,
  ] = useState("daily");

  const [
    reportData,
    setReportData,
  ] = useState(null);

  const [
    loadingPatients,
    setLoadingPatients,
  ] = useState(true);

  const [
    reportLoading,
    setReportLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    showExportMenu,
    setShowExportMenu,
  ] = useState(false);

  useEffect(() => {
    const fetchPatients =
      async () => {
        if (!user?.email) {
          return;
        }

        try {
          setLoadingPatients(true);
          setError("");

         
const response = await axios.get(
  `http://localhost:3002/caregiver/my-patients/${encodeURIComponent(
    user.email
  )}`
);


          const linkedPatients =
            response.data?.patients || [];

          setPatients(
            linkedPatients
          );

          if (
            linkedPatients.length >
            0
          ) {
            const matchedPatient =
              linkedPatients.find(
                (patient) =>
                  patient.patientEmail ===
                  patientFromURL
              );

            setSelectedPatientEmail(
              matchedPatient
                ? matchedPatient.patientEmail
                : linkedPatients[0]
                    .patientEmail
            );
          }
        } catch (error) {
          console.error(
            "Caregiver report patient fetch error:",
            error
          );

          setError(
            error.response?.data
              ?.message ||
              (isArabic ? "تعذر تحميل المرضى المرتبطين." : "Unable to load linked patients.")
          );
        } finally {
          setLoadingPatients(
            false
          );
        }
      };

    fetchPatients();
  }, [
    user?.email,
    patientFromURL,
    isArabic,
  ]);

  useEffect(() => {
    const fetchReport =
      async () => {
        if (
          !user?.email ||
          !selectedPatientEmail
        ) {
          setReportData(null);
          return;
        }

        try {
          setReportLoading(true);
          setError("");
          setReportData(null);
          setShowExportMenu(false);

          let endpoint = "";

          if (
            selectedReport ===
            "daily"
          ) {
            endpoint =
              "patient-daily-report";
          } else if (
            selectedReport ===
            "weekly"
          ) {
            endpoint =
              "patient-weekly-report";
          } else {
            endpoint =
              "patient-monthly-report";
          }

          
const response = await axios.get(
  `http://localhost:3002/caregiver/${endpoint}/${encodeURIComponent(
    user.email
  )}/${encodeURIComponent(
    selectedPatientEmail
  )}`
);


          setReportData(
            response.data?.report ||
              null
          );
        } catch (error) {
          console.error(
            "Caregiver report fetch error:",
            error
          );

          setError(
            error.response?.data
              ?.message ||
              (isArabic ? "تعذر تحميل تقرير المريض." : "Unable to load patient report.")
          );
        } finally {
          setReportLoading(false);
        }
      };

    fetchReport();
  }, [
    user?.email,
    selectedPatientEmail,
    selectedReport,
    isArabic,
  ]);

  const selectedPatient =
    useMemo(() => {
      return patients.find(
        (patient) =>
          patient.patientEmail ===
          selectedPatientEmail
      );
    }, [
      patients,
      selectedPatientEmail,
    ]);

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(
        `${date}T00:00:00`
      );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      isArabic ? "ar-OM" : "en-US",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hour, minute] =
      time.split(":");

    let numericHour =
      Number(hour);

    const period =
      numericHour >= 12
        ? "PM"
        : "AM";

    numericHour =
      numericHour % 12 || 12;

    return isArabic
      ? `${numericHour}:${minute} ${period === "AM" ? "ص" : "م"}`
      : `${numericHour}:${minute} ${period}`;
  };

  const getReportTitle = () => {
    if (
      selectedReport === "daily"
    ) {
      return "Daily Report";
    }

    if (
      selectedReport === "weekly"
    ) {
      return "Weekly Report";
    }

    return "Monthly Report";
  };

  const getReportSubtitle = () => {
    if (
      selectedReport === "daily"
    ) {
      return "Medication adherence for today.";
    }

    if (
      selectedReport === "weekly"
    ) {
      return "Medication adherence during the last 7 days.";
    }

    return "Medication adherence during this month.";
  };

  const getPeriodLabel = () => {
    if (!reportData) {
      return "";
    }

    if (
      selectedReport === "daily"
    ) {
      return reportData.date || "";
    }

    if (
      selectedReport === "weekly"
    ) {
      if (
        reportData.startDate &&
        reportData.endDate
      ) {
        return `${formatDate(
          reportData.startDate
        )} — ${formatDate(
          reportData.endDate
        )}`;
      }

      return "";
    }

    return reportData.month || "";
  };

  const getStatusBadgeStyle = (
    status
  ) => {
    const baseStyle = {
      padding: "6px 11px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
    };

    if (status === "Taken") {
      return {
        ...baseStyle,
        backgroundColor: "#eaf7ef",
        color: "#198754",
      };
    }

    if (status === "Missed") {
      return {
        ...baseStyle,
        backgroundColor: "#fdecec",
        color: "#dc3545",
      };
    }

    if (status === "Skipped") {
      return {
        ...baseStyle,
        backgroundColor: "#fff5d8",
        color: "#8a6d1d",
      };
    }

    return {
      ...baseStyle,
      backgroundColor: "#e7eefb",
      color: "#1e3a8a",
    };
  };

  const getDayCompletedCount = (
    day
  ) => {
    return (
      (day.taken || 0) +
      (day.missed || 0) +
      (day.skipped || 0)
    );
  };

  const getDayStatusText = (
    day
  ) => {
    const total =
      day.total || 0;

    const completed =
      getDayCompletedCount(day);

    const upcoming =
      day.upcoming || 0;

    if (total === 0) {
      return {
        main:
          (isArabic ? "لا توجد جرعات مجدولة" : "No scheduled doses"),
        secondary: "",
      };
    }

    if (
      completed === 0 &&
      upcoming > 0
    ) {
      return {
        main: isArabic ? "قادمة" : "Upcoming",
        secondary:
          isArabic
            ? `${upcoming} جرعة قادمة`
            : `${upcoming} dose${upcoming === 1 ? "" : "s"} pending`,
      };
    }

    return {
      main:
        `${day.adherenceRate}%`,

      secondary:
        isArabic
          ? `${day.taken || 0} تم تناولها · ${day.missed || 0} فائتة${(day.skipped || 0) > 0 ? ` · ${day.skipped} تم تخطيها` : ""}`
          : `${day.taken || 0} taken · ${day.missed || 0} missed${(day.skipped || 0) > 0 ? ` · ${day.skipped} skipped` : ""}`,
    };
  };

  const getAdherenceDisplay =
    () => {
      if (!reportData) {
        return {
          value: "N/A",
          note:
            (isArabic ? "لا توجد بيانات تقرير متاحة." : "No report data available."),
        };
      }

      const completed =
        (reportData.taken || 0) +
        (reportData.missed || 0) +
        (reportData.skipped || 0);

      if (completed === 0) {
        return {
          value: "N/A",

          note:
            reportData.total === 0
              ? (isArabic ? "لم تُجدول جرعات دوائية لهذه الفترة." : "No medication doses were scheduled for this period.")
              : (isArabic ? "الجرعات المجدولة لم يحن موعدها بعد." : "The scheduled doses are still upcoming."),
        };
      }

      return {
        value:
          `${reportData.adherenceRate}%`,

        note:
          selectedReport ===
          "daily"
            ? (isArabic ? "الالتزام اليوم" : "Today's adherence")
            : selectedReport ===
              "weekly"
            ? (isArabic ? "الالتزام الأسبوعي" : "Weekly adherence")
            : (isArabic ? "الالتزام الشهري" : "Monthly adherence"),
      };
    };

  const handleExportPDF = () => {
    if (!reportData) {
      return;
    }

    const doc =
      new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const adherence =
      getAdherenceDisplay();

    const patientName =
      selectedPatient
        ?.patientName ||
      "Patient";

    const period =
      getPeriodLabel();

    doc.setFillColor(
      30,
      58,
      138
    );

    doc.rect(
      0,
      0,
      pageWidth,
      28,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFontSize(18);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "MediMind",
      14,
      12
    );

    doc.setFontSize(13);

    doc.text(
      `Caregiver ${getReportTitle()}`,
      14,
      21
    );

    doc.setTextColor(
      30,
      58,
      138
    );

    doc.setFontSize(11);

    doc.setFont(
      "helvetica",
      "normal"
    );

    let currentY = 38;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Patient:",
      14,
      currentY
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      patientName,
      35,
      currentY
    );

    currentY += 7;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Patient Email:",
      14,
      currentY
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      selectedPatientEmail ||
        "",
      42,
      currentY
    );

    currentY += 7;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Period:",
      14,
      currentY
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      period ||
        "Not available",
      35,
      currentY
    );

    currentY += 12;

    autoTable(
      doc,
      {
        startY:
          currentY,

        head: [
          [
            "Taken",
            "Missed",
            "Skipped",
            "Upcoming",
          ],
        ],

        body: [
          [
            String(
              reportData.taken ||
                0
            ),

            String(
              reportData.missed ||
                0
            ),

            String(
              reportData.skipped ||
                0
            ),

            String(
              reportData.upcoming ||
                0
            ),
          ],
        ],

        theme: "grid",

        headStyles: {
          fillColor: [
            197,
            216,
            240,
          ],

          textColor: [
            30,
            58,
            138,
          ],
        },

        styles: {
          halign:
            "center",
          cellPadding: 4,
        },
      }
    );

    currentY =
      doc.lastAutoTable?.finalY
        ? doc.lastAutoTable
            .finalY + 12
        : currentY + 30;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(14);

    doc.text(
      `Adherence: ${adherence.value}`,
      14,
      currentY
    );

    currentY += 7;

    doc.setFontSize(10);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setTextColor(
      90,
      100,
      115
    );

    const adherenceNote =
      doc.splitTextToSize(
        isArabic ? (selectedReport === "daily" ? "Today's adherence" : selectedReport === "weekly" ? "Weekly adherence" : "Monthly adherence") : adherence.note,
        180
      );

    doc.text(
      adherenceNote,
      14,
      currentY
    );

    currentY +=
      adherenceNote.length *
        5 +
      8;

    if (
      selectedReport !==
        "daily" &&
      reportData.dailyBreakdown
        ?.length > 0
    ) {
      doc.setTextColor(
        30,
        58,
        138
      );

      doc.setFontSize(12);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        selectedReport ===
          "weekly"
          ? "Daily Breakdown"
          : "Month Breakdown",
        14,
        currentY
      );

      currentY += 4;

      const rows =
        reportData.dailyBreakdown.map(
          (day) => {
            const status =
              getDayStatusText(
                day
              );

            return [
              selectedReport ===
              "weekly"
                ? day.dayName
                : `${day.dayNumber} ${day.dayName}`,

              formatDate(
                day.date
              ),

              status.main,

              status.secondary ||
                "-",
            ];
          }
        );

      autoTable(
        doc,
        {
          startY:
            currentY,

          head: [
            [
              "Day",
              "Date",
              "Adherence",
              "Details",
            ],
          ],

          body: rows,

          theme:
            "striped",

          headStyles: {
            fillColor: [
              220,
              233,
              248,
            ],

            textColor: [
              30,
              58,
              138,
            ],
          },

          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
        }
      );

      currentY =
        doc.lastAutoTable?.finalY
          ? doc.lastAutoTable
              .finalY + 10
          : currentY + 30;
    }

    const doseRows =
      (reportData.doses ||
        []).map((dose) => [
        dose.medicationName ||
          "",

        dose.dosage || "",

        selectedReport ===
        "daily"
          ? formatTime(
              dose.scheduledTime
            )
          : `${formatDate(
              dose.scheduledDate
            )} ${formatTime(
              dose.scheduledTime
            )}`,

        dose.status || "",
      ]);

    if (
      currentY > 260
    ) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(
      30,
      58,
      138
    );

    doc.setFontSize(12);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Medication Doses",
      14,
      currentY
    );

    currentY += 4;

    if (
      doseRows.length > 0
    ) {
      autoTable(
        doc,
        {
          startY:
            currentY,

          head: [
            [
              "Medication",
              "Dosage",
              selectedReport ===
              "daily"
                ? "Time"
                : "Date / Time",
              "Status",
            ],
          ],

          body:
            doseRows,

          theme:
            "striped",

          headStyles: {
            fillColor: [
              30,
              58,
              138,
            ],

            textColor: [
              255,
              255,
              255,
            ],
          },

          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
        }
      );
    }

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    doc.save(
      `MediMind-caregiver-${selectedReport}-report-${today}.pdf`
    );
  };

  const escapeCSVValue = (
    value
  ) => {
    const stringValue =
      String(
        value ?? ""
      );

    return `"${stringValue.replace(
      /"/g,
      '""'
    )}"`;
  };

  const handleExportCSV = () => {
    if (!reportData) {
      return;
    }

    const adherence =
      getAdherenceDisplay();

    const rows = [];

    rows.push([
      (isArabic ? "تقرير مقدم الرعاية من MediMind" : "MediMind Caregiver Report"),
    ]);

    rows.push([
      (isArabic ? "المريض" : "Patient"),
      selectedPatient
        ?.patientName ||
        (isArabic ? "المريض" : "Patient"),
    ]);

    rows.push([
      (isArabic ? "البريد الإلكتروني للمريض" : "Patient Email"),
      selectedPatientEmail,
    ]);

    rows.push([
      (isArabic ? "نوع التقرير" : "Report Type"),
      isArabic ? (selectedReport === "daily" ? "التقرير اليومي" : selectedReport === "weekly" ? "التقرير الأسبوعي" : "التقرير الشهري") : getReportTitle(),
    ]);

    rows.push([
      (isArabic ? "الفترة" : "Period"),
      getPeriodLabel(),
    ]);

    rows.push([]);

    rows.push([
      (isArabic ? "تم تناولها" : "Taken"),
      (isArabic ? "فائتة" : "Missed"),
      (isArabic ? "تم تخطيها" : "Skipped"),
      (isArabic ? "قادمة" : "Upcoming"),
      (isArabic ? "الالتزام" : "Adherence"),
    ]);

    rows.push([
      reportData.taken || 0,
      reportData.missed || 0,
      reportData.skipped || 0,
      reportData.upcoming || 0,
      adherence.value,
    ]);

    rows.push([]);

    if (
      selectedReport !==
        "daily" &&
      reportData.dailyBreakdown
        ?.length > 0
    ) {
      rows.push([
        (isArabic ? "التفصيل اليومي" : "Daily Breakdown"),
      ]);

      rows.push([
        (isArabic ? "اليوم" : "Day"),
        (isArabic ? "التاريخ" : "Date"),
        (isArabic ? "تم تناولها" : "Taken"),
        (isArabic ? "فائتة" : "Missed"),
        (isArabic ? "تم تخطيها" : "Skipped"),
        (isArabic ? "قادمة" : "Upcoming"),
        (isArabic ? "الالتزام" : "Adherence"),
      ]);

      reportData.dailyBreakdown.forEach(
        (day) => {
          const status =
            getDayStatusText(
              day
            );

          rows.push([
            selectedReport ===
            "weekly"
              ? (isArabic ? new Date(`${day.date}T00:00:00`).toLocaleDateString("ar-OM", { weekday: "long" }) : day.dayName)
              : `${day.dayNumber} ${isArabic ? new Date(`${day.date}T00:00:00`).toLocaleDateString("ar-OM", { weekday: "long" }) : day.dayName}`,

            day.date || "",

            day.taken || 0,

            day.missed || 0,

            day.skipped || 0,

            day.upcoming || 0,

            status.main,
          ]);
        }
      );

      rows.push([]);
    }

    rows.push([
      (isArabic ? "الجرعات الدوائية" : "Medication Doses"),
    ]);

    rows.push([
      (isArabic ? "الدواء" : "Medication"),
      (isArabic ? "الجرعة" : "Dosage"),
      (isArabic ? "التاريخ" : "Date"),
      (isArabic ? "الوقت" : "Time"),
      (isArabic ? "الحالة" : "Status"),
    ]);

    (reportData.doses ||
      []).forEach((dose) => {
      rows.push([
        dose.medicationName ||
          "",

        dose.dosage || "",

        selectedReport ===
        "daily"
          ? reportData.date ||
            ""
          : dose.scheduledDate ||
            "",

        formatTime(
          dose.scheduledTime
        ),

        isArabic ? (dose.status === "Taken" ? "تم تناولها" : dose.status === "Missed" ? "فائتة" : dose.status === "Skipped" ? "تم تخطيها" : dose.status === "Upcoming" ? "قادمة" : dose.status || "") : dose.status || "",
      ]);
    });

    const csvContent =
      rows
        .map((row) =>
          row
            .map(
              escapeCSVValue
            )
            .join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        [
          "\uFEFF",
          csvContent,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    link.href = url;

    link.download =
      `MediMind-caregiver-${selectedReport}-report-${today}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  const tabs = [
    {
      key: "daily",
      label: "Daily",
    },
    {
      key: "weekly",
      label: "Weekly",
    },
    {
      key: "monthly",
      label: "Monthly",
    },
  ];

  return (
    <Container
      fluid
      className={`dashboard-page mm-caregiver-reports ${isDark ? "mm-reports-dark" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
      style={{ minHeight: "100vh" }}
    >
      <style>{`
        .mm-caregiver-reports {
          background: #f7f9fc;
          min-width: 0;
          padding-left: 0 !important;
          padding-right: 0 !important;
          display: flex;
          flex-direction: column;
        }
        .mm-caregiver-reports .mm-caregiver-reports-body {
          flex: 1;
          min-width: 0;
        }
        .mm-caregiver-reports .mm-report-panel {
          min-width: 0;
        }
        .mm-caregiver-reports .mm-report-panel-content {
          padding: 30px;
        }
        .mm-caregiver-reports .mm-report-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .mm-caregiver-reports .mm-report-dose-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .mm-caregiver-reports .mm-report-dose-row > div {
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .mm-caregiver-reports .mm-report-dose-row > span {
          flex-shrink: 0;
        }
        .mm-caregiver-reports[dir="rtl"] .mm-report-export-menu {
          right: auto !important;
          left: 0;
        }
        .mm-caregiver-reports.mm-reports-dark {
          background: #101827;
          color: #e5e7eb;
        }
        .mm-caregiver-reports.mm-reports-dark .card {
          background: #1c2940;
          color: #e5e7eb;
          border-color: #334155 !important;
        }
        .mm-caregiver-reports.mm-reports-dark .text-muted {
          color: #cbd5e1 !important;
        }
        .mm-caregiver-reports.mm-reports-dark .mm-report-panel {
          background: #243957 !important;
        }
        .mm-caregiver-reports.mm-reports-dark .mm-report-tabs {
          background: #304a70 !important;
        }
        .mm-caregiver-reports.mm-reports-dark .mm-report-panel-content { background: #243957; }
        .mm-caregiver-reports.mm-reports-dark .mm-report-export-menu,
        .mm-caregiver-reports.mm-reports-dark .mm-report-export-menu button { background: #243957 !important; color: #e5e7eb; }
        .mm-caregiver-reports.mm-reports-dark .mm-report-tabs button { color: #e5e7eb !important; }
        .mm-caregiver-reports.mm-reports-dark h2,
        .mm-caregiver-reports.mm-reports-dark h4,
        .mm-caregiver-reports.mm-reports-dark h5,
        .mm-caregiver-reports.mm-reports-dark label { color: #b8d3ff !important; }
        .mm-caregiver-reports.mm-reports-dark select { background: #101827; color: #e5e7eb; border-color: #52627c; }
        @media (max-width: 600px) {
          .mm-caregiver-reports .mm-caregiver-reports-body {
            padding: 24px 12px !important;
          }
          .mm-caregiver-reports .mm-report-panel-content {
            padding: 16px;
          }
          .mm-caregiver-reports .mm-report-dose-row {
            flex-wrap: wrap;
          }
          .mm-caregiver-reports .mm-report-tabs button {
            padding: 12px 6px !important;
          }
        }
      `}</style>
      <CaregiverHeader />

      <Row className="py-5 px-3 mm-caregiver-reports-body">
        <Col
          lg="10"
          xl="9"
          className="mx-auto"
        >
          <div className="mb-4">
            <h2
              style={{
                color: "#1e3a8a",
                fontWeight: "700",
                marginBottom: "6px",
              }}
            >
              {isArabic ? "تقارير المرضى" : "Patient Reports"}
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginBottom: 0,
              }}
            >
              {isArabic
                ? "راجع تقارير الالتزام بالأدوية للمرضى المرتبطين بك."
                : "Review adherence reports for your linked patients."}
            </p>
          </div>

          {error && (
            <Alert color="danger">
              {error}
            </Alert>
          )}

          {loadingPatients ? (
            <Card>
              <CardBody className="text-center py-5">
                {isArabic ? "جارٍ تحميل المرضى المرتبطين..." : "Loading linked patients..."}
              </CardBody>
            </Card>
          ) : patients.length === 0 ? (
            <Card>
              <CardBody className="text-center py-5">
                {isArabic ? "لا يوجد مرضى مرتبطون بعد." : "No linked patients yet."}
              </CardBody>
            </Card>
          ) : (
            <>
              <Card
                className="mb-4"
                style={{
                  border: "none",
                  borderRadius: "18px",
                }}
              >
                <CardBody>
                  <label
                    style={{
                      color:
                        "#1e3a8a",
                      fontWeight:
                        "600",
                      marginBottom:
                        "7px",
                    }}
                  >
                    {isArabic ? "اختيار المريض" : "Select Patient"}
                  </label>

                  <Input
                    type="select"
                    value={
                      selectedPatientEmail
                    }
                    onChange={(event) =>
                      setSelectedPatientEmail(
                        event.target.value
                      )
                    }
                  >
                    {patients.map(
                      (patient) => (
                        <option
                          key={
                            patient._id ||
                            patient.patientEmail
                          }
                          value={
                            patient.patientEmail
                          }
                        >
                          {patient.patientName ||
                            patient.patientEmail}
                        </option>
                      )
                    )}
                  </Input>
                </CardBody>
              </Card>

              <div
                style={{
                  backgroundColor:
                    isDark ? "#243957" : "#dce9f8",
                  borderRadius:
                    "22px",
                  overflow:
                    "hidden",
                  boxShadow:
                    "0 12px 30px rgba(30, 58, 138, 0.10)",
                }}
              >
                <div
                  className="mm-report-tabs"
                  style={{
                    display:
                      "flex",
                    backgroundColor:
                      isDark ? "#304a70" : "#c5d8f0",
                  }}
                >
                  {tabs.map(
                    (tab) => {
                      const active =
                        selectedReport ===
                        tab.key;

                      return (
                        <button
                          key={
                            tab.key
                          }
                          onClick={() =>
                            setSelectedReport(
                              tab.key
                            )
                          }
                          style={{
                            flex: 1,
                            border:
                              "none",
                            padding:
                              "18px",
                            backgroundColor:
                              active
                                ? (isDark ? "#243957" : "#dce9f8")
                                : (isDark ? "#304a70" : "#c5d8f0"),
                            color:
                              "#1e3a8a",
                            fontWeight:
                              active
                                ? "700"
                                : "500",
                          }}
                        >
                          {
                            isArabic ? (tab.key === "daily" ? "يومي" : tab.key === "weekly" ? "أسبوعي" : "شهري") : tab.label
                          }
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="mm-report-panel-content">
                  <div className="mm-report-heading mb-4">
                    <div>
                      <h4
                        style={{
                          color:
                            "#1e3a8a",
                        }}
                      >
                        {isArabic
                          ? (selectedReport === "daily" ? "التقرير اليومي" : selectedReport === "weekly" ? "التقرير الأسبوعي" : "التقرير الشهري")
                          : getReportTitle()}
                      </h4>

                      <p className="text-muted mb-1">
                        {isArabic
                          ? (selectedReport === "daily" ? "الالتزام بالأدوية اليوم." : selectedReport === "weekly" ? "الالتزام بالأدوية خلال آخر 7 أيام." : "الالتزام بالأدوية خلال هذا الشهر.")
                          : getReportSubtitle()}
                      </p>

                      <small className="text-muted">
                        {getPeriodLabel()}
                      </small>
                    </div>

                    <div
                      style={{
                        position:
                          "relative",
                      }}
                    >
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          setShowExportMenu(
                            !showExportMenu
                          )
                        }
                        disabled={
                          reportLoading ||
                          !reportData
                        }
                      >
                        {isArabic ? "تصدير ▾" : "Export ▾"}
                      </button>

                      {showExportMenu && (
                        <div
                          className="mm-report-export-menu"
                          style={{
                            position:
                              "absolute",
                            right: 0,
                            top:
                              "44px",
                            background:
                              "white",
                            borderRadius:
                              "10px",
                            minWidth:
                              "150px",
                            boxShadow:
                              "0 8px 20px rgba(0,0,0,0.15)",
                            zIndex:
                              20,
                          }}
                        >
                          <button
                            onClick={() => {
                              handleExportPDF();
                              setShowExportMenu(
                                false
                              );
                            }}
                            style={{
                              width:
                                "100%",
                              border:
                                "none",
                              background:
                                "white",
                              padding:
                                "11px",
                              textAlign:
                                "left",
                            }}
                          >
                            {isArabic ? "تصدير PDF" : "Export PDF"}
                          </button>

                          <button
                            onClick={() => {
                              handleExportCSV();
                              setShowExportMenu(
                                false
                              );
                            }}
                            style={{
                              width:
                                "100%",
                              border:
                                "none",
                              background:
                                "white",
                              padding:
                                "11px",
                              textAlign:
                                "left",
                            }}
                          >
                            {isArabic ? "تصدير CSV" : "Export CSV"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {reportLoading ? (
                    <div className="text-center py-5">
                      {isArabic ? "جارٍ تحميل التقرير..." : "Loading report..."}
                    </div>
                  ) : reportData ? (
                    <>
                      <Row className="g-3 mb-4">
                        {[
                          [
                            "Taken",
                            reportData.taken,
                            "#198754",
                          ],
                          [
                            "Missed",
                            reportData.missed,
                            "#dc3545",
                          ],
                          [
                            "Skipped",
                            reportData.skipped,
                            "#8a6d1d",
                          ],
                          [
                            "Upcoming",
                            reportData.upcoming,
                            "#1e3a8a",
                          ],
                        ].map(
                          ([
                            label,
                            value,
                            color,
                          ]) => (
                            <Col
                              md="3"
                              sm="6"
                              key={
                                label
                              }
                            >
                              <Card
                                style={{
                                  border:
                                    "none",
                                  borderRadius:
                                    "16px",
                                }}
                              >
                                <CardBody className="text-center">
                                  <h3
                                    style={{
                                      color,
                                      fontWeight:
                                        "700",
                                    }}
                                  >
                                    {
                                      value
                                    }
                                  </h3>

                                  <span className="text-muted">
                                    {
                                      isArabic
                                        ? (label === "Taken" ? "تم تناولها" : label === "Missed" ? "فائتة" : label === "Skipped" ? "تم تخطيها" : "قادمة")
                                        : label
                                    }
                                  </span>
                                </CardBody>
                              </Card>
                            </Col>
                          )
                        )}
                      </Row>

                      <Card className="mb-4">
                        <CardBody className="text-center p-4">
                          <h2
                            style={{
                              color:
                                "#1e3a8a",
                            }}
                          >
                            {
                              getAdherenceDisplay()
                                .value
                            }
                          </h2>

                          <p className="text-muted mb-0">
                            {
                              getAdherenceDisplay()
                                .note
                            }
                          </p>
                        </CardBody>
                      </Card>

                      <Card>
                        <CardBody>
                          <h5
                            style={{
                              color:
                                "#1e3a8a",
                            }}
                          >
                            {isArabic ? "الجرعات الدوائية" : "Medication Doses"}
                          </h5>

                          {reportData
                            .doses
                            ?.length >
                          0 ? (
                            reportData.doses.map(
                              (
                                dose
                              ) => (
                                <div
                                  key={
                                    dose._id
                                  }
                                  className="mm-report-dose-row py-3 border-bottom"
                                >
                                  <div>
                                    <strong>
                                      {
                                        dose.medicationName
                                      }
                                    </strong>

                                    <div className="small text-muted">
                                      {
                                        dose.dosage
                                      }{" "}
                                      ·{" "}
                                      {formatTime(
                                        dose.scheduledTime
                                      )}
                                    </div>
                                  </div>

                                  <span
                                    style={getStatusBadgeStyle(
                                      dose.status
                                    )}
                                  >
                                    {isArabic
                                      ? (dose.status === "Taken" ? "تم تناولها" : dose.status === "Missed" ? "فائتة" : dose.status === "Skipped" ? "تم تخطيها" : dose.status === "Upcoming" ? "قادمة" : dose.status)
                                      : dose.status}
                                  </span>
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-muted mb-0">
                              {isArabic ? "لم يتم العثور على جرعات دوائية." : "No medication doses found."}
                            </p>
                          )}
                        </CardBody>
                      </Card>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </Col>
      </Row>
      <Footer />
    </Container>
  );
};

export default CaregiverReports;
