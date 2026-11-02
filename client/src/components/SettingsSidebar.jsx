
import {FiUser,FiBell,FiClock,FiGlobe,FiMoon,FiShield,FiInfo,FiMessageSquare,} from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SettingsSidebar = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = language === "ar";

  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
    };

    window.addEventListener("medimind-language-change", updateLanguage);
    window.addEventListener("storage", updateLanguage);

    return () => {
      window.removeEventListener("medimind-language-change", updateLanguage);
      window.removeEventListener("storage", updateLanguage);
    };
  }, []);

  const t = (english, arabic) =>
    isArabic ? arabic : english;

  return (
  <div
    className="settings-sidebar"
    dir={isArabic ? "rtl" : "ltr"}
    style={{
      textAlign: isArabic ? "right" : "left",
      backgroundColor: "#17418C",
      color: "white",
      padding: "24px 16px",
      borderRadius: "14px",
    }}
  >
    <h4 style={{ color: "white", marginBottom: "24px" }}>
      {t("Settings", "الإعدادات")}
    </h4>

    <Link className="settings-link" to="/settings/profile"
      style={{ color: "white" }}>
      <FiUser size={19} style={{ marginInlineEnd: "12px" }} />
      {t("Profile", "الملف الشخصي")}
    </Link>

    <Link className="settings-link" to="/settings/notification"
      style={{ color: "white" }}>
      <FiBell size={19} style={{ marginInlineEnd: "12px" }} />
      {t("Notification", "الإشعارات")}
    </Link>

    <Link
  className="settings-link"
  to="/settings/daily-routine"
  style={{
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
    fontSize: "14px",
  }}
>
  <FiClock size={18} style={{ flexShrink: 0 }} />
  <span>{t("Daily Routine", "الروتين اليومي")}</span>
</Link>

    <Link className="settings-link" to="/settings/language"
      style={{ color: "white" }}>
      <FiGlobe size={19} style={{ marginInlineEnd: "12px" }} />
      {t("Language", "اللغة")}
    </Link>

    <Link className="settings-link" to="/settings/theme"
      style={{ color: "white" }}>
      <FiMoon size={19} style={{ marginInlineEnd: "12px" }} />
      {t("Theme", "المظهر")}
    </Link>

    <Link className="settings-link" to="/settings/security"
      style={{ color: "white" }}>
      <FiShield size={19} style={{ marginInlineEnd: "12px" }} />
      {t("Security", "الأمان")}
    </Link>

    <Link className="settings-link" to="/settings/about"
      style={{ color: "white" }}>
      <FiInfo size={19} style={{ marginInlineEnd: "12px" }} />
      {t("About Us", "من نحن")}
    </Link>

    <Link className="settings-link" to="/settings/feedback"
      style={{ color: "white" }}>
      <FiMessageSquare size={19} style={{ marginInlineEnd: "12px" }} />
      {t("Feedback", "الملاحظات")}
    </Link>
  </div>
);
};

export default SettingsSidebar;
