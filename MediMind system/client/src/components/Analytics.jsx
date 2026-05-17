import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Header from "./Header";
const Analytics = () => {
  return (
    <Container fluid className="dashboard-page">
      <Header />
      <Row className="p-4">
        <Col>
          <Card className="dashboard-card text-center">
            <CardBody>
              <h2>Analytics</h2>
              <p className="text-muted">
                Advanced medication adherence analytics and visual reports
              </p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;
