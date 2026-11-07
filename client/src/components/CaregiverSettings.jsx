import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import CaregiverHeader from "./CaregiverHeader";
import CaregiverSettingsSidebar from "./CaregiverSettingsSidebar";
import Footer from "./Footer";

const CaregiverSettings = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );
  const isArabic = language === "ar";

  useEffect(() => {
    const syncLanguage = () =>
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
    window.addEventListener("medimind-language-change", syncLanguage);
    window.addEventListener("medimindLanguageChanged", syncLanguage);
    window.addEventListener("storage", syncLanguage);
    return () => {
      window.removeEventListener("medimind-language-change", syncLanguage);
      window.removeEventListener("medimindLanguageChanged", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  

  return (
    <div className="dashboard-page mm-caregiver-settings-page" dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        .mm-caregiver-settings-page { width: 100%; min-width: 0; padding: 0; margin: 0; box-sizing: border-box; }
        .mm-caregiver-settings-page *, .mm-caregiver-settings-page *::before, .mm-caregiver-settings-page *::after { box-sizing: border-box; }
        .mm-caregiver-settings-layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 24px; width: 100%; min-width: 0; min-height: 85vh; align-items: stretch; }
        .mm-caregiver-settings-sidebar-column { min-width: 0; background: #17418c; }
        .mm-caregiver-settings-sidebar-column .mm-caregiver-settings-sidebar { width: 100%; min-width: 0; height: 100%; min-height: 85vh; border-radius: 0; }
        .mm-caregiver-settings-content { min-width: 0; width: 100%; padding: 30px 24px 30px 0; }
        .mm-caregiver-settings-page[dir="rtl"] .mm-caregiver-settings-content { padding: 30px 0 30px 24px; }
        .mm-caregiver-settings-content > * { max-width: 100%; min-width: 0; }
        @media (max-width: 991px) {
          .mm-caregiver-settings-layout { grid-template-columns: 190px minmax(0, 1fr); gap: 14px; }
          .mm-caregiver-settings-content { padding: 24px 14px 24px 0; }
          .mm-caregiver-settings-page[dir="rtl"] .mm-caregiver-settings-content { padding: 24px 0 24px 14px; }
        }
        @media (max-width: 600px) {
          .mm-caregiver-settings-layout { grid-template-columns: 155px minmax(0, 1fr); gap: 10px; }
          .mm-caregiver-settings-content { padding: 18px 10px 18px 0; }
          .mm-caregiver-settings-page[dir="rtl"] .mm-caregiver-settings-content { padding: 18px 0 18px 10px; }
        }
        @media (max-width: 400px) {
          .mm-caregiver-settings-layout { grid-template-columns: 120px minmax(0, 1fr); gap: 8px; }
          .mm-caregiver-settings-content { padding: 12px 8px 12px 0; }
          .mm-caregiver-settings-page[dir="rtl"] .mm-caregiver-settings-content { padding: 12px 0 12px 8px; }
        }
      `}</style>
      <CaregiverHeader />
      <div className="mm-caregiver-settings-layout">
        <aside className="mm-caregiver-settings-sidebar-column">
          <CaregiverSettingsSidebar />
        </aside>
        <main className="mm-caregiver-settings-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CaregiverSettings;
