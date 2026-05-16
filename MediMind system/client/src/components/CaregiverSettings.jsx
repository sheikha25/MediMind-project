import { useState } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { useSelector } from "react-redux";
import CaregiverHeader from "./CaregiverHeader";
import Footer from "./footer";

const CaregiverSettings = () => {
  const user = useSelector((state) => state.user.user);
  const [activePage, setActivePage] = useState("profile");

  return (
    <Container fluid className="dashboard-page">
      <CaregiverHeader />

      <Row style={{ minHeight: "85vh" }}>
        <Col md="3" className="settings-sidebar">
          <h4>Settings</h4>

          <div className="settings-link" onClick={() => setActivePage("profile")}>
            Profile
          </div>
          <div className="settings-link" onClick={() => setActivePage("notification")}>
            Notification
          </div>
          <div className="settings-link" onClick={() => setActivePage("language")}>
  Language
</div>

<div className="settings-link" onClick={() => setActivePage("theme")}>
  Theme
</div>
          <div className="settings-link" onClick={() => setActivePage("security")}>
            Security
          </div>
          <div className="settings-link" onClick={() => setActivePage("about")}>
            About Us
          </div>
          <div className="settings-link" onClick={() => setActivePage("feedback")}>
            Feedback
          </div>
        </Col>

        <Col md="9" className="p-5">
          {activePage === "profile" && (
            <>
              <h2>Caregiver Profile Settings</h2>

              <Card>
                <CardBody>
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    defaultValue={user?.name || ""}
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control mb-3"
                    defaultValue={user?.email || ""}
                  />

                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    defaultValue={user?.phoneNumber || ""}
                    placeholder="91234567"
                  />

                  <label>Profile Picture</label>
                  <input type="file" className="form-control mb-3" />

                  <label>Role</label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    value={user?.role || "caregiver"}
                    disabled
                  />

                  <hr />

                  <h5>Link Patient Account</h5>
                  <p className="text-muted">
                    Enter the patient email to link their account with this caregiver.
                  </p>

                  <label>Patient Email</label>
                  <input
                    type="email"
                    className="form-control mb-3"
                    placeholder="Enter patient email"
                  />

                  <Button color="success" className="mb-3">
                    Add Patient
                  </Button>

                  <Button color="primary" className="w-100">
                    Save Changes
                  </Button>
                </CardBody>
              </Card>
            </>
          )}

          {activePage === "notification" && (
            <>
              <h2>Notification Settings</h2>
              <Card>
                <CardBody>
                  <select className="form-control mb-3">
                    <option>Enable Medication Reminder Alerts</option>
                    <option>Enable Missed Dose Alerts</option>
                    <option>Disable Notifications</option>
                  </select>

                  <Button color="primary" className="w-100">
                    Save
                  </Button>
                </CardBody>
              </Card>
            </>
          )}
          {activePage === "language" && (
  <>
    <h2>Language</h2>
    <Card>
      <CardBody>
        <select className="form-control">
          <option>English</option>
          <option>Arabic</option>
        </select>
      </CardBody>
    </Card>
  </>
)}

{activePage === "theme" && (
  <>
    <h2>Theme</h2>
    <Card>
      <CardBody>
        <select className="form-control">
          <option>Light Mode</option>
          <option>Dark Mode</option>
        </select>
      </CardBody>
    </Card>
  </>
)}

          {activePage === "security" && (
            <>
              <h2>Security</h2>
              <Card>
                <CardBody>
                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Current Password"
                  />
                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="New Password"
                  />
                  <Button color="primary" className="w-100">
                    Change Password
                  </Button>
                </CardBody>
              </Card>
            </>
          )}

          {activePage === "about" && (
            <>
              <h2>About MediMind</h2>
              <Card>
                <CardBody>
                  <p style={{ fontSize: "16px", lineHeight: "1.8" }}>
                    MediMind is a smart web-based medication reminder system that helps
                    users take their medicines on time. It provides personalized
                    reminders, tracks medication intake, and generates adherence reports.
                  </p>

                  <p style={{ fontSize: "16px", lineHeight: "1.8" }}>
                    Caregivers can monitor linked patients, view reports, and receive
                    alerts for missed medication doses.
                  </p>

                  <p>
                    <strong>Version:</strong> 1.0
                  </p>
                  <p>
                    <strong>Year:</strong> 2026
                  </p>

                  <h5>Developed by:</h5>
                  <ul>
                    <li>Sheikha Qasim Al-Qusaimi — 16s18247</li>
                    <li>Rawan Salim Al-Hosni — 16s18120</li>
                  </ul>
                </CardBody>
              </Card>
            </>
          )}

          {activePage === "feedback" && (
            <>
              <h2>Feedback</h2>

              <Card style={{ maxWidth: "600px" }}>
                <CardBody>
                  <label>Your Name</label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter your name"
                  />

                  <label>Your Email</label>
                  <input type="email" className="form-control mb-3" />

                  <label>Your Feedback</label>
                  <textarea
                    className="form-control mb-3"
                    rows="4"
                    placeholder="Tell us what you think..."
                  ></textarea>

                  <div className="mb-3">
                    <span style={{ fontSize: "28px", color: "#9ca3af" }}>
                      ★★★★★
                    </span>
                    <span style={{ marginLeft: "10px", textDecoration: "underline" }}>
                      Select Rating
                    </span>
                  </div>

                  <Button color="primary" className="w-100">
                    Send Feedback
                  </Button>
                </CardBody>
              </Card>
            </>
          )}
        </Col>
      </Row>

      <Footer />
    </Container>
  );
};

export default CaregiverSettings;