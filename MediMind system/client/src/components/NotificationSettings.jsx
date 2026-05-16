import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const NotificationSettings = () => {
  return (
    <Container fluid className="dashboard-page">
      <Header />
      <Row style={{ minHeight: "85vh" }}>
        <Col md="2" className="settings-sidebar"><SettingsSidebar /></Col>
        <Col md="9" className="p-5">
          <h2>Notification Settings</h2>
          <Card>
            <CardBody>
              <select className="form-control mb-3">
                <option>Enable Notifications</option>
                <option>Disable Notifications</option>
              </select>
              <Button color="primary" className="w-100">Save</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotificationSettings;