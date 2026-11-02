import { useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  FormGroup,
  Label,
} from "reactstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import medimindlogo from "../assets/medimindlogo.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Footer from "./footer";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const response = await axios.post(
      "http://localhost:3002/reset-password",
      {
        email,
        otp,
        newPassword,
      }
    );

    setMessage(response.data.message);

    if (response.data.message === "Password reset successfully") {
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  return (
    <Container fluid>
      <Row className="login-row">
        <Col className="login-col">
          <Card>
            <CardBody>
              <img
                src={medimindlogo}
                alt="MediMind logo"
                className="logo"
              />

              <h2 className="text-center">Reset Password</h2>

              <p className="text-center">
                Enter OTP and your new password.
              </p>

              <FormGroup>
                <Label>Email</Label>

                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>OTP</Label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>New Password</Label>

                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter new password"
                    style={{ paddingRight: "45px" }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword((previous) => !previous)
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "14px",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "#1e3a8a",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showNewPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Confirm Password</Label>

                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Confirm new password"
                    style={{ paddingRight: "45px" }}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "14px",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "#1e3a8a",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
              </FormGroup>

              <Button
                color="primary"
                className="w-100"
                onClick={resetPassword}
              >
                Reset Password
              </Button>

              <h6
                className="text-center mt-3"
                style={{
                  color:
                    message === "Password reset successfully"
                      ? "green"
                      : "red",
                }}
              >
                {message}
              </h6>

              <p className="text-center mt-3">
                Back to <Link to="/">Login</Link>
              </p>
            </CardBody>
          </Card>
        </Col>

        <Footer />
      </Row>
    </Container>
  );
};

export default ResetPassword;