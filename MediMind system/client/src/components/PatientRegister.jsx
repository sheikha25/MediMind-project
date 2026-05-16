import { Button, Card, CardBody, Col, Container, FormGroup, Label, Row } from "reactstrap";
import medimindlogo from "../assets/medimindlogo.jpg";
import { RegisterValidation } from "../validations/RegisterValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../features/UserSlice";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./footer";
import { useState } from "react";

const PatientRegister = () => {
  const dispatch = useDispatch();
  const message = useSelector((state) => state.user.message);
  const navigate = useNavigate();

  const [selectedCondition, setSelectedCondition] = useState("");
  const [otherCondition, setOtherCondition] = useState("");
  const [conditions, setConditions] = useState([]);
  const [conditionMsg, setConditionMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterValidation),
  });

  const addCondition = () => {
    const conditionToAdd =
      selectedCondition === "Other" ? otherCondition : selectedCondition;

    if (!conditionToAdd) {
      setConditionMsg("Please select or enter a condition");
      return;
    }

    if (conditions.includes(conditionToAdd)) {
      setConditionMsg("Condition already added");
      return;
    }

    setConditions([...conditions, conditionToAdd]);
    setConditionMsg("Condition added");
    setSelectedCondition("");
    setOtherCondition("");
  };

  const onSubmit = (data) => {
    const udata = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      role: "patient",
      medicalCondition: conditions,
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

              <h2 className="text-center">Patient Registration</h2>

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
                  <Label>Medical Condition</Label>

                  <select
                    className="form-control mb-2"
                    value={selectedCondition}
                    onChange={(e) => {
                      setSelectedCondition(e.target.value);
                      setConditionMsg("");
                    }}
                  >
                    <option value="">Select Condition</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Hypertension">Hypertension</option>
                    <option value="Asthma">Asthma</option>
                    <option value="Heart Disease">Heart Disease</option>
                    <option value="Other">Other</option>
                  </select>

                  {selectedCondition === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter Medical Condition"
                      className="form-control mb-2"
                      value={otherCondition}
                      onChange={(e) => {
                        setOtherCondition(e.target.value);
                        setConditionMsg("");
                      }}
                    />
                  )}

                  <Button
                    color="secondary"
                    type="button"
                    onClick={addCondition}
                  >
                    + Add Condition
                  </Button>

                  {conditionMsg && (
                    <p
                      style={{
                        color:
                          conditionMsg === "Condition added"
                            ? "green"
                            : "red",
                        marginTop: "8px",
                      }}
                    >
                      {conditionMsg}
                    </p>
                  )}
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

export default PatientRegister;