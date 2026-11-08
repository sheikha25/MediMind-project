import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
} from "reactstrap";

import { useSelector } from "react-redux";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Header from "./Header";
import Footer from "./Footer";

const medicationTips = [
  "Try linking your medication to a regular daily habit, such as breakfast or brushing your teeth.",
  "Set a reminder a little before your usual medication time.",
  "Keep your medication in a visible and safe place, when appropriate.",
  "Use a pill organizer if you take several medications during the day.",
  "If you keep missing doses, consider discussing your routine with your pharmacist or doctor.",
];

const arabicDays = {
  Sun: "الأحد", Mon: "الاثنين", Tue: "الثلاثاء", Wed: "الأربعاء",
  Thu: "الخميس", Fri: "الجمعة", Sat: "السبت",
  Sunday: "الأحد", Monday: "الاثنين", Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت",
};
const arabicPeriods = {
  Morning: "الصباح", Afternoon: "بعد الظهر", Evening: "المساء", Night: "الليل",
};
const arabicTips = [
  "حاولي ربط تناول الدواء بعادة يومية، مثل الإفطار أو تنظيف الأسنان.",
  "اضبطي تذكيرًا قبل موعد الدواء المعتاد بقليل.",
  "احتفظي بالدواء في مكان واضح وآمن عندما يكون ذلك مناسبًا.",
  "استخدمي منظم الحبوب إذا كنتِ تتناولين عدة أدوية خلال اليوم.",
  "إذا تكرر نسيان الجرعات، ناقشي روتينك مع الصيدلي أو الطبيب.",
];

