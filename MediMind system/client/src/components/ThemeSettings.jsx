import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const ThemeSettings = () => {
  return (
    <Container fluid className="dashboard-page">
      <Header />
      <Row style={{ minHeight: "85vh" }}>
        <Col md="2" className="settings-sidebar"><SettingsSidebar /></Col>
        <Col md="9" className="p-5">
          <h2>Theme</h2>
          <Card>
            <CardBody>
              <select className="form-control">
                <option>Light Mode</option>
                <option>Dark Mode</option>
              </select>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ThemeSettings;