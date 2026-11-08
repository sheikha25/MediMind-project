
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import medimindlogo from "../assets/medimindlogo.jpg";
import { logout } from "../features/UserSlice";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = language === "ar";
  const t = (english, arabic) => (isArabic ? arabic : english);

  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
    };

    window.addEventListener("medimind-language-change", updateLanguage);
    window.addEventListener("medimindLanguageChanged", updateLanguage);
    window.addEventListener("storage", updateLanguage);

    return () => {
      window.removeEventListener("medimind-language-change", updateLanguage);
      window.removeEventListener("medimindLanguageChanged", updateLanguage);
      window.removeEventListener("storage", updateLanguage);
    };
  }, []);

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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
      navigate("/Splashscreen");
    }
  };

  const navItems = [
    { to: "/home", en: "Dashboard", ar: "لوحة التحكم" },
    { to: "/medications", en: "Medications", ar: "الأدوية" },
    { to: "/reports", en: "Reports", ar: "التقارير" },
    { to: "/analytics", en: "Analytics", ar: "التحليلات" },
    { to: "/caregiver", en: "Caregiver", ar: "مقدم الرعاية" },
    { to: "/settings", en: "Settings", ar: "الإعدادات" },
  ];

  const isActivePage = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

  return (
    <header
      className="medimind-patient-header"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        /*
           HEADER CONTAINER
     */

        .medimind-patient-header {
          background: #ffffff !important;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
          width: 100%;
          position: relative;
          z-index: 10;
        }

        .medimind-patient-header .mm-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          gap: 18px;
          padding: 12px 22px;
          min-height: 88px;
          max-width: 1600px;
          margin: 0 auto;
        }

        /* 
           LOGO + NAVIGATION
         */

        .medimind-patient-header .mm-header-main {
          display: flex;
          align-items: center;
          flex: 1 1 auto;
          min-width: 0;
          gap: 22px;
        }

        .medimind-patient-header .mm-header-logo {
          width: 115px;
          height: auto;
          object-fit: contain;
          flex-shrink: 0;
          display: block;
        }

        .medimind-patient-header .mm-header-nav {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          flex: 1 1 auto;
          min-width: 0;
          gap: 17px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .medimind-patient-header .mm-header-nav::-webkit-scrollbar {
          display: none;
        }

        .medimind-patient-header .mm-header-nav .nav-link {
          color: #233e64 !important;
          opacity: 1 !important;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.5;
          text-decoration: none;
          white-space: nowrap;
          padding: 9px 3px;
          border-bottom: 2px solid transparent;
          background: transparent !important;
          transition: color 0.2s ease, border-color 0.2s ease;
        }

        .medimind-patient-header .mm-header-nav .nav-link:hover,
        .medimind-patient-header .mm-header-nav .nav-link:focus-visible {
          color: #1769d2 !important;
          border-bottom-color: #93c5fd;
          text-decoration: none;
        }

        .medimind-patient-header .mm-header-nav .nav-link.mm-active {
          color: #155cb5 !important;
          font-weight: 700;
          border-bottom-color: #155cb5;
        }

        /*
           NOTIFICATIONS + PROFILE + LOGOUT
        */

        .medimind-patient-header .mm-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-shrink: 0;
          gap: 14px;
        }

        .medimind-patient-header .mm-header-actions > * {
          flex-shrink: 0;
        }

        .medimind-patient-header .mm-header-profile {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #d9e0e9;
          background-color: #f8fafc;
          display: block;
        }

        .medimind-patient-header .mm-header-logout {
          border-radius: 10px;
          padding: 10px 15px;
          white-space: nowrap;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.5;
          background-color: #dc3545;
          border-color: #dc3545;
          transition: background-color 0.2s ease;
        }

        .medimind-patient-header .mm-header-logout:hover {
          background-color: #bb2d3b;
          border-color: #bb2d3b;
        }

        /* 
           ARABIC SUPPORT
         */

        .medimind-patient-header[dir="rtl"] .mm-header-nav .nav-link {
          font-family: Tahoma, Arial, sans-serif;
          font-size: 16px;
        }

        .medimind-patient-header[dir="rtl"] .mm-header-actions {
          justify-content: flex-start;
        }

        /* 
           DARK MODE
           Keep the original white header
         */

        body.dark-theme .medimind-patient-header,
        body.dark-mode .medimind-patient-header,
        [data-theme="dark"] .medimind-patient-header {
          background: #ffffff !important;
          border-bottom-color: #e5e7eb;
        }

        body.dark-theme .medimind-patient-header .mm-header-nav .nav-link,
        body.dark-mode .medimind-patient-header .mm-header-nav .nav-link,
        [data-theme="dark"] .medimind-patient-header .mm-header-nav .nav-link {
          color: #233e64 !important;
        }

        body.dark-theme .medimind-patient-header .mm-header-nav .nav-link.mm-active,
        body.dark-mode .medimind-patient-header .mm-header-nav .nav-link.mm-active,
        [data-theme="dark"] .medimind-patient-header .mm-header-nav .nav-link.mm-active {
          color: #155cb5 !important;
        }

        /* 
           RESPONSIVE DESIGN
        */

        @media (max-width: 1200px) {
          .medimind-patient-header .mm-header-inner {
            gap: 12px;
            padding: 11px 14px;
          }

          .medimind-patient-header .mm-header-main {
            gap: 13px;
          }

          .medimind-patient-header .mm-header-logo {
            width: 100px;
          }

          .medimind-patient-header .mm-header-nav {
            gap: 11px;
          }

          .medimind-patient-header .mm-header-nav .nav-link,
          .medimind-patient-header[dir="rtl"] .mm-header-nav .nav-link {
            font-size: 14px;
          }

          .medimind-patient-header .mm-header-actions {
            gap: 9px;
          }
        }

        @media (max-width: 900px) {
          .medimind-patient-header .mm-header-inner {
            min-height: 72px;
            padding: 9px 10px;
            gap: 8px;
          }

          .medimind-patient-header .mm-header-main {
            gap: 9px;
          }

          .medimind-patient-header .mm-header-logo {
            width: 85px;
          }

          .medimind-patient-header .mm-header-nav {
            gap: 8px;
          }

          .medimind-patient-header .mm-header-nav .nav-link,
          .medimind-patient-header[dir="rtl"] .mm-header-nav .nav-link {
            font-size: 12px;
            padding: 7px 2px;
          }

          .medimind-patient-header .mm-header-actions {
            gap: 7px;
          }

          .medimind-patient-header .mm-header-profile {
            width: 34px;
            height: 34px;
          }

          .medimind-patient-header .mm-header-logout {
            font-size: 12px;
            padding: 7px 9px;
          }
        }

        @media (max-width: 576px) {
          .medimind-patient-header .mm-header-inner {
            gap: 6px;
            padding: 8px;
          }

          .medimind-patient-header .mm-header-logo {
            width: 70px;
          }

          .medimind-patient-header .mm-header-main {
            gap: 7px;
          }

          .medimind-patient-header .mm-header-actions {
            gap: 5px;
          }

          .medimind-patient-header .mm-header-profile {
            width: 30px;
            height: 30px;
          }

          .medimind-patient-header .mm-header-logout {
            font-size: 11px;
            padding: 6px;
          }
        }

        /* Make header cover the full viewport width */
