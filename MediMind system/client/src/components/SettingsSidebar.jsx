import { Link } from "react-router-dom";

const SettingsSidebar = () => {
  return (
    <div className="settings-sidebar">
      <h4>Settings</h4>

      <Link className="settings-link" to="/settings/profile">Profile</Link>
      <Link className="settings-link" to="/settings/notification">Notification</Link>
      <Link className="settings-link" to="/settings/language">Language</Link>
      <Link className="settings-link" to="/settings/theme">Theme</Link>
      <Link className="settings-link" to="/settings/security">Security</Link>
      <Link className="settings-link" to="/settings/about">About Us</Link>
      <Link className="settings-link" to="/settings/feedback">Feedback</Link>
    </div>
  );
};

export default SettingsSidebar;