import { useState } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { useSelector } from "react-redux";
import Header from "./Header";
import Footer from "./footer";

const Medication = () => {
  const user = useSelector((state) => state.user.user);

  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [timing, setTiming] = useState("Before Meal");
  const [instructions, setInstructions] = useState("");

  return (
    <Container fluid className="dashboard-page">
      <Header />

      <Row className="p-5 justify-content-center">
        <Col md="8">
          <h2>Add New Medication</h2>

          <p style={{ color: "#6b7280" }}>
            Enter medication details or upload prescription image.
          </p>

          <Card className="medication-card">
            <CardBody>
              <h5>Medication Name</h5>

              <input
                type="text"
                placeholder="Medication Name"
                className="form-control mb-3"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
              />

              <h5>Dosage :</h5>

              <input
                type="text"
                placeholder="Dosage (e.g. 500mg)"
                className="form-control mb-3"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />

              <h5>Frequency :</h5>

              <input
                type="text"
                placeholder="Frequency (e.g. Twice daily)"
                className="form-control mb-3"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              />

              <h5>Timing :</h5>

              <select
                className="form-control mb-3"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
              >
                <option>Before Meal</option>
                <option>After Meal</option>
                <option>Morning</option>
                <option>Evening</option>
              </select>

              <h5>Instructions</h5>

              <textarea
                className="form-control mb-3"
                rows="3"
                placeholder="Enter medication instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              ></textarea>

              <h5>Prescription Image : (Optional)</h5>

              <input
                type="file"
                accept="image/*"
                className="form-control mb-3"
              />

              <Button color="primary" className="w-100">
                Save Medication
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Footer />
    </Container>
  );
};

export default Medication;
