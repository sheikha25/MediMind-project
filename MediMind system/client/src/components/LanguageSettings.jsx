import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const LanguageSettings = () => {
  return (
    <Container fluid className="dashboard-page">
      <Header />
      <Row style={{ minHeight: "85vh" }}>
        <Col md="2" className="settings-sidebar"><SettingsSidebar /></Col>
        <Col md="9" className="p-5">
          <h2>Language</h2>
          <Card>
            <CardBody>
              <select className="form-control">
                <option>English</option>
                <option>Arabic</option>
              </select>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LanguageSettings;