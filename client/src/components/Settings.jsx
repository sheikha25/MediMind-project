import { useState } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { useSelector } from "react-redux";
import axios from "axios";
import Header from "./Header";
import Footer from "./footer";
const Settings = () => {
  const user = useSelector((state) => state.user.user);
  const [activePage, setActivePage] = useState("profile");
const [dailyRoutine, setDailyRoutine] = useState({
  breakfastTime: user?.dailyRoutine?.breakfastTime || "",
  lunchTime: user?.dailyRoutine?.lunchTime || "",
  dinnerTime: user?.dailyRoutine?.dinnerTime || "",
  sleepTime: user?.dailyRoutine?.sleepTime || "",
  wakeTime: user?.dailyRoutine?.wakeTime || "",
});

const [routineMessage, setRoutineMessage] = useState("");
const [savingRoutine, setSavingRoutine] = useState(false);

const handleRoutineChange = (event) => {
  const { name, value } = event.target;

  setDailyRoutine((currentRoutine) => ({
    ...currentRoutine,
    [name]: value,
  }));

  setRoutineMessage("");
};

const handleSaveRoutine = async () => {
  try {
    setSavingRoutine(true);
    setRoutineMessage("");

    const response = await axios.put(
      "http://localhost:3002/patient/daily-routine",
      {
        email: user.email,
        ...dailyRoutine,
      }
    );

    setRoutineMessage(
      response.data.message ||
        "Daily routine saved successfully."
    );
  } catch (error) {
    console.error(
      "Daily routine update error:",
      error
    );

    setRoutineMessage(
      error.response?.data?.message ||
        "Unable to save daily routine."
    );
  } finally {
    setSavingRoutine(false);
  }
};

  return (
    <Container fluid className="dashboard-page">
      <Header />

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
<h3>test routine section</h3>
    <Card>
      <CardBody>
        <label>Notifications</label>

        <select className="form-control mb-4">
          <option>Enable Notifications</option>
          <option>Disable Notifications</option>
        </select>

        <h5 className="mb-3">
          Daily Routine
        </h5>

        <p className="text-muted">
          Set your usual meal and sleep times so MediMind
          can adjust medication reminders to your routine.
        </p>

        <Row>
          <Col md="6">
            <label>Breakfast Time</label>
            <input
              type="time"
              name="breakfastTime"
              className="form-control mb-3"
              value={dailyRoutine.breakfastTime}
              onChange={handleRoutineChange}
            />
          </Col>

          <Col md="6">
            <label>Lunch Time</label>
            <input
              type="time"
              name="lunchTime"
              className="form-control mb-3"
              value={dailyRoutine.lunchTime}
              onChange={handleRoutineChange}
            />
          </Col>
        </Row>

        <Row>
          <Col md="6">
            <label>Dinner Time</label>
            <input
              type="time"
              name="dinnerTime"
              className="form-control mb-3"
              value={dailyRoutine.dinnerTime}
              onChange={handleRoutineChange}
            />
          </Col>

          <Col md="6">
            <label>Wake Time</label>
            <input
              type="time"
              name="wakeTime"
              className="form-control mb-3"
              value={dailyRoutine.wakeTime}
              onChange={handleRoutineChange}
            />
          </Col>
        </Row>

        <label>Sleep Time</label>
        <input
          type="time"
          name="sleepTime"
          className="form-control mb-3"
          value={dailyRoutine.sleepTime}
          onChange={handleRoutineChange}
        />

        {routineMessage && (
          <div className="alert alert-info">
            {routineMessage}
          </div>
        )}

        <Button
          color="primary"
          className="w-100"
          onClick={handleSaveRoutine}
          disabled={savingRoutine}
        >
          {savingRoutine
            ? "Saving..."
            : "Save Daily Routine"}
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
                  <input type="password" className="form-control mb-3" placeholder="Current Password" />
                  <input type="password" className="form-control mb-3" placeholder="New Password" />
                  <Button color="primary" className="w-100">Change Password</Button>
                </CardBody>
              </Card>
              <Card className="mt-4 border-danger">
  <CardBody>
    <h5 className="text-danger">Delete Account</h5>

    <p className="text-muted">
      Permanently delete your account, medications,
      dose history, and caregiver connections.
      This action cannot be undone.
    </p>

    <Button color="danger" outline>
      Delete My Account
    </Button>
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

export default Settings;