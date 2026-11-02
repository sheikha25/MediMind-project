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
import Footer from "./footer";

const Reports = () => {
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
      "en-US",
      {
        day: "numeric",
        month: "short",
      }
    );
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
      getReportTitle(),
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
      getReportTitle(),
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
      className="dashboard-page"
      style={{
        backgroundColor: "#f7f9fc",
        minHeight: "100vh",
      }}
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
              Adherence Reports
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginBottom: 0,
              }}
            >
              Review your medication
              adherence across daily,
              weekly, and monthly
              periods.
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
            <div
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
          <div
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
                      {getPeriodLabel()}
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
                    Export 
                  </button>

                  {showExportMenu && (
                    <div
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
                        Export PDF
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
                        Export CSV
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
                      Loading{" "}
                      {selectedReport}{" "}
                      report...
                    </p>
                  </div>
                ) : reportError ? (
                  <div className="alert alert-danger">
                    {reportError}
                  </div>
                ) : reportData ? (
                  <>
<div
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
                                No adherence
                                score yet
                              </h4>

                              <p className="text-muted mb-0">
                                {reportData.total ===
                                0
                                  ? "No medication doses were scheduled for this period."
                                  : "The scheduled doses are still upcoming."}
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
                              {selectedReport ===
                              "daily"
                                ? "Today's Adherence"
                                : selectedReport ===
                                  "weekly"
                                ? "Weekly Adherence"
                                : "Monthly Adherence"}
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    {selectedReport !== "daily" ? (
                      <Row className="g-4">
                        {/* LEFT HALF: BREAKDOWN */}
                        <Col lg="6">
                          <div
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
                                ? "Daily Breakdown"
                                : "Month Breakdown"}
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
                                        {selectedReport === "weekly"
                                          ? day.dayName
                                          : `${day.dayNumber} ${day.dayName}`}
                                      </strong>

                                      <div className="small text-muted">
                                        {formatDate(day.date)}
                                      </div>
                                    </div>

                                    <div className="text-end">
                                      <strong
                                        style={{
                                          color:
                                            dayStatus.color,
                                        }}
                                      >
                                        {dayStatus.main}
                                      </strong>

                                      {dayStatus.secondary && (
                                        <div className="small text-muted">
                                          {dayStatus.secondary}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-muted text-center mb-0">
                                No breakdown data is available for this period.
                              </p>
                            )}
                          </div>
                        </Col>

                        {/* RIGHT HALF: MEDICATION SUMMARY */}
                        <Col lg="6">
                          <div
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
                              Medication Summary
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
                                      {medication.total} dose
                                      {medication.total !== 1 ? "s" : ""}
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
                                        Taken {medication.Taken}
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
                                        Missed {medication.Missed}
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
                                        Skipped {medication.Skipped}
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
                                        Upcoming {medication.Upcoming}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted text-center mb-0">
                                No medication doses were found for this period.
                              </p>
                            )}
                          </div>
                        </Col>
                      </Row>
                    ) : (
                      /* DAILY: no breakdown, just today's doses */
                      <div
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
                          Today's Doses
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
                                  {dose.dosage} ·{" "}
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
                                {dose.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted text-center mb-0">
                            No medication doses were found for today.
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
        `}
      </style>

      <Footer />
    </Container>
  );
};

export default Reports;