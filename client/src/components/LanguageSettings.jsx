
import { useState } from "react";
import { Card, CardBody } from "reactstrap";

const LanguageSettings = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;

    setLanguage(selectedLanguage);

    localStorage.setItem(
      "medimindLanguage",
      selectedLanguage
    );

    window.dispatchEvent(
      new Event("medimind-language-change")
    );
  };

  const isArabic = language === "ar";

  return (
    <div
      className="language-settings-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .language-settings-page {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          text-align: start;
        }

        .language-settings-page h2 {
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .language-settings-page .language-card {
          width: 100%;
          max-width: 100%;
          border-radius: 14px;
          box-sizing: border-box;
        }

        .language-settings-page .language-select {
          min-height: 44px;
          font-size: 16px;
          border-radius: 9px;
        }

        body.dark-theme .language-settings-page,
        body.dark-mode .language-settings-page,
        [data-theme="dark"] .language-settings-page {
          color: #f1f5f9;
        }

        body.dark-theme .language-settings-page .language-card,
        body.dark-mode .language-settings-page .language-card,
        [data-theme="dark"] .language-settings-page .language-card {
          background: #17283a;
          color: #f1f5f9;
          border-color: #415a73;
        }

        body.dark-theme .language-settings-page .language-select,
        body.dark-mode .language-settings-page .language-select,
        [data-theme="dark"] .language-settings-page .language-select {
          background: #21374e;
          color: #f1f5f9;
          border-color: #415a73;
        }

        @media (max-width: 768px) {
          .language-settings-page h2 {
            font-size: 25px;
          }
        }
      `}</style>

      <h2>
        {isArabic ? "اللغة" : "Language"}
      </h2>

      <Card className="language-card">
        <CardBody>
          <select
            className="form-control language-select"
            value={language}
            onChange={handleLanguageChange}
            aria-label={
              isArabic ? "اختر اللغة" : "Select Language"
            }
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </CardBody>
      </Card>
    </div>
  );
};

export default LanguageSettings;
