
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../features/UserSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const primaryBlue = "#17418C";

const activities = [
  { key: "breakfast", icon: "🌅" },
  { key: "lunch", icon: "☀️" },
  { key: "dinner", icon: "🍽️" },
  { key: "wake", icon: "⏰" },
  { key: "sleep", icon: "🌙" },
];


const initialRoutine = {
  breakfast: "",
  lunch: "",
  dinner: "",
  wake: "",
  sleep: "",
};


const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const DailyRoutineSetup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);

  // Read language from the existing Language Settings page.
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

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep language synchronized with the rest of MediMind.
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

      window.removeEventListener(
        "storage",
        updateLanguage
      );
    };
  }, []);

  
  // Load the patient's saved routine.
  useEffect(() => {
    if (!user?.dailyRoutine) return;

    const saved = user.dailyRoutine;

    const getSavedTime = (activity) => {
      const value = saved[activity];

      // New format: "07:00"
      if (typeof value === "string") {
        return value;
      }

      // Old format: { start: "07:00", end: "08:00" }
      if (value && typeof value === "object") {
        return value.start || "";
      }

      return "";
    };

    setDailyRoutine({
      breakfast: getSavedTime("breakfast"),
      lunch: getSavedTime("lunch"),
      dinner: getSavedTime("dinner"),
      wake: getSavedTime("wake"),
      sleep: getSavedTime("sleep"),
    });
  }, [user?.dailyRoutine]);

  
const mealActivities = activities.slice(0, 3);
const sleepActivities = activities.slice(3);

const visibleActivities =
  currentStep === 1 ? mealActivities : sleepActivities;

const getActivityLabel = (key) => {
  const labels = {
    breakfast: t("Breakfast", "الإفطار"),
    lunch: t("Lunch", "الغداء"),
    dinner: t("Dinner", "العشاء"),
    wake: t("Wake-up Time", "وقت الاستيقاظ"),
    sleep: t("Bedtime", "وقت النوم"),
  };

  return labels[key] || key;
};

const updateTime = (activity, value) => {
  setDailyRoutine((previous) => ({
    ...previous,
    [activity]: value,
  }));

  setError("");
};


  // Validate required fields and time order.

const validateActivities = (items) => {
  const timeFormat = /^([01]\d|2[0-3]):[0-5]\d$/;

  // Rule 1: Every required activity needs a valid time.
  for (const activity of items) {
    const time = dailyRoutine[activity.key];
    const activityName = getActivityLabel(activity.key);

    if (!time || !timeFormat.test(time)) {
      return t(
        `Please select a valid time for ${activityName}.`,
        `يرجى تحديد وقت صحيح لـ ${activityName}.`
      );
    }
  }

  // Step 1: Breakfast must be before lunch,
  // and lunch must be before dinner.
  const checkingMeals = items.some(
    (activity) => activity.key === "breakfast"
  );

  if (checkingMeals) {
    const { breakfast, lunch, dinner } = dailyRoutine;

    if (!(breakfast < lunch && lunch < dinner)) {
      return t(
        "Breakfast must be before lunch, and lunch must be before dinner.",
        "يجب أن يكون الإفطار قبل الغداء، والغداء قبل العشاء."
      );
    }
  }

  // Step 2: Check the complete daily routine.
  const checkingAll = items.length === activities.length;

  if (checkingAll) {
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
  }

  return "";
};


  // Move to the second onboarding step.

