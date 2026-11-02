import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Label, Navbar } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import medimindlogo from "../assets/medimindlogo.jpg";
import CaregiverHeader from "./CaregiverHeader";
import Footer from "./footer";
const Caregiver = () => {
  const user = useSelector((state) => state.user.user);

  const [patientEmail, setPatientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [patients, setPatients] = useState([]);

  const addCaregiverLink = async () => {
    try {
      const response = await axios.post("http://localhost:3002/addCaregiverLink", {
        patientEmail: patientEmail,
        caregiverEmail: user.email,
      });

      setMessage(response.data.message);
      getPatients();
      setPatientEmail("");
    } catch (error) {
      setMessage("Error linking patient");
    }
  };

  const getPatients = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3002/getPatients/${user.email}`
      );

      setPatients(response.data);
    } catch (error) {
      console.log("Error loading patients", error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      getPatients();
    }
  }, [user]);

  return (
    <Container fluid>
      <Header/>

      <Row className="mt-5">
        <Col md="8" className="mx-auto">
          <h2 className="text-center mb-4">Caregiver Panel</h2>

          <Card>
            <CardBody>
              <h5>Link Patient</h5>

              <FormGroup>
                <Label>Patient Email</Label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter patient email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                />
              </FormGroup>

              <Button color="primary" className="w-100" onClick={addCaregiverLink}>
                Link Patient
              </Button>

              <p className="text-center mt-3">{message}</p>
            </CardBody>
          </Card>

          <Card className="mt-4">
            <CardBody>
              <h5>My Patients</h5>

              {patients.length === 0 ? (
                <p>No patients linked yet.</p>
              ) : (
                patients.map((p) => (
                  <div key={p._id} style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
                    <strong>Patient Email:</strong> {p.patientEmail}
                    <br />
                    <strong>Status:</strong> {p.status}
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Footer/>
    </Container>
  );
};

export default Caregiver;