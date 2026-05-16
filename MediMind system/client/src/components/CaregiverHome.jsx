import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import CaregiverHeader from "./CaregiverHeader";

const CaregiverHome = () => {
  return (
    <Container fluid className="dashboard-page">
      <CaregiverHeader/>

      <Row className="p-4">
        <Col>
          <h2>Caregiver Dashboard</h2>
          <p>Monitor patient medications and adherence..</p>
        </Col>
      </Row>

      <Row className="px-4">
        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Linked Patients</h5>
              <h2></h2>
              <p></p>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Upcoming Medications</h5>
              <h2></h2>
              <p></p>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="dashboard-card missed-card">
            <CardBody>
              <h5>Missed Doses</h5>
              <h2></h2>
              <p></p>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="dashboard-card adherence-card">
            <CardBody>
              <h5>Adherence Rate</h5>
              <h2></h2>
              <p></p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="p-4">
        <Col md="8">
          <Card className="dashboard-card">
            <CardBody>
              <h4>Patient Medication Overview</h4>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Medication</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td ></td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td ></td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>
        </Col>

        <Col md="4">
          <Card className="dashboard-card">
            <CardBody>
              <h4>Caregiver Alerts</h4>

              <div className="reminder-box">
                <h5>Missed Dose Alert</h5>
                
                
              </div>

              <div className="reminder-box mt-3">
                <h5>Medication Reminder</h5>
               
              </div>

              <Button color="primary" className="w-100 mt-3">
                View Reports
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CaregiverHome;