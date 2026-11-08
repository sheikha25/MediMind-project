
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import medimindlogo from "../assets/medimindlogo.jpg";
import { LoginValidation } from "../validations/LoginValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login, clearUserMessage } from "../features/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Footer from "./Footer";

const Login = () => {
  const dispatch = useDispatch();

  const message = useSelector((state) => state.user.message);
  const isSuccess = useSelector((state) => state.user.isSuccess);
  const user = useSelector((state) => state.user.user);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isAdminLogin = searchParams.get("role") === "admin";

  // Same language system used in FeedbackSettings.jsx
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = language === "ar";
  const t = (en, ar) => (isArabic ? ar : en);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
    };

    window.addEventListener("medimind-language-change", syncLanguage);
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener(
        "medimind-language-change",
        syncLanguage
      );
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(LoginValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    dispatch(clearUserMessage());

    reset({
      email: "",
      password: "",
    });

    setRememberMe(false);
    setShowPassword(false);
  }, [dispatch, reset, isAdminLogin]);

  const handleSubmit = (data) => {
    const udata = {
      email: data.email.trim(),
      password: data.password,
      rememberMe,
    };

    dispatch(login(udata));
  };

  // Original navigation logic preserved
  useEffect(() => {
    if (message === "success" && isSuccess) {
      reset({
        email: "",
        password: "",
      });

      if (user?.role === "admin") {
        navigate("/admin-home");
      } else if (user?.role === "caregiver") {
        navigate("/caregiver-home");
      } else if (user?.role === "patient") {
        if (
          user.routineSetupCompleted === false &&
          user.routineSetupDeferred !== true
        ) {
          navigate("/daily-routine-setup", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      }
    }
  }, [message, isSuccess, user, navigate, reset]);

  const translateError = (error) => {
    if (!error) return "";

    if (!isArabic) return error;

    const normalized = error.toLowerCase();

    if (
      normalized.includes("email") &&
      normalized.includes("required")
    ) {
      return "البريد الإلكتروني مطلوب";
    }

    if (
      normalized.includes("email") &&
      (normalized.includes("valid") ||
        normalized.includes("invalid"))
    ) {
      return "يرجى إدخال بريد إلكتروني صحيح";
    }

    if (
      normalized.includes("password") &&
      normalized.includes("required")
    ) {
      return "كلمة المرور مطلوبة";
    }

    return error;
  };

  const displayMessage = () => {
    if (!message) return "";

    if (message === "success") {
      return t("Login successful", "تم تسجيل الدخول بنجاح");
    }

    if (isArabic && typeof message === "string") {
      if (
        /invalid credentials|incorrect password|login failed/i.test(
          message
        )
      ) {
        return "فشل تسجيل الدخول. يرجى التحقق من بياناتك.";
      }
    }

    return message;
  };

  return (
    <Container fluid>
      <div
        className="medimind-login-page"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <style>{`
          .medimind-login-page {
            --login-text: #24364b;
            --login-muted: #64748b;
            --login-input: #ffffff;
            --login-border: #ced4da;
            --login-heading: #1e3a8a;
            --login-link: #1e40af;
            width: 100%;
            min-width: 0;
          }

          body.dark-theme .medimind-login-page,
          body.dark-mode .medimind-login-page,
          [data-theme="dark"] .medimind-login-page {
            --login-text: #f1f5f9;
            --login-muted: #c4d1df;
            --login-input: #243b53;
            --login-border: #40566f;
            --login-heading: #a9c9ff;
            --login-link: #93c5fd;
          }

          .medimind-login-page .login-col .card {
            color: var(--login-text);
          }

          .medimind-login-page .login-label {
            color: var(--login-text);
          }

          .medimind-login-page .login-input {
            background: var(--login-input);
            color: var(--login-text);
            border: 1px solid var(--login-border);
          }

          .medimind-login-page .login-input:focus {
            background: var(--login-input);
            color: var(--login-text);
          }

          .medimind-login-page .login-input::placeholder {
            color: var(--login-muted);
          }

          .medimind-login-page .login-admin-title {
            color: var(--login-heading);
            font-weight: 600;
          }

          .medimind-login-page .login-link {
            color: var(--login-link);
          }

          .medimind-login-page .login-eye-button {
            color: var(--login-heading) !important;
          }

          .medimind-login-page .login-register-text {
            color: var(--login-text);
          }

          .medimind-login-page[dir="rtl"] .login-label,
          .medimind-login-page[dir="rtl"] .login-register-text {
            text-align: right;
          }

          .medimind-login-page .login-remember-group {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .medimind-login-page .login-remember-group .form-check-input {
            margin: 0;
            float: none;
            position: static;
          }

          .medimind-login-page .login-remember-group .form-check-label {
            margin: 0;
          }
        `}</style>

        <Row className="login-row">
          <Col md="6" className="login-col mx-auto">
            <Card>
              <CardBody>
                <img
                  src={medimindlogo}
                  alt="MediMind logo"
                  className="logo text-center"
                />

                {isAdminLogin && (
                  <h4 className="text-center mb-4 login-admin-title">
                    {t("Admin Login", "تسجيل دخول المسؤول")}
                  </h4>
                )}

                <form
                  onSubmit={submitForm(handleSubmit)}
                  autoComplete="off"
                >
                  {message && (
                    <FormGroup>
                      <h5
                        className="text-center"
                        role="status"
                        style={{
                          color:
                            message === "success" ? "green" : "red",
                        }}
                      >
                        {displayMessage()}
                      </h5>
                    </FormGroup>
                  )}

                  <FormGroup>
                    <Label
                      htmlFor="login-email"
                      className="login-label"
                    >
                      {t("Email", "البريد الإلكتروني")}
                    </Label>

                    <input
                      id="login-email"
                      type="email"
                      placeholder={t(
                        "Enter Email Address",
                        "أدخل البريد الإلكتروني"
                      )}
                      className="form-control login-input"
                      autoComplete="off"
                      dir="ltr"
                      {...register("email")}
                    />

                    <p style={{ color: "red" }}>
                      {translateError(errors.email?.message)}
                    </p>
                  </FormGroup>

                  <FormGroup>
                    <Label
                      htmlFor="login-password"
                      className="login-label"
                    >
                      {t("Password", "كلمة المرور")}
                    </Label>

                    <div style={{ position: "relative" }}>
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t(
                          "Enter Password",
                          "أدخل كلمة المرور"
                        )}
                        className="form-control login-input"
                        autoComplete="new-password"
                        style={{
                          paddingRight: isArabic ? "12px" : "45px",
                          paddingLeft: isArabic ? "45px" : "12px",
                        }}
                        dir={isArabic ? "rtl" : "ltr"}
                        {...register("password")}
                      />

                      <button
                        type="button"
                        className="login-eye-button"
                        onClick={() =>
                          setShowPassword((previous) => !previous)
                        }
                        aria-label={
                          showPassword
                            ? t("Hide password", "إخفاء كلمة المرور")
                            : t("Show password", "إظهار كلمة المرور")
                        }
                        style={{
                          position: "absolute",
                          top: "50%",
                          ...(isArabic
                            ? { left: "14px" }
                            : { right: "14px" }),
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {showPassword ? (
                          <FaEyeSlash size={20} />
                        ) : (
                          <FaEye size={20} />
                        )}
                      </button>
                    </div>

                    <p style={{ color: "red" }}>
                      {translateError(errors.password?.message)}
                    </p>
                  </FormGroup>

                  <FormGroup className="login-remember-group">
                    <Input
                      id="login-remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(event.target.checked)
                      }
                    />

                    <Label
                      htmlFor="login-remember"
                      className="login-label"
                    >
                      {t("Remember me", "تذكرني")}
                    </Label>
                  </FormGroup>

                  <FormGroup>
                    <Link
                      to="/forgot-password"
                      className="login-link"
                    >
                      {t(
                        "Forgot Password?",
                        "هل نسيت كلمة المرور؟"
                      )}
                    </Link>
                  </FormGroup>

                  <FormGroup className="text-center">
                    <Button
                      color="primary"
                      type="submit"
                      style={{ width: "60%" }}
                    >
                      {t("SIGN IN", "تسجيل الدخول")}
                    </Button>
                  </FormGroup>

                  {!isAdminLogin && (
                    <FormGroup className="login-register-text">
                      {t("No Account?", "ليس لديك حساب؟")}{" "}
                      <Link
                        to="/Splashscreen"
                        className="login-link"
                      >
                        {t("Sign Up", "إنشاء حساب")}
                      </Link>{" "}
                      {t("Now", "الآن")}
                    </FormGroup>
                  )}
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      <Footer />
    </Container>
  );
};

export default Login;
