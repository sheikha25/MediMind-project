import { useEffect, useState } from "react";
import { FiBell, FiVolume2, FiVolumeX } from "react-icons/fi";

const CaregiverNotificationSettings = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem("caregiverNotificationSound") !== "false"
  );

  const isArabic = language === "ar";

  useEffect(() => {
    const syncSettings = () => {
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
      setSoundEnabled(
        localStorage.getItem("caregiverNotificationSound") !== "false"
      );
    };

    const events = [
      "medimind-language-change",
      "medimindLanguageChanged",
      "caregiver-notification-sound-change",
      "storage",
    ];

    events.forEach((event) => window.addEventListener(event, syncSettings));

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, syncSettings)
      );
    };
  }, []);

  const toggleSound = () => {
    const nextValue = !soundEnabled;

    setSoundEnabled(nextValue);
    localStorage.setItem("caregiverNotificationSound", String(nextValue));
    window.dispatchEvent(new Event("caregiver-notification-sound-change"));
  };

  return (
    <section
      className="cg-notification-settings"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .cg-notification-settings {
          --cg-notify-text: #1e3a5f;
          --cg-notify-muted: #64748b;
          --cg-notify-card: #ffffff;
          --cg-notify-border: #dbe5f0;
          --cg-notify-icon: #17418c;
          --cg-notify-status: #475569;

          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          color: var(--cg-notify-text);
          text-align: start;
        }

        body.dark-theme .cg-notification-settings,
        body.dark-mode .cg-notification-settings,
        [data-theme="dark"] .cg-notification-settings {
          --cg-notify-text: #f8fafc;
          --cg-notify-muted: #cbd5e1;
          --cg-notify-card: #203750;
          --cg-notify-border: #405b79;
          --cg-notify-icon: #82b8ff;
          --cg-notify-status: #d1dfef;
        }

        .cg-notification-settings *,
        .cg-notification-settings *::before,
        .cg-notification-settings *::after {
          box-sizing: border-box;
        }

        .cg-notification-settings h2 {
          color: var(--cg-notify-text) !important;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 10px;
        }

        .cg-notification-settings .cg-description {
          color: var(--cg-notify-muted) !important;
          margin: 0 0 25px;
          line-height: 1.6;
        }

        .cg-notification-settings .cg-notification-card {
          width: 100%;
          min-width: 0;
          padding: 25px;
          background: var(--cg-notify-card) !important;
          color: var(--cg-notify-text) !important;
          border: 1px solid var(--cg-notify-border) !important;
          border-radius: 16px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.09);
        }

        .cg-notification-settings .cg-notification-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          min-width: 0;
        }

        .cg-notification-settings .cg-notification-info {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
          flex: 1 1 auto;
        }

        .cg-notification-settings .cg-notification-info > div {
          min-width: 0;
        }

        .cg-notification-settings .cg-notification-icon {
          font-size: 25px;
          color: var(--cg-notify-icon) !important;
          flex-shrink: 0;
        }

        .cg-notification-settings .cg-notification-info h4 {
          color: var(--cg-notify-text) !important;
          margin: 0 0 6px;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.4;
        }

        .cg-notification-settings .cg-notification-info p {
          margin: 0;
          color: var(--cg-notify-muted) !important;
          font-size: 14px;
          line-height: 1.6;
        }

        .cg-notification-settings .cg-sound-toggle {
          width: 54px;
          min-width: 54px;
          height: 30px;
          padding: 0;
          border: none;
          border-radius: 30px;
          background: #94a3b8;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }

        .cg-notification-settings .cg-sound-toggle.enabled {
          background: #3986e8;
        }

        .cg-notification-settings .cg-sound-toggle::after {
          content: "";
          position: absolute;
          top: 4px;
          left: 4px;
          width: 22px;
          height: 22px;
          background: #ffffff;
          border-radius: 50%;
          transition: transform 0.2s ease;
        }

        .cg-notification-settings .cg-sound-toggle.enabled::after {
          transform: translateX(24px);
        }

        .cg-notification-settings .cg-sound-toggle:focus-visible {
          outline: 3px solid #60a5fa;
          outline-offset: 3px;
        }

        .cg-notification-settings .cg-notification-status {
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--cg-notify-status) !important;
          font-size: 14px;
        }

        .cg-notification-settings[dir="rtl"] .cg-sound-toggle::after {
          left: auto;
          right: 4px;
        }

        .cg-notification-settings[dir="rtl"] .cg-sound-toggle.enabled::after {
          transform: translateX(-24px);
        }

        @media (max-width: 600px) {
          .cg-notification-settings h2 { font-size: 24px; }
          .cg-notification-settings .cg-notification-card { padding: 16px; }
          .cg-notification-settings .cg-notification-row { gap: 10px; }
          .cg-notification-settings .cg-notification-info { gap: 9px; }
          .cg-notification-settings .cg-notification-info h4 { font-size: 15px; }
          .cg-notification-settings .cg-notification-info p { font-size: 12px; }
          .cg-notification-settings .cg-notification-icon { font-size: 22px; }
        }
      `}</style>

      <h2>{isArabic ? "الإشعارات" : "Notifications"}</h2>

      <p className="cg-description">
        {isArabic
          ? "تحكم في إعدادات إشعارات مقدم الرعاية."
          : "Manage your caregiver notification preferences."}
      </p>

      <div className="cg-notification-card">
        <div className="cg-notification-row">
          <div className="cg-notification-info">
            <FiBell className="cg-notification-icon" aria-hidden="true" />

            <div>
              <h4>
                {isArabic ? "صوت الإشعارات" : "Notification Sound"}
              </h4>
              <p>
                {isArabic
                  ? "تشغيل أو كتم صوت الإشعارات الجديدة."
                  : "Play or mute the sound of new notifications."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`cg-sound-toggle ${soundEnabled ? "enabled" : ""}`}
            onClick={toggleSound}
            role="switch"
            aria-checked={soundEnabled}
            aria-label={
              isArabic ? "صوت الإشعارات" : "Notification Sound"
            }
          />
        </div>

        <div className="cg-notification-status" role="status" aria-live="polite">
          {soundEnabled ? (
            <FiVolume2 aria-hidden="true" />
          ) : (
            <FiVolumeX aria-hidden="true" />
          )}
          <span>
            {soundEnabled
              ? isArabic
                ? "الصوت مفعّل"
                : "Sound enabled"
              : isArabic
              ? "الصوت مكتوم"
              : "Sound muted"}
          </span>
        </div>
      </div>
    </section>
  );
};

export default CaregiverNotificationSettings;
