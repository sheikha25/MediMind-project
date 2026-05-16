import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import alarm from "../assets/alarm.jpg"
import caregiverr from "../assets/caregiverr.png"
import medicine from "../assets/medicine.jpg"
import report from "../assets/report.png"
const Home = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  return (
    <Container fluid className="dashboard-page">
      <Header />

      {/* TOP SECTION */}
      <Row className="p-4 align-items-center justify-content-between">
        <Col md="6">
          <h4 className="mt-3">Welcome Back, {user?.name || "User"}</h4>
        </Col>

        <Col md="6" className="text-end">
          <button
            className="btn btn-primary me-2"
            style={{
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: "500",
            }}
            onClick={() => navigate("/medications/add")}
          >
            + Add Medication
          </button>

          <button
            className="btn btn-outline-primary"
            style={{
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: "500",
            }}
          >
             Ask AI
          </button>
        </Col>
      </Row>
{/* FEATURE CIRCLES */}
<Row className="px-4 mb-4 text-center">
  <Col md="3">
    <img src={medicine} alt="Medication" className="circle-image" />
    <h6 className="mt-3">Medication</h6>
  </Col>

  <Col md="3">
    <img src={alarm} alt="Reminder" className="circle-image" />
    <h6 className="mt-3">Reminders</h6>
  </Col>

  <Col md="3">
    <img src={report} alt="Reports" className="circle-image" />
    <h6 className="mt-3">Reports</h6>
  </Col>

  <Col md="3">
    <img src={caregiverr} alt="Patient Care" className="circle-image" />
    <h6 className="mt-3">Patient Care</h6>
  </Col>
</Row>
      {/* CARDS */}
      <Row className="px-4">
        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Total Medications</h5>
              <h2></h2>
              <p></p>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Upcoming Reminder</h5>
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
              <h5>Adherence</h5>
              <h2></h2>
              <p></p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* TABLE + REMINDERS */}
      <Row className="p-4">
        <Col md="8">
          <Card className="dashboard-card">
            <CardBody>
              <h4>Medication Overview</h4>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Dosage</th>
                    <th>Time</th>
                    <th>Instruction</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="status-upcoming"></td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="status-taken"></td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="status-missed"></td>
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>
        </Col>

        <Col md="4">
          <Card className="dashboard-card">
            <CardBody>
              <h4>Today's Reminder</h4>

              <div className="reminder-box">
                <h5></h5>
                <p></p>
                <span>Upcoming</span>
              </div>

              <div className="reminder-box mt-3">
                <h5></h5>
                <p></p>
                <span></span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      
    </Container>
  );
};

export default Home;