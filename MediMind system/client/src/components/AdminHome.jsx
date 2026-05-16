import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import AdminHeader from "./AdminHeader";
const AdminHome = () => {
  return (
    <Container fluid className="dashboard-page">
      <AdminHeader />

      <Row className="p-4">
        <Col>
          <h2>Admin Dashboard</h2>
          <p>Manage users, roles, and system reports.</p>
        </Col>
      </Row>

      <Row className="px-4">
        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Total Users</h5>
              <h2></h2>
              <p>Registered accounts</p>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Patients</h5>
              <h2></h2>
              <p>Active patients</p>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Caregivers</h5>
              <h2></h2>
              <p>Linked caregivers</p>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Reports</h5>
              <h2></h2>
              <p></p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="p-4">
        <Col>
          <Card className="dashboard-card">
            <CardBody>
              <h4>User Management</h4>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="status-taken"></td>
                    <td>
                     
                    </td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="status-taken"></td>
                    <td>
                      
                    </td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      
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

export default AdminHome;