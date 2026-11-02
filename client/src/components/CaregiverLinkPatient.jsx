import { useState } from "react";
import axios from "axios";
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
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import medimindlogo from "../assets/medimindlogo.jpg";
import Footer from "./footer";

const CaregiverLinkPatient = () => {
  const navigate = useNavigate();

  const caregiverEmail = useSelector(
    (state) => state.user.user.email
  );

  const [patientLinkCode, setPatientLinkCode] =
    useState("");

  const [relationship, setRelationship] =
    useState("");

  const [otherRelationship, setOtherRelationship] =
    useState("");

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    const finalRelationship =
      relationship === "Other"
        ? otherRelationship.trim()
        : relationship;

    if (!caregiverEmail) {
      setMessage(
        "Caregiver information was not found. Please log in again."
      );
      return;
    }

    if (!patientLinkCode.trim()) {
      setMessage("Please enter the patient link code.");
      return;
    }

    if (!finalRelationship) {
      setMessage(
        "Please select or enter your relationship to the patient."
      );
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        "http://localhost:3002/caregiver/request-link",
        {
          caregiverEmail,
          patientLinkCode: patientLinkCode.trim(),
          relationship: finalRelationship,
        }
      );

      setMessage(response.data.message);

      if (
        response.data.message ===
        "Link request sent successfully"
      ) {
        setPatientLinkCode("");
        setRelationship("");
        setOtherRelationship("");
      }
    } catch (error) {
      console.log("Link Request Error:", error);

      setMessage(
        "Unable to send the link request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const messageIsSuccessful =
    message === "Link request sent successfully";

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
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>

              <img
                src={medimindlogo}
                alt="MediMind logo"
                className="logo"
              />

              <h2 className="text-center">
                Link to a Patient
              </h2>

              <p className="text-center">
                Enter the code shared by the patient to
                request access.
              </p>

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Patient Link Code</Label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Example: MM-EA0C1S"
                    value={patientLinkCode}
                    onChange={(event) => {
                      setPatientLinkCode(
                        event.target.value.toUpperCase()
                      );
                      setMessage("");
                    }}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    Relationship to Patient
                  </Label>

                  <select
                    className="form-control"
                    value={relationship}
                    onChange={(event) => {
                      setRelationship(event.target.value);
                      setOtherRelationship("");
                      setMessage("");
                    }}
                  >
                    <option value="">
                      Select Relationship
                    </option>

                    <option value="Parent">
                      Parent
                    </option>

                    <option value="Son">Son</option>

                    <option value="Daughter">
                      Daughter
                    </option>

                    <option value="Sibling">
                      Sibling
                    </option>

                    <option value="Spouse">
                      Spouse
                    </option>

                    <option value="Relative">
                      Relative
                    </option>

                    <option value="Friend">
                      Friend
                    </option>

                    <option value="Neighbor">
                      Neighbor
                    </option>

                    <option value="Professional Caregiver">
                      Professional Caregiver
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </FormGroup>

                {relationship === "Other" && (
                  <FormGroup>
                    <Label>
                      Specify Relationship
                    </Label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter relationship"
                      value={otherRelationship}
                      onChange={(event) => {
                        setOtherRelationship(
                          event.target.value
                        );
                        setMessage("");
                      }}
                    />
                  </FormGroup>
                )}

                <FormGroup>
                  <Button
                    color="primary"
                    type="submit"
                    className="w-100"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Sending Request..."
                      : "Send Link Request"}
                  </Button>
                </FormGroup>

                {message && (
                  <FormGroup>
                    <h5
                      className="text-center"
                      style={{
                        color: messageIsSuccessful
                          ? "green"
                          : "red",
                      }}
                    >
                      {message}
                    </h5>
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

export default CaregiverLinkPatient;