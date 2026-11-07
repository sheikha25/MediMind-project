import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  FormGroup,
  Label,
  Row,
} from "reactstrap";

import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import medimindlogo from "../assets/medimindlogo.jpg";
import { RegisterValidation } from "../validations/RegisterValidation";
import {
  addUser,
  clearUserMessage,
} from "../features/UserSlice";
import Footer from "./Footer";

const CaregiverRegister = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem("medimindLanguage") || "en");
  const isArabic = language === "ar";
  const t = (en, ar) => isArabic ? ar : en;

  useEffect(() => {
    const syncLanguage = () => setLanguage(localStorage.getItem("medimindLanguage") || "en");
    window.addEventListener("medimind-language-change", syncLanguage);
    window.addEventListener("medimindLanguageChanged", syncLanguage);
    window.addEventListener("storage", syncLanguage);
    return () => {
      window.removeEventListener("medimind-language-change", syncLanguage);
      window.removeEventListener("medimindLanguageChanged", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const message = useSelector(
    (state) => state.user.message
  );

  const isSuccess = useSelector(
    (state) => state.user.isSuccess
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterValidation),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    dispatch(clearUserMessage());

    reset({
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [dispatch, reset]);

  const onSubmit = (data) => {
    const userData = {
      name: data.name,
      email: data.email.trim(),
      phoneNumber: data.phoneNumber,
      password: data.password,
      role: "caregiver",
    };

    dispatch(addUser(userData));
  };

  useEffect(() => {
    if (
      isSuccess &&
      message?.includes("Successful")
    ) {
      navigate("/");
    }
  }, [isSuccess, message, navigate]);

  const passwordIconButtonStyle = {
    position: "absolute",
    top: "50%",
    right: isArabic ? "auto" : "14px",
    left: isArabic ? "14px" : "auto",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#1e3a8a",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Container fluid className="mm-caregiver-register" dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        .mm-caregiver-register .login-col { min-width: 0; }
        .mm-caregiver-register .form-control { max-width: 100%; }
        .mm-caregiver-register[dir="rtl"] .form-control { text-align: right; }
        .mm-caregiver-register[dir="rtl"] .mm-password-input { padding-left: 45px !important; padding-right: 12px !important; }
        .mm-caregiver-register .mm-password-input { padding-right: 45px; }
      `}</style>
      <Row className="login-row">
        <Col className="login-col">
          <Card>
            <CardBody>
              <Button
                color="light"
                type="button"
                style={{
                  border: "1px solid #d1d5db",
                  marginBottom: "15px",
                  fontWeight: "500",
                }}
                onClick={() =>
                  navigate("/Splashscreen")
                }
              >
                {t("Go Back", "رجوع")}
              </Button>

              <img
                src={medimindlogo}
                alt="MediMind logo"
                className="logo"
              />

              <h2 className="text-center">
                {t("Caregiver Registration", "تسجيل مقدم الرعاية")}
              </h2>

              <p className="text-center">
                {t("Create your caregiver account.", "أنشئ حساب مقدم الرعاية الخاص بك.")}
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
              >
                <FormGroup>
                  <Label>{t("Full Name", "الاسم الكامل")}</Label>

                  <input
                    type="text"
                    placeholder={t("Enter Full Name", "أدخل الاسم الكامل")}
                    className="form-control"
                    autoComplete="off"
                    {...register("name")}
                  />

                  <p style={{ color: "red" }}>
                    {errors.name?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Label>{t("Email", "البريد الإلكتروني")}</Label>

                  <input
                    type="email"
                    placeholder={t("Enter Email", "أدخل البريد الإلكتروني")}
                    className="form-control"
                    autoComplete="new-email"
                    {...register("email")}
                  />

                  <p style={{ color: "red" }}>
                    {errors.email?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Label>{t("Phone Number", "رقم الهاتف")}</Label>

                  <input
                    type="text"
                    placeholder={t("Enter Phone Number", "أدخل رقم الهاتف")}
                    className="form-control"
                    autoComplete="off"
                    {...register("phoneNumber")}
                  />

                  <p style={{ color: "red" }}>
                    {errors.phoneNumber?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Label>{t("Password", "كلمة المرور")}</Label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder={t("Enter Password", "أدخل كلمة المرور")}
                      className="form-control"
                      autoComplete="new-password"
                      style={{
                        paddingRight: isArabic ? "12px" : "45px",
                        paddingLeft: isArabic ? "45px" : "12px",
                      }}
                      {...register("password")}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      title={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      style={
                        passwordIconButtonStyle
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>

                  <p style={{ color: "red" }}>
                    {errors.password?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Label>{t("Confirm Password", "تأكيد كلمة المرور")}</Label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder={t("Confirm Password", "أكد كلمة المرور")}
                      className="form-control"
                      autoComplete="new-password"
                      style={{
                        paddingRight: isArabic ? "12px" : "45px",
                        paddingLeft: isArabic ? "45px" : "12px",
                      }}
                      {...register(
                        "confirmPassword"
                      )}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      title={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      style={
                        passwordIconButtonStyle
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>

                  <p style={{ color: "red" }}>
                    {
                      errors.confirmPassword
                        ?.message
                    }
                  </p>
                </FormGroup>

                <FormGroup>
                  <Button
                    color="success"
                    type="submit"
                    className="w-100"
                  >
                    {t("Create Account", "إنشاء حساب")}
                  </Button>
                </FormGroup>

                {message && (
                  <FormGroup>
                    <h5
                      className="text-center"
                      style={{
                        color:
                          message.includes(
                            "Successful"
                          )
                            ? "green"
                            : "red",
                      }}
                    >
                      {message}
                    </h5>
                  </FormGroup>
                )}

                <FormGroup className="text-center">
                  {t("Already have an account?", "لديك حساب بالفعل؟")}{" "}
                  <Link to="/">
                    {t("Login", "تسجيل الدخول")}
                  </Link>
                </FormGroup>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Footer />
    </Container>
  );
};

export default CaregiverRegister;
