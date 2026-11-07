
import { useEffect, useState } from "react";
import {Navbar,NavbarBrand,Nav,NavItem,Collapse,NavbarToggler,} from "reactstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../features/UserSlice";
import medimindlogo from "../assets/medimindlogo.jpg";

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

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

  // Sync language and theme with MediMind settings
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

  // Logout
  const handleLogout = () => {
    const confirmed = window.confirm(
      t(
        "Are you sure you want to logout from MediMind?",
        "هل أنت متأكد من رغبتك في تسجيل الخروج من MediMind؟"
      )
    );

    if (confirmed) {
      dispatch(logout());
      navigate("/Splashscreen");
    }
  };

  // Admin navigation only
  const navLinks = [
    {
      path: "/admin-home",
      en: "Dashboard",
      ar: "لوحة التحكم",
    },
    {
      path: "/admin-settings",
      en: "Settings",
      ar: "الإعدادات",
    },
  ];

  return (
    <Navbar
      expand="md"
      className={`admin-header px-3 px-md-4 ${isDark ? "admin-header-dark" : ""
        }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .admin-header {
          background-color: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          min-height: 76px;
          position: relative;
          z-index: 100;
        }

        .admin-header .navbar-brand {
          margin-inline-end: 24px;
          margin-right: 0;
        }

        .admin-header .admin-header-logo {
          width: 120px;
          height: auto;
          max-width: 100%;
        }

        .admin-header .navbar-nav {
          gap: 10px;
        }

        .admin-header .admin-nav-link {
          color: #334155;
          text-decoration: none;
          display: block;
          padding: 9px 14px;
          border-radius: 9px;
          font-weight: 500;
          transition:
            background-color 0.2s ease,
            color 0.2s ease;
        }

        .admin-header .admin-nav-link:hover {
          background-color: #eff6ff;
          color: #1e40af;
        }

        .admin-header .admin-nav-link.active {
          background-color: #dbeafe;
          color: #1e3a8a;
          font-weight: 700;
        }

        .admin-header .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-inline-start: auto;
        }

        .admin-header .admin-profile-image {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #d1d5db;
        }

        .admin-header .admin-logout-button {
          border-radius: 8px;
          padding: 7px 16px;
          font-weight: 500;
        }

        .admin-header .navbar-toggler {
          border-color: #cbd5e1;
        }

        .admin-header .navbar-toggler-icon {
          background-image: none;
          width: auto;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          color: #334155;
        }

  /* White header in BOTH themes */
.admin-header,
.admin-header.admin-header-dark,
body.dark-theme .admin-header {
  background-color: #ffffff !important;
  background-image: none !important;
  color: #1e3a8a !important;
  border-bottom: 1px solid #e5e7eb !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Dark blue navigation text in BOTH themes */
.admin-header .admin-nav-link,
.admin-header.admin-header-dark .admin-nav-link {
  color: #334155 !important;
}

/* Hover */
.admin-header .admin-nav-link:hover,
.admin-header.admin-header-dark .admin-nav-link:hover {
  background-color: #eff6ff !important;
  color: #1e40af !important;
}

/* Active navigation */
.admin-header .admin-nav-link.active,
.admin-header.admin-header-dark .admin-nav-link.active {
  background-color: #dbeafe !important;
  color: #1e3a8a !important;
}

/* Mobile menu icon */
.admin-header .navbar-toggler-icon,
.admin-header.admin-header-dark .navbar-toggler-icon {
  color: #334155 !important;
}

        .admin-header-dark .admin-nav-link {
          color: #e2e8f0;
        }

        .admin-header-dark .admin-nav-link:hover {
          background-color: #293b57;
          color: #ffffff;
        }

        .admin-header-dark .admin-nav-link.active {
          background-color: #3b63b6;
          color: #ffffff;
        }

        .admin-header-dark .admin-profile-image {
          border-color: #64748b;
        }

        .admin-header-dark .navbar-toggler {
          border-color: #64748b;
        }

        .admin-header-dark .navbar-toggler-icon {
          color: #e2e8f0;
        }

        /* Mobile Responsive */

        @media (max-width: 767px) {
          .admin-header {
            padding-top: 12px;
            padding-bottom: 12px;
          }

          .admin-header .navbar-collapse {
            width: 100%;
            padding-top: 15px;
          }

          .admin-header .navbar-nav {
            gap: 5px;
            width: 100%;
          }

          .admin-header .admin-header-actions {
            width: 100%;
            margin-inline-start: 0;
            padding-top: 15px;
            margin-top: 12px;
            border-top: 1px solid #e5e7eb;
            justify-content: space-between;
          }

          .admin-header-dark .admin-header-actions {
            border-top-color: #334155;
          }

          .admin-header .admin-nav-link {
            padding: 12px;
          }
        }
      `}</style>

      {/* MediMind Logo */}
      <NavbarBrand
        tag={Link}
        to="/admin-home"
        className="d-flex align-items-center"
        onClick={() => setIsOpen(false)}
      >
        <img
          src={medimindlogo}
          className="admin-header-logo"
          alt={t("MediMind logo", "شعار MediMind")}
        />
      </NavbarBrand>

      {/* Mobile Menu Toggle */}
      <NavbarToggler
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={t(
          "Toggle navigation",
          "إظهار أو إخفاء قائمة التنقل"
        )}
      >
        <span className="navbar-toggler-icon">
          {isOpen ? "✕" : "☰"}
        </span>
      </NavbarToggler>

      {/* Navigation */}
      <Collapse isOpen={isOpen} navbar>
        <Nav className="d-flex align-items-md-center" navbar>
          {navLinks.map((item) => {
            const active = location.pathname === item.path;

            return (
              <NavItem key={item.path}>
                <Link
                  to={item.path}
                  className={`admin-nav-link ${active ? "active" : ""
                    }`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {t(item.en, item.ar)}
                </Link>
              </NavItem>
            );
          })}
        </Nav>

        {/* Admin Profile and Logout */}
        <div className="admin-header-actions">
          <Link
            to="/admin-settings"
            title={t("Admin Profile", "الملف الشخصي للمسؤول")}
            aria-label={t(
              "Open Admin Settings",
              "فتح إعدادات المسؤول"
            )}
            onClick={() => setIsOpen(false)}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt={t("Admin Profile", "الملف الشخصي للمسؤول")}
              className="admin-profile-image"
            />
          </Link>

          <button
            type="button"
            className="btn btn-danger admin-logout-button"
            onClick={handleLogout}
          >
            {t("Logout", "تسجيل الخروج")}
          </button>
        </div>
      </Collapse>
    </Navbar>
  );
};

export default AdminHeader;
