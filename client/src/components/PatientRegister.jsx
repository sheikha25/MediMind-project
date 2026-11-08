import { useEffect, useState } from "react";
import {Button,Card,CardBody,Col,Container,FormGroup,Label,Row,} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEye, FaEyeSlash, FaPlus, FaTimes } from "react-icons/fa";

import medimindlogo from "../assets/medimind-symbol.png";
import { RegisterValidation } from "../validations/RegisterValidation";
import {addUser,clearUserMessage,} from "../features/UserSlice";
import Footer from "./Footer";

const PatientRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const message = useSelector((state) => state.user.message);
  const isSuccess = useSelector((state) => state.user.isSuccess);

  const [selectedCondition, setSelectedCondition] = useState("");
  const [otherCondition, setOtherCondition] = useState("");
  const [conditions, setConditions] = useState([]);
  const [conditionMsg, setConditionMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const addCondition = () => {
    const conditionToAdd =
      selectedCondition === "Other"
        ? otherCondition.trim()
        : selectedCondition;

    if (!conditionToAdd) {
      setConditionMsg("Please select or enter a condition");
      return;
    }

    const conditionAlreadyExists = conditions.some(
      (condition) =>
        condition.toLowerCase() === conditionToAdd.toLowerCase()
    );

    if (conditionAlreadyExists) {
      setConditionMsg("Condition already added");
      return;
    }

    setConditions((previousConditions) => [
      ...previousConditions,
      conditionToAdd,
    ]);

    setSelectedCondition("");
    setOtherCondition("");
    setConditionMsg("");
  };

  const removeCondition = (conditionToRemove) => {
    setConditions((previousConditions) =>
      previousConditions.filter(
        (condition) => condition !== conditionToRemove
      )
    );

    setConditionMsg("");
  };

  const onSubmit = (data) => {
    const finalConditions = [...conditions];

    const conditionToAdd =
      selectedCondition === "Other"
        ? otherCondition.trim()
        : selectedCondition;

    const conditionAlreadyExists = conditionToAdd
      ? finalConditions.some(
          (condition) =>
            condition.toLowerCase() === conditionToAdd.toLowerCase()
        )
      : false;

    if (conditionToAdd && !conditionAlreadyExists) {
      finalConditions.push(conditionToAdd);
    }

    if (finalConditions.length === 0) {
      setConditionMsg(
        "Please select or add at least one medical condition"
      );
      return;
    }

    const userData = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      role: "patient",
      medicalCondition: finalConditions,
    };

    dispatch(addUser(userData));
  };


  useEffect(() => {
  dispatch(clearUserMessage());

  reset({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  setSelectedCondition("");
  setOtherCondition("");
  setConditions([]);
  setConditionMsg("");
  setShowPassword(false);
  setShowConfirmPassword(false);
}, [dispatch, reset]);

  useEffect(() => {
    if (isSuccess && message?.includes("Successful")) {
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
                onClick={() => navigate("/Splashscreen")}
              >
                Go Back
              </Button>

              <div className="patient-register-brand">
  <img
    src={medimindlogo}
    alt="MediMind symbol"
    className="patient-register-logo"
  />
  <div className="patient-register-brand-name">
    MEDIMIND
  </div>
</div>

              <h2 className="text-center">
                Patient Registration
              </h2>

              <p className="text-center">
                Begin your journey to better medication adherence.
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
                    {...register("phoneNumber")}
                  />

                  <p style={{ color: "red" }}>
                    {errors.phoneNumber?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Label>Medical Condition</Label>

                  <select
                    className="form-control mb-2"
                    value={selectedCondition}
                    onChange={(event) => {
                      setSelectedCondition(event.target.value);
                      setOtherCondition("");
                      setConditionMsg("");
                    }}
                  >
                    <option value="">
                      Select Condition
                    </option>

                    <option value="Diabetes">
                      Diabetes
                    </option>

                    <option value="Hypertension">
                      Hypertension
                    </option>

                    <option value="Asthma">
                      Asthma
                    </option>

                    <option value="Heart Disease">
                      Heart Disease
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                  {selectedCondition === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter Medical Condition"
                      className="form-control mb-2"
                      value={otherCondition}
                      onChange={(event) => {
                        setOtherCondition(event.target.value);
                        setConditionMsg("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addCondition();
                        }
                      }}
                    />
                  )}

                  <Button
                    color="secondary"
                    type="button"
                    onClick={addCondition}
                    className="d-flex align-items-center"
                  >
                    <FaPlus
                      size={12}
                      style={{ marginRight: "7px" }}
                    />
                    Add Condition
                  </Button>

                  {conditionMsg && (
                    <p
                      style={{
                        color: "red",
                        marginTop: "8px",
                        marginBottom: 0,
                      }}
                    >
                      {conditionMsg}
                    </p>
                  )}

                  {conditions.length > 0 && (
                    <div className="mt-3">
                      <Label>Added Conditions</Label>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                          marginTop: "8px",
                        }}
                      >
                        {conditions.map((condition) => (
                          <div
                            key={condition}
                            style={{
                              backgroundColor: "#eef4ff",
                              color: "#1e3a8a",
                              border: "1px solid #c8d8ff",
                              borderRadius: "20px",
                              padding: "7px 12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              fontWeight: "500",
                            }}
                          >
                            <span>{condition}</span>

                            <button
                              type="button"
                              onClick={() =>
                                removeCondition(condition)
                              }
                              aria-label={`Remove ${condition}`}
                              title={`Remove ${condition}`}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#dc3545",
                                cursor: "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FaTimes size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Password</Label>

                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      className="form-control"
                      autoComplete="new-password"
                      style={{ paddingRight: "45px" }}
                      {...register("password")}
                    />

                    <button className="patient-password-toggle"
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
                      style={passwordIconButtonStyle}
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
                  <Label>Confirm Password</Label>

                  <div style={{ position: "relative" }}>
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm Password"
                      className="form-control"
                      autoComplete="new-password"
                      style={{ paddingRight: "45px" }}
                      {...register("confirmPassword")}
                    />

                    <button className="patient-password-toggle"
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
                      style={passwordIconButtonStyle}
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>

                  <p style={{ color: "red" }}>
                    {errors.confirmPassword?.message}
                  </p>
                </FormGroup>

                <FormGroup>
                  <Button
                    color="primary"
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
                        color: message.includes("Successful")
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
                  <Link to="/">Login</Link>
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

export default PatientRegister;
