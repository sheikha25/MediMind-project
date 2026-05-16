import { Container, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import medimindlogo from "../assets/medimindlogo.jpg";
const Splashscreen = () => {
  const navigate = useNavigate();

  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "white",
      }}
    >
      <img
        src={medimindlogo}
        alt="MediMind Logo"
        width="420px"
        className="mb-4"
      />

      <p
        style={{
          color: "#1e3a8a",
          fontSize: "20px",
          fontWeight: "500",
          marginBottom: "30px",
        }}
      >
        Select your role to continue.....
      </p>

      <div
  className="d-flex gap-5 mt-3"
  style={{ fontSize: "20px", fontWeight: "700" }}
>
  <span
    style={{ color: "#0d6efd", cursor: "pointer" }}
    onClick={() => navigate("/register/patient")}
  >
    Patient
  </span>

  <span
    style={{ color: "#198754", cursor: "pointer" }}
    onClick={() => navigate("/register/caregiver")}
  >
    Caregiver
  </span>

  <span
    style={{ color: "#212529", cursor: "pointer" }}
    onClick={() => navigate("/register/admin")}
  >
    Admin
  </span>
</div>

    </Container>
  );
};

export default Splashscreen;