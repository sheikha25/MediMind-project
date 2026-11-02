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

const CaregiverReports = () => {
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
              "Unable to load linked patients."
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

          
const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

const response = await axios.get(
  `http://localhost:3002/caregiver/${endpoint}/${encodeURIComponent(
    user.email
  )}/${encodeURIComponent(
    selectedPatientEmail
  )}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
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
              "Unable to load patient report."
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
      "en-US",
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

    return `${numericHour}:${minute} ${period}`;
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
          "No scheduled doses",
        secondary: "",
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
      "MediMind Caregiver Report",
    ]);

    rows.push([
      "Patient",
      selectedPatient
        ?.patientName ||
        "Patient",
    ]);

    rows.push([
      "Patient Email",
      selectedPatientEmail,
    ]);

    rows.push([
      "Report Type",
      getReportTitle(),
    ]);

    rows.push([
      "Period",
      getPeriodLabel(),
    ]);

    rows.push([]);

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
        "Daily Breakdown",
      ]);

      rows.push([
        "Day",
        "Date",
        "Taken",
        "Missed",
        "Skipped",
        "Upcoming",
        "Adherence",
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

        dose.status || "",
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
      className="dashboard-page"
      style={{
        backgroundColor: "#f7f9fc",
        minHeight: "100vh",
      }}
    >
      <CaregiverHeader />

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
              Patient Reports
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginBottom: 0,
              }}
            >
              Review adherence reports for
              your linked patients.
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
                Loading linked patients...
              </CardBody>
            </Card>
          ) : patients.length === 0 ? (
            <Card>
              <CardBody className="text-center py-5">
                No linked patients yet.
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
                    Select Patient
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
                    "#dce9f8",
                  borderRadius:
                    "22px",
                  overflow:
                    "hidden",
                  boxShadow:
                    "0 12px 30px rgba(30, 58, 138, 0.10)",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    backgroundColor:
                      "#c5d8f0",
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
                                ? "#dce9f8"
                                : "#c5d8f0",
                            color:
                              "#1e3a8a",
                            fontWeight:
                              active
                                ? "700"
                                : "500",
                          }}
                        >
                          {
                            tab.label
                          }
                        </button>
                      );
                    }
                  )}
                </div>

                <div
                  style={{
                    padding:
                      "30px",
                  }}
                >
                  <div className="d-flex justify-content-between mb-4">
                    <div>
                      <h4
                        style={{
                          color:
                            "#1e3a8a",
                        }}
                      >
                        {getReportTitle()}
                      </h4>

                      <p className="text-muted mb-1">
                        {getReportSubtitle()}
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
                        Export ▾
                      </button>

                      {showExportMenu && (
                        <div
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
                            Export PDF
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
                            Export CSV
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {reportLoading ? (
                    <div className="text-center py-5">
                      Loading report...
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
                                      label
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
                            Medication Doses
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
                                  className="d-flex justify-content-between py-3 border-bottom"
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
                                    {
                                      dose.status
                                    }
                                  </span>
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-muted mb-0">
                              No medication doses found.
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
    </Container>
  );
};

export default CaregiverReports;