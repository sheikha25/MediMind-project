
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  FormGroup,
  Label,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import medimindlogo from "../assets/medimindlogo.jpg";
import Footer from "./Footer";

const Forgotpass = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  // Language
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  // Theme
  const [theme, setTheme] = useState(
    () => localStorage.getItem("medimind-theme") || "light"
  );

  const isArabic = language === "ar";
  const isDark = theme === "dark";

  // Translation helper
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

  // Translate known backend messages
  const translateMessage = (text) => {
    const messages = {
      "OTP sent to your email": t(
        "OTP sent to your email.",
        "تم إرسال رمز التحقق إلى بريدك الإلكتروني."
      ),
      "User not found": t(
        "User not found.",
        "لم يتم العثور على المستخدم."
      ),
      "Email is required": t(
        "Email is required.",
        "البريد الإلكتروني مطلوب."
      ),
      "Invalid email": t(
        "Invalid email address.",
        "عنوان البريد الإلكتروني غير صالح."
      ),
      "Failed to send OTP": t(
        "Failed to send OTP.",
        "فشل إرسال رمز التحقق."
      ),
    };

    return messages[text] || text;
  };

  // Send OTP
  const sendOtp = async (event) => {
    event?.preventDefault();

    if (loading) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage(
        t(
          "Please enter your email address.",
          "يرجى إدخال بريدك الإلكتروني."
        )
      );
      setMessageType("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setMessage(
        t(
          "Please enter a valid email address.",
          "يرجى إدخال بريد إلكتروني صحيح."
        )
      );
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await axios.post(
        "http://localhost:3002/forgot-password",
        {
          email: trimmedEmail,
        }
      );

      const backendMessage = response.data?.message || "";

      if (backendMessage === "OTP sent to your email") {
        setMessageType("success");

        navigate("/reset-password", {
          state: { email: trimmedEmail },
        });

        return;
      }

      setMessage(
        backendMessage
          ? translateMessage(backendMessage)
          : t(
              "Unable to send OTP. Please try again.",
              "تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى."
            )
      );

      setMessageType("error");
    } catch (error) {
      console.error("Forgot password error:", error);

      const backendMessage = error.response?.data?.message;

      setMessage(
        backendMessage
          ? translateMessage(backendMessage)
          : t(
              "Unable to send OTP. Check your connection and try again.",
              "تعذر إرسال رمز التحقق. تحقق من اتصال الإنترنت وحاول مرة أخرى."
            )
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className={`forgot-password-page ${
        isDark ? "forgot-password-dark" : ""
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .forgot-password-page {
          min-height: 100vh;
          background-color: #f7f9fc;
          color: #1f2937;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .forgot-password-page .login-row {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          margin: 0;
        }

        .forgot-password-page .login-col {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 16px;
        }

        .forgot-password-page .card {
          width: 100%;
          max-width: 450px;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 8px 30px rgba(30, 58, 138, 0.08);
        }

        .forgot-password-page .card-body {
          padding: 35px;
        }

        .forgot-password-page .logo {
          display: block;
          width: 135px;
          height: auto;
          margin: 0 auto 22px;
        }

        .forgot-password-page h2 {
          color: #1e3a8a;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .forgot-password-page .forgot-description {
          color: #64748b;
          margin-bottom: 25px;
          line-height: 1.7;
        }

        .forgot-password-page label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .forgot-password-page .form-control {
          min-height: 46px;
          border-radius: 9px;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: #1f2937;
        }

        .forgot-password-page .form-control:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .forgot-password-page .forgot-submit-button {
          min-height: 46px;
          border-radius: 9px;
          font-weight: 600;
          margin-top: 10px;
        }

        .forgot-password-page .forgot-message {
          margin-top: 18px;
          font-size: 14px;
          text-align: center;
        }

        .forgot-password-page .forgot-message.success {
          color: #15803d;
        }

        .forgot-password-page .forgot-message.error {
          color: #dc2626;
        }

        .forgot-password-page .forgot-login-link {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
          margin-inline-start: 5px;
        }

        .forgot-password-page .forgot-login-link:hover {
          text-decoration: underline;
        }

        /* Dark Mode */

        .forgot-password-dark {
          background-color: #101827;
          color: #e5e7eb;
        }

        .forgot-password-dark .card {
          background-color: #1c2940;
          border-color: #334155;
          color: #e5e7eb;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .forgot-password-dark h2 {
          color: #a9c8ff;
        }

        .forgot-password-dark .forgot-description {
          color: #cbd5e1;
        }

        .forgot-password-dark .form-control {
          background-color: #111b2b;
          border-color: #475569;
          color: #f8fafc;
        }

        .forgot-password-dark .form-control::placeholder {
          color: #94a3b8;
        }

        .forgot-password-dark .forgot-login-link {
          color: #93c5fd;
        }

        .forgot-password-dark .forgot-message.success {
          color: #86efac;
        }

        .forgot-password-dark .forgot-message.error {
          color: #fca5a5;
        }

        @media (max-width: 576px) {
          .forgot-password-page .login-col {
            padding: 25px 14px;
          }

          .forgot-password-page .card-body {
            padding: 25px 20px;
          }

          .forgot-password-page h2 {
            font-size: 25px;
          }
        }
      `}</style>

      <Row className="login-row">
        <Col className="login-col">
          <Card>
            <CardBody>
              <img
                src={medimindlogo}
                alt={t("MediMind logo", "شعار MediMind")}
                className="logo"
              />

              <h2 className="text-center">
                {t("Forgot Password", "نسيت كلمة المرور")}
              </h2>

              <p className="text-center forgot-description">
                {t(
                  "Enter your email to receive an OTP.",
                  "أدخل بريدك الإلكتروني لاستلام رمز التحقق."
                )}
              </p>

              <form onSubmit={sendOtp}>
                <FormGroup>
                  <Label for="forgot-password-email">
                    {t("Email", "البريد الإلكتروني")}
                  </Label>

                  <input
                    id="forgot-password-email"
                    type="email"
                    className="form-control"
                    placeholder={t(
                      "Enter your email",
                      "أدخل بريدك الإلكتروني"
                    )}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setMessage("");
                    }}
                    autoComplete="email"
                    required
                    disabled={loading}
                    dir="ltr"
                  />
                </FormGroup>

                <Button
                  color="primary"
                  className="w-100 forgot-submit-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? t("Sending OTP...", "جارٍ إرسال رمز التحقق...")
                    : t("Send OTP", "إرسال رمز التحقق")}
                </Button>
              </form>

              {message && (
                <p
                  className={`forgot-message ${messageType}`}
                  role="alert"
                >
                  {message}
                </p>
              )}

              <p className="text-center mt-4">
                {t("Back to", "العودة إلى")}
                <Link to="/" className="forgot-login-link">
                  {t("Login", "تسجيل الدخول")}
                </Link>
              </p>
            </CardBody>
          </Card>
        </Col>

        <Footer />
      </Row>
    </Container>
  );
};

export default Forgotpass;
