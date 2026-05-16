import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { useSelector } from "react-redux";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const ProfileSettings = () => {
  const user = useSelector((state) => state.user.user);

  return (
    <Container fluid className="dashboard-page">
      <Header />

      <Row style={{ minHeight: "85vh" }}>
        <Col md="2" className="settings-sidebar">
          <SettingsSidebar />
        </Col>

        <Col md="9" className="p-5">
          <h2>Profile Settings</h2>

          <Card>
            <CardBody>
              <label>Username</label>
              <input type="text" className="form-control mb-3" defaultValue={user?.name || ""} />

        <label>Age</label>
        <input
          type="number"
          className="form-control mb-3"
          placeholder="24"
        />
      

      
        <label>
          Height <small>(cm)</small>
        </label>

        <input
          type="number"
          className="form-control mb-3"
          placeholder="162"
        />
      

    <label>
      Weight <small>(kg)</small>
    </label>

    <input
      type="number"
      className="form-control mb-3"
      placeholder="64"
      style={{ maxWidth: "250px" }}
    />
              <label>Email</label>
              <input type="email" className="form-control mb-3" defaultValue={user?.email || ""} />

              <label>Phone Number</label>
              <input type="text" className="form-control mb-3" defaultValue={user?.phoneNumber || ""} />

              <label>Profile Picture</label>
              <input type="file" className="form-control mb-3" />

              <label>Role</label>
              <input type="text" className="form-control mb-3" value={user?.role || "patient"} disabled />

              <Button color="primary" className="w-100">Save Changes</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileSettings;