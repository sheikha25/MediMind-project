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
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import CaregiverHeader from "./CaregiverHeader";

const AnalyticsCaregiver = () => {
  const user = useSelector(
    (state) => state.user.user
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
    reportData,
    setReportData,
  ] = useState(null);

  const [
    patientInfo,
    setPatientInfo,
  ] = useState(null);

  const [
    loadingPatients,
    setLoadingPatients,
  ] = useState(true);

  const [
    loadingAnalytics,
    setLoadingAnalytics,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const fetchPatients =
      async () => {
        if (!user?.email) {
          return;
        }

        try {
          setLoadingPatients(true);
          setError("");

          const response =
            await axios.get(
              `http://localhost:3002/caregiver/my-patients/${encodeURIComponent(
                user.email
              )}`
            );

          const linkedPatients =
            response.data?.patients ||
            [];

          setPatients(
            linkedPatients
          );

          if (
            linkedPatients.length > 0
          ) {
            setSelectedPatientEmail(
              linkedPatients[0]
                .patientEmail
            );
          }
        } catch (error) {
          console.error(
            "Caregiver analytics patient fetch error:",
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
  }, [user?.email]);

  useEffect(() => {
    const fetchPatientAnalytics =
      async () => {
        if (
          !user?.email ||
          !selectedPatientEmail
        ) {
          setReportData(null);
          setPatientInfo(null);
          return;
        }

        try {
          setLoadingAnalytics(
            true
          );

          setError("");

          const response =
            await axios.get(
              `http://localhost:3002/caregiver/patient-weekly-report/${encodeURIComponent(
                user.email
              )}/${encodeURIComponent(
                selectedPatientEmail
              )}`
            );

          setReportData(
            response.data?.report ||
              null
          );

          setPatientInfo(
            response.data?.patient ||
              null
          );
        } catch (error) {
          console.error(
            "Caregiver patient analytics error:",
            error
          );

          setError(
            error.response?.data
              ?.message ||
              "Unable to load patient analytics."
          );

          setReportData(null);
          setPatientInfo(null);
        } finally {
          setLoadingAnalytics(
            false
          );
        }
      };

    fetchPatientAnalytics();
  }, [
    user?.email,
    selectedPatientEmail,
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

  const trendData =
    useMemo(() => {
      if (
        !reportData
          ?.dailyBreakdown
          ?.length
      ) {
        return [];
      }

      return reportData.dailyBreakdown.map(
        (day) => {
          const completed =
            (day.taken || 0) +
            (day.missed || 0) +
            (day.skipped || 0);

          return {
            day:
              day.dayName,

            adherence:
              completed > 0
                ? day.adherenceRate
                : null,

            taken:
              day.taken || 0,

            missed:
              day.missed || 0,

            skipped:
              day.skipped || 0,
          };
        }
      );
    }, [reportData]);

  const validDays =
    useMemo(() => {
      if (
        !reportData
          ?.dailyBreakdown
          ?.length
      ) {
        return [];
      }

      return reportData.dailyBreakdown.filter(
        (day) =>
          (day.taken || 0) +
            (day.missed || 0) +
            (day.skipped || 0) >
          0
      );
    }, [reportData]);

  const bestDay =
    useMemo(() => {
      if (
        validDays.length === 0
      ) {
        return null;
      }

      return [...validDays].sort(
        (a, b) =>
          b.adherenceRate -
          a.adherenceRate
      )[0];
    }, [validDays]);

  const lowestDay =
    useMemo(() => {
      if (
        validDays.length === 0
      ) {
        return null;
      }

      return [...validDays].sort(
        (a, b) =>
          a.adherenceRate -
          b.adherenceRate
      )[0];
    }, [validDays]);

  const missedPeriods =
    useMemo(() => {
      const periods = {
        Morning: 0,
        Afternoon: 0,
        Evening: 0,
        Night: 0,
      };

      if (
        !reportData?.doses
          ?.length
      ) {
        return periods;
      }

      reportData.doses
        .filter(
          (dose) =>
            dose.status ===
            "Missed"
        )
        .forEach((dose) => {
          if (
            !dose.scheduledTime
          ) {
            return;
          }

          const hour =
            Number(
              dose.scheduledTime.split(
                ":"
              )[0]
            );

          if (
            hour >= 5 &&
            hour < 12
          ) {
            periods.Morning += 1;
          } else if (
            hour >= 12 &&
            hour < 17
          ) {
            periods.Afternoon +=
              1;
          } else if (
            hour >= 17 &&
            hour < 21
          ) {
            periods.Evening += 1;
          } else {
            periods.Night += 1;
          }
        });

      return periods;
    }, [reportData]);

  const missedTimeData =
    useMemo(() => {
      return Object.entries(
        missedPeriods
      ).map(
        ([period, missed]) => ({
          period,
          missed,
        })
      );
    }, [missedPeriods]);

  const doseDistribution =
    useMemo(() => {
      if (!reportData) {
        return [];
      }

      return [
        {
          name: "Taken",
          value:
            reportData.taken || 0,
          color: "#51a77b",
        },
        {
          name: "Missed",
          value:
            reportData.missed || 0,
          color: "#de6663",
        },
        {
          name: "Skipped",
          value:
            reportData.skipped || 0,
          color: "#e6ad48",
        },
      ];
    }, [reportData]);

  const completedDoseCount =
    useMemo(() => {
      return doseDistribution.reduce(
        (total, item) =>
          total + item.value,
        0
      );
    }, [doseDistribution]);

  const missedDoseInsight =
    useMemo(() => {
      const entries =
        Object.entries(
          missedPeriods
        );

      const totalMissed =
        entries.reduce(
          (
            total,
            [, count]
          ) =>
            total + count,
          0
        );

      if (
        totalMissed === 0
      ) {
        return "No missed doses were recorded for this patient during the last 7 days.";
      }

      const highestCount =
        Math.max(
          ...entries.map(
            ([, count]) =>
              count
          )
        );

      const highestPeriods =
        entries
          .filter(
            ([, count]) =>
              count ===
              highestCount
          )
          .map(
            ([period]) =>
              period.toLowerCase()
          );

      if (
        highestPeriods.length ===
        1
      ) {
        return `Most missed doses occurred during the ${highestPeriods[0]}. This may be a useful time for caregiver follow-up.`;
      }

      if (
        highestPeriods.length ===
        2
      ) {
        return `Missed doses were equally common during the ${highestPeriods[0]} and ${highestPeriods[1]}. These may be useful times for additional reminders.`;
      }

      return "Missed doses were spread across different times of the day.";
    }, [missedPeriods]);

  const needsAttention =
    useMemo(() => {
      if (!reportData) {
        return {
          level: "none",

          title:
            "No analytics available",

          message:
            "Select a patient with medication history to view attention indicators.",
        };
      }

      const missed =
        reportData.missed || 0;

      const skipped =
        reportData.skipped || 0;

      const adherence =
        reportData.adherenceRate ||
        0;

      if (
        completedDoseCount === 0
      ) {
        return {
          level: "info",

          title:
            "Not enough data yet",

          message:
            "There are not enough completed doses to assess this patient's adherence pattern.",
        };
      }

      if (
        adherence < 50 ||
        missed >= 3
      ) {
        return {
          level: "high",

          title:
            "Needs attention",

          message:
            "This patient has low adherence or several missed doses this week. A check-in may be helpful.",
        };
      }

      if (
        adherence < 80 ||
        missed > 0 ||
        skipped > 0
      ) {
        return {
          level: "medium",

          title:
            "Monitor adherence",

          message:
            "Some doses were missed or skipped this week. Continued monitoring may be helpful.",
        };
      }

      return {
        level: "good",

        title:
          "Adherence looks stable",

        message:
          "The patient has maintained strong medication adherence during the last 7 days.",
      };
    }, [
      reportData,
      completedDoseCount,
    ]);

  const attentionStyle =
    useMemo(() => {
      if (
        needsAttention.level ===
        "high"
      ) {
        return {
          backgroundColor:
            "#fff1f2",

          titleColor:
            "#b42332",
        };
      }

      if (
        needsAttention.level ===
        "medium"
      ) {
        return {
          backgroundColor:
            "#fff8e8",

          titleColor:
            "#946200",
        };
      }

      if (
        needsAttention.level ===
        "good"
      ) {
        return {
          backgroundColor:
            "#eef9f2",

          titleColor:
            "#198754",
        };
      }

      return {
        backgroundColor:
          "#eef4ff",

        titleColor:
          "#1e3a8a",
      };
    }, [needsAttention]);

  const cardStyle = {
    border: "none",
    borderRadius: "18px",
    backgroundColor: "#ffffff",

    boxShadow:
      "0 6px 18px rgba(30, 58, 138, 0.07)",
  };

  const titleStyle = {
    color: "#1e3a8a",
    fontWeight: "700",
  };

  const tooltipStyle = {
    border: "none",
    borderRadius: "12px",

    boxShadow:
      "0 8px 24px rgba(30, 58, 138, 0.13)",
  };

  return (
    <Container
      fluid
      className="dashboard-page"
      style={{
        minHeight: "100vh",
        backgroundColor:
          "#f7f9fc",
      }}
    >
      <CaregiverHeader />

      <Row className="py-4 px-3">
        <Col
          lg="11"
          xl="10"
          className="mx-auto"
        >
          <div className="mb-4">
            <h2
              style={{
                color:
                  "#1e3a8a",
                fontWeight:
                  "700",
                marginBottom:
                  "5px",
              }}
            >
              Patient Analytics
            </h2>

            <p className="text-muted mb-0">
              Discover adherence
              patterns for your linked
              patients.
            </p>
          </div>

          {error && (
            <Alert color="danger">
              {error}
            </Alert>
          )}

          {loadingPatients ? (
            <Card style={cardStyle}>
              <CardBody className="text-center py-5">
                Loading linked
                patients...
              </CardBody>
            </Card>
          ) : patients.length ===
            0 ? (
            <Card style={cardStyle}>
              <CardBody className="text-center py-5">
                <h5>
                  No linked patients yet
                </h5>

                <p className="text-muted mb-0">
                  Patient analytics will
                  appear after a patient
                  accepts your caregiver
                  request.
                </p>
              </CardBody>
            </Card>
          ) : (
            <>
              <Card
                className="mb-4"
                style={cardStyle}
              >
                <CardBody className="p-4">
                  <Row className="align-items-center">
                    <Col md="7">
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
                        onChange={(
                          event
                        ) =>
                          setSelectedPatientEmail(
                            event.target
                              .value
                          )
                        }
                      >
                        {patients.map(
                          (
                            patient
                          ) => (
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
                    </Col>

                    <Col
                      md="5"
                      className="mt-3 mt-md-0"
                    >
                      <div className="d-flex align-items-center justify-content-md-end">
                        <img
                          src={
                            selectedPatient
                              ?.patientProfilePicture
                              ? `http://localhost:3002${selectedPatient.patientProfilePicture}`
                              : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                          }
                          alt={
                            selectedPatient
                              ?.patientName ||
                            "Patient"
                          }
                          style={{
                            width:
                              "52px",
                            height:
                              "52px",
                            borderRadius:
                              "50%",
                            objectFit:
                              "cover",
                            marginRight:
                              "12px",
                            border:
                              "2px solid #dbe2ea",
                          }}
                        />

                        <div>
                          <strong
                            style={{
                              color:
                                "#1e3a8a",
                            }}
                          >
                            {patientInfo?.name ||
                              selectedPatient?.patientName ||
                              "Patient"}
                          </strong>

                          <div className="small text-muted">
                            {selectedPatient
                              ?.relationship ||
                              "Linked patient"}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              {loadingAnalytics ? (
                <Card style={cardStyle}>
                  <CardBody className="text-center py-5">
                    Loading patient
                    analytics...
                  </CardBody>
                </Card>
              ) : reportData ? (
                <>
                  <Row className="g-4 mb-4">
                    <Col
                      lg="6"
                      md="12"
                    >
                      <Card
                        style={{
                          ...cardStyle,
                          height:
                            "100%",
                        }}
                      >
                        <CardBody className="p-4">
                          <h5
                            style={{
                              ...titleStyle,
                              marginBottom:
                                "4px",
                            }}
                          >
                            Adherence Trend
                          </h5>

                          <p className="text-muted small mb-3">
                            How has this
                            patient's
                            adherence changed
                            this week?
                          </p>

                          <div
                            style={{
                              width:
                                "100%",
                              height:
                                "250px",
                            }}
                          >
                            <ResponsiveContainer
                              width="100%"
                              height="100%"
                            >
                              <AreaChart
                                data={
                                  trendData
                                }
                                margin={{
                                  top: 10,
                                  right:
                                    15,
                                  left:
                                    -20,
                                  bottom:
                                    0,
                                }}
                              >
                                <defs>
                                  <linearGradient
                                    id="caregiverAdherenceFill"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#4f83cc"
                                      stopOpacity={
                                        0.35
                                      }
                                    />

                                    <stop
                                      offset="95%"
                                      stopColor="#4f83cc"
                                      stopOpacity={
                                        0.03
                                      }
                                    />
                                  </linearGradient>
                                </defs>

                                <CartesianGrid
                                  stroke="#e8edf3"
                                  strokeDasharray="4 4"
                                  vertical={
                                    false
                                  }
                                />

                                <XAxis
                                  dataKey="day"
                                  axisLine={
                                    false
                                  }
                                  tickLine={
                                    false
                                  }
                                />

                                <YAxis
                                  domain={[
                                    0,
                                    100,
                                  ]}
                                  ticks={[
                                    0,
                                    25,
                                    50,
                                    75,
                                    100,
                                  ]}
                                  width={
                                    45
                                  }
                                  axisLine={
                                    false
                                  }
                                  tickLine={
                                    false
                                  }
                                  tickFormatter={(
                                    value
                                  ) =>
                                    `${value}%`
                                  }
                                />

                                <Tooltip
                                  contentStyle={
                                    tooltipStyle
                                  }
                                  formatter={(
                                    value
                                  ) => [
                                    value ===
                                    null
                                      ? "No completed doses"
                                      : `${value}%`,
                                    "Adherence",
                                  ]}
                                />

                                <Area
                                  type="monotone"
                                  dataKey="adherence"
                                  stroke="#3f7fc9"
                                  strokeWidth={
                                    3
                                  }
                                  fill="url(#caregiverAdherenceFill)"
                                  connectNulls={
                                    false
                                  }
                                  dot={{
                                    r: 4,
                                    fill:
                                      "#3f7fc9",
                                    stroke:
                                      "#ffffff",
                                    strokeWidth:
                                      2,
                                  }}
                                  activeDot={{
                                    r: 7,
                                  }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>

                    <Col
                      lg="6"
                      md="12"
                    >
                      <Card
                        style={{
                          ...cardStyle,
                          height:
                            "100%",
                        }}
                      >
                        <CardBody className="p-4">
                          <h5
                            style={{
                              ...titleStyle,
                              marginBottom:
                                "4px",
                            }}
                          >
                            Daily Pattern
                          </h5>

                          <p className="text-muted small mb-3">
                            What happened
                            with this
                            patient's doses
                            each day?
                          </p>

                          <div
                            style={{
                              width:
                                "100%",
                              height:
                                "250px",
                            }}
                          >
                            <ResponsiveContainer
                              width="100%"
                              height="100%"
                            >
                              <BarChart
                                data={
                                  trendData
                                }
                                margin={{
                                  top: 10,
                                  right:
                                    15,
                                  left:
                                    -20,
                                  bottom:
                                    0,
                                }}
                              >
                                <CartesianGrid
                                  stroke="#e8edf3"
                                  strokeDasharray="4 4"
                                  vertical={
                                    false
                                  }
                                />

                                <XAxis
                                  dataKey="day"
                                  axisLine={
                                    false
                                  }
                                  tickLine={
                                    false
                                  }
                                />

                                <YAxis
                                  allowDecimals={
                                    false
                                  }
                                  width={
                                    35
                                  }
                                  axisLine={
                                    false
                                  }
                                  tickLine={
                                    false
                                  }
                                />

                                <Tooltip
                                  contentStyle={
                                    tooltipStyle
                                  }
                                />

                                <Legend />

                                <Bar
                                  dataKey="taken"
                                  name="Taken"
                                  stackId="dose"
                                  fill="#51a77b"
                                  maxBarSize={
                                    32
                                  }
                                />

                                <Bar
                                  dataKey="missed"
                                  name="Missed"
                                  stackId="dose"
                                  fill="#de6663"
                                  maxBarSize={
                                    32
                                  }
                                />

                                <Bar
                                  dataKey="skipped"
                                  name="Skipped"
                                  stackId="dose"
                                  fill="#e6ad48"
                                  maxBarSize={
                                    32
                                  }
                                  radius={[
                                    6,
                                    6,
                                    0,
                                    0,
                                  ]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-4">
                    <Col
                      lg="6"
                      md="12"
                    >
                      <Card
                        style={{
                          ...cardStyle,
                          height:
                            "100%",
                        }}
                      >
                        <CardBody className="p-4">
                          <h5
                            style={{
                              ...titleStyle,
                              marginBottom:
                                "4px",
                            }}
                          >
                            Dose Status
                          </h5>

                          <p className="text-muted small mb-0">
                            How were the
                            patient's
                            completed doses
                            distributed?
                          </p>

                          {completedDoseCount >
                          0 ? (
                            <div
                              style={{
                                width:
                                  "100%",
                                height:
                                  "260px",
                                position:
                                  "relative",
                              }}
                            >
                              <ResponsiveContainer
                                width="100%"
                                height="100%"
                              >
                                <PieChart>
                                  <Pie
                                    data={
                                      doseDistribution
                                    }
                                    cx="50%"
                                    cy="47%"
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={
                                      65
                                    }
                                    outerRadius={
                                      92
                                    }
                                    paddingAngle={
                                      4
                                    }
                                    cornerRadius={
                                      7
                                    }
                                  >
                                    {doseDistribution.map(
                                      (
                                        entry
                                      ) => (
                                        <Cell
                                          key={
                                            entry.name
                                          }
                                          fill={
                                            entry.color
                                          }
                                        />
                                      )
                                    )}
                                  </Pie>

                                  <Tooltip
                                    contentStyle={
                                      tooltipStyle
                                    }
                                  />

                                  <Legend
                                    verticalAlign="bottom"
                                    height={
                                      28
                                    }
                                  />
                                </PieChart>
                              </ResponsiveContainer>

                              <div
                                style={{
                                  position:
                                    "absolute",
                                  top:
                                    "44%",
                                  left:
                                    "50%",
                                  transform:
                                    "translate(-50%, -50%)",
                                  textAlign:
                                    "center",
                                  pointerEvents:
                                    "none",
                                }}
                              >
                                <strong
                                  style={{
                                    display:
                                      "block",
                                    fontSize:
                                      "29px",
                                    color:
                                      "#1e3a8a",
                                    lineHeight:
                                      "1",
                                  }}
                                >
                                  {
                                    completedDoseCount
                                  }
                                </strong>

                                <small className="text-muted">
                                  Completed
                                </small>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-5">
                              <p className="text-muted mb-0">
                                No completed
                                doses yet.
                              </p>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </Col>

                    <Col
                      lg="6"
                      md="12"
                    >
                      <Card
                        style={{
                          ...cardStyle,
                          height:
                            "100%",
                        }}
                      >
                        <CardBody className="p-4">
                          <h5
                            style={{
                              ...titleStyle,
                              marginBottom:
                                "4px",
                            }}
                          >
                            Missed Dose
                            Pattern
                          </h5>

                          <p className="text-muted small mb-2">
                            When are this
                            patient's missed
                            doses most likely
                            to happen?
                          </p>

                          <div
                            style={{
                              width:
                                "100%",
                              height:
                                "260px",
                            }}
                          >
                            <ResponsiveContainer
                              width="100%"
                              height="100%"
                            >
                              <BarChart
                                layout="vertical"
                                data={
                                  missedTimeData
                                }
                                margin={{
                                  top: 10,
                                  right:
                                    25,
                                  left: 5,
                                  bottom:
                                    5,
                                }}
                              >
                                <CartesianGrid
                                  stroke="#e8edf3"
                                  strokeDasharray="4 4"
                                  horizontal={
                                    false
                                  }
                                />

                                <XAxis
                                  type="number"
                                  allowDecimals={
                                    false
                                  }
                                  axisLine={
                                    false
                                  }
                                  tickLine={
                                    false
                                  }
                                />

                                <YAxis
                                  type="category"
                                  dataKey="period"
                                  width={
                                    80
                                  }
                                  axisLine={
                                    false
                                  }
                                  tickLine={
                                    false
                                  }
                                />

                                <Tooltip
                                  contentStyle={
                                    tooltipStyle
                                  }
                                />

                                <Bar
                                  dataKey="missed"
                                  name="Missed Doses"
                                  fill="#6c8fc2"
                                  barSize={
                                    20
                                  }
                                  radius={[
                                    0,
                                    10,
                                    10,
                                    0,
                                  ]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-4">
                    <Col
                      lg="6"
                      md="12"
                    >
                      <Card
                        style={{
                          ...cardStyle,
                          height:
                            "100%",
                          backgroundColor:
                            "#eef4ff",
                        }}
                      >
                        <CardBody className="p-4">
                          <h5
                            style={{
                              ...titleStyle,
                              marginBottom:
                                "14px",
                            }}
                          >
                            Weekly Insight
                          </h5>

                          <p
                            style={{
                              color:
                                "#40516a",
                              lineHeight:
                                "1.7",
                            }}
                          >
                            {
                              missedDoseInsight
                            }
                          </p>

                          {bestDay ? (
                            <Row
                              style={{
                                borderTop:
                                  "1px solid #dbe5f5",
                                paddingTop:
                                  "15px",
                                marginTop:
                                  "15px",
                              }}
                            >
                              <Col xs="6">
                                <small className="text-muted">
                                  Best day
                                </small>

                                <div
                                  style={{
                                    color:
                                      "#198754",
                                    fontWeight:
                                      "700",
                                    marginTop:
                                      "4px",
                                  }}
                                >
                                  {
                                    bestDay.dayName
                                  }{" "}
                                  ·{" "}
                                  {
                                    bestDay.adherenceRate
                                  }
                                  %
                                </div>
                              </Col>

                              <Col xs="6">
                                <small className="text-muted">
                                  Lowest day
                                </small>

                                <div
                                  style={{
                                    color:
                                      "#dc3545",
                                    fontWeight:
                                      "700",
                                    marginTop:
                                      "4px",
                                  }}
                                >
                                  {
                                    lowestDay.dayName
                                  }{" "}
                                  ·{" "}
                                  {
                                    lowestDay.adherenceRate
                                  }
                                  %
                                </div>
                              </Col>
                            </Row>
                          ) : (
                            <small className="text-muted">
                              More completed
                              doses are
                              needed before
                              daily
                              highlights can
                              be calculated.
                            </small>
                          )}
                        </CardBody>
                      </Card>
                    </Col>

                    <Col
                      lg="6"
                      md="12"
                    >
                      <Card
                        style={{
                          ...cardStyle,
                          height:
                            "100%",
                          backgroundColor:
                            attentionStyle.backgroundColor,
                        }}
                      >
                        <CardBody className="p-4">
                          <h5
                            style={{
                              color:
                                attentionStyle.titleColor,
                              fontWeight:
                                "700",
                              marginBottom:
                                "14px",
                            }}
                          >
                            {
                              needsAttention.title
                            }
                          </h5>

                          <p
                            style={{
                              color:
                                "#40516a",
                              lineHeight:
                                "1.7",
                              marginBottom:
                                "12px",
                            }}
                          >
                            {
                              needsAttention.message
                            }
                          </p>

                          {reportData.missed >
                            0 && (
                            <small className="text-muted">
                              Use the
                              patterns above
                              to identify
                              when follow-up
                              may be most
                              useful.
                            </small>
                          )}
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </>
              ) : (
                <Card style={cardStyle}>
                  <CardBody className="text-center py-5">
                    <p className="text-muted mb-0">
                      No analytics data
                      is available for
                      this patient yet.
                    </p>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AnalyticsCaregiver;