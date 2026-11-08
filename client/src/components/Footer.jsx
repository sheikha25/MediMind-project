
import { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";

const Footer = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = language === "ar";
  const t = (en, ar) => (isArabic ? ar : en);

  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
    };

    window.addEventListener("storage", updateLanguage);
    window.addEventListener("medimindLanguageChanged", updateLanguage);

    return () => {
      window.removeEventListener("storage", updateLanguage);
      window.removeEventListener("medimindLanguageChanged", updateLanguage);
    };
  }, []);

  return (
    <footer
      className="footer medimind-footer mt-auto py-4"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .medimind-footer {
          background: var(--mm-card-bg, #ffffff);
          color: var(--mm-text, #1e293b);
          border-top: 1px solid var(--mm-border, #e2e8f0);
          transition: background 0.3s, color 0.3s;
        }

        .medimind-footer .footer-divider {
          border-color: var(--mm-border, #e2e8f0);
          opacity: 0.5;
          margin-bottom: 30px;
        }

        .medimind-footer h5 {
          font-size: 25px;
          font-weight: 800;
          color: var(--mm-text, #1e293b);
        }

        .medimind-footer h6 {
          font-size: 21px;
          font-weight: 700;
          color: var(--mm-text, #1e293b);
        }

        .medimind-footer p {
          font-size: 17px !important;
          line-height: 1.9;
          color: var(--mm-muted, #64748b) !important;
        }

        .medimind-footer .footer-copyright {
          font-size: 15px !important;
          margin-top: 20px;
        }

        .medimind-footer[dir="rtl"] {
          text-align: right;
        }

        .medimind-footer[dir="ltr"] {
          text-align: left;
        }

        .medimind-footer .footer-column {
          text-align: start;
        }

        .medimind-footer .footer-email {
          direction: ltr;
          unicode-bidi: isolate;
          display: inline-block;
        }

        body.dark-mode .medimind-footer,
        body.dark-theme .medimind-footer,
        [data-theme="dark"] .medimind-footer {
          background: #111827;
          color: #f1f5f9;
          border-color: #334155;
        }

        body.dark-mode .medimind-footer h5,
        body.dark-mode .medimind-footer h6,
        body.dark-theme .medimind-footer h5,
        body.dark-theme .medimind-footer h6,
        [data-theme="dark"] .medimind-footer h5,
        [data-theme="dark"] .medimind-footer h6 {
          color: #f8fafc;
        }

        body.dark-mode .medimind-footer p,
        body.dark-theme .medimind-footer p,
        [data-theme="dark"] .medimind-footer p {
          color: #cbd5e1 !important;
        }

        @media (max-width: 767px) {
          .medimind-footer .footer-column {
            text-align: center;
          }

          .medimind-footer p {
            font-size: 16px !important;
          }
        }
      `}</style>

      <Container>
        <Row className="justify-content-between">
          <Col md="4" className="mb-4 footer-column">
            <h5 className="mb-3">MediMind</h5>
            <p>
              {t(
                "A smart web-based medication reminder system that helps users manage medication schedules, reminders, and adherence reports.",
                "نظام ذكي لتذكير المرضى بمواعيد الأدوية عبر الويب، يساعد المستخدمين على تنظيم جداول الأدوية والتذكيرات ومتابعة تقارير الالتزام بالعلاج."
              )}
            </p>
          </Col>

          <Col md="3" className="mb-4 footer-column">
            <h6 className="mb-3">
              {t("Developers", "المطوّرون")}
            </h6>

            <p className="mb-1">
              {t(
                "Sheikha Qasim Al-Qusaimi",
                "شيخة قاسم القسيمي"
              )}
            </p>

            <p>
              {t(
                "Rawan Salim Al-Hosni",
                "روان سالم الحوسني"
              )}
            </p>
          </Col>

          <Col md="3" className="mb-4 footer-column">
            <h6 className="mb-3">
              {t("Contact", "التواصل")}
            </h6>

            <p className="mb-1">
              {t("Email:", "البريد الإلكتروني:")}{" "}
              <span className="footer-email">
               
<a
  href="mailto:medimindproject@gmail.com"
  className="footer-email"
>
  medimindproject@gmail.com
</a>

              </span>
            </p>

            <p>
              {t(
                "Location: Muscat, Oman",
                "الموقع: مسقط، سلطنة عُمان"
              )}
            </p>
          </Col>
        </Row>

        <p className="text-center footer-copyright mb-0">
          © 2026 MediMind.{" "}
          {t("All rights reserved.", "جميع الحقوق محفوظة.")}
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
