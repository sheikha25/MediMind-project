
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const Settings = () => {
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

  return (
    <div
      className="dashboard-page mm-settings-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        /* Main Settings Page */
        .mm-settings-page {
          width: 100%;
          min-width: 0;
          margin: 0;
          padding: 0 !important;
          box-sizing: border-box;
        }

        .mm-settings-page *,
        .mm-settings-page *::before,
        .mm-settings-page *::after {
          box-sizing: border-box;
        }

        /* Two-column layout at ALL screen sizes */
        .mm-settings-page .mm-settings-layout {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 24px;
          align-items: stretch;
          width: 100%;
          min-width: 0;
          min-height: 85vh;
          margin: 0;
          padding: 0;
        }

        /* Sidebar column */
        .mm-settings-page .mm-settings-sidebar-column {
          width: 100%;
          min-width: 0;
          min-height: 85vh;
          background-color: #17418c;
        }

        .mm-settings-page
        .mm-settings-sidebar-column
        .mm-settings-sidebar {
          width: 100% !important;
          min-width: 0 !important;
          max-width: none !important;
          min-height: 85vh;
          height: 100%;
          margin: 0 !important;
          border-radius: 0 !important;
        }

        /* Content column */
        .mm-settings-page .mm-settings-content {
          width: 100%;
          min-width: 0;
          padding: 30px 24px 30px 0;
        }

        .mm-settings-page[dir="rtl"] .mm-settings-content {
          padding: 30px 0 30px 24px;
        }

        .mm-settings-page .mm-settings-content > * {
          max-width: 100%;
          min-width: 0;
        }

        /* English: sidebar left */
        .mm-settings-page[dir="ltr"] .mm-settings-layout {
          direction: ltr;
        }

        /* Arabic: sidebar right */
        .mm-settings-page[dir="rtl"] .mm-settings-layout {
          direction: rtl;
        }

        /* Tablet and smaller windows */
        @media (max-width: 991px) {
          .mm-settings-page .mm-settings-layout {
            grid-template-columns: 190px minmax(0, 1fr);
            gap: 14px;
          }

          .mm-settings-page .mm-settings-content {
            padding: 24px 14px 24px 0;
          }

          .mm-settings-page[dir="rtl"] .mm-settings-content {
            padding: 24px 0 24px 14px;
          }
        }

        /* Narrow windows */
        @media (max-width: 600px) {
          .mm-settings-page .mm-settings-layout {
            grid-template-columns: 155px minmax(0, 1fr);
            gap: 10px;
          }

          .mm-settings-page .mm-settings-content {
            padding: 18px 10px 18px 0;
          }

          .mm-settings-page[dir="rtl"] .mm-settings-content {
            padding: 18px 0 18px 10px;
          }
        }

        /* Very small screens */
        @media (max-width: 400px) {
          .mm-settings-page .mm-settings-layout {
            grid-template-columns: 120px minmax(0, 1fr);
            gap: 8px;
          }

          .mm-settings-page .mm-settings-content {
            padding: 12px 8px 12px 0;
          }

          .mm-settings-page[dir="rtl"] .mm-settings-content {
            padding: 12px 0 12px 8px;
          }
        }
      `}</style>

      <Header />

      <div className="mm-settings-layout">
        <aside className="mm-settings-sidebar-column">
          <SettingsSidebar />
        </aside>

        <main className="mm-settings-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Settings;
