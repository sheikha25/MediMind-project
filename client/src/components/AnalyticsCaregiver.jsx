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
import Footer from "./Footer";

const AnalyticsCaregiver = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") === "ar" ? "ar" : "en"
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem("medimind-theme") === "dark" ? "dark" : "light"
  );
  const isArabic = language === "ar";
  const isDark = theme === "dark";

  useEffect(() => {
    const syncPreferences = () => {
      setLanguage(localStorage.getItem("medimindLanguage") === "ar" ? "ar" : "en");
      setTheme(localStorage.getItem("medimind-theme") === "dark" ? "dark" : "light");
    };
    const events = [
      "medimind-language-change", "medimindLanguageChanged",
      "medimind-theme-change", "medimindThemeChanged", "storage"
    ];
    events.forEach((name) => window.addEventListener(name, syncPreferences));
    return () => events.forEach((name) => window.removeEventListener(name, syncPreferences));
  }, []);

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
            (isArabic ? "تعذر تحميل المرضى المرتبطين." : "Unable to load linked patients.")
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
            (isArabic ? "تعذر تحميل تحليلات المريض." : "Unable to load patient analytics.")
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
              isArabic ? ({ Sunday: "الأحد", Monday: "الإثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت" }[day.dayName] || day.dayName) : day.dayName,

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


  const translatePeriod = (period) => {
    if (!isArabic) return period;

    const translations = {
      morning: "الصباح",
      afternoon: "الظهيرة",
      evening: "المساء",
      night: "الليل",
    };

    return translations[period.toLowerCase()] || period;
  };

  const missedTimeData =
    useMemo(() => {
      return Object.entries(
        missedPeriods
      ).map(
        ([period, missed]) => ({
          period: translatePeriod(period),
          missed,
        })
      );
    }, [missedPeriods, isArabic]);

  const doseDistribution =
    useMemo(() => {
      if (!reportData) {
        return [];
      }

      return [
        {
          name: isArabic ? "تم أخذها" : "Taken",
          value:
            reportData.taken || 0,
          color: "#51a77b",
        },
        {
          name: isArabic ? "فائتة" : "Missed",
          value:
            reportData.missed || 0,
          color: "#de6663",
        },
        {
          name: isArabic ? "تم تخطيها" : "Skipped",
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
        return isArabic ? "لم تُسجل جرعات فائتة لهذا المريض خلال الأيام السبعة الماضية." : "No missed doses were recorded for this patient during the last 7 days.";
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
        return isArabic ? `حدثت معظم الجرعات الفائتة خلال ${translatePeriod(highestPeriods[0])}. وقد يكون هذا وقتًا مناسبًا للمتابعة.` : `Most missed doses occurred during the ${highestPeriods[0]}. This may be a useful time for caregiver follow-up.`;
      }

      if (
        highestPeriods.length ===
        2
      ) {
        return isArabic ? `تساوت الجرعات الفائتة خلال ${translatePeriod(highestPeriods[0])} و${translatePeriod(highestPeriods[1])}. قد تفيد التذكيرات الإضافية في هذين الوقتين.` : `Missed doses were equally common during the ${highestPeriods[0]} and ${highestPeriods[1]}. These may be useful times for additional reminders.`;
      }

      return isArabic ? "توزعت الجرعات الفائتة على أوقات مختلفة من اليوم." : "Missed doses were spread across different times of the day.";
    }, [missedPeriods, isArabic]);

  const needsAttention =
    useMemo(() => {
      if (!reportData) {
        return {
          level: "none",

          title:
            (isArabic ? "لا تتوفر تحليلات" : "No analytics available"),

          message:
            (isArabic ? "اختر مريضًا لديه سجل أدوية لعرض مؤشرات المتابعة." : "Select a patient with medication history to view attention indicators."),
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
            (isArabic ? "البيانات غير كافية بعد" : "Not enough data yet"),

          message:
            (isArabic ? "لا توجد جرعات مكتملة كافية لتقييم نمط التزام هذا المريض." : "There are not enough completed doses to assess this patient's adherence pattern."),
        };
      }

      if (
        adherence < 50 ||
        missed >= 3
      ) {
        return {
          level: "high",

          title:
            (isArabic ? "يحتاج إلى متابعة" : "Needs attention"),

          message:
            (isArabic ? "التزام هذا المريض منخفض أو لديه عدة جرعات فائتة هذا الأسبوع. قد تكون المتابعة مفيدة." : "This patient has low adherence or several missed doses this week. A check-in may be helpful."),
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
            (isArabic ? "راقب الالتزام" : "Monitor adherence"),

          message:
            (isArabic ? "فاتت بعض الجرعات أو تم تخطيها هذا الأسبوع. يُنصح باستمرار المتابعة." : "Some doses were missed or skipped this week. Continued monitoring may be helpful."),
        };
      }

      return {
        level: "good",

        title:
          (isArabic ? "الالتزام مستقر" : "Adherence looks stable"),

        message:
          (isArabic ? "حافظ المريض على التزام جيد بالأدوية خلال الأيام السبعة الماضية." : "The patient has maintained strong medication adherence during the last 7 days."),
      };
    }, [
      reportData,
      completedDoseCount,
      isArabic,
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
    border: isDark
      ? "1px solid #40566f"
      : "1px solid #e5e7eb",
    borderRadius: "18px",
    backgroundColor: isDark ? "#192b40" : "#ffffff",
    color: isDark ? "#f8fafc" : "#24364b",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
  };

  const titleStyle = {
    color: isDark ? "#ffffff" : "#1e3a8a",
    fontWeight: "700",
  };

  const tooltipStyle = {
    backgroundColor: isDark ? "#243b53" : "#ffffff",
    color: isDark ? "#f8fafc" : "#24364b",
    border: isDark ? "1px solid #40566f" : "none",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.13)",
  };

  return (

    <Container
      fluid
      className={`dashboard-page caregiver-analytics ${isDark ? "caregiver-analytics-dark" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        paddingLeft: 0,
        paddingRight: 0,
        backgroundColor: "transparent",
      }}
    >

      <CaregiverHeader />

      <style>{`
  .caregiver-analytics-dark .card .text-muted {
    color: #cbd5e1 !important;
  }

  .caregiver-analytics-dark .card label,
  .caregiver-analytics-dark .card strong {
    color: #f8fafc !important;
  }

  .caregiver-analytics-dark .form-select {
    background-color: #243b53 !important;
    color: #ffffff !important;
    border-color: #40566f !important;
  }

  .caregiver-analytics-dark .form-select option {
    background-color: #243b53;
    color: #ffffff;
  }

  .caregiver-analytics-dark .recharts-cartesian-axis-tick-value {
    fill: #e2e8f0 !important;
  }

  .caregiver-analytics-dark .recharts-legend-item-text {
    color: #e2e8f0 !important;
  }

  .caregiver-analytics-dark .recharts-cartesian-grid line {
    stroke: #40566f !important;
  }
`}</style>

      <Row className="py-4 px-3">
        <Col
          lg="11"
          xl="10"
          className="mx-auto"
        >
          <div className="mb-4">
           <h2
  style={{
    color: isDark ? "#ffffff" : "#1e3a8a",
    textShadow: "none",
    fontWeight: "700",
    marginBottom: "5px",
  }}
>{isArabic ? "تحليلات المرضى" : "Patient Analytics"}</h2>


            <p
  className="mb-0"
  style={{
    color: isDark ? "#d5e5ff" : "#405775",
    fontSize: isArabic ? "18px" : "16px",
    fontWeight: "500",
    textShadow: "none",
  }}
>
              {isArabic
                ? "اكتشف أنماط الالتزام بالأدوية لدى مرضاك المرتبطين."
                : "Discover adherence patterns for your linked patients."}
            </p>

          </div>

          {error && (
            <Alert color="danger">
              {error}
            </Alert>
          )}

          {loadingPatients ? (
            <Card style={cardStyle}>
              <CardBody className="text-center py-5">{isArabic ? "جارٍ تحميل المرضى المرتبطين..." : "Loading linked patients..."}</CardBody>
            </Card>
          ) : patients.length ===
            0 ? (
            <Card style={cardStyle}>
              <CardBody className="text-center py-5">
                <h5 style={{ color: "#1e3a8a", fontWeight: "700" }}>
                  {isArabic ? "لا يوجد مرضى مرتبطون بعد" : "No linked patients yet"}
                </h5>

                <p className="text-muted mb-0">{isArabic ? "ستظهر تحليلات المرضى بعد قبول أحد المرضى طلب الربط." : "Patient analytics will appear after a patient accepts your caregiver request."}</p>
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
                      >{isArabic ? "اختر المريض" : "Select Patient"}</label>

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
                  <CardBody className="text-center py-5">{isArabic ? "جارٍ تحميل تحليلات المريض..." : "Loading patient analytics..."}</CardBody>
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
                          >{isArabic ? "اتجاه الالتزام" : "Adherence Trend"}</h5>

                          <p className="text-muted small mb-3">{isArabic ? "كيف تغيّر التزام هذا المريض خلال الأسبوع؟" : "How has this patient's adherence changed this week?"}</p>

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
                                data={trendData}
                                margin={{
                                  top: 10,
                                  right: 20,
                                  left: 15,
                                  bottom: 5,
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
                                  domain={[0, 100]}
                                  ticks={[0, 25, 50, 75, 100]}
                                  width={60}
                                  tickMargin={8}
                                  axisLine={false}
                                  tickLine={false}
                                  tickFormatter={(value) => `${value}%`}
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
                                        ? (isArabic ? "لا توجد جرعات مكتملة" : "No completed doses")
                                        : `${value}%`,
                                      isArabic ? "الالتزام" : "Adherence",
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
                          >{isArabic ? "النمط اليومي" : "Daily Pattern"}</h5>

                          <p className="text-muted small mb-3">{isArabic ? "ماذا حدث لجرعات هذا المريض كل يوم؟" : "What happened with this patient's doses each day?"}</p>

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
                                data={trendData}
                                margin={{
                                  top: 10,
                                  right: 15,
                                  left: 15,
                                  bottom: 5,
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
                                  allowDecimals={false}
                                  width={45}
                                  tickMargin={8}
                                  axisLine={false}
                                  tickLine={false}
                                />

                                <Tooltip
                                  contentStyle={
                                    tooltipStyle
                                  }
                                />

                                <Legend />

                                <Bar
                                  dataKey="taken"
                                  name={isArabic ? "تم أخذها" : "Taken"}
                                  stackId="dose"
                                  fill="#51a77b"
                                  maxBarSize={
                                    32
                                  }
                                />

                                <Bar
                                  dataKey="missed"
                                  name={isArabic ? "فائتة" : "Missed"}
                                  stackId="dose"
                                  fill="#de6663"
                                  maxBarSize={
                                    32
                                  }
                                />

                                <Bar
                                  dataKey="skipped"
                                  name={isArabic ? "تم تخطيها" : "Skipped"}
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
                          >{isArabic ? "حالة الجرعات" : "Dose Status"}</h5>

                          <p className="text-muted small mb-0">{isArabic ? "كيف توزعت جرعات المريض المكتملة؟" : "How were the patient's completed doses distributed?"}</p>

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

                                <small className="text-muted">{isArabic ? "مكتملة" : "Completed"}</small>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-5">
                              <p className="text-muted mb-0">{isArabic ? "لا توجد جرعات مكتملة بعد." : "No completed doses yet."}</p>
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
                          >{isArabic ? "نمط الجرعات الفائتة" : "Missed Dose Pattern"}</h5>

                          <p className="text-muted small mb-2">{isArabic ? "متى يُرجّح أن تفوت جرعات هذا المريض؟" : "When are this patient's missed doses most likely to happen?"}</p>

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
                                  name={isArabic ? "الجرعات الفائتة" : "Missed Doses"}
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
                          backgroundColor: isDark ? "#233955" : "#eef4ff",
                        }}
                      >
                        <CardBody className="p-4">
                          <h5
                            style={{
                              ...titleStyle,
                              marginBottom:
                                "14px",
                            }}
                          >{isArabic ? "ملخص الأسبوع" : "Weekly Insight"}</h5>

                          <p
                            style={{
                              color: isDark ? "#cbd5e1" : "#40516a",
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
                                <small className="text-muted">{isArabic ? "أفضل يوم" : "Best day"}</small>

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
                                <small className="text-muted">{isArabic ? "أقل يوم التزامًا" : "Lowest day"}</small>

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
                            <small className="text-muted">{isArabic ? "نحتاج إلى جرعات مكتملة إضافية لحساب أبرز النتائج اليومية." : "More completed doses are needed before daily highlights can be calculated."}</small>
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
                          backgroundColor: isDark
                            ? "#24364d"
                            : attentionStyle.backgroundColor,
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
                              color: isDark ? "#cbd5e1" : "#40516a",
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
                              <small className="text-muted">{isArabic ? "استخدم الأنماط أعلاه لتحديد أنسب أوقات المتابعة." : "Use the patterns above to identify when follow-up may be most useful."}</small>
                            )}
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </>
              ) : (
                <Card style={cardStyle}>
                  <CardBody className="text-center py-5">
                    <p className="text-muted mb-0">{isArabic ? "لا تتوفر بيانات تحليلية لهذا المريض بعد." : "No analytics data is available for this patient yet."}</p>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </Col>
      </Row>
      <Footer />
    </Container>
  );
};

export default AnalyticsCaregiver;
