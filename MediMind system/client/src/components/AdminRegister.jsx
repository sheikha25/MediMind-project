import { Button, Card, CardBody, Col, Container, FormGroup, Label, Row } from "reactstrap";
import medimindlogo from "../assets/medimindlogo.jpg";
import { RegisterValidation } from "../validations/RegisterValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../features/UserSlice";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Footer from "./footer";
const AdminRegister = () => {
  const dispatch = useDispatch();
  const message = useSelector((state) => state.user.message);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterValidation),
  });

  const onSubmit = (data) => {
    const udata = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      role: "admin",
    };

    dispatch(addUser(udata));
  };

  return (
    <Container fluid>
      <Row className="login-row">
        <Col className="login-col">

          <Card>
            <CardBody>
              <Button
                color="light"
                style={{
                  border: "1px solid #d1d5db",
                  marginBottom: "15px",
                  fontWeight: "500",
                }}
                onClick={() => navigate("/Splashscreen")}
              >
                Go Back
              </Button>
              <img src={medimindlogo} alt="MediMind logo" className="logo" />

              <h2 className="text-center">Admin Registration</h2>
              <p className="text-center">Create your admin account.</p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <FormGroup>
                  <Label>Full Name</Label>
                  <input
                    type="text"
                    placeholder="Enter Full Name"
                    className="form-control"
                    {...register("name")}
                  />
                  <p style={{ color: "red" }}>{errors.name?.message}</p>
                </FormGroup>

                <FormGroup>
                  <Label>Email</Label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    className="form-control"
                    {...register("email")}
                  />
                  <p style={{ color: "red" }}>{errors.email?.message}</p>
                </FormGroup>
                <FormGroup>
                  <Label>Phone Number</Label>
                  <input
                    type="text"
                    placeholder="Enter Phone Number"
                    className="form-control"
                    {...register("phoneNumber")}
                  />
                  <p style={{ color: "red" }}>{errors.phoneNumber?.message}</p>
                </FormGroup>
                <FormGroup>
                  <Label>Password</Label>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    className="form-control"
                    {...register("password")}
                  />
                  <p style={{ color: "red" }}>{errors.password?.message}</p>
                </FormGroup>

                <FormGroup>
                  <Label>Confirm Password</Label>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="form-control"
                    {...register("confirmPassword")}
                  />
                  <p style={{ color: "red" }}>{errors.confirmPassword?.message}</p>
                </FormGroup>

                <FormGroup>
                  <Button color="dark" type="submit" className="w-100">
                    Create Account
                  </Button>
                </FormGroup>

                <FormGroup>
                  <h5 className="text-center" style={{ color: message.includes("Successful") ? "green" : "red" }}>
                    {message}</h5>
                </FormGroup>

                <FormGroup className="text-center">
                  Already have an account? <Link to="/">Login</Link>
                </FormGroup>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Footer />
    </Container>
  );
};

export default AdminRegister;