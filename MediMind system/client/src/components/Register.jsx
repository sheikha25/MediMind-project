import { Button, Card, CardBody, Col, Container, FormGroup, Label, Row } from "reactstrap";
import medimindlogo from "../assets/medimindlogo.jpg";
import { RegisterValidation } from "../validations/RegisterValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../features/UserSlice";
import { Link } from "react-router-dom";
import Footer from "./footer";
const Register = () => {
  const dispatch = useDispatch();
  const message = useSelector((state) => state.user.message);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterValidation),
    defaultValues: {
      role: "patient",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = (data) => {
    const udata = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      medicalCondition: data.role === "patient" ? data.medicalCondition : "",
    };

    dispatch(addUser(udata));
  };

  return (
    <Container fluid>
      <Row className="login-row">
        <Col className="login-col">
          <Card>
            <CardBody>
              <img
                src={medimindlogo}
                alt="MediMind logo"
                className="logo"
              />

              <h2 className="text-center">Create Your MediMind Account</h2>
              <p className="text-center">
                Begin your journey to better medication adherence.
              </p>

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
                  <Label>User Type</Label>
                  <select className="form-control" {...register("role")}>
                    <option value="patient">Patient</option>
                    <option value="caregiver">Caregiver</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p style={{ color: "red" }}>{errors.role?.message}</p>
                </FormGroup>

                {selectedRole === "patient" && (
                  <FormGroup>
                    <Label>Medical Condition</Label>
                    <input
                      type="text"
                      placeholder="Example: Diabetes, Hypertension"
                      className="form-control"
                      {...register("medicalCondition")}
                    />
                    <p style={{ color: "red" }}>
                      {errors.medicalCondition?.message}
                    </p>
                  </FormGroup>
                )}

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
                  <p style={{ color: "red" }}>
                    {errors.confirmPassword?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Button color="primary" type="submit" className="w-100">
                    Create Account
                  </Button>
                </FormGroup>

                <FormGroup>
                  <h5 className="text-center">{message}</h5>
                </FormGroup>

                <FormGroup className="text-center">
                 Already have an account? <Link to="/">Login</Link>
                </FormGroup>
              </form>
            </CardBody>
          </Card>
        </Col>
        <Footer/>
      </Row>
    </Container>
  );
};

export default Register;