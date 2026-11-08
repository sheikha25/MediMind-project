
import { useEffect, useRef, useState } from "react";
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
import { Link, useLocation, useNavigate } from "react-router-dom";
import medimindlogo from "../assets/medimindlogo.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Footer from "./Footer";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Language and theme
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

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  // Translate known backend responses
  const translateMessage = (text) => {
    const messages = {
      "Password reset successfully": t(
        "Password reset successfully.",
        "تمت إعادة تعيين كلمة المرور بنجاح."
      ),
      "Invalid OTP": t(
        "Invalid verification code.",
        "رمز التحقق غير صحيح."
      ),
      "OTP expired": t(
        "The verification code has expired.",
        "انتهت صلاحية رمز التحقق."
      ),
      "User not found": t(
        "User not found.",
        "لم يتم العثور على المستخدم."
      ),
      "Invalid or expired OTP": t(
        "Invalid or expired verification code.",
        "رمز التحقق غير صحيح أو انتهت صلاحيته."
      ),
    };

    return messages[text] || text;
  };

  const resetPassword = async (event) => {
    event?.preventDefault();

    if (loading) return;

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    setMessage("");
    setMessageType("");

    if (!trimmedEmail || !trimmedOtp || !newPassword || !confirmPassword) {
      setMessage(
        t(
          "Please complete all fields.",
          "يرجى تعبئة جميع الحقول."
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

    if (newPassword !== confirmPassword) {
      setMessage(
        t(
          "Passwords do not match.",
          "كلمتا المرور غير متطابقتين."
        )
      );
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3002/reset-password",
        {
          email: trimmedEmail,
          otp: trimmedOtp,
          newPassword,
        }
      );

      const backendMessage = response.data?.message || "";

      if (backendMessage === "Password reset successfully") {
        setMessage(
          t(
            "Password reset successfully. Redirecting to login...",
            "تمت إعادة تعيين كلمة المرور بنجاح. جارٍ الانتقال إلى تسجيل الدخول..."
          )
        );
        setMessageType("success");

        redirectTimer.current = setTimeout(() => {
          navigate("/");
        }, 1000);

        return;
      }

      setMessage(
        backendMessage
          ? translateMessage(backendMessage)
          : t(
              "Unable to reset password. Please try again.",
              "تعذرت إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى."
            )
      );
      setMessageType("error");
    } catch (error) {
      console.error("Reset password error:", error);

      const backendMessage = error.response?.data?.message;

      setMessage(
        backendMessage
          ? translateMessage(backendMessage)
          : t(
              "Unable to reset password. Check your connection and try again.",
              "تعذرت إعادة تعيين كلمة المرور. تحقق من اتصال الإنترنت وحاول مرة أخرى."
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
      className={`reset-password-page ${
        isDark ? "reset-password-dark" : ""
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .reset-password-page {
          min-height: 100vh;
          background: #f7f9fc;
          color: #1f2937;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .reset-password-page .login-row {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          margin: 0;
        }

        .reset-password-page .login-col {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 16px;
        }

        .reset-password-page .card {
          width: 100%;
          max-width: 460px;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 8px 30px rgba(30, 58, 138, 0.08);
        }

        .reset-password-page .card-body {
          padding: 35px;
        }

        .reset-password-page .logo {
          display: block;
          width: 135px;
          height: auto;
          margin: 0 auto 22px;
        }

        .reset-password-page h2 {
          color: #1e3a8a;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .reset-password-page .reset-description {
          color: #64748b;
          margin-bottom: 25px;
          line-height: 1.7;
        }

        .reset-password-page label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .reset-password-page .form-control {
          min-height: 46px;
          border-radius: 9px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #1f2937;
        }

        .reset-password-page .form-control:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .reset-password-page .password-wrapper {
          position: relative;
        }

        .reset-password-page .password-wrapper input {
          padding-inline-end: 48px;
        }

        .reset-password-page .password-toggle {
          position: absolute;
          top: 50%;
          inset-inline-end: 14px;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #1e3a8a;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reset-password-page .reset-submit-button {
          min-height: 46px;
          border-radius: 9px;
          font-weight: 600;
          margin-top: 10px;
        }

        .reset-password-page .reset-message {
          margin-top: 18px;
          font-size: 14px;
          text-align: center;
          line-height: 1.6;
        }

        .reset-password-page .reset-message.success {
          color: #15803d;
        }

        .reset-password-page .reset-message.error {
          color: #dc2626;
        }

        .reset-password-page .reset-login-link {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
          margin-inline-start: 5px;
        }

        .reset-password-page .reset-login-link:hover {
          text-decoration: underline;
        }

        /* Dark Mode */

        .reset-password-dark {
          background: #101827;
          color: #e5e7eb;
        }

        .reset-password-dark .card {
          background: #1c2940;
          border-color: #334155;
          color: #e5e7eb;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .reset-password-dark h2 {
          color: #a9c8ff;
        }

        .reset-password-dark .reset-description {
          color: #cbd5e1;
        }

        .reset-password-dark .form-control {
          background: #111b2b;
          border-color: #475569;
          color: #f8fafc;
        }

        .reset-password-dark .form-control::placeholder {
          color: #94a3b8;
        }

        .reset-password-dark .password-toggle {
          color: #a9c8ff;
        }

        .reset-password-dark .reset-login-link {
          color: #93c5fd;
        }

        .reset-password-dark .reset-message.success {
          color: #86efac;
        }

        .reset-password-dark .reset-message.error {
          color: #fca5a5;
        }

        @media (max-width: 576px) {
          .reset-password-page .login-col {
            padding: 25px 14px;
          }

          .reset-password-page .card-body {
            padding: 25px 20px;
          }

          .reset-password-page h2 {
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
                {t("Reset Password", "إعادة تعيين كلمة المرور")}
              </h2>

              <p className="text-center reset-description">
                {t(
                  "Enter OTP and your new password.",
                  "أدخل رمز التحقق وكلمة المرور الجديدة."
                )}
              </p>

              <form onSubmit={resetPassword}>
                {/* Email */}
                <FormGroup>
                  <Label for="reset-email">
                    {t("Email", "البريد الإلكتروني")}
                  </Label>

                  <input
                    id="reset-email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t(
                      "Enter your email",
                      "أدخل بريدك الإلكتروني"
                    )}
                    autoComplete="email"
                    dir="ltr"
                    required
                    disabled={loading}
                  />
                </FormGroup>

                {/* OTP */}
                <FormGroup>
                  <Label for="reset-otp">
                    {t("OTP", "رمز التحقق")}
                  </Label>

                  <input
                    id="reset-otp"
                    type="text"
                    className="form-control"
                    placeholder={t(
                      "Enter OTP",
                      "أدخل رمز التحقق"
                    )}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    dir="ltr"
                    required
                    disabled={loading}
                  />
                </FormGroup>

                {/* New Password */}
                <FormGroup>
                  <Label for="reset-new-password">
                    {t("New Password", "كلمة المرور الجديدة")}
                  </Label>

                  <div className="password-wrapper">
                    <input
                      id="reset-new-password"
                      type={showNewPassword ? "text" : "password"}
                      className="form-control"
                      placeholder={t(
                        "Enter new password",
                        "أدخل كلمة المرور الجديدة"
                      )}
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      required
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowNewPassword((previous) => !previous)
                      }
                      aria-label={
                        showNewPassword
                          ? t("Hide new password", "إخفاء كلمة المرور الجديدة")
                          : t("Show new password", "إظهار كلمة المرور الجديدة")
                      }
                    >
                      {showNewPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>
                </FormGroup>

                {/* Confirm Password */}
                <FormGroup>
                  <Label for="reset-confirm-password">
                    {t("Confirm Password", "تأكيد كلمة المرور")}
                  </Label>

                  <div className="password-wrapper">
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder={t(
                        "Confirm new password",
                        "أكد كلمة المرور الجديدة"
                      )}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      required
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      aria-label={
                        showConfirmPassword
                          ? t(
                              "Hide confirm password",
                              "إخفاء تأكيد كلمة المرور"
                            )
                          : t(
                              "Show confirm password",
                              "إظهار تأكيد كلمة المرور"
                            )
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>
                </FormGroup>

                {/* Submit */}
                <Button
                  color="primary"
                  className="w-100 reset-submit-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? t(
                        "Resetting Password...",
                        "جارٍ إعادة تعيين كلمة المرور..."
                      )
                    : t(
                        "Reset Password",
                        "إعادة تعيين كلمة المرور"
                      )}
                </Button>
              </form>

              {/* Feedback message */}
              {message && (
                <p
                  className={`reset-message ${messageType}`}
                  role="alert"
                >
                  {message}
                </p>
              )}

              {/* Back to Login */}
              <p className="text-center mt-4">
                {t("Back to", "العودة إلى")}
                <Link to="/" className="reset-login-link">
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

export default ResetPassword;
