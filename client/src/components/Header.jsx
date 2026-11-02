import { Row, Col } from "reactstrap";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useSelector,
  useDispatch,
} from "react-redux";

import medimindlogo from "../assets/medimindlogo.jpg";

import {
  logout,
} from "../features/UserSlice";

import NotificationBell from "./NotificationBell";

const Header = () => {
  const [language, setLanguage] = useState(
  () => localStorage.getItem("medimindLanguage") || "en"
);

const isArabic = language === "ar";

const t = (english, arabic) =>
  isArabic ? arabic : english;

useEffect(() => {
  const updateLanguage = () => {
    setLanguage(localStorage.getItem("medimindLanguage") || "en");
  };

  window.addEventListener("medimind-language-change", updateLanguage);
  window.addEventListener("storage", updateLanguage);

  return () => {
    window.removeEventListener("medimind-language-change", updateLanguage);
    window.removeEventListener("storage", updateLanguage);
  };
}, []);

  const user = useSelector(
    (state) => state.user.user
  );

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const handleLogout = () => {
    if (
     window.confirm(
  t(
    "Are you sure you want to logout from MediMind?",
    "هل أنت متأكد من تسجيل الخروج من MediMind؟"
  )
)
    ) {
      dispatch(logout());

      navigate(
        "/Splashscreen"
      );
    }
  };

  return (
    <Row
  dir={isArabic ? "rtl" : "ltr"}
  className="align-items-center px-4 py-3"
      style={{
        backgroundColor:
          "white",

        borderBottom:
          "1px solid #e5e7eb",

        boxShadow:
          "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <Col
        md="12"
        className="d-flex align-items-center justify-content-between"
      >
        <div className="d-flex align-items-center">
          <img
            src={medimindlogo}
            width="120px"
            alt="MediMind logo"
          />

          <div
            className="d-flex align-items-center"
            style={{
             marginInlineStart: "30px",

              gap: "10px",
            }}
          >
            <Link
              to="/home"
              className="nav-link"
            >
            {t("Dashboard", "لوحة التحكم")}
            </Link>

            <Link
              to="/medications"
              className="nav-link"
            >
             {t("Medications", "الأدوية")}
            </Link>

            <Link
              to="/reports"
              className="nav-link"
            >
             {t("Reports", "التقارير")}
            </Link>

            <Link
              to="/analytics"
              className="nav-link"
            >
             {t("Analytics", "التحليلات")}
            </Link>

            <Link
              to="/caregiver"
              className="nav-link"
            >
             {t("Caregiver", "مقدم الرعاية")}
            </Link>

            <Link
              to="/settings"
              className="nav-link"
            >
             {t("Settings", "الإعدادات")}
            </Link>
          </div>
        </div>

        <div
          className="d-flex align-items-center"
          style={{
            gap: "15px",
          }}
        >
          <NotificationBell />

          <div className="d-flex align-items-center">
            <img
              src={
                user?.profilepic
                  ? `http://localhost:3002${user.profilepic}`
                  : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt="Profile"
              style={{
                width:
                  "40px",

                height:
                  "40px",

                borderRadius:
                  "50%",

                objectFit:
                  "cover",

                border:
                  "2px solid #ddd",
              }}
            />
          </div>

          <button
            className="btn btn-danger"
            style={{
              borderRadius:
                "8px",

              padding:
                "6px 15px",
            }}
            onClick={
              handleLogout
            }
          >
           {t("Logout", "تسجيل الخروج")}
          </button>
        </div>
      </Col>
    </Row>
  );
};

export default Header;