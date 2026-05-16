import { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Label } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import medimindlogo from "../assets/medimindlogo.jpg";
import Footer from "./footer";

const Forgotpass = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
  const response = await axios.post(
    "http://localhost:3002/forgot-password",
    {
      email,
    }
  );

  setMessage(response.data.message);

  if (response.data.message === "OTP sent to your email") {
    navigate("/reset-password", {
      state: { email: email },
    });
  }
};

  return (
    <Container fluid>
      <Row className="login-row">
        <Col className="login-col">
          <Card>
            <CardBody>
              <img src={medimindlogo} alt="MediMind logo" className="logo" />

              <h2 className="text-center">Forgot Password</h2>
              <p className="text-center">
                Enter your email to receive an OTP.
              </p>

              <FormGroup>
                <Label>Email</Label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>

              <Button color="primary" className="w-100" onClick={sendOtp}>
                Send OTP
              </Button>

              <h6 className="text-center mt-3" style={{ color: message === "Password reset successfully" ? "green" : "red",}}>{message}</h6>
              <p className="text-center mt-3">
                Back to 
                <Link to="/">Login</Link>
              </p>
            </CardBody>
          </Card>
        </Col>
        <Footer/>
      </Row>
    </Container>
  );
};

export default Forgotpass;