.medimind-patient-header {
  width: 100vw !important;
  max-width: none !important;
  margin-left: calc(50% - 50vw) !important;
  margin-right: calc(50% - 50vw) !important;
  box-sizing: border-box;
}

/* Keep header content aligned */
.medimind-patient-header .mm-header-inner {
  max-width: none;
  width: 100%;
  box-sizing: border-box;
  padding-left: 30px;
  padding-right: 30px;
}
      `}</style>

      <div className="mm-header-inner">
        <div className="mm-header-main">
          <img
            src={medimindlogo}
            className="mm-header-logo"
            alt="MediMind logo"
          />

          <nav
            className="mm-header-nav"
            aria-label={t("Patient navigation", "تنقل المريض")}
          >
            {navItems.map(({ to, en, ar }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link${
                  isActivePage(to) ? " mm-active" : ""
                }`}
                aria-current={isActivePage(to) ? "page" : undefined}
              >
                {t(en, ar)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mm-header-actions">
          <NotificationBell />

          <img
            src={
              user?.profilepic
                ? `http://localhost:3002${user.profilepic}`
                : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt={t("Profile", "الصورة الشخصية")}
            className="mm-header-profile"
          />

          <button
            type="button"
            className="btn btn-danger mm-header-logout"
            onClick={handleLogout}
          >
            {t("Logout", "تسجيل الخروج")}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
