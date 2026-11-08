
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Alert,
} from "reactstrap";
import { useSelector } from "react-redux";
import AdminHeader from "./AdminHeader";

const AdminSettings = () => {
  const user = useSelector((state) => state.user.user);

  const [activePage, setActivePage] = useState("profile");

  // Language
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = language === "ar";
  const t = (en, ar) => (isArabic ? ar : en);

  // Theme
  const [theme, setTheme] = useState(
    () => localStorage.getItem("medimind-theme") || "light"
  );

  const isDark = theme === "dark";

  // Notifications preference (local only)
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem("medimind-admin-notifications") !== "false"
  );

  // Admin profile display values
  const [adminName, setAdminName] = useState(user?.name || "");
  const [adminEmail, setAdminEmail] = useState(user?.email || "");

  const [message, setMessage] = useState("");

  useEffect(() => {
    setAdminName(user?.name || "");
    setAdminEmail(user?.email || "");
  }, [user?.name, user?.email]);

  // Sync with changes made elsewhere in MediMind
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

    events.forEach((eventName) =>
      window.addEventListener(eventName, syncSettings)
    );

    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, syncSettings)
      );
    };
  }, []);

  const changeLanguage = (value) => {
    setLanguage(value);
    localStorage.setItem("medimindLanguage", value);

    window.dispatchEvent(new Event("medimind-language-change"));
    window.dispatchEvent(new Event("medimindLanguageChanged"));
  };

  const changeTheme = (value) => {
    setTheme(value);
    localStorage.setItem("medimind-theme", value);

    document.body.classList.toggle("dark-theme", value === "dark");

    window.dispatchEvent(new Event("medimind-theme-change"));
    window.dispatchEvent(new Event("medimindThemeChanged"));
  };

  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDark);
  }, [isDark]);

  const saveNotifications = () => {
    localStorage.setItem(
      "medimind-admin-notifications",
      String(notificationsEnabled)
    );

    setMessage(
      t(
        "Notification preference saved on this device. Server notifications are not configured here.",
        "تم حفظ تفضيل الإشعارات على هذا الجهاز. لم يتم إعداد إشعارات الخادم من هذه الصفحة."
      )
    );
  };

  const showUnavailableMessage = () => {
    setMessage(
      t(
        "This action requires a backend endpoint and is not connected yet.",
        "هذه العملية تحتاج إلى واجهة برمجية في الخادم ولم يتم ربطها بعد."
      )
    );
  };

  const openPage = (page) => {
    setActivePage(page);
    setMessage("");
  };

  const menuItems = [
    {
      key: "profile",
      en: "Admin Profile",
      ar: "الملف الشخصي للمسؤول",
    },
    {
      key: "notification",
      en: "Notifications",
      ar: "الإشعارات",
    },
    {
      key: "language",
      en: "Language",
      ar: "اللغة",
    },
    {
      key: "theme",
      en: "Theme",
      ar: "المظهر",
    },
    {
      key: "security",
      en: "Security",
      ar: "الأمان",
    },
    {
      key: "about",
      en: "About MediMind",
      ar: "حول MediMind",
    },
  ];

  return (
    <Container
      fluid
      className={`dashboard-page admin-settings-page ${isDark ? "admin-settings-dark" : ""
        }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .admin-settings-page {
          min-height: 100vh;
          /* Reveal the medical-pattern image already on body in App.css */
          background: transparent !important;
          color: #1f2937;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .admin-settings-page .admin-settings-sidebar {
          background: #17418c !important;
          color: #ffffff !important;
          padding: 28px 18px;
          min-height: 85vh;
          border-inline-end: 1px solid rgba(255,255,255,.25);
        }

        .admin-settings-page .admin-settings-content {
          padding: 35px;
          min-width: 0;
          background: transparent !important;
        }

        .admin-settings-page .admin-settings-sidebar h4 {
          color: #ffffff !important;
        }

        .admin-settings-page .admin-settings-link {
          display: block;
          width: 100%;
          border: none;
          background: transparent;
          padding: 13px 15px;
          margin-bottom: 7px;
          border-radius: 10px;
          text-align: start;
          color: #ffffff !important;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .admin-settings-page .admin-settings-link:hover {
          background: #0b5ed7 !important;
          color: #ffffff !important;
        }

        .admin-settings-page .admin-settings-link.active {
          background: #0b5ed7 !important;
          color: #ffffff !important;
          font-weight: 700;
        }

        .admin-settings-page .card {
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 15px rgba(30, 58, 138, 0.05);
          background: #ffffff;
          color: #1f2937;
        }

        .admin-settings-page .card-body {
          padding: 25px;
        }

        .admin-settings-page label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .admin-settings-page .form-control {
          min-height: 44px;
          border-radius: 9px;
        }

        .admin-settings-page .admin-settings-section-title {
          color: #1e3a8a;
          font-weight: 700;
          margin-bottom: 22px;
        }

        .admin-settings-page .admin-settings-description {
          color: #64748b;
          line-height: 1.8;
        }

        /* Dark theme */

        .admin-settings-page.admin-settings-dark {
          background: transparent !important;
          color: #e5e7eb;
        }

        .admin-settings-page.admin-settings-dark .admin-settings-sidebar {
          background: #17418c !important;
          border-color: rgba(255,255,255,.25);
        }

        .admin-settings-dark .admin-settings-link {
          color: #ffffff !important;
        }

        .admin-settings-dark .admin-settings-link:hover {
          background: #0b5ed7 !important;
        }

        .admin-settings-dark .admin-settings-link.active {
          background: #0b5ed7 !important;
          color: #ffffff !important;
        }

        .admin-settings-dark .card {
          background: #1c2940;
          border-color: #334155;
          color: #e5e7eb;
        }

        .admin-settings-dark .form-control {
          background: #111b2b;
          color: #f8fafc;
          border-color: #475569;
        }

        .admin-settings-dark .form-control:disabled {
          background: #27354b;
          color: #cbd5e1;
          opacity: 1;
        }

        .admin-settings-dark .form-control::placeholder {
          color: #94a3b8;
        }

        .admin-settings-dark .admin-settings-section-title {
          color: #a9c8ff;
        }

        .admin-settings-dark .admin-settings-description {
          color: #cbd5e1;
        }

        .admin-settings-dark .text-muted {
          color: #cbd5e1 !important;
        }

        @media (max-width: 767px) {
          .admin-settings-page .admin-settings-sidebar {
            border-inline-end: none;
            border-bottom: 1px solid rgba(255,255,255,.25);
            padding: 18px 14px;
            min-height: auto;
          }

          .admin-settings-page .admin-settings-content {
            padding: 22px 14px;
          }

          .admin-settings-page .card-body {
            padding: 18px;
          }

          .admin-settings-page .admin-settings-section-title {
            font-size: 23px;
          }
        }
      `}</style>

      <AdminHeader />

      <Row className="g-0" style={{ minHeight: "85vh" }}>
        {/* Sidebar */}
        <Col md="3" lg="2" className="admin-settings-sidebar">
          <h4 className="mb-4">
            {t("Admin Settings", "إعدادات المسؤول")}
          </h4>

          <nav aria-label={t("Settings sections", "أقسام الإعدادات")}>
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`admin-settings-link ${activePage === item.key ? "active" : ""
                  }`}
                onClick={() => openPage(item.key)}
                aria-current={activePage === item.key ? "page" : undefined}
              >
                {t(item.en, item.ar)}
              </button>
            ))}
          </nav>
        </Col>

        {/* Main Content */}
        <Col md="9" lg="10" className="admin-settings-content">
          {message && (
            <Alert color="info" className="mb-4">
              {message}
            </Alert>
          )}

          {/* ADMIN PROFILE */}
          {activePage === "profile" && (
            <>
              <h2 className="admin-settings-section-title">
                {t("Admin Profile", "الملف الشخصي للمسؤول")}
              </h2>

              <Card>
                <CardBody>
                  <p className="admin-settings-description">
                    {t(
                      "View your administrator account information.",
                      "عرض معلومات حساب المسؤول."
                    )}
                  </p>

                  <label htmlFor="admin-name">
                    {t("Full Name", "الاسم الكامل")}
                  </label>

                  <input
                    id="admin-name"
                    type="text"
                    className="form-control mb-3"
                    value={adminName}
                    onChange={(event) => setAdminName(event.target.value)}
                  />

                  <label htmlFor="admin-email">
                    {t("Email Address", "البريد الإلكتروني")}
                  </label>

                  <input
                    id="admin-email"
                    type="email"
                    className="form-control mb-3"
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                  />

                  <label htmlFor="admin-role">
                    {t("Account Role", "دور الحساب")}
                  </label>

                  <input
                    id="admin-role"
                    type="text"
                    className="form-control mb-3"
                    value={t("Administrator", "مسؤول النظام")}
                    disabled
                  />

                  <Button
                    color="primary"
                    className="w-100"
                    type="button"
                    onClick={showUnavailableMessage}
                  >
                    {t("Save Changes", "حفظ التغييرات")}
                  </Button>
                </CardBody>
              </Card>
            </>
          )}

          {/* NOTIFICATIONS */}
          {activePage === "notification" && (
            <>
              <h2 className="admin-settings-section-title">
                {t("Notification Settings", "إعدادات الإشعارات")}
              </h2>

              <Card>
                <CardBody>
                  <p className="admin-settings-description">
                    {t(
                      "Choose your notification preference for administrator alerts.",
                      "اختر تفضيل الإشعارات الخاصة بتنبيهات المسؤول."
                    )}
                  </p>

                  <label htmlFor="admin-notifications">
                    {t("Notifications", "الإشعارات")}
                  </label>

                  <select
                    id="admin-notifications"
                    className="form-control mb-3"
                    value={notificationsEnabled ? "enabled" : "disabled"}
                    onChange={(event) =>
                      setNotificationsEnabled(
                        event.target.value === "enabled"
                      )
                    }
                  >
                    <option value="enabled">
                      {t("Enable Notifications", "تفعيل الإشعارات")}
                    </option>

                    <option value="disabled">
                      {t("Disable Notifications", "تعطيل الإشعارات")}
                    </option>
                  </select>

                  <p className="small text-muted">
                    {t(
                      "This preference is stored locally. It does not change server notification delivery.",
                      "يُحفظ هذا التفضيل محليًا، ولا يغيّر إرسال الإشعارات من الخادم."
                    )}
                  </p>

                  <Button
                    color="primary"
                    className="w-100"
                    type="button"
                    onClick={saveNotifications}
                  >
                    {t("Save Preferences", "حفظ التفضيلات")}
                  </Button>
                </CardBody>
              </Card>
            </>
          )}

          {/* LANGUAGE */}
          {activePage === "language" && (
            <>
              <h2 className="admin-settings-section-title">
                {t("Language", "اللغة")}
              </h2>

              <Card>
                <CardBody>
                  <p className="admin-settings-description">
                    {t(
                      "Select your preferred language for MediMind.",
                      "اختر لغتك المفضلة لاستخدام MediMind."
                    )}
                  </p>

                  <label htmlFor="admin-language">
                    {t("Display Language", "لغة العرض")}
                  </label>

                  <select
                    id="admin-language"
                    className="form-control"
                    value={language}
                    onChange={(event) =>
                      changeLanguage(event.target.value)
                    }
                  >
                    <option value="en">
                      {t("English", "الإنجليزية")}
                    </option>

                    <option value="ar">
                      {t("Arabic", "العربية")}
                    </option>
                  </select>
                </CardBody>
              </Card>
            </>
          )}

          {/* THEME */}
          {activePage === "theme" && (
            <>
              <h2 className="admin-settings-section-title">
                {t("Appearance", "المظهر")}
              </h2>

              <Card>
                <CardBody>
                  <p className="admin-settings-description">
                    {t(
                      "Customize how MediMind looks on your device.",
                      "خصص مظهر MediMind على جهازك."
                    )}
                  </p>

                  <label htmlFor="admin-theme">
                    {t("Display Theme", "مظهر العرض")}
                  </label>

                  <select
                    id="admin-theme"
                    className="form-control"
                    value={theme}
                    onChange={(event) =>
                      changeTheme(event.target.value)
                    }
                  >
                    <option value="light">
                      {t("Light Mode", "الوضع الفاتح")}
                    </option>

                    <option value="dark">
                      {t("Dark Mode", "الوضع الداكن")}
                    </option>
                  </select>
                </CardBody>
              </Card>
            </>
          )}

          {/* SECURITY */}
          {activePage === "security" && (
            <>
              <h2 className="admin-settings-section-title">
                {t("Security Settings", "إعدادات الأمان")}
              </h2>

              <Card>
                <CardBody>
                  <p className="admin-settings-description">
                    {t(
                      "Manage the security of your administrator account.",
                      "إدارة أمان حساب المسؤول."
                    )}
                  </p>

                  <label htmlFor="admin-current-password">
                    {t("Current Password", "كلمة المرور الحالية")}
                  </label>

                  <input
                    id="admin-current-password"
                    type="password"
                    className="form-control mb-3"
                    autoComplete="current-password"
                    placeholder={t(
                      "Enter current password",
                      "أدخل كلمة المرور الحالية"
                    )}
                  />

                  <label htmlFor="admin-new-password">
                    {t("New Password", "كلمة المرور الجديدة")}
                  </label>

                  <input
                    id="admin-new-password"
                    type="password"
                    className="form-control mb-3"
                    autoComplete="new-password"
                    placeholder={t(
                      "Enter new password",
                      "أدخل كلمة المرور الجديدة"
                    )}
                  />

                  <label htmlFor="admin-confirm-password">
                    {t("Confirm New Password", "تأكيد كلمة المرور الجديدة")}
                  </label>

                  <input
                    id="admin-confirm-password"
                    type="password"
                    className="form-control mb-3"
                    autoComplete="new-password"
                    placeholder={t(
                      "Confirm new password",
                      "أكد كلمة المرور الجديدة"
                    )}
                  />

                  <Button
                    color="primary"
                    className="w-100"
                    type="button"
                    onClick={showUnavailableMessage}
                  >
                    {t("Change Password", "تغيير كلمة المرور")}
                  </Button>
                </CardBody>
              </Card>
            </>
          )}

          {/* ABOUT MEDIMIND */}
          {activePage === "about" && (
            <>
              <h2 className="admin-settings-section-title">
                {t("About MediMind", "حول MediMind")}
              </h2>

              <Card>
                <CardBody>
                  <p className="admin-settings-description">
                    {t(
                      "MediMind is a smart web-based medication reminder system that helps users take their medicines on time. It provides personalized reminders, tracks medication intake, and generates adherence reports.",
                      "MediMind هو نظام ذكي قائم على الويب للتذكير بالأدوية، يساعد المستخدمين على تناول أدويتهم في الوقت المحدد. ويوفر تذكيرات مخصصة، ويتابع تناول الأدوية، وينشئ تقارير الالتزام الدوائي."
                    )}
                  </p>

                  <p className="admin-settings-description">
                    {t(
                      "Our mission is to improve health by helping users stay consistent with their medication routines.",
                      "مهمتنا هي تحسين الصحة من خلال مساعدة المستخدمين على الالتزام بمواعيد أدويتهم."
                    )}
                  </p>

                  <p>
                    <strong>{t("Version:", "الإصدار:")}</strong> 1.0
                  </p>

                  <p>
                    <strong>{t("Year:", "السنة:")}</strong> 2026
                  </p>

                  <h5 className="mt-4">
                    {t("Developed by:", "تم التطوير بواسطة:")}
                  </h5>

                  <ul>
                    <li>Sheikha Qasim Al-Qusaimi</li>
                    <li>Rawan Salim Al-Hosni</li>
                  </ul>
                </CardBody>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminSettings;
