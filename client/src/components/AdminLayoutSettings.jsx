
import { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import AdminHeader from "./AdminHeader";
import SettingsSidebar from "./SettingsSidebar";

const SettingsLayout = ({ children }) => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("medimind-theme") || "light"
  );

  const isArabic = language === "ar";
  const isDark = theme === "dark";

  const t = (en, ar) => (isArabic ? ar : en);

  useEffect(() => {
    const syncSettings = () => {
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
      setTheme(localStorage.getItem("medimind-theme") || "light");
    };

    const events = [
      "storage",
      "medimind-language-change",
      "medimindLanguageChanged",
      "medimind-theme-change",
      "medimindThemeChanged",
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, syncSettings);
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, syncSettings);
      });
    };
  }, []);

  return (
    <Container
      fluid
      className={`dashboard-page admin-settings-layout ${isDark ? "admin-settings-layout-dark" : ""
        }`}
      dir={isArabic ? "rtl" : "ltr"}
      aria-label={t("Admin Settings", "إعدادات المسؤول")}
    >
      <style>{`
        .admin-settings-layout {
          min-height: 100vh;
          background-color: #f7f9fc;
          color: #1f2937;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .admin-settings-layout .admin-settings-layout-row {
          min-height: 85vh;
        }

        .admin-settings-layout .admin-settings-layout-sidebar {
          background-color: #e8f0fa;
          border-inline-end: 1px solid #d5e1ef;
          padding: 24px 16px;
          min-width: 0;
        }

        .admin-settings-layout .admin-settings-layout-content {
          padding: 35px;
          min-width: 0;
        }

        .admin-settings-layout .card {
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background-color: #ffffff;
          color: #1f2937;
        }

        .admin-settings-layout .form-control {
          border-radius: 9px;
          min-height: 44px;
        }

        /* Dark theme */

        .admin-settings-layout-dark {
          background-color: #101827;
          color: #e5e7eb;
        }

        .admin-settings-layout-dark
        .admin-settings-layout-sidebar {
          background-color: #172338;
          border-color: #334155;
        }

        .admin-settings-layout-dark .card {
          background-color: #1c2940;
          border-color: #334155;
          color: #e5e7eb;
        }

        .admin-settings-layout-dark .form-control {
          background-color: #111b2b;
          border-color: #475569;
          color: #f8fafc;
        }

        .admin-settings-layout-dark .form-control::placeholder {
          color: #94a3b8;
        }

        .admin-settings-layout-dark .text-muted {
          color: #cbd5e1 !important;
        }

        .admin-settings-layout-dark .border {
          border-color: #475569 !important;
        }

        @media (max-width: 767px) {
          .admin-settings-layout
          .admin-settings-layout-sidebar {
            border-inline-end: none;
            border-bottom: 1px solid #d5e1ef;
            padding: 16px 12px;
          }

          .admin-settings-layout
          .admin-settings-layout-content {
            padding: 22px 14px;
          }
        }
      `}</style>

      <AdminHeader />

      <Row className="g-0 admin-settings-layout-row">
        <Col
          md="3"
          lg="2"
          className="admin-settings-layout-sidebar"
        >
          <SettingsSidebar />
        </Col>

        <Col
          md="9"
          lg="10"
          className="admin-settings-layout-content"
        >
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsLayout;
