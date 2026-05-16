import {Button,Card,CardBody,Col,Container,FormGroup,Input,Label,Row} from "reactstrap";
import medimindlogo from "../assets/medimindlogo.jpg";
import { LoginValidation } from "../validations/LoginValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../features/UserSlice";
import { useDispatch, useSelector } from "react-redux";

import Footer from "./footer";

const Login = () => {
  const dispatch = useDispatch();

  const message = useSelector((state) => state.user.message);

  const isSuccess = useSelector((state) => state.user.isSuccess);

  const user = useSelector((state) => state.user.user);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LoginValidation),
  });

  const handleSubmit = (data) => {
    const udata = {
      email: data.email,
      password: data.password,
    };

    dispatch(login(udata));
  };

  useEffect(() => {
    if (message === "success" && isSuccess) {
      if (user?.role === "admin") {
        navigate("/admin-home");
      }

      else if (user?.role === "caregiver") {
        navigate("/caregiver-home");
      }

      else {
        navigate("/home");
      }
    }
  }, [message, isSuccess, user, navigate]);

  return (
    <Container fluid>
      <Row className="login-row">
        <Col md="6" className="login-col mx-auto">
          <Card>
            <CardBody>
              <img
                src={medimindlogo}
                alt="MediMind logo"
                className="logo text-center"
              />

              <form onSubmit={submitForm(handleSubmit)}>
                <FormGroup>
                  <h5
                    className="text-center"
                    style={{
                      color:
                        message === "success"
                          ? "green"
                          : "red",
                    }}
                  >
                    {message}
                  </h5>
                </FormGroup>

                <FormGroup>
                  <Label>Email</Label>

                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    className="form-control"
                    {...register("email")}
                  />

                  <p style={{ color: "red" }}>
                    {errors.email?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Label>Password</Label>

                  <input
                    type="password"
                    placeholder="Enter Password"
                    className="form-control"
                    {...register("password")}
                  />

                  <p style={{ color: "red" }}>
                    {errors.password?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Input type="checkbox" />{" "}
                  <Label>Remember me</Label>
                </FormGroup>

                <FormGroup>
                  <Link to="/forgot-password">
                    Forgot Password?
                  </Link>
                </FormGroup>

                <FormGroup className="text-center">
                  <Button
                    color="primary"
                    type="submit"
                    style={{ width: "60%" }}
                  >
                    SIGN IN
                  </Button>
                </FormGroup>

                <FormGroup>
                  No Account?{" "}
                  <Link to="/Splashscreen">
                    Sign Up
                  </Link>{" "}
                  Now
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

export default Login;