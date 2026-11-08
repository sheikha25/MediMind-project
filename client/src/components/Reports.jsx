import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Container,
  Row,
  Col,
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

import Header from "./Header";
import Footer from "./Footer";

const Reports = () => {

  
const [language, setLanguage] = useState(
  () => localStorage.getItem("medimindLanguage") || "en"
);

const isArabic = language === "ar";

const t = (english, arabic) =>
  isArabic ? arabic : english;

useEffect(() => {
  const handleLanguageChange = () => {
    setLanguage(localStorage.getItem("medimindLanguage") || "en");
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

  const user = useSelector(
    (state) => state.user.user
  );

  const [
    selectedReport,
    setSelectedReport,
  ] = useState("daily");

  const [
    reportData,
    setReportData,
  ] = useState(null);

  const [
    reportLoading,
    setReportLoading,
  ] = useState(true);

  const [
    reportError,
    setReportError,
  ] = useState("");

  const [
    showExportMenu,
    setShowExportMenu,
  ] = useState(false);

  useEffect(() => {
    const fetchReport =
      async () => {
        if (!user?.email) {
          return;
        }

        try {
          setReportLoading(true);
          setReportError("");
          setReportData(null);
          setShowExportMenu(false);

          let endpoint = "";

          if (
            selectedReport === "daily"
          ) {
            endpoint =
              "daily-report";
          } else if (
            selectedReport === "weekly"
          ) {
            endpoint =
              "weekly-report";
          } else {
            endpoint =
              "monthly-report";
          }

          const response =
            await axios.get(
              `http://localhost:3002/patient/${endpoint}/${encodeURIComponent(
                user.email
              )}`
            );

            
console.log(
  "MONTHLY API DATE CHECK:",
  response.data?.report?.dailyBreakdown?.slice(0, 3)
);

          setReportData(
            response.data?.report ||
              null
          );
        } catch (error) {
          console.error(
            "Report fetch error:",
            error
          );

          setReportError(
            error.response?.data
              ?.message ||
              "Unable to load the report."
          );
        } finally {
          setReportLoading(false);
        }
      };

    fetchReport();
  }, [
    user?.email,
    selectedReport,
  ]);


const getReportTitle = () => {
  if (selectedReport === "daily") {
    return t("Daily Report", "التقرير اليومي");
  }

  if (selectedReport === "weekly") {
    return t("Weekly Report", "التقرير الأسبوعي");
  }

  return t("Monthly Report", "التقرير الشهري");
};


 
const getReportSubtitle = () => {
  if (selectedReport === "daily") {
    return t(
      "Medication adherence for today.",
      "مدى الالتزام بتناول الأدوية اليوم."
    );
  }

  if (selectedReport === "weekly") {
    return t(
      "Medication adherence during the last 7 days.",
      "مدى الالتزام بتناول الأدوية خلال آخر 7 أيام."
    );
  }

  return t(
    "Medication adherence during this month.",
    "مدى الالتزام بتناول الأدوية خلال هذا الشهر."
  );
};


  
const formatDate = (date, locale = "en-US") => {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return date;

  return new Date(
    Date.UTC(year, month - 1, day)
  ).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
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

  const getMedicationSummary = (doses = []) => {
    const grouped = {};

    doses.forEach((dose) => {
      const key = `${dose.medicationName || "Medication"}__${dose.dosage || ""}`;

      if (!grouped[key]) {
        grouped[key] = {
          medicationName: dose.medicationName || "Medication",
          dosage: dose.dosage || "",
          Taken: 0,
          Missed: 0,
          Skipped: 0,
          Upcoming: 0,
          total: 0,
        };
      }

      grouped[key].total += 1;

      if (
        ["Taken", "Missed", "Skipped", "Upcoming"].includes(
          dose.status
        )
      ) {
        grouped[key][dose.status] += 1;
      }
    });

    return Object.values(grouped);
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

  
const formatDoseDetails = (dose) => {
  const dosage = String(dose.dosage || "");

  if (!isArabic) {
    return `${dosage} · ${formatTime(dose.scheduledTime)}`;
  }

  const arabicDosage = dosage
    .replace(/\btablets\b/gi, "أقراص")
    .replace(/\btablet\b/gi, "قرص")
    .replace(/\bcapsules\b/gi, "كبسولات")
    .replace(/\bcapsule\b/gi, "كبسولة")
    .replace(/\bmg\b/gi, "ملغ")
    .replace(/\bml\b/gi, "مل");

  const arabicTime = formatTime(dose.scheduledTime)
    .replace(/\bAM\b/gi, "ص")
    .replace(/\bPM\b/gi, "م");

  return `الجرعة: ${arabicDosage} · الوقت: ${arabicTime}`;
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

    return `${numericHour}:${minute} ${period}`;
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
          "No scheduled doses",
        secondary: "",
        color: "#6b7280",
      };
    }

    if (
      completed === 0 &&
      upcoming > 0
    ) {
      return {
        main: "Upcoming",
        secondary:
          `${upcoming} dose${
            upcoming === 1
              ? ""
              : "s"
          } pending`,
        color: "#1e3a8a",
      };
    }

    return {
      main:
        `${day.adherenceRate}%`,

      secondary:
        `${day.taken || 0} taken · ${
          day.missed || 0
        } missed${
          (day.skipped || 0) > 0
            ? ` · ${day.skipped} skipped`
            : ""
        }`,

      color: "#1e3a8a",
    };
  };

  const getAdherenceDisplay =
    () => {
      if (!reportData) {
        return {
          value: "N/A",
          note:
            "No report data available.",
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
              ? "No medication doses were scheduled for this period."
              : "The scheduled doses are still upcoming.",
        };
      }

      return {
        value:
          `${reportData.adherenceRate}%`,

        note:
          selectedReport ===
          "daily"
            ? "Today's adherence"
            : selectedReport ===
              "weekly"
            ? "Weekly adherence"
            : "Monthly adherence",
      };
    };

  const handleExportPDF = () => {
    if (!reportData) {
      return;
    }

    
console.log("PDF EXPORT DATE CHECK:", {
  rawDate: reportData.dailyBreakdown?.[0]?.date,
  formattedDate: formatDate(
    reportData.dailyBreakdown?.[0]?.date
  ),
});

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
      user?.name ||
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
     `${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report`,
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
      "Email:",
      14,
      currentY
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      user?.email || "",
      35,
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

          fontStyle:
            "bold",
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
        adherence.note,
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

      const breakdownRows =
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

          body:
            breakdownRows,

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

    if (
      currentY > 260
    ) {
      doc.addPage();
      currentY = 20;
    }

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
    } else {
      doc.setTextColor(
        90,
        100,
        115
      );

      doc.setFontSize(10);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        "No medication doses were found for this period.",
        14,
        currentY + 6
      );
    }

    const pageCount =
      doc.getNumberOfPages();

    for (
      let pageNumber = 1;
      pageNumber <=
      pageCount;
      pageNumber++
    ) {
      doc.setPage(
        pageNumber
      );

      doc.setTextColor(
        120,
        130,
        145
      );

      doc.setFontSize(8);

      doc.text(
        `Generated by MediMind · Page ${pageNumber} of ${pageCount}`,
        14,
        290
      );
    }

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    doc.save(
      `MediMind-${selectedReport}-report-${today}.pdf`
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
      "MediMind Adherence Report",
    ]);

    rows.push([
     "Report Type",
`${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report`,
    ]);

    rows.push([
      "Patient",
      user?.name ||
        "Patient",
    ]);

    rows.push([
      "Email",
      user?.email || "",
    ]);

    rows.push([
      "Period",
      getPeriodLabel(),
    ]);

    rows.push([]);

    rows.push([
      "Summary",
    ]);

    rows.push([
      "Taken",
      "Missed",
      "Skipped",
      "Upcoming",
      "Adherence",
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
        selectedReport ===
        "weekly"
          ? "Daily Breakdown"
          : "Month Breakdown",
      ]);

      rows.push([
        "Day",
        "Date",
        "Taken",
        "Missed",
        "Skipped",
        "Upcoming",
        "Adherence",
        "Details",
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
              ? day.dayName
              : `${day.dayNumber} ${day.dayName}`,

            day.date || "",

            day.taken || 0,

            day.missed || 0,

            day.skipped || 0,

            day.upcoming || 0,

            status.main,

            status.secondary ||
              "",
          ]);
        }
      );

      rows.push([]);
    }

    rows.push([
      "Medication Doses",
    ]);

    rows.push([
      "Medication",
      "Dosage",
      "Date",
      "Time",
      "Status",
    ]);

    if (
      reportData.doses
        ?.length > 0
    ) {
      reportData.doses.forEach(
        (dose) => {
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

            dose.status || "",
          ]);
        }
      );
    } else {
      rows.push([
        "No medication doses were found for this period.",
      ]);
    }

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
      `MediMind-${selectedReport}-report-${today}.csv`;

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
  { key: "daily", label: t("Daily", "يومي") },
  { key: "weekly", label: t("Weekly", "أسبوعي") },
  { key: "monthly", label: t("Monthly", "شهري") },
];


  return (
   

<Container
  fluid
  className={`dashboard-page reports-page ${
    isArabic ? "reports-ar" : ""
  }`}
  dir={isArabic ? "rtl" : "ltr"}
>


      <Header />

      <Row className="py-5 px-3">
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
             {t("Adherence Reports", "تقارير الالتزام بالأدوية")}
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginBottom: 0,
              }}
            >
             