const Analytics = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );
  const isArabic = language === "ar";
  const t = (english, arabic) => isArabic ? arabic : english;
  const dayLabel = (name) => isArabic ? (arabicDays[name] || name) : name;
  const periodLabel = (name) => isArabic ? (arabicPeriods[name] || name) : name;
  const statusLabel = (name) => t(name, ({
    Taken: "تم التناول", Missed: "فائتة", Skipped: "تم التخطي",
  })[name] || name);

  useEffect(() => {
    const onLanguageChange = () => setLanguage(localStorage.getItem("medimindLanguage") || "en");
    window.addEventListener("medimind-language-change", onLanguageChange);
    return () => window.removeEventListener("medimind-language-change", onLanguageChange);
  }, []);

  const user = useSelector(
    (state) => state.user.user
  );

  const [weeklyReport, setWeeklyReport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [medicationTipIndex] = useState(() => {
    const randomIndex = Math.floor(
      Math.random() * medicationTips.length
    );

    return randomIndex;
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.email) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:3002/patient/weekly-report/${encodeURIComponent(
            user.email
          )}`
        );

        setWeeklyReport(
          response.data?.report || null
        );
      } catch (error) {
        console.error(
          "Analytics fetch error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.email]);

  const medicationTip = isArabic
    ? arabicTips[medicationTipIndex]
    : medicationTips[medicationTipIndex];

  const trendData = useMemo(() => {
    if (
      !weeklyReport?.dailyBreakdown?.length
    ) {
      return [];
    }

    return weeklyReport.dailyBreakdown.map(
      (day) => {
        const completed =
          (day.taken || 0) +
          (day.missed || 0) +
          (day.skipped || 0);

        return {
          day: day.dayName,

          adherence:
            completed > 0
              ? day.adherenceRate
              : null,

          taken: day.taken || 0,
          missed: day.missed || 0,
          skipped: day.skipped || 0,
        };
      }
    );
  }, [weeklyReport]);

  const validDays = useMemo(() => {
    if (
      !weeklyReport?.dailyBreakdown?.length
    ) {
      return [];
    }

    return weeklyReport.dailyBreakdown.filter(
      (day) =>
        (day.taken || 0) +
        (day.missed || 0) +
        (day.skipped || 0) >
        0
    );
  }, [weeklyReport]);

  const bestDay = useMemo(() => {
    if (!validDays.length) {
      return null;
    }

    return [...validDays].sort(
      (a, b) =>
        b.adherenceRate -
        a.adherenceRate
    )[0];
  }, [validDays]);

  const lowestDay = useMemo(() => {
    if (!validDays.length) {
      return null;
    }

    return [...validDays].sort(
      (a, b) =>
        a.adherenceRate -
        b.adherenceRate
    )[0];
  }, [validDays]);

  const missedPeriods = useMemo(() => {
    const periods = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Night: 0,
    };

    if (!weeklyReport?.doses?.length) {
      return periods;
    }

    weeklyReport.doses
      .filter(
        (dose) =>
          dose.status === "Missed"
      )
      .forEach((dose) => {
        if (!dose.scheduledTime) {
          return;
        }

        const hour = Number(
          dose.scheduledTime.split(":")[0]
        );

        if (hour >= 5 && hour < 12) {
          periods.Morning += 1;
        } else if (
          hour >= 12 &&
          hour < 17
        ) {
          periods.Afternoon += 1;
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
  }, [weeklyReport]);

  const missedTimeData = useMemo(() => {
    return Object.entries(
      missedPeriods
    ).map(([period, missed]) => ({
      period,
      missed,
    }));
  }, [missedPeriods]);

  const doseDistribution = useMemo(() => {
    if (!weeklyReport) {
      return [];
    }

    return [
      {
        name: "Taken",
        value: weeklyReport.taken || 0,
        color: "#51a77b",
      },
      {
        name: "Missed",
        value: weeklyReport.missed || 0,
        color: "#de6663",
      },
      {
        name: "Skipped",
        value: weeklyReport.skipped || 0,
        color: "#e6ad48",
      },
    ];
  }, [weeklyReport]);

  const translatedTrendData = useMemo(() => trendData.map((item) => ({
    ...item, day: dayLabel(item.day),
  })), [trendData, isArabic]);

  const translatedMissedTimeData = useMemo(() => missedTimeData.map((item) => ({
    ...item, period: periodLabel(item.period),
  })), [missedTimeData, isArabic]);

  const translatedDoseDistribution = useMemo(() => doseDistribution.map((item) => ({
    ...item, name: statusLabel(item.name),
  })), [doseDistribution, isArabic]);

  const completedDoseCount = useMemo(() => {
    return doseDistribution.reduce(
      (total, item) =>
        total + item.value,
      0
    );
  }, [doseDistribution]);

  const weeklyInsight = useMemo(() => {
    const entries =
      Object.entries(missedPeriods);

    const totalMissed =
      entries.reduce(
        (total, [, count]) =>
          total + count,
        0
      );

    if (totalMissed === 0) {
      return "No missed-dose pattern was detected this week.";
    }

    const highestCount = Math.max(
      ...entries.map(
        ([, count]) => count
      )
    );

    const highestPeriods =
      entries
        .filter(
          ([, count]) =>
            count === highestCount
        )
        .map(
          ([period]) =>
            period.toLowerCase()
        );

    if (
      highestPeriods.length === 1
    ) {
      return `Your missed doses occurred most often during the ${highestPeriods[0]}.`;
    }

    if (
      highestPeriods.length === 2
    ) {
      return `Your missed doses were equally common during the ${highestPeriods[0]} and ${highestPeriods[1]}.`;
    }

    return "Your missed doses were spread across different times of the day.";
  }, [missedPeriods]);

  const medicationPattern = useMemo(() => {
    if (!weeklyReport?.doses?.length) {
      return null;
    }

    const missedDoses =
      weeklyReport.doses.filter(
        (dose) =>
          dose.status === "Missed"
      );

    if (!missedDoses.length) {
      return null;
    }

    const medications = {};

    missedDoses.forEach((dose) => {
      const name =
        dose.medicationName ||
        "Medication";

      if (!medications[name]) {
        medications[name] = {
          name,
          dosage: dose.dosage || "",
          count: 0,

          periods: {
            Morning: 0,
            Afternoon: 0,
            Evening: 0,
            Night: 0,
          },
        };
      }

      medications[name].count += 1;

      if (!dose.scheduledTime) {
        return;
      }

      const hour = Number(
        dose.scheduledTime.split(":")[0]
      );

      if (hour >= 5 && hour < 12) {
        medications[
          name
        ].periods.Morning += 1;
      } else if (
        hour >= 12 &&
        hour < 17
      ) {
        medications[
          name
        ].periods.Afternoon += 1;
      } else if (
        hour >= 17 &&
        hour < 21
      ) {
        medications[
          name
        ].periods.Evening += 1;
      } else {
        medications[
          name
        ].periods.Night += 1;
      }
    });

    const medication =
      Object.values(
        medications
      ).sort(
        (a, b) =>
          b.count - a.count
      )[0];

    if (
      !medication ||
      medication.count < 2
    ) {
      return null;
    }

    const periodEntries =
      Object.entries(
        medication.periods
      );

    const highestCount =
      Math.max(
        ...periodEntries.map(
          ([, count]) => count
        )
      );

    const mainPeriods =
      periodEntries
        .filter(
          ([, count]) =>
            count === highestCount &&
            count > 0
        )
        .map(
          ([period]) =>
            period.toLowerCase()
        );

    let periodText = "";

    if (mainPeriods.length === 1) {
      periodText =
        mainPeriods[0];
    } else if (
      mainPeriods.length === 2
    ) {
      periodText =
        `${mainPeriods[0]} and ${mainPeriods[1]}`;
    } else if (
      mainPeriods.length > 2
    ) {
      periodText =
        "different times of the day";
    }

    return {
      ...medication,
      periodText,
    };
  }, [weeklyReport]);

  const localizedWeeklyInsight = useMemo(() => {
    if (!isArabic) return weeklyInsight;
    const entries = Object.entries(missedPeriods);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    if (!total) return "لم يُكتشف نمط لتفويت الجرعات هذا الأسبوع.";
    const max = Math.max(...entries.map(([, count]) => count));
    const periods = entries.filter(([, count]) => count === max)
      .map(([period]) => arabicPeriods[period]);
    if (periods.length === 1) return `حدثت معظم الجرعات الفائتة خلال ${periods[0]}.`;
    if (periods.length === 2) return `تساوت الجرعات الفائتة خلال ${periods[0]} و${periods[1]}.`;
    return "توزعت الجرعات الفائتة على أوقات مختلفة من اليوم.";
  }, [isArabic, weeklyInsight, missedPeriods]);

  const localizedMedicationPeriod = (periodText) => {
    if (!isArabic || !periodText) return periodText;
    if (periodText === "different times of the day") return "أوقات مختلفة من اليوم";
    return periodText.replace(/morning|afternoon|evening|night/gi,
      (period) => arabicPeriods[period.charAt(0).toUpperCase() + period.slice(1)] || period)
      .replace(/ and /g, " و");
  };

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
      className={`dashboard-page analytics-page ${isArabic ? "analytics-ar" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        backgroundColor: "#f7f9fc",
        minHeight: "100vh",
      }}
    >
      <Header />
      <style>{`
        .analytics-page { background: #f7f9fc !important; }
        .analytics-page h2 { font-size: 36px; }
        .analytics-page h5 { font-size: 23px; }
        .analytics-page p { font-size: 17px; }
        .analytics-page .card { color: #24354d; }
        .analytics-page .recharts-text, .analytics-page .recharts-legend-item-text { font-size: 14px; }
        .analytics-ar { text-align: right; font-family: Tahoma, Arial, sans-serif; }
        .analytics-ar .recharts-wrapper { direction: ltr; }
        .analytics-ar .recharts-legend-wrapper { direction: rtl; }
        body.dark-theme .analytics-page { background: transparent !important; }
        body.dark-theme .analytics-page .card {
          background: #17283a !important; color: #f1f5f9 !important;
          border: 1px solid #304358 !important;
        }
        body.dark-theme .analytics-page h2,
        body.dark-theme .analytics-page h5,
        body.dark-theme .analytics-page .card strong { color: #e2ecff !important; }
        body.dark-theme .analytics-page p,
        body.dark-theme .analytics-page .text-muted,
        body.dark-theme .analytics-page small { color: #c4d0e0 !important; }
        body.dark-theme .analytics-page .recharts-cartesian-axis-tick-value,
        body.dark-theme .analytics-page .recharts-legend-item-text { fill: #e2e8f0 !important; color: #e2e8f0 !important; }
        body.dark-theme .analytics-page .recharts-cartesian-grid line { stroke: #34485f !important; }
        body.dark-theme .analytics-page .recharts-default-tooltip {
          background: #22374d !important; border: 1px solid #456078 !important;
        }
        body.dark-theme .analytics-page .recharts-tooltip-item,
        body.dark-theme .analytics-page .recharts-tooltip-label { color: #f1f5f9 !important; }
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
                color: "#1e3a8a",
                fontWeight: "700",
                marginBottom: "5px",
              }}
            >
              {t("Analytics", "التحليلات")}
            </h2>

            <p className="text-muted mb-0">
              {t("Discover patterns in your medication adherence.", "اكتشف أنماط الالتزام بتناول أدويتك.")}
            </p>
          </div>

          {loading ? (
            <Card style={cardStyle}>
              <CardBody className="text-center py-5">
                {t("Loading analytics...", "جارٍ تحميل التحليلات...")}
              </CardBody>
            </Card>
          ) : error ? (
            <div className="alert alert-danger">
              {error}
            </div>
          ) : weeklyReport ? (
            <>
              <Row className="g-4 mb-4">
                <Col lg="6" md="12">
                  <Card
                    style={{
                      ...cardStyle,
                      height: "100%",
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
                        {t("Adherence Trend", "اتجاه الالتزام")}
                      </h5>

                      <p className="text-muted small mb-3">
                        {t("How has your adherence changed this week?", "كيف تغير التزامك خلال هذا الأسبوع؟")}
                      </p>

                      <div
                        style={{
                          width: "100%",
                          height: "250px",
                        }}
                      >
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >
                          <AreaChart
                            data={translatedTrendData}
                            margin={{
                              top: 10,
                              right: 20,
                              left: 15,
                              bottom: 5,
                            }}
                          >
                            <defs>
                              <linearGradient
                                id="adherenceFill"
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
                              width={55}
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
                                    ? t("No completed doses", "لا توجد جرعات مكتملة")
                                    : `${value}%`,
                                  t("Adherence", "الالتزام"),
                                ]}
                            />

                            <Area
                              type="monotone"
                              dataKey="adherence"
                              stroke="#3f7fc9"
                              strokeWidth={
                                3
                              }
                              fill="url(#adherenceFill)"
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

                <Col lg="6" md="12">
                  <Card
                    style={{
                      ...cardStyle,
                      height: "100%",
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
                        {t("Daily Pattern", "النمط اليومي")}
                      </h5>

                      <p className="text-muted small mb-3">
                        {t("What happened with your doses each day?", "ما حالة جرعاتك في كل يوم؟")}
                      </p>

                      <div
                        style={{
                          width: "100%",
                          height: "250px",
                        }}
                      >
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >
                          <BarChart
                            data={translatedTrendData}
                            margin={{
                              top: 10,
                              right: 15,
                              left: 10,
                              bottom: 0,
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
                              width={35}
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
                              name={t("Taken", "تم التناول")}
                              stackId="dose"
                              fill="#51a77b"
                              maxBarSize={
                                32
                              }
                            />

                            <Bar
                              dataKey="missed"
                              name={t("Missed", "فائتة")}
                              stackId="dose"
                              fill="#de6663"
                              maxBarSize={
                                32
                              }
                            />

                            <Bar
                              dataKey="skipped"
                              name={t("Skipped", "تم التخطي")}
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
                <Col lg="6" md="12">
                  <Card
                    style={{
                      ...cardStyle,
                      height: "100%",
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
                        {t("Dose Status", "حالة الجرعات")}
                      </h5>

                      <p className="text-muted small mb-0">
                        {t("How were your completed doses distributed?", "كيف توزعت الجرعات المكتملة؟")}
                      </p>

                      {completedDoseCount >
                        0 ? (
                        <div
                          style={{
                            width: "100%",
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
                                data={translatedDoseDistribution}
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
                              top: "44%",
                              left: "50%",
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
                              {t("Completed", "مكتملة")}
                            </small>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <p className="text-muted mb-0">
                            {t("No completed doses yet.", "لا توجد جرعات مكتملة حتى الآن.")}
                          </p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Col>

                <Col lg="6" md="12">
                  <Card
                    style={{
                      ...cardStyle,
                      height: "100%",
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
                        {t("Missed Dose Pattern", "نمط الجرعات الفائتة")}
                      </h5>

                      <p className="text-muted small mb-2">
                        {t("When are missed doses most likely to happen?", "في أي وقت يُحتمل تفويت الجرعات أكثر؟")}
                      </p>

                      <div
                        style={{
                          width: "100%",
                          height: "260px",
                        }}
                      >
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >
                          <BarChart
                            layout="vertical"
                            data={translatedMissedTimeData}
                            margin={{
                              top: 10,
                              right: 25,
                              left: 5,
                              bottom: 5,
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
                              width={80}
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
                              name={t("Missed Doses", "الجرعات الفائتة")}
                              fill="#6c8fc2"
                              barSize={20}
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
                <Col lg="6" md="12">
                  <Card
                    style={{
                      ...cardStyle,
                      height: "100%",
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
                        {t("Weekly Insight", "ملخص الأسبوع")}
                      </h5>

                      <p
                        style={{
                          color:
                            "#40516a",
                          lineHeight:
                            "1.7",
                        }}
                      >
                        {localizedWeeklyInsight}
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
                              {t("Best day", "أفضل يوم")}
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
                                dayLabel(bestDay.dayName)
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
                              {t("Lowest day", "أقل يوم التزامًا")}
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
                                dayLabel(lowestDay.dayName)
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
                          {t("More completed doses are needed before daily highlights can be calculated.", "نحتاج إلى المزيد من الجرعات المكتملة لحساب أفضل الأيام وأقلها التزامًا.")}
                        </small>
                      )}
                    </CardBody>
                  </Card>
                </Col>

                <Col lg="6" md="12">
                  <Card
                    style={{
                      ...cardStyle,
                      height: "100%",
                      backgroundColor:
                        medicationPattern
                          ? "#fffaf0"
                          : "#f8fafc",
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
                        {t("Medication Insight", "ملاحظات حول الأدوية")}
                      </h5>

                      {medicationPattern ? (
                        <>
                          <p
                            style={{
                              color:
                                "#40516a",
                              lineHeight:
                                "1.7",
                              marginBottom:
                                "14px",
                            }}
                          >
                            {isArabic ? (
                              <>
                                فاتتك جرعات من <strong>{medicationPattern.name}{medicationPattern.dosage ? ` ${medicationPattern.dosage}` : ""}</strong>{" "}
                                <strong>{medicationPattern.count} مرات</strong> هذا الأسبوع
                                {medicationPattern.periodText
                                  ? `، غالبًا خلال ${localizedMedicationPeriod(medicationPattern.periodText)}`
                                  : ""}.
                              </>
                            ) : (
                              <>
                                You missed <strong>{medicationPattern.name}{medicationPattern.dosage ? ` ${medicationPattern.dosage}` : ""}</strong>{" "}
                                <strong>{medicationPattern.count} times</strong> this week
                                {medicationPattern.periodText
                                  ? `, mostly in the ${medicationPattern.periodText}`
                                  : ""}.
                              </>
                            )}
                          </p>

                          <p className="small mb-2">
                            <strong
                              style={{
                                color:
                                  "#1e3a8a",
                              }}
                            >
                              {t("Why consistency matters:", "لماذا الانتظام مهم؟")}
                            </strong>{" "}

                            {t("Taking medication regularly helps treatment work as intended.", "يساعد الانتظام في تناول الدواء على تحقيق الفائدة المرجوة من العلاج.")}
                          </p>

                          <p className="small mb-0">
                            <strong
                              style={{
                                color:
                                  "#1e3a8a",
                              }}
                            >
                              {t("Tip:", "نصيحة:")}
                            </strong>{" "}

                            {medicationTip}
                          </p>
                        </>
                      ) : (
                        <>
                          <strong
                            style={{
                              color:
                                "#198754",
                            }}
                          >
                            {t("No repeated missed-medication pattern detected.", "لم يُكتشف نمط متكرر لتفويت دواء معين.")}
                          </strong>

                          <p className="text-muted small mt-2 mb-0">
                            {t("An insight will appear when the same medication is missed repeatedly.", "ستظهر ملاحظة عند تفويت الدواء نفسه بشكل متكرر.")}
                          </p>
                        </>
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Card style={cardStyle}>
              <CardBody className="text-center py-5">
                {t("No analytics data is available yet.", "لا تتوفر بيانات تحليلية حتى الآن.")}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>

      <Footer />
    </Container>
  );
};

export default Analytics;
