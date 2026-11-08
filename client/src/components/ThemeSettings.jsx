
import { useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";

const ThemeSettings = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("medimind-theme") || "light"
  );

  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = language === "ar";

  const t = (english, arabic) =>
    isArabic ? arabic : english;

  // Apply and save the selected theme
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    localStorage.setItem("medimind-theme", theme);
  }, [theme]);

  // Keep language synchronized across MediMind
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(
        localStorage.getItem("medimindLanguage") || "en"
      );
    };

    window.addEventListener(
      "medimind-language-change",
      handleLanguageChange
    );

    window.addEventListener(
      "storage",
      handleLanguageChange
    );

    return () => {
      window.removeEventListener(
        "medimind-language-change",
        handleLanguageChange
      );

      window.removeEventListener(
        "storage",
        handleLanguageChange
      );
    };
  }, []);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <div
      className="theme-settings-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .theme-settings-page {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          text-align: start;
        }

        .theme-settings-page h2 {
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .theme-settings-page .theme-card {
          width: 100%;
          max-width: 100%;
          border-radius: 14px;
          box-sizing: border-box;
        }

        .theme-settings-page .theme-select {
          min-height: 44px;
          font-size: 16px;
          border-radius: 9px;
        }

        body.dark-theme .theme-settings-page {
          color: #f1f5f9;
        }

        body.dark-theme .theme-settings-page .theme-card {
          background-color: #17283a;
          color: #f1f5f9;
          border-color: #415a73;
        }

        body.dark-theme .theme-settings-page .theme-select {
          background-color: #21374e;
          color: #f1f5f9;
          border-color: #415a73;
        }

        @media (max-width: 768px) {
          .theme-settings-page h2 {
            font-size: 25px;
          }
        }
      `}</style>

      <h2>
        {t("Theme", "المظهر")}
      </h2>

      <Card className="theme-card">
        <CardBody>
          <select
            className="form-control theme-select"
            value={theme}
            onChange={handleThemeChange}
            aria-label={t("Select Theme", "اختر المظهر")}
          >
            <option value="light">
              {t("Light Mode", "الوضع الفاتح")}
            </option>

            <option value="dark">
              {t("Dark Mode", "الوضع الداكن")}
            </option>
          </select>
        </CardBody>
      </Card>
    </div>
  );
};

export default ThemeSettings;
