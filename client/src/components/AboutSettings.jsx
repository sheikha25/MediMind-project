
import { useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";

const AboutSettings = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = language === "ar";
  const t = (en, ar) => (isArabic ? ar : en);

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

    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener(
        "medimind-language-change",
        syncLanguage
      );
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  return (
    <div
      className="about-settings-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .about-settings-page {
          --about-card-bg: #ffffff;
          --about-text: #24364b;
          --about-muted: #52657c;
          --about-border: #dce6f2;
          --about-heading: #17418c;
          --about-highlight: #f1f7ff;

          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        body.dark-theme .about-settings-page,
        body.dark-mode .about-settings-page,
        [data-theme="dark"] .about-settings-page {
          --about-card-bg: #192d42;
          --about-text: #f1f5f9;
          --about-muted: #c4d1df;
          --about-border: #40566f;
          --about-heading: #a9c9ff;
          --about-highlight: #243d58;
        }

        .about-settings-page .about-title {
          font-size: 30px;
          font-weight: 700;
          color: var(--about-heading);
          margin-bottom: 24px;
        }

        .about-settings-page .about-card {
          background: var(--about-card-bg);
          color: var(--about-text);
          border: 1px solid var(--about-border);
          border-radius: 16px;
          padding: 12px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .about-settings-page .about-paragraph {
          font-size: 20px;
          line-height: 2;
          color: var(--about-text);
          margin-bottom: 22px;
          overflow-wrap: anywhere;
        }

        .about-settings-page .about-section-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--about-heading);
          margin-top: 24px;
          margin-bottom: 12px;
        }

        .about-settings-page .about-info {
          font-size: 19px;
          line-height: 1.9;
          color: var(--about-text);
          margin-bottom: 8px;
        }

        .about-settings-page .about-developers {
          font-size: 19px;
          line-height: 2;
          color: var(--about-text);
          padding-inline-start: 25px;
        }

        .about-settings-page .about-highlight {
          background: var(--about-highlight);
          border-radius: 12px;
          padding: 18px 20px;
          margin-bottom: 22px;
        }

        .about-settings-page[dir="rtl"] {
          text-align: right;
        }

        @media (max-width: 768px) {
          .about-settings-page .about-title {
            font-size: 25px;
          }

          .about-settings-page .about-paragraph {
            font-size: 18px;
          }

          .about-settings-page .about-info,
          .about-settings-page .about-developers {
            font-size: 17px;
          }
        }
          .mm-admin-settings .mm-admin-sidebar {
  padding: 28px 20px;
  background-color: #17418c !important;
  color: #ffffff !important;
  min-height: 85vh;
}

.mm-admin-settings .mm-admin-sidebar h4 {
  color: #ffffff !important;
}


/* Show MediMind background images behind Admin Settings */
.mm-admin-settings,
.mm-admin-settings.mm-admin-settings-dark,
.mm-admin-settings .mm-admin-content,
.mm-admin-settings.mm-admin-settings-dark .mm-admin-content {
  background: transparent !important;
}

/* Match Patient Settings sidebar */
.mm-admin-settings .mm-admin-sidebar,
.mm-admin-settings.mm-admin-settings-dark .mm-admin-sidebar {
  background: #17418c !important;
  color: #ffffff !important;
  min-height: 85vh;
}

.mm-admin-settings .mm-admin-sidebar h4,
.mm-admin-settings .mm-admin-link {
  color: #ffffff !important;
}

.mm-admin-settings .mm-admin-link:hover,
.mm-admin-settings .mm-admin-link.active {
  background: #0b5ed7 !important;
  color: #ffffff !important;
}

/* Keep content cards readable */
.mm-admin-settings:not(.mm-admin-settings-dark) .card {
  background: #ffffff !important;
  color: #243247 !important;
}

.mm-admin-settings.mm-admin-settings-dark .card {
  background: #1d2b42 !important;
  color: #e7edf7 !important;
}

/* Show the same MediMind background on Admin Dashboard */
.admin-home-page,
.admin-home-page.admin-home-dark {
  background: transparent !important;
}
      `}</style>

      <h2 className="about-title">
        {t("About MediMind", "حول MediMind")}
      </h2>

      <Card className="about-card mt-4">
        <CardBody>
          <p className="about-paragraph">
            {t(
              "MediMind is a smart web-based medication reminder and management system designed to help patients take their medications on time and manage their daily medication routines. The system provides personalized reminders, medication tracking, and adherence reports to support better medication management.",
              "MediMind هو نظام ذكي قائم على الويب للتذكير بالأدوية وإدارتها، صُمم لمساعدة المرضى على تناول أدويتهم في الوقت المحدد وتنظيم روتينهم الدوائي اليومي. يوفر النظام تذكيرات مخصصة، وتتبعًا للأدوية والجرعات، وتقارير عن مدى الالتزام بتناول الأدوية لدعم إدارة العلاج بشكل أفضل."
            )}
          </p>

          <h5 className="about-section-title">
            {t("Our Mission", "رسالتنا")}
          </h5>

          <p className="about-paragraph">
            {t(
              "Our mission is to improve medication adherence and support patients and caregivers through a simple, accessible, and organized medication management experience.",
              "تتمثل رسالتنا في تحسين الالتزام بتناول الأدوية ودعم المرضى ومقدمي الرعاية من خلال تجربة سهلة ومنظمة لإدارة الأدوية والوصول إلى معلوماتها."
            )}
          </p>

          <hr
            style={{
              borderColor: "var(--about-border)",
              opacity: 0.7,
            }}
          />

          <p className="about-info">
            <strong>{t("Version:", "الإصدار:")}</strong>{" "}
            1.0
          </p>

          <p className="about-info">
            <strong>{t("Year:", "السنة:")}</strong>{" "}
            2026
          </p>

          <h5 className="about-section-title">
            {t("Developed by:", "تطوير:")}
          </h5>

          <ul className="about-developers">
            <li>
              Sheikha Qasim Al-Qusaimi - 16s18247
            </li>
            <li>
              Rawan Salim Al-Hosni - 16s18120
            </li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
};

export default AboutSettings;
