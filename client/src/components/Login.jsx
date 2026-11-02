import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import medimindlogo from "../assets/medimindlogo.jpg";
import { LoginValidation } from "../validations/LoginValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  login,
  clearUserMessage,
} from "../features/UserSlice";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import {
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Footer from "./footer";
const Login = () => {
  const dispatch = useDispatch();

  const message = useSelector(
    (state) => state.user.message
  );

  const isSuccess = useSelector(
    (state) => state.user.isSuccess
  );

  const user = useSelector(
    (state) => state.user.user
  );

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const isAdminLogin =
    searchParams.get("role") === "admin";

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(
      LoginValidation
    ),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    dispatch(clearUserMessage());

    reset({
      email: "",
      password: "",
    });

    setRememberMe(false);
    setShowPassword(false);
  }, [
    dispatch,
    reset,
    isAdminLogin,
  ]);

  const handleSubmit = (data) => {
    const udata = {
      email: data.email.trim(),
      password: data.password,
      rememberMe,
    };

    dispatch(login(udata));
  };

  useEffect(() => {
    if (
      message === "success" &&
      isSuccess
    ) {
      reset({
        email: "",
        password: "",
      });

      if (user?.role === "admin") {
        navigate("/admin-home");
      } else if (
        user?.role === "caregiver"
      ) {
        navigate("/caregiver-home");
      } else if (user?.role === "patient") {
  if (
    user.routineSetupCompleted === false &&
    user.routineSetupDeferred !== true
  ) {
    navigate("/daily-routine-setup", { replace: true });
  } else {
    navigate("/home", { replace: true });
  }
}
    }
  }, [
    message,
    isSuccess,
    user,
    navigate,
    reset,
  ]);


  return (
    <Container fluid>
      <Row className="login-row">
        <Col
          md="6"
          className="login-col mx-auto"
        >
          <Card>
            <CardBody>
              <img
                src={medimindlogo}
                alt="MediMind logo"
                className="logo text-center"
              />

              {isAdminLogin && (
                <h4
                  className="text-center mb-4"
                  style={{
                    color: "#1e3a8a",
                    fontWeight: "600",
                  }}
                >
                  Admin Login
                </h4>
              )}

              <form
                onSubmit={submitForm(
                  handleSubmit
                )}
                autoComplete="off"
              >
                {message && (
                  <FormGroup>
                    <h5
                      className="text-center"
                      style={{
                        color:
                          message ===
                          "success"
                            ? "green"
                            : "red",
                      }}
                    >
                      {message}
                    </h5>
                  </FormGroup>
                )}

                <FormGroup>
                  <Label>Email</Label>

                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    className="form-control"
                    autoComplete="off"
                    {...register("email")}
                  />

                  <p
                    style={{
                      color: "red",
                    }}
                  >
                    {errors.email?.message}
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
                        paddingRight:
                          "45px",
                      }}
                      {...register(
                        "password"
                      )}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      style={{
                        position:
                          "absolute",
                        top: "50%",
                        right: "14px",
                        transform:
                          "translateY(-50%)",
                        border: "none",
                        background:
                          "transparent",
                        color: "#1e3a8a",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems:
                          "center",
                      }}
                    >
                      {showPassword ? (
                        <FaEyeSlash
                          size={20}
                        />
                      ) : (
                        <FaEye
                          size={20}
                        />
                      )}
                    </button>
                  </div>

                  <p
                    style={{
                      color: "red",
                    }}
                  >
                    {
                      errors.password
                        ?.message
                    }
                  </p>
                </FormGroup>

                <FormGroup>
                  <Input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target
                          .checked
                      )
                    }
                  />{" "}
                  <Label>
                    Remember me
                  </Label>
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
                    style={{
                      width: "60%",
                    }}
                  >
                    SIGN IN
                  </Button>
                </FormGroup>

                {!isAdminLogin && (
                  <FormGroup>
                    No Account?{" "}
                    <Link to="/Splashscreen">
                      Sign Up
                    </Link>{" "}
                    Now
                  </FormGroup>
                )}
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