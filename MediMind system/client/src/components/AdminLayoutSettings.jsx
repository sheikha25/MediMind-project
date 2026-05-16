import { Container, Row, Col } from "reactstrap";
import AdminHeader from "./AdminHeader";
import SettingsSidebar from "./SettingsSidebar";

const SettingsLayout = ({ children }) => {
  return (
    <Container fluid className="dashboard-page">
      <Header />

      <Row style={{ minHeight: "85vh" }}>
        <Col md="3">
          <SettingsSidebar />
        </Col>

        <Col md="9" className="p-5">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsLayout;