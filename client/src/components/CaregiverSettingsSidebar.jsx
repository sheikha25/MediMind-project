
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiUser,
  FiUsers,
  FiBell,
  FiGlobe,
  FiMoon,
  FiShield,
  FiInfo,
  FiMessageSquare,
} from "react-icons/fi";

const CaregiverSettingsSidebar = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = language === "ar";

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(
        localStorage.getItem("medimindLanguage") || "en"
      );
    };

    window.addEventListener(
      "medimind-language-change",
      syncLanguage
    );

    window.addEventListener(
      "medimindLanguageChanged",
      syncLanguage
    );

    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener(
        "medimind-language-change",
        syncLanguage
      );

      window.removeEventListener(
        "medimindLanguageChanged",
        syncLanguage
      );

      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const menuItems = [
    {
      path: "/caregiver-settings",
      icon: FiUser,
      en: "Profile",
      ar: "الملف الشخصي",
    },
    {
      path: "/caregiver-link-patient",
      icon: FiUsers,
      en: "Link Patient",
      ar: "ربط مريض",
    },
    
{
  path: "/caregiver-settings/notifications",
  icon: FiBell,
  en: "Notifications",
  ar: "الإشعارات",
},

    {
      path: "/caregiver-language",
      icon: FiGlobe,
      en: "Language",
      ar: "اللغة",
    },
    {
      path: "/caregiver-theme",
      icon: FiMoon,
      en: "Theme",
      ar: "المظهر",
    },
    {
      path: "/caregiver-security",
      icon: FiShield,
      en: "Security",
      ar: "الأمان",
    },
    {
      path: "/caregiver-about",
      icon: FiInfo,
      en: "About Us",
      ar: "من نحن",
    },
    {
      path: "/caregiver-feedback",
      icon: FiMessageSquare,
      en: "Feedback",
      ar: "الملاحظات",
    },
  ];

  return (
    <aside
      className="mm-caregiver-settings-sidebar"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .mm-caregiver-settings-sidebar {
          width: 100%;
          min-width: 0;
          height: 100%;
          min-height: 590px;
          background: #17418c;
          color: #ffffff;
          padding: 26px 18px;
          border-radius: 14px;
          box-sizing: border-box;
        }

        .mm-caregiver-settings-sidebar .mm-cg-title {
          margin: 0 0 24px;
          color: #ffffff;
          font-size: 22px;
          font-weight: 700;
          text-align: start;
        }

        .mm-caregiver-settings-sidebar .mm-cg-menu {
          display: flex !important;
          flex-direction: column !important;
          flex-wrap: nowrap !important;
          gap: 7px;
          width: 100%;
          min-width: 0;
        }

        .mm-caregiver-settings-sidebar .mm-cg-link {
          display: flex !important;
          align-items: center;
          flex-wrap: nowrap !important;
          gap: 12px;
          width: 100%;
          min-width: 0;
          padding: 12px 13px;
          color: #ffffff;
          text-decoration: none;
          border-radius: 9px;
          font-size: 15px;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .mm-caregiver-settings-sidebar .mm-cg-link:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
        }

        .mm-caregiver-settings-sidebar .mm-cg-link.active {
          background: #ffffff;
          color: #17418c;
          font-weight: 700;
        }

        .mm-caregiver-settings-sidebar .mm-cg-icon {
          flex: 0 0 19px;
          width: 19px;
          height: 19px;
        }

        .mm-caregiver-settings-sidebar .mm-cg-text {
          display: block;
          min-width: 0;
          white-space: nowrap !important;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: normal !important;
          overflow-wrap: normal !important;
        }

        .mm-caregiver-settings-sidebar[dir="rtl"]
        .mm-cg-link {
          text-align: right;
        }

        @media (max-width: 991px) {
          .mm-caregiver-settings-sidebar {
            padding: 22px 10px;
          }

          .mm-caregiver-settings-sidebar .mm-cg-link {
            gap: 9px;
            padding: 11px 8px;
            font-size: 13px;
          }

          .mm-caregiver-settings-sidebar .mm-cg-title {
            font-size: 19px;
          }
        }

        @media (max-width: 480px) {
          .mm-caregiver-settings-sidebar {
            padding: 16px 6px;
          }

          .mm-caregiver-settings-sidebar .mm-cg-link {
            gap: 6px;
            padding: 10px 5px;
            font-size: 11px;
          }

          .mm-caregiver-settings-sidebar .mm-cg-icon {
            flex-basis: 16px;
            width: 16px;
            height: 16px;
          }

          .mm-caregiver-settings-sidebar .mm-cg-title {
            font-size: 16px;
          }
        }
      `}</style>

      <h4 className="mm-cg-title">
        {isArabic ? "الإعدادات" : "Settings"}
      </h4>

      <nav className="mm-cg-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `mm-cg-link ${isActive ? "active" : ""}`
              }
            >
              <Icon className="mm-cg-icon" />

              <span className="mm-cg-text">
                {isArabic ? item.ar : item.en}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default CaregiverSettingsSidebar;
