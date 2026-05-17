import { Navbar, NavbarBrand, Nav, NavItem } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import medimindlogo from "../assets/medimindlogo.jpg";
import { useDispatch } from "react-redux";
import { logout } from "../features/UserSlice";

const AdminHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout from MediMind?")) {
      dispatch(logout());
      navigate("/Splashscreen");
    }
  };

  return (
    <Navbar
      expand="md"
      className="px-4 d-flex align-items-center justify-content-between"
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
     
      <div className="d-flex align-items-center">
        <NavbarBrand tag={Link} to="/admin-home" className="d-flex align-items-center">
          <img
            src={medimindlogo}
            width="120px"
            alt="MediMind logo"
          />
        </NavbarBrand>

        <Nav
          className="d-flex align-items-center"
          navbar
          style={{
            marginLeft: "30px",
            gap: "10px",
          }}
        >
          <NavItem>
            <Link to="/admin-home" className="nav-link">
              Dashboard
            </Link>
          </NavItem>

          

          <NavItem>
            <Link to="/admin-settings" className="nav-link">
              Settings
            </Link>
          </NavItem>
        </Nav>
      </div>

      <div
        className="d-flex align-items-center"
        style={{ gap: "15px" }}
      >
        
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

        
        <button className="btn btn-danger" style={{borderRadius: "8px",padding: "6px 15px",}} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </Navbar>
  );
};

export default AdminHeader;
