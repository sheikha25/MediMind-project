import { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Label } from "reactstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import medimindlogo from "../assets/medimindlogo.jpg";
import Footer from "./footer";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const response = await axios.post("http://localhost:3002/reset-password", {
      email,
      otp,
      newPassword,
    });

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
              <img src={medimindlogo} alt="MediMind logo" className="logo" />

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
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Confirm Password</Label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FormGroup>

              <Button color="primary" className="w-100" onClick={resetPassword}>
                Reset Password
              </Button>

              <h6 className="text-center mt-3" style={{color: message === "Password reset successfully" ? "green" : "red",}}>{message}</h6>
              <p className="text-center mt-3">
                Back to <Link to="/">Login</Link>
              </p>
            </CardBody>
          </Card>
        </Col>
        <Footer/>
      </Row>
    </Container>
  );
};

export default ResetPassword;