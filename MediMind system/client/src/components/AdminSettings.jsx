import { useState } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { useSelector } from "react-redux";
import AdminHeader from "./AdminHeader";
import Footer from "./footer";
const AdminSettings = () => {
  const user = useSelector((state) => state.user.user);
  const [activePage, setActivePage] = useState("profile");
  return (
    <Container fluid className="dashboard-page">
      <AdminHeader/>
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
              <h2>Profile Settings</h2>

<Card>
  <CardBody>

    <label>Username</label>
    <input
      type="text"
      className="form-control mb-3"
      defaultValue={user?.name || "Sheikha"}
    />

    <Row>
      <Col md="6">
        <label>Age</label>
        <input
          type="number"
          className="form-control mb-3"
          placeholder="24"
        />
      </Col>
      <Col md="6">
        <label>
          Height <small>(cm)</small>
        </label>

        <input
          type="number"
          className="form-control mb-3"
          placeholder="162"
        />
      </Col>
    </Row>

    <label>
      Weight <small>(kg)</small>
    </label>

    <input
      type="number"
      className="form-control mb-3"
      placeholder="64"
      style={{ maxWidth: "250px" }}
    />

    <label>Email</label>
    <input
      type="email"
      className="form-control mb-3"
      defaultValue={user?.email || "Sheikha@gmail.com"}
    />

    <label>Phone Number</label>
    <input
      type="text"
      className="form-control mb-3"
      placeholder="91234567"
    />
    <label>Profile Picture</label>
    <input
      type="file"
      className="form-control mb-3"
    />
    <label>Role</label>
    <input
      type="text"
      className="form-control mb-3"
      value={user?.role || "patient"}
      disabled
    />

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
                    <option>Enable Notifications</option>
                    <option>Disable Notifications</option>
                  </select>
                  <Button color="primary" className="w-100">Save</Button>
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
                  <input type="password" className="form-control mb-3" placeholder="Current Password" />
                  <input type="password" className="form-control mb-3" placeholder="New Password" />
                  <Button color="primary" className="w-100">Change Password</Button>
                </CardBody>
              </Card>
            </>
          )}

          {activePage === "about" && (
            <>
              <h2>About MediMind </h2>
              <Card>
                <CardBody>
                 <p style={{ fontSize: "16px", lineHeight: "1.8" }}>
                MediMind is a smart web-based medication reminder system that helps users take their medicines on time. 
                It provides personalized reminders, tracks medication intake, and generates adherence reports.
              </p>

              <p style={{ fontSize: "16px", lineHeight: "1.8" }}>
                Our mission is to improve health by helping users stay consistent with their medication routines.
              </p>

              

              <p><strong>Version:</strong> 1.0</p>
              <p><strong>Year:</strong> 2026</p>

              

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
              <Col md="9" className="p-5">
          <h4>we value your feedback</h4>
          <p style={{ color: "#6b7280" }}>
            Let us know how we can improve you exprience
          </p>

          <Card style={{ maxWidth: "600px" }}>
            <CardBody>
              <label>Your name <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Sheikha"
              />

              <label>Your Email (optional)</label>
              <input
                type="email"
                className="form-control mb-3"
              />

              <label>Your Feedback</label>
              <textarea
                className="form-control mb-3"
                rows="4"
                placeholder="Tell us what you think...."
              ></textarea>

              <div className="mb-3">
                <span style={{ fontSize: "28px", color: "#9ca3af" }}>
                  ★★★★★
                </span>
                <span style={{ marginLeft: "10px", textDecoration: "underline" }}>
                  Select Rating
                </span>
              </div>
            </CardBody>
          </Card>

          <div style={{ maxWidth: "600px" }} className="text-center mt-3">
            <Button color="primary" style={{ width: "60%" }}>
              Send Feedback
            </Button>
          </div>
        </Col>
            </>
          )}
        </Col>
      </Row>
      <Footer/>
    </Container>
  );
};

export default AdminSettings;
