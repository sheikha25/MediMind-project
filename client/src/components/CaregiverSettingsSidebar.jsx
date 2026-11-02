import { Link } from "react-router-dom";

const CaregiverSettingsSidebar = () => {
  return (
    <>
      <h4>Settings</h4>

      <Link
        to="/caregiver-settings"
        className="settings-link d-block"
      >
        Profile
      </Link>

      <Link
        to="/caregiver-link-patient"
        className="settings-link d-block"
      >
        Link Patient
      </Link>

      <Link
        to="/caregiver-notifications"
        className="settings-link d-block"
      >
        Notification
      </Link>

      <Link
        to="/caregiver-language"
        className="settings-link d-block"
      >
        Language
      </Link>

      <Link
        to="/caregiver-theme"
        className="settings-link d-block"
      >
        Theme
      </Link>

      <Link
        to="/caregiver-security"
        className="settings-link d-block"
      >
        Security
      </Link>

      <Link
        to="/caregiver-about"
        className="settings-link d-block"
      >
        About Us
      </Link>

      <Link
        to="/caregiver-feedback"
        className="settings-link d-block"
      >
        Feedback
      </Link>
    </>
  );
};

export default CaregiverSettingsSidebar;