import { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import CaregiverHeader from "./CaregiverHeader";
import SettingsSidebar from "./SettingsSidebar";

const SettingsLayout = ({ children }) => {
  const [language, setLanguage] = useState(
    () => (localStorage.getItem("medimindLanguage") === "ar" ? "ar" : "en")
  );
  const [theme, setTheme] = useState(
    () => (localStorage.getItem("medimind-theme") === "dark" ? "dark" : "light")
  );

  useEffect(() => {
    const syncPreferences = () => {
      setLanguage(localStorage.getItem("medimindLanguage") === "ar" ? "ar" : "en");
      setTheme(localStorage.getItem("medimind-theme") === "dark" ? "dark" : "light");
    };

    const events = [
      "medimind-language-change",
      "medimindLanguageChanged",
      "medimind-theme-change",
      "medimindThemeChanged",
      "storage",
    ];
    events.forEach((eventName) => window.addEventListener(eventName, syncPreferences));
    return () => events.forEach((eventName) => window.removeEventListener(eventName, syncPreferences));
  }, []);

  const isArabic = language === "ar";

  return (
    <Container
      fluid
      className={`dashboard-page mm-caregiver-settings-layout ${theme === "dark" ? "mm-csl-dark" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .mm-caregiver-settings-layout {
          min-height: 100vh;
          background: #f3f7fd;
          color: #1c2b43;
          padding: 0;
        }
        .mm-caregiver-settings-layout .mm-csl-row {
          min-height: 85vh;
          margin: 0;
          display: grid;
          grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
          align-items: stretch;
        }
        .mm-caregiver-settings-layout .mm-csl-sidebar {
          min-width: 0;
          padding: 16px 10px;
          border-inline-end: 1px solid #dbe4f1;
        }
        .mm-caregiver-settings-layout .mm-csl-content {
          min-width: 0;
          padding: 28px;
        }
        .mm-caregiver-settings-layout.mm-csl-dark {
          background: #101827;
          color: #e8edf6;
        }
        .mm-caregiver-settings-layout.mm-csl-dark .mm-csl-sidebar {
          border-inline-end-color: #35445b;
        }
        @media (max-width: 768px) {
          .mm-caregiver-settings-layout .mm-csl-row {
            grid-template-columns: minmax(130px, 175px) minmax(0, 1fr);
          }
          .mm-caregiver-settings-layout .mm-csl-sidebar { padding: 12px 6px; }
          .mm-caregiver-settings-layout .mm-csl-content { padding: 16px 12px; }
        }
        @media (max-width: 420px) {
          .mm-caregiver-settings-layout .mm-csl-row {
            grid-template-columns: minmax(105px, 125px) minmax(0, 1fr);
          }
          .mm-caregiver-settings-layout .mm-csl-content { padding: 12px 8px; }
        }
      `}</style>

      <CaregiverHeader />

      <Row className="mm-csl-row">
        <Col className="mm-csl-sidebar">
          <SettingsSidebar />
        </Col>
        <Col className="mm-csl-content">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsLayout;
