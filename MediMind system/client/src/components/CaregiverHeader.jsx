import { Row, Col } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import medimindlogo from "../assets/medimindlogo.jpg";
import { logout } from "../features/UserSlice";

const CaregiverHeader = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout from MediMind?")) {
      dispatch(logout());
      navigate("/Splashscreen");
    }
  };

  return (
    <Row
      className="align-items-center px-4 py-3"
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <Col md="12" className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <img src={medimindlogo} width="120px" alt="MediMind logo" />

          <div
            className="d-flex align-items-center"
            style={{ marginLeft: "30px", gap: "10px" }}
          >

            <Link to="/caregiver-home" className="nav-link">
  Dashboard
</Link>

<Link to="/caregiver-reports" className="nav-link">
  Reports
</Link>

<Link to="/caregiver-analytics" className="nav-link">
  Analytics
</Link>

<Link to="/caregiver-settings" className="nav-link">
  Settings
</Link>
          </div>
        </div>

        <div className="d-flex align-items-center" style={{ gap: "15px" }}>
          <div className="d-flex align-items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Profile"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ddd",
              }}
            />

           
          </div>

          <button
            className="btn btn-danger"
            style={{ borderRadius: "8px", padding: "6px 15px" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </Col>
    </Row>
  );
};

export default CaregiverHeader;