{t(
  "Review your medication adherence across daily, weekly, and monthly periods.",
  "راجع مدى التزامك بتناول أدويتك خلال الفترات اليومية والأسبوعية والشهرية."
)}

            </p>
          </div>

          {/* Report tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "28px",
            }}
          >
            <div  className="reports-tabs"
              style={{
                display: "flex",
                width: "100%",
                backgroundColor: "#c5d8f0",
                borderRadius: "16px",
                padding: "6px",
                gap: "6px",
                boxShadow:
                  "0 8px 22px rgba(30, 58, 138, 0.08)",
              }}
            >
              {tabs.map((tab) => {
                const active =
                  selectedReport ===
                  tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    aria-selected={active}
                    onClick={() =>
                      setSelectedReport(
                        tab.key
                      )
                    }
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      borderRadius:
                        "12px",
                      backgroundColor:
                        active
                          ? "#ffffff"
                          : "transparent",
                      color:
                        "#1e3a8a",
                      padding:
                        "15px 18px",
                      fontSize:
                        "16px",
                      fontWeight:
                        active
                          ? "700"
                          : "500",
                      cursor:
                        "pointer",
                      transition:
                        "all 0.2s ease",
                      boxShadow:
                        active
                          ? "0 4px 12px rgba(30, 58, 138, 0.10)"
                          : "none",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report content */}
          <div className="reports-panel"
            style={{
              backgroundColor: "#dce9f8",
              borderRadius: "22px",
              overflow: "hidden",
              boxShadow:
                "0 12px 30px rgba(30, 58, 138, 0.10)",
            }}
          >
            <div
              style={{
                padding: "30px",
                minHeight: "520px",
              }}
            >
              <div
                className="d-flex justify-content-between align-items-start mb-4"
                style={{
                  gap: "15px",
                }}
              >
                <div>
                  <h4
                    style={{
                      color:
                        "#1e3a8a",
                      fontWeight:
                        "700",
                      marginBottom:
                        "5px",
                    }}
                  >
                    {getReportTitle()}
                  </h4>

                  <p
                    style={{
                      color:
                        "#667085",
                      marginBottom:
                        "4px",
                    }}
                  >
                    {getReportSubtitle()}
                  </p>

                  {getPeriodLabel() && (
                    <small
                      style={{
                        color:
                          "#6b7280",
                      }}
                    >
                      
{(() => {
  const label = getPeriodLabel();

  if (!isArabic) return label;

  
const arabicMonths = {
  Jan: "يناير", Feb: "فبراير", Mar: "مارس",
  Apr: "أبريل", May: "مايو", Jun: "يونيو",
  Jul: "يوليو", Aug: "أغسطس", Sep: "سبتمبر",
  Oct: "أكتوبر", Nov: "نوفمبر", Dec: "ديسمبر",
};

const arabicNumber = (value) =>
  String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

if (selectedReport === "weekly") {
  const match = label.match(
    /^([A-Za-z]{3})\s+(\d{1,2})\s*[—–-]\s*([A-Za-z]{3})\s+(\d{1,2})$/
  );

  if (match) {
    const [, startMonth, startDay, endMonth, endDay] = match;

    return `${arabicNumber(startDay)} ${
      arabicMonths[startMonth] || startMonth
    } — ${arabicNumber(endDay)} ${
      arabicMonths[endMonth] || endMonth
    }`;
  }
}


  const months = {
  Jan: "يناير", January: "يناير",
  Feb: "فبراير", February: "فبراير",
  Mar: "مارس", March: "مارس",
  Apr: "أبريل", April: "أبريل",
  May: "مايو",
  Jun: "يونيو", June: "يونيو",
  Jul: "يوليو", July: "يوليو",
  Aug: "أغسطس", August: "أغسطس",
  Sep: "سبتمبر", Sept: "سبتمبر", September: "سبتمبر",
  Oct: "أكتوبر", October: "أكتوبر",
  Nov: "نوفمبر", November: "نوفمبر",
  Dec: "ديسمبر", December: "ديسمبر",
};

  return arabicNumber(label.replace(
  /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\b/g,
  (month) => months[month] || month
  ));
})()}

                    </small>
                  )}
                </div>

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      borderRadius:
                        "10px",
                      minWidth:
                        "110px",
                    }}
                    onClick={() =>
                      setShowExportMenu(
                        (
                          currentValue
                        ) =>
                          !currentValue
                      )
                    }
                    disabled={
                      reportLoading ||
                      !reportData
                    }
                  >
                   {t("Export", "تصدير")}
                  </button>

                  {showExportMenu && (
                    <div className="reports-export-menu"
                      style={{
                        position:
                          "absolute",
                        right: 0,
                        top: "46px",
                        minWidth:
                          "155px",
                        backgroundColor:
                          "#ffffff",
                        borderRadius:
                          "10px",
                        overflow:
                          "hidden",
                        boxShadow:
                          "0 10px 25px rgba(30, 58, 138, 0.16)",
                        zIndex: 30,
                      }}
                    >
                      <button
                        type="button"
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
                          backgroundColor:
                            "#ffffff",
                          padding:
                            "11px 14px",
                          textAlign:
                            "left",
                          color:
                            "#1e3a8a",
                          fontWeight:
                            "500",
                          cursor:
                            "pointer",
                        }}
                        onMouseEnter={(
                          event
                        ) => {
                          event.currentTarget.style.backgroundColor =
                            "#f2f6fc";
                        }}
                        onMouseLeave={(
                          event
                        ) => {
                          event.currentTarget.style.backgroundColor =
                            "#ffffff";
                        }}
                      >
                       {t("Export PDF", "تصدير PDF")}
                      </button>

                      <button
                        type="button"
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
                          borderTop:
                            "1px solid #eef1f5",
                          backgroundColor:
                            "#ffffff",
                          padding:
                            "11px 14px",
                          textAlign:
                            "left",
                          color:
                            "#1e3a8a",
                          fontWeight:
                            "500",
                          cursor:
                            "pointer",
                        }}
                        onMouseEnter={(
                          event
                        ) => {
                          event.currentTarget.style.backgroundColor =
                            "#f2f6fc";
                        }}
                        onMouseLeave={(
                          event
                        ) => {
                          event.currentTarget.style.backgroundColor =
                            "#ffffff";
                        }}
                      >
                       {t("Export CSV", "تصدير CSV")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div
                key={selectedReport}
                style={{
                  animation:
                    "reportSlide 0.22s ease",
                }}
              >
                {reportLoading ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                     {t(
  `Loading ${selectedReport} report...`,
  "جارٍ تحميل التقرير..."
)}
                    </p>
                  </div>
                ) : reportError ? (
                  <div className="alert alert-danger">
                    {reportError}
                  </div>
                ) : reportData ? (
                  <>
<div className="reports-card"

                      style={{
                        backgroundColor:
                          "#ffffff",
                        borderRadius:
                          "18px",
                        padding:
                          "26px",
                        textAlign:
                          "center",
                        marginBottom:
                          "24px",
                        boxShadow:
                          "0 5px 14px rgba(30, 58, 138, 0.06)",
                      }}
                    >
                      {(() => {
                        const completed =
                          (reportData.taken ||
                            0) +
                          (reportData.missed ||
                            0) +
                          (reportData.skipped ||
                            0);

                        if (
                          completed ===
                          0
                        ) {
                          return (
                            <>
                              <h4
                                style={{
                                  color:
                                    "#1e3a8a",
                                  fontWeight:
                                    "700",
                                  marginBottom:
                                    "5px",
                                }}
                              >
                               {t("No adherence score yet", "لا توجد نسبة التزام حتى الآن")}
                              </h4>

                              <p className="text-muted mb-0">
                               
{reportData.total === 0
  ? t(
      "No medication doses were scheduled for this period.",
      "لم تتم جدولة أي جرعات دوائية خلال هذه الفترة."
    )
  : t(
      "The scheduled doses are still upcoming.",
      "الجرعات المجدولة لم يحن موعدها بعد."
    )}

                              </p>
                            </>
                          );
                        }

                        return (
                          <>
                            <h2
                              style={{
                                color:
                                  "#1e3a8a",
                                fontWeight:
                                  "700",
                                marginBottom:
                                  "4px",
                              }}
                            >
                              {
                                reportData.adherenceRate
                              }
                              %
                            </h2>

                            <p className="text-muted mb-0">
                             
{selectedReport === "daily"
  ? t("Today's Adherence", "الالتزام اليومي")
  : selectedReport === "weekly"
  ? t("Weekly Adherence", "الالتزام الأسبوعي")
  : t("Monthly Adherence", "الالتزام الشهري")}

                            </p>
                          </>
                        );
                      })()}
                    </div>

                    {selectedReport !== "daily" ? (
                      <Row className="g-4">
                        {/* LEFT HALF: BREAKDOWN */}
                        <Col lg="6">
                          <div className="reports-card"
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "18px",
                              padding: "22px",
                              boxShadow:
                                "0 5px 14px rgba(30, 58, 138, 0.06)",
                              height: "100%",
                              maxHeight: "560px",
                              overflowY: "auto",
                            }}
                          >
                            <h6
                              style={{
                                color: "#1e3a8a",
                                fontWeight: "700",
                                marginBottom: "16px",
                              }}
                            >
                              
{selectedReport === "weekly"
  ? t("Daily Breakdown", "التفاصيل اليومية")
  : t("Month Breakdown", "التفاصيل الشهرية")}

                            </h6>

                            {reportData.dailyBreakdown?.length > 0 ? (
                              reportData.dailyBreakdown.map((day) => {
                                const dayStatus =
                                  getDayStatusText(day);

                                return (
                                  <div
                                    key={day.date}
                                    className="d-flex justify-content-between align-items-center"
                                    style={{
                                      padding: "11px 0",
                                      borderBottom:
                                        "1px solid #eef1f5",
                                      gap: "15px",
                                    }}
                                  >
                                    <div>
                                      <strong
                                        style={{
                                          color: "#1e3a8a",
                                        }}
                                      >
                                       
{(() => {
 
const arabicDays = {
  Sun: "الأحد",
  Mon: "الاثنين",
  Tue: "الثلاثاء",
  Wed: "الأربعاء",
  Thu: "الخميس",
  Fri: "الجمعة",
  Sat: "السبت",
  Sunday: "الأحد",
  Monday: "الاثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};


  const dayName = isArabic
    ? arabicDays[day.dayName] || day.dayName
    : day.dayName;

  return selectedReport === "weekly"
    ? dayName
    : `${day.dayNumber} ${dayName}`;
})()}

                                      </strong>

                                      <div className="small text-muted">
                                       {formatDate(day.date, isArabic ? "ar-OM" : "en-US")}
                                      </div>
                                    </div>

                                    <div className="text-end">
                                      <strong
                                        style={{
                                          color:
                                            dayStatus.color,
                                        }}
                                      >
                                        
{isArabic
  ? dayStatus.main === "No scheduled doses"
    ? "لا توجد جرعات مجدولة"
    : dayStatus.main === "Upcoming"
    ? "قادمة"
    : dayStatus.main
  : dayStatus.main}

                                      </strong>

                                      {dayStatus.secondary && (
                                        <div className="small text-muted">
                                          
{isArabic
  ? day.total === 0
    ? ""
    : (day.taken || 0) +
        (day.missed || 0) +
        (day.skipped || 0) ===
      0
    ? `${day.upcoming || 0} جرعة بانتظار موعدها`
    : `${day.taken || 0} تم تناولها · ${
        day.missed || 0
      } فائتة${
        (day.skipped || 0) > 0
          ? ` · ${day.skipped} تم تخطيها`
          : ""
      }`
  : dayStatus.secondary}

                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-muted text-center mb-0">
                               {t(
  "No breakdown data is available for this period.",
  "لا تتوفر تفاصيل يومية لهذه الفترة."
)}
                              </p>
                            )}
                          </div>
                        </Col>

                        {/* RIGHT HALF: MEDICATION SUMMARY */}
                        <Col lg="6">
                          <div className="reports-card"
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "18px",
                              padding: "22px",
                              boxShadow:
                                "0 5px 14px rgba(30, 58, 138, 0.06)",
                              height: "100%",
                              maxHeight: "560px",
                              overflowY: "auto",
                            }}
                          >
                            <h6
                              style={{
                                color: "#1e3a8a",
                                fontWeight: "700",
                                marginBottom: "14px",
                              }}
                            >
                             {t("Medication Summary", "ملخص الأدوية")}
                            </h6>

                            {reportData.doses?.length > 0 ? (
                              getMedicationSummary(
                                reportData.doses
                              ).map((medication) => (
                                <div
                                  key={`${medication.medicationName}-${medication.dosage}`}
                                  style={{
                                    padding: "16px 0",
                                    borderBottom:
                                      "1px solid #eef1f5",
                                  }}
                                >
                                  <div
                                    className="d-flex justify-content-between align-items-start"
                                    style={{
                                      gap: "15px",
                                    }}
                                  >
                                    <div>
                                      <strong
                                        style={{
                                          color: "#1e3a8a",
                                        }}
                                      >
                                        {medication.medicationName}
                                      </strong>

                                      <div className="small text-muted mt-1">
                                        {medication.dosage}
                                      </div>
                                    </div>

                                    <span className="small text-muted">
                                     
{medication.total}{" "}
{isArabic
  ? "جرعة"
  : medication.total === 1
  ? "dose"
  : "doses"}

                                    </span>
                                  </div>

                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns:
                                        "repeat(2, minmax(0, 1fr))",
                                      gap: "8px",
                                      marginTop: "12px",
                                    }}
                                  >
                                    {medication.Taken > 0 && (
                                      <span
                                        style={{
                                          ...getStatusBadgeStyle(
                                            "Taken"
                                          ),
                                          display: "block",
                                          width: "100%",
                                          textAlign: "center",
                                        }}
                                      >
                                       {t("Taken", "تم التناول")} {medication.Taken}
                                      </span>
                                    )}

                                    {medication.Missed > 0 && (
                                      <span
                                        style={{
                                          ...getStatusBadgeStyle(
                                            "Missed"
                                          ),
                                          display: "block",
                                          width: "100%",
                                          textAlign: "center",
                                        }}
                                      >
                                      {t("Missed", "فائتة")} {medication.Missed}
                                      </span>
                                    )}

                                    {medication.Skipped > 0 && (
                                      <span
                                        style={{
                                          ...getStatusBadgeStyle(
                                            "Skipped"
                                          ),
                                          display: "block",
                                          width: "100%",
                                          textAlign: "center",
                                        }}
                                      >
                                       {t("Skipped", "تم التخطي")} {medication.Skipped}
                                      </span>
                                    )}

                                    {medication.Upcoming > 0 && (
                                      <span
                                        style={{
                                          ...getStatusBadgeStyle(
                                            "Upcoming"
                                          ),
                                          display: "block",
                                          width: "100%",
                                          textAlign: "center",
                                        }}
                                      >
                                        {t("Upcoming", "قادمة")} {medication.Upcoming}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted text-center mb-0">
                               {t(
  "No medication doses were found for this period.",
  "لم يتم العثور على جرعات دوائية خلال هذه الفترة."
)}
                              </p>
                            )}
                          </div>
                        </Col>
                      </Row>
                    ) : (
                      /* DAILY: no breakdown, just today's doses */
                      <div className="reports-card"
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: "18px",
                          padding: "22px",
                          boxShadow:
                            "0 5px 14px rgba(30, 58, 138, 0.06)",
                        }}
                      >
                        <h6
                          style={{
                            color: "#1e3a8a",
                            fontWeight: "700",
                            marginBottom: "14px",
                          }}
                        >
                         {t("Today's Doses", "جرعات اليوم")}
                        </h6>

                        {reportData.doses?.length > 0 ? (
                          reportData.doses.map((dose) => (
                            <div
                              key={dose._id}
                              className="d-flex justify-content-between align-items-center"
                              style={{
                                padding: "14px 0",
                                borderBottom:
                                  "1px solid #eef1f5",
                                gap: "15px",
                              }}
                            >
                              <div>
                                <strong
                                  style={{
                                    color: "#1e3a8a",
                                  }}
                                >
                                  {dose.medicationName}
                                </strong>

                                <div className="small text-muted mt-1">
                                  {formatDoseDetails(dose)}
                                  
                                </div>
                              </div>

                              <span
                                style={getStatusBadgeStyle(
                                  dose.status
                                )}
                              >
                                {t(
  dose.status,
  ({
    Taken: "تم التناول",
    Missed: "فائتة",
    Skipped: "تم التخطي",
    Upcoming: "قادمة",
  })[dose.status] || dose.status
)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted text-center mb-0">
                           {t(
  "No medication doses were found for today.",
  "لم يتم العثور على جرعات دوائية لهذا اليوم."
)}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <style>
        {`
          @keyframes reportSlide {
            from {
              opacity: 0;
              transform: translateX(10px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
            
.reports-ar {
  font-family: Tahoma, Arial, sans-serif;
  text-align: right;
}

.reports-ar h2,
.reports-ar h4,
.reports-ar h6 {
  font-weight: 700;
}

.reports-ar .text-end {
  text-align: left !important;
}

.reports-ar .reports-export-menu {
  right: auto !important;
  left: 0 !important;
}

.reports-ar .reports-export-menu button {
  text-align: right !important;
}

        `}
      </style>

      <Footer />
    </Container>
  );
};

export default Reports;
