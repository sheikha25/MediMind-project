import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { useSelector } from "react-redux";
import Header from "./Header";
import Footer from "./footer";
const Reports = () => {
  const user = useSelector((state) => state.user.user);

  return (
    <Container fluid>
      <Header />

      {/* Header with Export */}
      <Row className="mt-5 px-4 align-items-center justify-content-between">
        <Col md="6">
          <h2>Adherence Reports</h2>
        </Col>

        <Col md="6" className="text-end">
          <button className="btn btn-primary" style={{ borderRadius: "10px" }}>
  Export
</button>
        </Col>
      </Row>

      {/* Reports */}
      <Row className="px-4 mt-3">
        <Col md="8" className="mx-auto">

          <Card>
            <CardBody>
              <h5>Daily Report</h5>
              <p>Shows the medication intake status for today.</p>
            </CardBody>
          </Card>

          <Card className="mt-3">
            <CardBody>
              <h5>Weekly Report</h5>
              <p>Shows the user medication adherence during the week.</p>
            </CardBody>
          </Card>

          <Card className="mt-3">
            <CardBody>
              <h5>Monthly Report</h5>
              <p>Shows the user medication adherence during the month.</p>
            </CardBody>
          </Card>

        </Col>
      </Row>
      <Footer/>
    </Container>
  );
};

export default Reports;