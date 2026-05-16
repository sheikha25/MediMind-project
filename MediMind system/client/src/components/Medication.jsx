import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

const Medication = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className="dashboard-page">
      <Header />

      <Row className="p-4 align-items-center">
        <Col md="6">
          <h2>Medications</h2>
        </Col>

        <Col md="6" className="text-end">
          <button className="btn btn-primary me-2">Export</button>

          <button
            className="btn btn-success"
            onClick={() => navigate("/medications/add")}
          >
            + Add Medication
          </button>
        </Col>
      </Row>

      <Row className="px-4">
        <Col>
          <Card className="dashboard-card">
            <CardBody>
              <div className="text-end mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search medication name..."
                  style={{ maxWidth: "300px", display: "inline-block" }}
                />
              </div>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Time</th>
                    <th>Instructions</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                       <span >edit</span>
                    
                      
                      <span> delete </span>
                    </td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <span >edit</span>
                    
                      
                      <span> delete </span>
                    </td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                       <span >edit</span>
                    
                      
                      <span> delete </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>
        </Col>
      </Row>
      
    </Container>
  );
};

export default Medication;