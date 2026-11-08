
import { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../features/UserSlice";
import axios from "axios";


const primaryBlue = "var(--dr-accent)";

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

  const [showSleepWarning, setShowSleepWarning] = useState(false);
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

  
  // Calculate the time between bedtime and next wake-up.
  const getSleepDurationHours = () => {
    const toMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const bedtime = toMinutes(dailyRoutine.sleep);
    const wakeTime = toMinutes(dailyRoutine.wake);

    const durationMinutes =
      (wakeTime - bedtime + 1440) % 1440;

    return durationMinutes / 60;
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

    
    // Allow bedtime after midnight.
    const { wake, breakfast, lunch, dinner, sleep } =
      dailyRoutine;

    const daytimeOrderIsValid =
      wake < breakfast &&
      breakfast < lunch &&
      lunch < dinner;

    const bedtimeIsValid =
      sleep > dinner || sleep < wake;

    if (!daytimeOrderIsValid || !bedtimeIsValid) {
      return t(
        "The correct order is: Wake Up → Breakfast → Lunch → Dinner → Sleep.",
        "الترتيب الصحيح هو: الاستيقاظ ← الإفطار ← الغداء ← العشاء ← النوم."
      );
    }

    return "";
  };

  
  // Get recommended daily sleep hours based on patient age.
  const getSleepRecommendation = () => {
    const age = Number(user?.age);

    if (
      user?.age === undefined ||
      user?.age === null ||
      user?.age === "" ||
      !Number.isFinite(age) ||
      !Number.isInteger(age) ||
      age < 1
    ) {
      return null;
    }

    if (age <= 2) return { min: 11, max: 14 };
    if (age <= 5) return { min: 10, max: 13 };
    if (age <= 12) return { min: 9, max: 12 };
    if (age <= 17) return { min: 8, max: 10 };
    if (age <= 60) return { min: 7, max: null };
    if (age <= 64) return { min: 7, max: 9 };

    return { min: 7, max: 8 };
  };

  const handleSubmit = async (event, skipSleepWarning = false) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateRoutine();

    if (validationError) {
      setError(validationError);
      return;
    }

    // Check whether the patient's sleep window is too short.
const sleepRecommendation = getSleepRecommendation();
const sleepHours = getSleepDurationHours();


const isInfant =
  user?.age === 0 || user?.age === "0";

if (
  !skipSleepWarning &&
  !isInfant &&
  (
    (sleepRecommendation &&
      sleepHours < sleepRecommendation.min) ||
    (!sleepRecommendation && sleepHours < 7)
  )
) {
  setShowSleepWarning(true);
  return;
}



if (!user?.email) {
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
  {
    patientEmail: user.email,
    dailyRoutine,
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
      className="dr-time-card"
      style={{
        background: "var(--dr-card)",
        border: "1px solid var(--dr-border)",
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
            color: "var(--dr-muted)",
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
            border: "1px solid var(--dr-border)",
            background: "var(--dr-input)",
            color: "var(--dr-text)",
            fontSize: "16px",
          }}
        />
      </label>

      {recommendedMealTimes[activity.key] && (
        <p
          style={{
            color: "var(--dr-muted)",
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
    <div className="daily-routine-settings" dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        .daily-routine-settings {
          --dr-page: #f4f8ff;
          --dr-card: #ffffff;
          --dr-info: #eaf4ff;
          --dr-input: #f8fbff;
          --dr-text: #1e293b;
          --dr-muted: #58759c;
          --dr-accent: #17418c;
          --dr-border: #d9e9fb;
        }
        body.dark-theme .daily-routine-settings,
        body.dark-mode .daily-routine-settings,
        [data-theme="dark"] .daily-routine-settings {
          --dr-page: #102033;
          --dr-card: #17283a;
          --dr-info: #243b55;
          --dr-input: #21374e;
          --dr-text: #f1f5f9;
          --dr-muted: #c1cedd;
          --dr-accent: #83b8ff;
          --dr-border: #415a73;
        }
        .daily-routine-settings .dr-panel,
        .daily-routine-settings .dr-time-card,
        .daily-routine-settings .dr-dialog { color: var(--dr-text); }
        .daily-routine-settings input[type="time"] { color-scheme: light; }
        body.dark-theme .daily-routine-settings input[type="time"],
        body.dark-mode .daily-routine-settings input[type="time"],
        [data-theme="dark"] .daily-routine-settings input[type="time"] { color-scheme: dark; }
        .daily-routine-settings input[type="time"]:focus { border-color: var(--dr-accent); }
        .daily-routine-settings .dr-save { background: #17418c !important; color: white !important; }
        .daily-routine-settings .dr-dialog p { color: var(--dr-text); }
      `}</style>
          <div
            lang={language}
            dir={isArabic ? "rtl" : "ltr"}
            style={{
              minHeight: "auto",
              padding: "0",
              textAlign: isArabic ? "right" : "left",
            }}
          >
            <div
              className="dr-panel"
              style={{
                maxWidth: "900px",
                margin: "0 auto",
                background: "var(--dr-card)",
                borderRadius: "20px",
                padding: "30px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  color: "var(--dr-text)",
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
                  background: "var(--dr-info)",
                  borderRadius: "12px",
                  padding: "16px",
                  color: "var(--dr-text)",
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
                  className="btn btn-primary dr-save"
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

      
{showSleepWarning && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sleep-warning-title"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "28px",
        maxWidth: "450px",
        width: "100%",
        boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
      }}
    >
      <h4
        id="sleep-warning-title"
        style={{ color: "var(--dr-text)", marginBottom: "15px" }}
      >
        🌙 {t("Sleep Duration Warning", "تنبيه بشأن مدة النوم")}
      </h4>

      <p>
        {t(
          `Your schedule allows approximately ${getSleepDurationHours().toFixed(1)} hours between bedtime and wake-up.`,
          `يوفر جدولك حوالي ${getSleepDurationHours().toFixed(1)} ساعة بين وقت النوم والاستيقاظ.`
        )}
      </p>


{getSleepRecommendation() ? (
  <p>
    {t(
      `The recommended daily sleep duration for your age is ${getSleepRecommendation().min} ${
        getSleepRecommendation().max
          ? `to ${getSleepRecommendation().max}`
          : "or more"
      } hours.`,
      `مدة النوم اليومية الموصى بها لعمرك هي ${
        getSleepRecommendation().min
      } ${
        getSleepRecommendation().max
          ? `إلى ${getSleepRecommendation().max}`
          : "أو أكثر"
      } ساعات.`
    )}
  </p>
) : (
  <p>
    {t(
      "Your age is not provided. Sleep needs vary by age. Please update your age in Profile Settings to receive a personalized sleep recommendation.",
      "لم يتم تحديد عمرك. تختلف احتياجات النوم حسب العمر. يرجى تحديث عمرك في إعدادات الملف الشخصي للحصول على توصية نوم مناسبة لعمرك."
    )}
  </p>
)}


      <p style={{ color: "var(--dr-muted)", fontSize: "14px" }}>
        {t(
          "Insufficient sleep may affect concentration, mood, and overall health. For young children, daily sleep recommendations include naps.",
          "قلة النوم قد تؤثر على التركيز والمزاج والصحة العامة. بالنسبة للأطفال الصغار، تشمل توصيات النوم اليومية القيلولة."
        )}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "24px",
          flexWrap: "wrap",
        }}
      >
        <Button
          color="secondary"
          outline
          onClick={() => setShowSleepWarning(false)}
        >
          {t("Adjust Schedule", "تعديل الجدول")}
        </Button>

        <Button
          color="primary"
          onClick={async () => {
            setShowSleepWarning(false);
            await handleSubmit(
              { preventDefault: () => {} },
              true
            );
          }}
        >
          {t("Save Anyway", "حفظ على أي حال")}
        </Button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default DailyRoutineSettings;
