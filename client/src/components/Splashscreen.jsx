import { useNavigate } from "react-router-dom";

import medimindlogo from "../assets/medimind-symbol.png";
import splashCare from "../assets/medimind-splash-care.png";
import splashCareDark from "../assets/medimind-splash-care-dark.png";
import patientImage from "../assets/patient-role.png";
import caregiverImage from "../assets/caregiver-role.png";
import adminImage from "../assets/admin-role.png";
import { useState, useEffect } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import "./Splashscreen.css";

const Splashscreen = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(
  () => localStorage.getItem("medimindLanguage") || "en"
);

useEffect(() => {
  const handleLanguageUpdate = () => {
    setLanguage(localStorage.getItem("medimindLanguage") || "en");
  };

  window.addEventListener(
    "medimind-language-change",
    handleLanguageUpdate
  );

  return () => {
    window.removeEventListener(
      "medimind-language-change",
      handleLanguageUpdate
    );
  };
}, []);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("medimind-theme") || "light"
  );

  
const handleLanguageToggle = () => {
  const newLanguage = language === "en" ? "ar" : "en";

  setLanguage(newLanguage);
  localStorage.setItem("medimindLanguage", newLanguage);

  window.dispatchEvent(new Event("medimind-language-change"));
};


  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);
    localStorage.setItem("medimind-theme", newTheme);

    document.body.classList.toggle(
      "dark-theme",
      newTheme === "dark"
    );
  };

  return (
  
<div
  className="splash-page"
  dir={language === "ar" ? "rtl" : "ltr"}
>


<button
  type="button"
  className="splash-language-toggle"
  onClick={handleLanguageToggle}
  aria-label="Change language"
>
  {language === "en" ? "العربية" : "English"}
</button>

    <button
  type="button"
  className="splash-theme-toggle"
  onClick={handleThemeToggle}
  aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
  aria-pressed={theme === "dark"}
>
  <FiMoon className="theme-icon" />
  <FiSun className="theme-icon" />
  <span className="theme-toggle-circle" />
</button>

      {/* Decorative background shapes */}
      <div className="splash-blob splash-blob-top"></div>
      <div className="splash-blob splash-blob-bottom"></div>


      {/* ===================================
          LEFT SIDE
      ==================================== */}

      <section className="splash-content">

        {/* MediMind Logo */}
        <div className="splash-brand">
  <img
    src={medimindlogo}
    alt="MediMind symbol"
    className="splash-logo"
  />
  <div className="splash-brand-name">MEDIMIND</div>
</div>


        {/* Application Description */}
       
<p className="splash-product-title">
  {language === "ar"
    ? "إدارة ذكية للأدوية ومتابعة الرعاية الصحية"
    : "Smart Medication & Care Management"}
</p>



        <div className="splash-divider"></div>


        {/* Welcome */}
       
<h1 className="splash-heading">
  {language === "ar"
    ? "مرحبًا بك في ميدي مايند"
    : "Welcome to MediMind"}
</h1>



        
<p className="splash-tagline">
  {language === "ar"
    ? "أدويتك. رعايتك. تواصل يجمعهما."
    : "Your medication. Your care. Connected."}
</p>



        {/* ===================================
            ROLE CARDS
        ==================================== */}

        <div className="role-cards">


          {/* PATIENT */}

          <button
            type="button"
            className="role-card"
            onClick={() =>
              navigate("/register/patient")
            }
          >

            <div className="role-image-container">

              <img
                src={patientImage}
                alt="Patient"
                className="role-image"
              />

            </div>


            <div className="role-card-content">

              
<h2>
  {language === "ar" ? "المريض" : "Patient"}
</h2>

<p>
  {language === "ar" ? (
    <>
      إدارة أدويتك
      <br />
      والالتزام بمواعيدها.
    </>
  ) : (
    <>
      Manage your medications
      <br />
      and stay on track.
    </>
  )}
</p>


            </div>

          </button>


          {/* CAREGIVER */}

          <button
            type="button"
            className="role-card"
            onClick={() =>
              navigate("/register/caregiver")
            }
          >

            <div className="role-image-container">

              <img
                src={caregiverImage}
                alt="Caregiver"
                className="role-image"
              />

            </div>


            <div className="role-card-content">

              
<h2>
  {language === "ar" ? "مقدم الرعاية" : "Caregiver"}
</h2>

<p>
  {language === "ar" ? (
    <>
      دعم المرضى
      <br />
      ومتابعة رعايتهم الصحية.
    </>
  ) : (
    <>
      Support and monitor
      <br />
      patient care.
    </>
  )}
</p>


            </div>

          </button>


          {/* ADMIN */}

          <button
            type="button"
            className="role-card"
            onClick={() =>
              navigate("/?role=admin")
            }
          >

            <div className="role-image-container">

              <img
                src={adminImage}
                alt="Administrator"
                className="role-image"
              />

            </div>


            <div className="role-card-content">

              
<h2>
  {language === "ar" ? "المسؤول" : "Admin"}
</h2>

<p>
  {language === "ar" ? (
    <>
      إدارة المستخدمين
      <br />
      والتحقق من المختصين الصحيين.
    </>
  ) : (
    <>
      Manage users and
      <br />
      verify professionals.
    </>
  )}
</p>

            </div>

          </button>

        </div>


        {/* 
            LOGIN
         */}

        <div className="login-section">

          
<div className="or-row">
  <span></span>

  <p>
    {language === "ar" ? "أو" : "OR"}
  </p>

  <span></span>
</div>


          
<p className="account-text">
  {language === "ar"
    ? "لديك حساب بالفعل؟"
    : "Already have an account?"}
</p>



          
<button
  type="button"
  className="login-button"
  onClick={() => navigate("/")}
>
  {language === "ar" ? "تسجيل الدخول" : "Log in"}
</button>


        </div>

      </section>


      {/* 
          RIGHT SIDE
       */}

      <section className="splash-visual">
  <img
    src={theme === "dark" ? splashCareDark : splashCare}
    alt="MediMind medication and caregiver support"
    className="splash-care-image"
  />
</section>

    </div>
  );
};

export default Splashscreen;
