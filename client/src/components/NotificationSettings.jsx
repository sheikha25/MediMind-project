import { useEffect, useState } from "react";
import {useDispatch,useSelector,} from "react-redux";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import axios from "axios";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
} from "reactstrap";

import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

import {
  updateUser,
} from "../features/UserSlice";


const NotificationSettings =
  () => {
    const dispatch =
      useDispatch();

    const user = useSelector(
      (state) =>
        state.user.user
    );

    const [
      notificationsEnabled,
      setNotificationsEnabled,
    ] = useState(true);

const [soundMuted, setSoundMuted] = useState(() => {
  return localStorage.getItem("medimindSoundMuted") === "true";
});

    const [
      routineMessage,
      setRoutineMessage,
    ] = useState("");

    const [
      savingRoutine,
      setSavingRoutine,
    ] = useState(false);

    useEffect(() => {
  if (!user) {
    return;
  }

  setNotificationsEnabled(
    user.notificationsEnabled !== false
  );
}, [user]);


    const handleSaveRoutine = async () => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (!token) {
    setRoutineMessage("Please log in again.");
    return;
  }

  try {
    setSavingRoutine(true);
    setRoutineMessage("");

    const response = await axios.put(
      "http://localhost:3002/patient/notification-settings",
      { notificationsEnabled },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch(
      updateUser({
        ...user,
        notificationsEnabled: response.data.notificationsEnabled,
      })
    );

    setRoutineMessage(
      response.data.message ||
        "Notification settings saved successfully."
    );
  } catch (error) {
    console.error("Notification settings error:", error);

    setRoutineMessage(
      error.response?.data?.message ||
        "Unable to save notification settings."
    );
  } finally {
    setSavingRoutine(false);
  }
};

    return (
      <Container
        fluid
        className="dashboard-page"
      >
        <Header />

        <Row
          style={{
            minHeight:
              "85vh",
          }}
        >
          <Col
            md="2"
            className="settings-sidebar"
          >
            <SettingsSidebar />
          </Col>

          <Col
            md="9"
            className="p-5"
          >
            <h2>
              Notification
              Settings
            </h2>

            <Card>
              <CardBody>
                <label>
                  Notifications
                </label>

                <select
                  className="form-control mb-2"
                  value={
                    notificationsEnabled
                      ? "enabled"
                      : "disabled"
                  }
                  onChange={(
                    event
                  ) => {
                    setNotificationsEnabled(
                      event.target
                        .value ===
                        "enabled"
                    );

                    setRoutineMessage(
                      ""
                    );
                  }}
                >
                  <option value="enabled">
                    Enable
                    Notifications
                  </option>

                  <option value="disabled">
                    Disable
                    Notifications
                  </option>
                </select>

                <small className="text-muted d-block mb-4">
                  When disabled,
                  medication reminder
                  notifications will not
                  be shown. Your
                  medication schedule
                  and dose records will
                  continue to be
                  tracked.
                </small>
<div
  className="d-flex align-items-center justify-content-between mb-4"
  style={{
    padding: "15px",
    background: "#f4f8ff",
    borderRadius: "12px",
  }}
>
  <div>
    <h6 className="mb-1">Notification Sound</h6>
    <small className="text-muted">
      {soundMuted ? "Sound is muted" : "Sound is enabled"}
    </small>
  </div>

  <button
    type="button"
    className="btn btn-light"
    onClick={() => {
  const newMuted = !soundMuted;

  setSoundMuted(newMuted);

  localStorage.setItem(
    "medimindSoundMuted",
    String(newMuted)
  );
}}
    aria-label={soundMuted ? "Unmute sound" : "Mute sound"}
    title={soundMuted ? "Unmute sound" : "Mute sound"}
    style={{
      fontSize: "25px",
      color: "#17418C",
      borderRadius: "10px",
    }}
  >
    {soundMuted ? <FiVolumeX /> : <FiVolume2 />}
  </button>
</div>


                {routineMessage && (
                  <div className="alert alert-info mt-3">
                    {
                      routineMessage
                    }
                  </div>
                )}

                <Button
                  color="primary"
                  className="w-100"
                  onClick={
                    handleSaveRoutine
                  }
                  disabled={
                    savingRoutine
                  }
                >
                  {savingRoutine
                    ? "Saving..."
                    : "Save "}
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  };

export default NotificationSettings;