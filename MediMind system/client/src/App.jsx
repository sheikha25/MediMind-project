import "./App.css";

import Login from "./components/Login";
import PatientRegister from "./components/PatientRegister";
import CaregiverRegister from "./components/CaregiverRegister";
import AdminRegister from "./components/AdminRegister";

import Home from "./components/Home";
import Medication from "./components/Medication";
import Addmedication from "./components/Addmedication";

import Reports from "./components/Reports";
import Analytics from "./components/Analytics";

import Forgotpass from "./components/Forgotpass";
import ResetPassword from "./components/ResetPassword";

import Caregiver from "./components/Caregiver";
import CaregiverHome from "./components/CaregiverHome";
import CaregiverReports from "./components/CaregiverReports";
import CaregiverSettings from "./components/CaregiverSettings";
import AnalyticsCaregiver from "./components/AnalyticsCaregiver";

import AdminHome from "./components/AdminHome";
import AdminSettings from "./components/AdminSettings";

import Splashscreen from "./components/Splashscreen";
import ProfileSettings from "./components/ProfileSettings";
import NotificationSettings from "./components/NotificationSettings";
import LanguageSettings from "./components/LanguageSettings";
import ThemeSettings from "./components/ThemeSettings";
import SecuritySettings from "./components/SecuritySettings";
import AboutSettings from "./components/AboutSettings";
import FeedbackSettings from "./components/FeedbackSettings";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Container } from "reactstrap";

function App() {
  return (
    <Container fluid>
      <BrowserRouter>
        <Routes>
          {/* AUTH */}
          <Route path="/" element={<Login />} />

          <Route
            path="/Splashscreen"
            element={<Splashscreen />}
          />

          <Route
            path="/forgot-password"
            element={<Forgotpass />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* REGISTER */}
          <Route
            path="/register/patient"
            element={<PatientRegister />}
          />

          <Route
            path="/register/caregiver"
            element={<CaregiverRegister />}
          />

          <Route
            path="/register/admin"
            element={<AdminRegister />}
          />

          {/* PATIENT */}
          <Route path="/home" element={<Home />} />

          <Route
            path="/medications"
            element={<Medication />}
          />

          <Route
            path="/medications/add"
            element={<Addmedication />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          

          {/* CAREGIVER */}
          <Route
            path="/caregiver"
            element={<Caregiver />}
          />

          <Route
            path="/caregiver-home"
            element={<CaregiverHome />}
          />

          <Route
            path="/caregiver-reports"
            element={<CaregiverReports />}
          />

          <Route
            path="/caregiver-analytics"
            element={<AnalyticsCaregiver />}
          />

          <Route
            path="/caregiver-settings"
            element={<CaregiverSettings />}
          />

          {/* ADMIN */}
          <Route
            path="/admin-home"
            element={<AdminHome />}
          />

          <Route
            path="/admin-settings"
            element={<AdminSettings />}
          />

          <Route path="/settings" element={<ProfileSettings />} />
<Route path="/settings/profile" element={<ProfileSettings />} />
<Route path="/settings/notification" element={<NotificationSettings />} />
<Route path="/settings/language" element={<LanguageSettings />} />
<Route path="/settings/theme" element={<ThemeSettings />} />
<Route path="/settings/security" element={<SecuritySettings />} />
<Route path="/settings/about" element={<AboutSettings />} />
<Route path="/settings/feedback" element={<FeedbackSettings />} />
        </Routes>
      </BrowserRouter>
    </Container>
  );
}

export default App;