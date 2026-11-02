import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  FormGroup,
  Label,
  Row,
} from "reactstrap";

import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import medimindlogo from "../assets/medimindlogo.jpg";
import { RegisterValidation } from "../validations/RegisterValidation";
import {
  addUser,
  clearUserMessage,
} from "../features/UserSlice";
import Footer from "./footer";

const CaregiverRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const message = useSelector(
    (state) => state.user.message
  );

  const isSuccess = useSelector(
    (state) => state.user.isSuccess
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterValidation),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    dispatch(clearUserMessage());

    reset({
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [dispatch, reset]);

  const onSubmit = (data) => {
    const userData = {
      name: data.name,
      email: data.email.trim(),
      phoneNumber: data.phoneNumber,
      password: data.password,
      role: "caregiver",
    };

    dispatch(addUser(userData));
  };

  useEffect(() => {
    if (
      isSuccess &&
      message?.includes("Successful")
    ) {
      navigate("/");
    }
  }, [isSuccess, message, navigate]);

  const passwordIconButtonStyle = {
    position: "absolute",
    top: "50%",
    right: "14px",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#1e3a8a",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Container fluid>
      <Row className="login-row">
        <Col className="login-col">
          <Card>
            <CardBody>
              <Button
                color="light"
                type="button"
                style={{
                  border: "1px solid #d1d5db",
                  marginBottom: "15px",
                  fontWeight: "500",
                }}
                onClick={() =>
                  navigate("/Splashscreen")
                }
              >
                Go Back
              </Button>

              <img
                src={medimindlogo}
                alt="MediMind logo"
                className="logo"
              />

              <h2 className="text-center">
                Caregiver Registration
              </h2>

              <p className="text-center">
                Create your caregiver account.
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
              >
                <FormGroup>
                  <Label>Full Name</Label>

                  <input
                    type="text"
                    placeholder="Enter Full Name"
                    className="form-control"
                    autoComplete="off"
                    {...register("name")}
                  />

                  <p style={{ color: "red" }}>
                    {errors.name?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Label>Email</Label>

                  <input
                    type="email"
                    placeholder="Enter Email"
                    className="form-control"
                    autoComplete="new-email"
                    {...register("email")}
                  />

                  <p style={{ color: "red" }}>
                    {errors.email?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Label>Phone Number</Label>

                  <input
                    type="text"
                    placeholder="Enter Phone Number"
                    className="form-control"
                    autoComplete="off"
                    {...register("phoneNumber")}
                  />

                  <p style={{ color: "red" }}>
                    {errors.phoneNumber?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Label>Password</Label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter Password"
                      className="form-control"
                      autoComplete="new-password"
                      style={{
                        paddingRight: "45px",
                      }}
                      {...register("password")}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      title={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      style={
                        passwordIconButtonStyle
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>

                  <p style={{ color: "red" }}>
                    {errors.password?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Label>
                    Confirm Password
                  </Label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm Password"
                      className="form-control"
                      autoComplete="new-password"
                      style={{
                        paddingRight: "45px",
                      }}
                      {...register(
                        "confirmPassword"
                      )}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      title={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      style={
                        passwordIconButtonStyle
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>

                  <p style={{ color: "red" }}>
                    {
                      errors.confirmPassword
                        ?.message
                    }
                  </p>
                </FormGroup>

                <FormGroup>
                  <Button
                    color="success"
                    type="submit"
                    className="w-100"
                  >
                    Create Account
                  </Button>
                </FormGroup>

                {message && (
                  <FormGroup>
                    <h5
                      className="text-center"
                      style={{
                        color:
                          message.includes(
                            "Successful"
                          )
                            ? "green"
                            : "red",
                      }}
                    >
                      {message}
                    </h5>
                  </FormGroup>
                )}

                <FormGroup className="text-center">
                  Already have an account?{" "}
                  <Link to="/">
                    Login
                  </Link>
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

export default CaregiverRegister;