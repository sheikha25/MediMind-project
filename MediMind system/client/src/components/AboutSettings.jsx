import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const AboutSettings = () => {
  return (
    <Container fluid className="dashboard-page">
      <Header />

      <Row style={{ minHeight: "85vh" }}>
        <Col md="3" className="settings-sidebar">
          <SettingsSidebar />
        </Col>

        <Col md="9" className="p-5">
          <h2>About MediMind</h2>

          <Card className="mt-4">
            <CardBody>
              <p style={{ fontSize: "16px", lineHeight: "1.8" }}>
                MediMind is a smart web-based medication reminder system that
                helps users take their medicines on time. It provides
                personalized reminders, tracks medication intake, and generates
                adherence reports.
              </p>

              <p style={{ fontSize: "16px", lineHeight: "1.8" }}>
                Our mission is to improve health by helping users stay
                consistent with their medication routines.
              </p>

              <p><strong>Version:</strong> 1.0</p>
              <p><strong>Year:</strong> 2026</p>

              <h5>Developed by:</h5>
              <ul>
                <li>Sheikha Qasim Al-Qusaimi - 16s18247</li>
                <li>Rawan Salim Al-Hosni - 16s18120</li>
              </ul>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutSettings;