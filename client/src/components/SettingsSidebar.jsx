
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FiUser,
  FiBell,
  FiClock,
  FiGlobe,
  FiMoon,
  FiShield,
  FiInfo,
  FiMessageSquare,
} from "react-icons/fi";

const SettingsSidebar = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = language === "ar";

  const t = (english, arabic) =>
    isArabic ? arabic : english;

  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(
        localStorage.getItem("medimindLanguage") || "en"
      );
    };

    window.addEventListener(
      "medimind-language-change",
      updateLanguage
    );

    window.addEventListener(
      "medimindLanguageChanged",
      updateLanguage
    );

    window.addEventListener("storage", updateLanguage);

    return () => {
      window.removeEventListener(
        "medimind-language-change",
        updateLanguage
      );

      window.removeEventListener(
        "medimindLanguageChanged",
        updateLanguage
      );

      window.removeEventListener(
        "storage",
        updateLanguage
      );
    };
  }, []);

  const menuItems = [
    {
      path: "/settings/profile",
      en: "Profile",
      ar: "الملف الشخصي",
      icon: FiUser,
    },
    {
      path: "/settings/notification",
      en: "Notifications",
      ar: "الإشعارات",
      icon: FiBell,
    },
    {
      path: "/settings/daily-routine",
      en: "Daily Routine",
      ar: "الروتين اليومي",
      icon: FiClock,
    },
    {
      path: "/settings/language",
      en: "Language",
      ar: "اللغة",
      icon: FiGlobe,
    },
    {
      path: "/settings/theme",
      en: "Theme",
      ar: "المظهر",
      icon: FiMoon,
    },
    {
      path: "/settings/security",
      en: "Security",
      ar: "الأمان",
      icon: FiShield,
    },
    {
      path: "/settings/about",
      en: "About Us",
      ar: "من نحن",
      icon: FiInfo,
    },
    {
      path: "/settings/feedback",
      en: "Feedback",
      ar: "الملاحظات",
      icon: FiMessageSquare,
    },
  ];

  return (
    <aside
      className="settings-sidebar mm-settings-sidebar"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .mm-settings-sidebar {
          background-color: #17418c !important;
          color: #ffffff !important;

          width: 100% !important;
          min-width: 0 !important;
          max-width: none !important;

          min-height: 590px;
          height: 100%;

          padding: 26px 16px;
          border-radius: 0;
          box-sizing: border-box;

          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .mm-settings-sidebar .mm-sidebar-title {
          color: #ffffff !important;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 24px;
          padding-inline: 8px;
          text-align: start;
          line-height: 1.5;
        }

        /* Always one vertical column */
        .mm-settings-sidebar .mm-sidebar-menu {
          display: flex !important;
          flex-direction: column !important;
          flex-wrap: nowrap !important;
          grid-template-columns: none !important;
          gap: 7px;
          width: 100%;
          min-width: 0;
        }

        .mm-settings-sidebar .mm-sidebar-link {
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          justify-content: flex-start;
          flex-wrap: nowrap !important;

          gap: 10px;
          width: 100%;
          min-width: 0;
          min-height: 46px;

          padding: 10px 11px;

          color: #ffffff !important;
          text-decoration: none !important;

          font-size: 16px;
          font-weight: 500;
          line-height: 1.4;

          border-radius: 10px;
          box-sizing: border-box;

          transition: background-color 0.2s ease;
        }

        .mm-settings-sidebar .mm-sidebar-link:hover {
          background-color: rgba(255, 255, 255, 0.13);
        }

        .mm-settings-sidebar .mm-sidebar-link.active {
          background-color: rgba(255, 255, 255, 0.22);
          font-weight: 700;
        }

        .mm-settings-sidebar .mm-sidebar-link:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }

        .mm-settings-sidebar .mm-sidebar-icon {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
        }

        .mm-settings-sidebar .mm-sidebar-text {
          display: block;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          overflow-wrap: normal !important;
          word-break: normal !important;
        }

        .mm-settings-sidebar[dir="rtl"] {
          direction: rtl;
          text-align: right;
        }

        .mm-settings-sidebar[dir="ltr"] {
          direction: ltr;
          text-align: left;
        }

        .mm-settings-sidebar[dir="rtl"] .mm-sidebar-link {
          font-family: Tahoma, Arial, sans-serif;
        }

        body.dark-theme .mm-settings-sidebar,
        body.dark-mode .mm-settings-sidebar,
        [data-theme="dark"] .mm-settings-sidebar {
          background-color: #17418c !important;
          color: #ffffff !important;
        }

        /* Tablet */
        @media (max-width: 991px) {
          .mm-settings-sidebar {
            padding: 20px 10px;
          }

          .mm-settings-sidebar .mm-sidebar-title {
            font-size: 20px;
            padding-inline: 5px;
          }

          .mm-settings-sidebar .mm-sidebar-link {
            font-size: 14px;
            padding: 10px 7px;
            gap: 7px;
          }

          .mm-settings-sidebar .mm-sidebar-icon {
            width: 18px;
            height: 18px;
            flex-basis: 18px;
          }
        }

        /* Very small screens */
        @media (max-width: 480px) {
          .mm-settings-sidebar {
            padding: 16px 6px;
          }

          .mm-settings-sidebar .mm-sidebar-title {
            font-size: 17px;
          }

          .mm-settings-sidebar .mm-sidebar-link {
            font-size: 12px;
            padding: 9px 5px;
            gap: 5px;
          }

          .mm-settings-sidebar .mm-sidebar-icon {
            width: 16px;
            height: 16px;
            flex-basis: 16px;
          }
        }
      `}</style>

      <h4 className="mm-sidebar-title">
        {t("Settings", "الإعدادات")}
      </h4>

      <nav
        className="mm-sidebar-menu"
        aria-label={t(
          "Settings navigation",
          "قائمة الإعدادات"
        )}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={t(item.en, item.ar)}
              className={({ isActive }) =>
                `mm-sidebar-link settings-link${
                  isActive ? " active" : ""
                }`
              }
            >
              <Icon className="mm-sidebar-icon" />

              <span className="mm-sidebar-text">
                {t(item.en, item.ar)}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
