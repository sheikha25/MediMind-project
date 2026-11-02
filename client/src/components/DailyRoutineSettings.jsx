
import { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateUser } from "../features/UserSlice";
import axios from "axios";

import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const primaryBlue = "#17418C";

const activities = [
  { key: "wake", icon: "⏰" },
  { key: "breakfast", icon: "🌅" },
  { key: "lunch", icon: "☀️" },
  { key: "dinner", icon: "🍽️" },
  { key: "sleep", icon: "🌙" },
];

const initialRoutine = {
  wake: "",
  breakfast: "",
  lunch: "",
  dinner: "",
  sleep: "",
};

const DailyRoutineSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const [language, setLanguage] = useState(() =>
    localStorage.getItem("medimindLanguage") === "ar"
      ? "ar"
      : "en"
  );

  const isArabic = language === "ar";

  const t = (english, arabic) =>
    isArabic ? arabic : english;

  const [dailyRoutine, setDailyRoutine] =
    useState(initialRoutine);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Keep language synchronized with MediMind.
  useEffect(() => {
    const updateLanguage = () => {
      const savedLanguage =
        localStorage.getItem("medimindLanguage") || "en";

      setLanguage(savedLanguage === "ar" ? "ar" : "en");
    };

    window.addEventListener(
      "medimind-language-change",
      updateLanguage
    );

    window.addEventListener("storage", updateLanguage);

    return () => {
      window.removeEventListener(
        "medimind-language-change",
        updateLanguage
      );

      window.removeEventListener("storage", updateLanguage);
    };
  }, []);

  // Load the patient's saved daily routine.
  useEffect(() => {
    if (!user?.dailyRoutine) return;

    const saved = user.dailyRoutine;

    const getSavedTime = (activity) => {
      const value = saved[activity];

      if (typeof value === "string") {
        return value;
      }

      // Support older routine data temporarily.
      if (value && typeof value === "object") {
        return value.start || "";
      }

      return "";
    };

    setDailyRoutine({
      wake: getSavedTime("wake"),
      breakfast: getSavedTime("breakfast"),
      lunch: getSavedTime("lunch"),
      dinner: getSavedTime("dinner"),
      sleep: getSavedTime("sleep"),
    });
  }, [user?.dailyRoutine]);

  const getActivityLabel = (key) => {
    const labels = {
      wake: t("Wake-up Time", "وقت الاستيقاظ"),
      breakfast: t("Breakfast", "الإفطار"),
      lunch: t("Lunch", "الغداء"),
      dinner: t("Dinner", "العشاء"),
      sleep: t("Bedtime", "وقت النوم"),
    };

    return labels[key] || key;
  };

  const recommendedMealTimes = {
    breakfast: t(
      "Recommended: 7:00 AM – 8:00 AM",
      "الوقت المقترح: ٧:٠٠ – ٨:٠٠ صباحًا"
    ),
    lunch: t(
      "Recommended: 12:00 PM – 1:00 PM",
      "الوقت المقترح: ١٢:٠٠ – ١:٠٠ ظهرًا"
    ),
    dinner: t(
      "Recommended: 6:00 PM – 7:00 PM",
      "الوقت المقترح: ٦:٠٠ – ٧:٠٠ مساءً"
    ),
  };

  const updateTime = (activity, value) => {
    setDailyRoutine((previous) => ({
      ...previous,
      [activity]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Validate all five activities.
  const validateRoutine = () => {
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    for (const activity of activities) {
      const time = dailyRoutine[activity.key];

      if (
        typeof time !== "string" ||
        !timePattern.test(time)
      ) {
        return t(
          `Please select a valid time for ${getActivityLabel(activity.key)}.`,
          `يرجى تحديد وقت صحيح لـ ${getActivityLabel(activity.key)}.`
        );
      }
    }

    // Prevent duplicate times.
    const times = activities.map(
      (activity) => dailyRoutine[activity.key]
    );

    if (new Set(times).size !== times.length) {
      return t(
        "Two activities cannot have the same time.",
        "لا يمكن تحديد الوقت نفسه لنشاطين."
      );
    }

    // Standard daytime routine.
    const { wake, breakfast, lunch, dinner, sleep } =
      dailyRoutine;

    if (
      !(
        wake < breakfast &&
        breakfast < lunch &&
        lunch < dinner &&
        dinner < sleep
      )
    ) {
      return t(
        "The correct order is: Wake Up → Breakfast → Lunch → Dinner → Sleep.",
        "الترتيب الصحيح هو: الاستيقاظ ← الإفطار ← الغداء ← العشاء ← النوم."
      );
    }

    return "";
  };

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateRoutine();

    if (validationError) {
      setError(validationError);
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        t(
          "Please log in again.",
          "يرجى تسجيل الدخول مرة أخرى."
        )
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        "http://localhost:3002/patient/daily-routine",
        { dailyRoutine },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(
        updateUser({
          ...user,
          dailyRoutine: response.data.dailyRoutine,
          routineSetupCompleted: true,
          routineSetupDeferred: false,
        })
      );

      setSuccess(
        t(
          "Your daily routine has been updated successfully.",
          "تم تحديث روتينك اليومي بنجاح."
        )
      );
    } catch (err) {
      console.error("Daily routine update error:", err);

      const errorCode = err.response?.data?.errorCode;
      const activity = err.response?.data?.activity;

      const errorMessages = {
        PATIENT_ONLY: t(
          "Only patients can update their daily routine.",
          "يمكن للمرضى فقط تعديل روتينهم اليومي."
        ),

        MISSING_ROUTINE: t(
          "Please enter your daily routine.",
          "يرجى إدخال روتينك اليومي."
        ),

        INVALID_TIME: t(
          `Please enter a valid time for ${getActivityLabel(activity)}.`,
          `يرجى إدخال وقت صحيح لـ ${getActivityLabel(activity)}.`
        ),

        DUPLICATE_TIME: t(
          "Two activities cannot have the same time.",
          "لا يمكن تحديد الوقت نفسه لنشاطين."
        ),

        INVALID_ROUTINE_ORDER: t(
          "The correct order is: Wake Up → Breakfast → Lunch → Dinner → Sleep.",
          "الترتيب الصحيح هو: الاستيقاظ ← الإفطار ← الغداء ← العشاء ← النوم."
        ),

        SAVE_FAILED: t(
          "Unable to save your daily routine.",
          "تعذر حفظ روتينك اليومي."
        ),
      };

      setError(
        errorMessages[errorCode] ||
          t(
            "Unable to update your daily routine. Please try again.",
            "تعذر تحديث روتينك اليومي. يرجى المحاولة مرة أخرى."
          )
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTimeField = (activity) => (
    <div
      key={activity.key}
      style={{
        background: "#FFFFFF",
        border: "1px solid #D9E9FB",
        borderRadius: "18px",
        padding: "22px",
        boxShadow: "0 5px 18px rgba(23,65,140,0.05)",
      }}
    >
      <h5
        style={{
          color: primaryBlue,
          fontWeight: 600,
          marginBottom: "18px",
        }}
      >
        <span style={{ marginInlineEnd: "8px" }}>
          {activity.icon}
        </span>
        {getActivityLabel(activity.key)}
      </h5>

      <label style={{ display: "block" }}>
        <span
          style={{
            display: "block",
            color: "#58759C",
            fontSize: "14px",
            marginBottom: "8px",
            fontWeight: 500,
          }}
        >
          {t("Select Time", "اختر الوقت")}
        </span>

        <input
          type="time"
          required
          dir="ltr"
          className="form-control"
          value={dailyRoutine[activity.key] || ""}
          onChange={(event) =>
            updateTime(activity.key, event.target.value)
          }
          style={{
            minHeight: "48px",
            borderRadius: "10px",
            border: "1px solid #C9DDF5",
            background: "#F8FBFF",
            color: primaryBlue,
            fontSize: "16px",
          }}
        />
      </label>

      {recommendedMealTimes[activity.key] && (
        <p
          style={{
            color: "#58759C",
            fontSize: "13px",
            marginTop: "10px",
            marginBottom: 0,
          }}
        >
          ⏰ {recommendedMealTimes[activity.key]}
        </p>
      )}
    </div>
  );

  return (
    <Container fluid className="dashboard-page">
      <Header />

      <Row
        dir={isArabic ? "rtl" : "ltr"}
        style={{
          display: "flex",
          flexDirection: isArabic ? "row-reverse" : "row",
          alignItems: "flex-start",
        }}
      >
        <Col
          md="2"
          className="settings-sidebar"
          style={{ flexShrink: 0 }}
        >
          <SettingsSidebar />
        </Col>

        <Col md="9">
          <div
            lang={language}
            dir={isArabic ? "rtl" : "ltr"}
            style={{
              minHeight: "100vh",
              background: "#F4F8FF",
              padding: "40px 16px",
              textAlign: isArabic ? "right" : "left",
            }}
          >
            <div
              style={{
                maxWidth: "900px",
                margin: "0 auto",
                background: "#FFFFFF",
                borderRadius: "20px",
                padding: "30px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  color: primaryBlue,
                  marginBottom: "20px",
                }}
              >
                🕒{" "}
                {t(
                  "Daily Routine Settings",
                  "إعدادات الروتين اليومي"
                )}
              </h2>

              <p style={{ color: "#64748B" }}>
                {t(
                  "View and update your usual meal, wake-up, and bedtime schedules.",
                  "يمكنك عرض وتعديل مواعيد وجباتك المعتادة والاستيقاظ والنوم."
                )}
              </p>

              <div
                style={{
                  background: "#EAF4FF",
                  borderRadius: "12px",
                  padding: "16px",
                  color: primaryBlue,
                  marginBottom: "25px",
                  lineHeight: 1.8,
                }}
              >
                <strong>
                  ⏰{" "}
                  {t(
                    "Choose one usual time for each activity.",
                    "اختر وقتًا معتادًا واحدًا لكل نشاط."
                  )}
                </strong>

                <p
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                  }}
                >
                  {t(
                    "Your routine should follow this order: Wake Up → Breakfast → Lunch → Dinner → Sleep. Recommended meal times are guidance only.",
                    "يجب أن يتبع روتينك هذا الترتيب: الاستيقاظ ← الإفطار ← الغداء ← العشاء ← النوم. أوقات الوجبات المقترحة للإرشاد فقط."
                  )}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                    gap: "20px",
                    marginBottom: "25px",
                  }}
                >
                  {activities.map(renderTimeField)}
                </div>

                {error && (
                  <div
                    role="alert"
                    style={{
                      background: "#FFF1F2",
                      color: "#B42318",
                      padding: "14px 18px",
                      borderRadius: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    style={{
                      background: "#EAF7EE",
                      color: "#237A45",
                      padding: "14px 18px",
                      borderRadius: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    background: primaryBlue,
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 30px",
                    fontWeight: 600,
                  }}
                >
                  {loading
                    ? t("Saving...", "جارٍ الحفظ...")
                    : t("Save Changes", "حفظ التغييرات")}
                </button>
              </form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DailyRoutineSettings;
