import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const FeedbackSettings = () => {
  return (
    <Container fluid className="dashboard-page">
      <Header />
      <Row style={{ minHeight: "85vh" }}>
        <Col md="2" className="settings-sidebar"><SettingsSidebar /></Col>
        <Col md="9" className="p-5">
          <h2>Feedback</h2>

          <Card style={{ maxWidth: "600px" }}>
            <CardBody>
              <label>Your Name</label>
              <input type="text" className="form-control mb-3" />

              <label>Your Email</label>
              <input type="email" className="form-control mb-3" />

              <label>Your Feedback</label>
              <textarea className="form-control mb-3" rows="4"></textarea>
<div className="mb-3">
                <span style={{ fontSize: "28px", color: "#9ca3af" }}>
                  ★★★★★
                </span>
                <span style={{ marginLeft: "10px", textDecoration: "underline" }}>
                  Select Rating
                </span>
              </div>
              <Button color="primary" className="w-100">Send Feedback</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FeedbackSettings;