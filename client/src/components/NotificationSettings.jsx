
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { Card, CardBody, Button } from "reactstrap";
import axios from "axios";
import { updateUser } from "../features/UserSlice";

const NotificationSettings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [uiLanguage, setUiLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = uiLanguage === "ar";
  const t = (en, ar) => (isArabic ? ar : en);

  useEffect(() => {
    const syncLanguage = () => {
      setUiLanguage(
        localStorage.getItem("medimindLanguage") || "en"
      );
    };

    window.addEventListener(
      "medimind-language-change",
      syncLanguage
    );
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener(
        "medimind-language-change",
        syncLanguage
      );
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [soundMuted, setSoundMuted] = useState(
    () =>
      localStorage.getItem("medimindSoundMuted") === "true"
  );

  const [routineMessage, setRoutineMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [savingRoutine, setSavingRoutine] = useState(false);

  useEffect(() => {
    if (!user) return;

    setNotificationsEnabled(
      user.notificationsEnabled !== false
    );
  }, [user]);

  const handleToggleSound = () => {
    const newMuted = !soundMuted;

    setSoundMuted(newMuted);

    localStorage.setItem(
      "medimindSoundMuted",
      String(newMuted)
    );
  };

  const handleSaveRoutine = async () => {
    if (!user?.email) {
      setMessageType("error");
      setRoutineMessage(
        t(
          "Please log in again.",
          "يرجى تسجيل الدخول مجددًا."
        )
      );
      return;
    }

    try {
      setSavingRoutine(true);
      setRoutineMessage("");

      const response = await axios.put(
        "http://localhost:3002/patient/notification-settings",
        {
          patientEmail: user.email,
          notificationsEnabled,
        }
      );

      dispatch(
        updateUser({
          ...user,
          notificationsEnabled:
            response.data.notificationsEnabled,
        })
      );

      setMessageType("success");
      setRoutineMessage(
        t(
          "Notification settings saved successfully.",
          "تم حفظ إعدادات الإشعارات بنجاح."
        )
      );
    } catch (error) {
      console.error("Notification settings error:", error);

      setMessageType("error");
      setRoutineMessage(
        t(
          error.response?.data?.message ||
            "Unable to save notification settings.",
          "تعذر حفظ إعدادات الإشعارات."
        )
      );
    } finally {
      setSavingRoutine(false);
    }
  };

  return (
    <div
      className="notification-settings-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .notification-settings-page {
          --ns-panel: #ffffff;
          --ns-text: #1e293b;
          --ns-muted: #64748b;
          --ns-border: #dce5ef;
          --ns-input: #ffffff;
          --ns-sound-bg: #f4f8ff;
          --ns-icon-bg: #ffffff;
          --ns-icon-color: #17418c;

          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        body.dark-theme .notification-settings-page,
        body.dark-mode .notification-settings-page,
        [data-theme="dark"] .notification-settings-page {
          --ns-panel: #17283a;
          --ns-text: #f1f5f9;
          --ns-muted: #c1cedd;
          --ns-border: #415a73;
          --ns-input: #21374e;
          --ns-sound-bg: #243b55;
          --ns-icon-bg: #314c6a;
          --ns-icon-color: #ffffff;
        }

        .notification-settings-page .ns-title {
          color: var(--ns-text);
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 22px;
        }

        .notification-settings-page .ns-card {
          background: var(--ns-panel);
          color: var(--ns-text);
          border: 1px solid var(--ns-border);
          border-radius: 14px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .notification-settings-page .ns-label {
          display: block;
          font-weight: 600;
          margin-bottom: 9px;
          color: var(--ns-text);
        }

        .notification-settings-page .ns-select {
          background: var(--ns-input);
          color: var(--ns-text);
          border: 1px solid var(--ns-border);
          min-height: 44px;
          border-radius: 9px;
        }

        .notification-settings-page .ns-muted {
          color: var(--ns-muted) !important;
          line-height: 1.7;
        }

        .notification-settings-page .ns-sound-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px;
          background: var(--ns-sound-bg);
          border: 1px solid var(--ns-border);
          border-radius: 12px;
        }

        .notification-settings-page .ns-sound-title {
          color: var(--ns-text);
          font-weight: 600;
        }

        .notification-settings-page .ns-sound-button {
          background: var(--ns-icon-bg);
          color: var(--ns-icon-color);
          border: 1px solid var(--ns-border);
          border-radius: 10px;
          font-size: 25px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
        }

        .notification-settings-page .ns-sound-button:hover {
          opacity: 0.85;
        }

        .notification-settings-page[dir="rtl"] {
          text-align: right;
        }

        .notification-settings-page[dir="rtl"] .ns-select {
          text-align: right;
        }

        @media (max-width: 768px) {
          .notification-settings-page .ns-title {
            font-size: 24px;
          }
        }
      `}</style>

      <h2 className="ns-title">
        {t("Notification Settings", "إعدادات الإشعارات")}
      </h2>

      <Card className="ns-card">
        <CardBody>
          <label className="ns-label">
            {t("Notifications", "الإشعارات")}
          </label>

          <select
            className="form-control ns-select mb-2"
            value={
              notificationsEnabled ? "enabled" : "disabled"
            }
            onChange={(event) => {
              setNotificationsEnabled(
                event.target.value === "enabled"
              );
              setRoutineMessage("");
            }}
          >
            <option value="enabled">
              {t(
                "Enable Notifications",
                "تفعيل الإشعارات"
              )}
            </option>

            <option value="disabled">
              {t(
                "Disable Notifications",
                "تعطيل الإشعارات"
              )}
            </option>
          </select>

          <small className="ns-muted d-block mb-4">
            {t(
              "When disabled, medication reminder notifications will not be shown. Your medication schedule and dose records will continue to be tracked.",
              "عند تعطيل الإشعارات، لن تظهر إشعارات التذكير بالأدوية. سيستمر النظام في تتبع جدول الأدوية وسجلات الجرعات."
            )}
          </small>

          <div className="ns-sound-box mb-4">
            <div>
              <h6 className="ns-sound-title mb-1">
                {t(
                  "Notification Sound",
                  "صوت الإشعارات"
                )}
              </h6>

              <small className="ns-muted">
                {soundMuted
                  ? t("Sound is muted", "الصوت مكتوم")
                  : t("Sound is enabled", "الصوت مفعّل")}
              </small>
            </div>

            <button
              type="button"
              className="ns-sound-button"
              onClick={handleToggleSound}
              aria-label={
                soundMuted
                  ? t("Unmute sound", "إلغاء كتم الصوت")
                  : t("Mute sound", "كتم الصوت")
              }
              title={
                soundMuted
                  ? t("Unmute sound", "إلغاء كتم الصوت")
                  : t("Mute sound", "كتم الصوت")
              }
            >
              {soundMuted ? <FiVolumeX /> : <FiVolume2 />}
            </button>
          </div>

          {routineMessage && (
            <div
              className={`alert mt-3 ${
                messageType === "success"
                  ? "alert-success"
                  : "alert-danger"
              }`}
              role="status"
            >
              {routineMessage}
            </div>
          )}

          <Button
            color="primary"
            type="button"
            className="w-100"
            onClick={handleSaveRoutine}
            disabled={savingRoutine}
          >
            {savingRoutine
              ? t("Saving...", "جارٍ الحفظ...")
              : t("Save Changes", "حفظ التغييرات")}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default NotificationSettings;