const handleNext = () => {
  const validationError = validateActivities(mealActivities);

  if (validationError) {
    setError(validationError);
    return;
  }

  setError("");
  setCurrentStep(2);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};


  const handleBack = () => {
    setError("");
    setCurrentStep(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

 


  // Skip onboarding.
  const handleSkip = async () => {
    setError("");

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

     
await axios.put(
  "http://localhost:3002/patient/daily-routine/skip",
  {
    patientEmail: user.email,
  }
);


      dispatch(
        updateUser({
          ...user,
          routineSetupCompleted: false,
          routineSetupDeferred: true,
        })
      );

      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Daily routine skip error:", err);

      setError(
        t(
          "Unable to skip daily routine setup.",
          "تعذر تخطي إعداد الروتين اليومي."
        )
      );
    } finally {
      setLoading(false);
    }
  };


  // Validate and save to MongoDB.
  
  // Validate and save to MongoDB.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateActivities(activities);

    if (validationError) {
      setError(validationError);

      const invalidActivity = activities.find(
        (activity) => validateActivities([activity]) !== ""
      );

      if (invalidActivity) {
        const isMeal = mealActivities.some(
          (activity) => activity.key === invalidActivity.key
        );

        setCurrentStep(isMeal ? 1 : 2);
      } else {
        setCurrentStep(1);
      }

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

      navigate("/home", { replace: true });
    
} catch (err) {
  console.error("Daily routine save error:", err);

  const errorCode = err.response?.data?.errorCode;
  const activity = err.response?.data?.activity;

  const errorMessages = {
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

    MISSING_ROUTINE: t(
      "Daily routine is required.",
      "يرجى إدخال الروتين اليومي."
    ),
  };

  setError(
    errorMessages[errorCode] ||
      t(
        "Unable to save your daily routine.",
        "تعذر حفظ روتينك اليومي."
      )
  );
} finally {
  setLoading(false);
}

  };

  
  // Recommended meal times (guidance only).
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

  // Render one exact time input per activity.
  const renderTimeFields = (activity) => (
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

 

  
  // First-login onboarding form.
  const routineForm = (
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
        {visibleActivities.map(renderTimeFields)}
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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginTop: "28px",
        }}
      >
        {currentStep === 2 && (
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            style={{
              padding: "13px 30px",
              borderRadius: "12px",
              background: "transparent",
              border: `1px solid ${primaryBlue}`,
              color: primaryBlue,
              fontWeight: 600,
            }}
          >
            {t("← Back", "رجوع →")}
          </button>
        )}

        {currentStep === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            style={{
              minWidth: "190px",
              padding: "13px 35px",
              borderRadius: "12px",
              border: "none",
              background: primaryBlue,
              color: "#FFFFFF",
              fontWeight: 600,
            }}
          >
            {t("Next →", "التالي ←")}
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            style={{
              minWidth: "190px",
              padding: "13px 35px",
              borderRadius: "12px",
              border: "none",
              background: primaryBlue,
              color: "#FFFFFF",
              fontWeight: 600,
            }}
          >
            {loading
              ? t("Saving...", "جارٍ الحفظ...")
              : t("Finish Setup", "إنهاء الإعداد")}
          </button>
        )}
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "22px",
        }}
      >
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: "#58759C",
            textDecoration: "underline",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          {t("Skip for Now", "تخطي الآن")}
        </button>
      </div>
    </form>
  );


  // FIRST-LOGIN ONBOARDING WIZARD
  return (
    <div
      lang={language}
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(145deg, #E8F4FF 0%, #DDEEFF 100%)",
        padding: "35px 20px 55px",
        textAlign: isArabic ? "right" : "left",
      }}
    >
      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
        }}
      >

        {/* Step progress indicator */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              textAlign: "end",
              color: "#58759C",
              fontSize: "14px",
              marginBottom: "12px",
            }}
          >
            {t(
              `Step ${currentStep} of 2`,
              `الخطوة ${currentStep} من 2`
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            {[1, 2].map((step) => (
              <div
                key={step}
                style={{
                  flex: 1,
                  height: "7px",
                  borderRadius: "20px",
                  background:
                    step <= currentStep
                      ? primaryBlue
                      : "#BED8F5",
                  transition:
                    "background 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Step heading */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          <div
            style={{
              width: "78px",
              height: "78px",
              borderRadius: "50%",
              background: "#D1E6FC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "38px",
              margin: "0 auto 20px",
            }}
          >
            {currentStep === 1 ? "🍽️" : "🌙"}
          </div>

          <h1
            style={{
              color: primaryBlue,
              fontWeight: 700,
              fontSize:
                "clamp(25px, 4vw, 34px)",
              marginBottom: "12px",
            }}
          >
            {currentStep === 1
              ? t(
                  "Let's Start With Your Meals",
                  "لنبدأ بمواعيد وجباتك"
                )
              : t(
                  "Now, Let's Talk About your Sleep",
                  "والآن، لنتحدث عن نومك"
                )}
          </h1>

          <p
            style={{
              color: "#58759C",
              fontSize: "16px",
              lineHeight: 1.8,
              maxWidth: "570px",
              margin: "0 auto",
            }}
          >
            {currentStep === 1
              ? t(
                  "Around what time do you usually have breakfast, lunch, and dinner?",
                  "في أي وقت تتناول عادةً وجبة الإفطار والغداء والعشاء؟"
                )
              : t(
                  "When do you usually wake up and go to bed?",
                  "في أي وقت تستيقظ عادةً ومتى تذهب إلى النوم؟"
                )}
          </p>
        </div>

        {/* Helpful information */}
        <div
          style={{
            background: "#D4E8FD",
            border: "1px solid #C4DDF8",
            borderRadius: "14px",
            padding: "17px 22px",
            maxWidth: "750px",
            margin: "0 auto 30px",
            color: primaryBlue,
            textAlign: "center",
            fontSize: "14px",
            lineHeight: 1.8,
          }}
        >
          <strong>
            ⏰{" "}
            {t(
              "Your routine doesn't have to be exact!",
              "ليس من الضروري أن تكون مواعيدك دقيقة تمامًا!"
            )}
          </strong>

          <div>
           
{t(
  "Choose one usual time for each activity. Meal times are recommendations, not strict limits. You can update your routine anytime in Settings.",
  "اختر وقتًا معتادًا واحدًا لكل نشاط. أوقات الوجبات المقترحة هي للإرشاد فقط وليست إلزامية. يمكنك تعديل روتينك في أي وقت من الإعدادات."
)}

          </div>
        </div>

        {/* Activities and navigation */}
        {routineForm}
      </div>
    </div>
  );
};

export default DailyRoutineSetup;
