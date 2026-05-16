import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const SecuritySettings = () => {
  return (
    <Container fluid className="dashboard-page">
      <Header />
      <Row style={{ minHeight: "85vh" }}>
        <Col md="3"><SettingsSidebar /></Col>
        <Col md="9" className="p-5">
          <h2>Security</h2>
          <Card>
            <CardBody>
              <input type="password" className="form-control mb-3" placeholder="Current Password" />
              <input type="password" className="form-control mb-3" placeholder="New Password" />
              <Button color="primary" className="w-100">Change Password</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SecuritySettings;