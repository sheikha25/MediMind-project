import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
} from "reactstrap";
import { useSelector } from "react-redux";
import axios from "axios";

import CaregiverHeader from "./CaregiverHeader";
import CaregiverSettingsSidebar from "./CaregiverSettingsSidebar";
import Footer from "./footer";

const LinkPatient = () => {
  const user = useSelector((state) => state.user.user);

  const [patientLinkCode, setPatientLinkCode] =
    useState("");

  const [relationship, setRelationship] =
    useState("");

  const [otherRelationship, setOtherRelationship] =
    useState("");

  const [patientPreview, setPatientPreview] =
    useState(null);

  const [isLoadingPreview, setIsLoadingPreview] =
    useState(false);

  const [previewMessage, setPreviewMessage] =
    useState("");

  const [linkMessage, setLinkMessage] =
    useState("");

  const [linkMessageType, setLinkMessageType] =
    useState("");

  const [isSendingLink, setIsSendingLink] =
    useState(false);

  const handlePreviewPatient = async () => {
    setPreviewMessage("");
    setPatientPreview(null);
    setLinkMessage("");
    setLinkMessageType("");

    if (!patientLinkCode.trim()) {
      setPreviewMessage(
        "Please enter the patient link code."
      );
      return;
    }

    try {
      setIsLoadingPreview(true);

      const formattedCode = patientLinkCode
        .trim()
        .toUpperCase();

      const response = await axios.get(
        `http://localhost:3002/caregiver/patient-preview/${encodeURIComponent(
          formattedCode
        )}`
      );

      setPatientPreview(
        response.data?.patient || null
      );
    } catch (error) {
      console.error(
        "Patient preview error:",
        error
      );

      setPreviewMessage(
        error.response?.data?.message ||
          "Unable to load patient preview."
      );
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleLinkPatient = async () => {
    setLinkMessage("");
    setLinkMessageType("");

    const finalRelationship =
      relationship === "Other"
        ? otherRelationship.trim()
        : relationship;

    if (!user?.email) {
      setLinkMessage("Please log in again.");
      setLinkMessageType("error");
      return;
    }

    if (!patientLinkCode.trim()) {
      setLinkMessage(
        "Please enter the patient link code."
      );
      setLinkMessageType("error");
      return;
    }

    if (!patientPreview) {
      setLinkMessage(
        "Please preview the patient before sending the request."
      );
      setLinkMessageType("error");
      return;
    }

    if (!finalRelationship) {
      setLinkMessage(
        "Please select or enter your relationship to the patient."
      );
      setLinkMessageType("error");
      return;
    }

    try {
      setIsSendingLink(true);

      const response = await axios.post(
        "http://localhost:3002/caregiver/request-link",
        {
          caregiverEmail: user.email,

          patientLinkCode: patientLinkCode
            .trim()
            .toUpperCase(),

          relationship: finalRelationship,
        }
      );

      setLinkMessage(
        response.data?.message ||
          "Link request sent successfully."
      );

      setLinkMessageType("success");

      setPatientLinkCode("");
      setRelationship("");
      setOtherRelationship("");
      setPatientPreview(null);
    } catch (error) {
      console.error(
        "Link Patient Error:",
        error
      );

      setLinkMessage(
        error.response?.data?.message ||
          "Unable to send the link request."
      );

      setLinkMessageType("error");
    } finally {
      setIsSendingLink(false);
    }
  };

  return (
    
  <Container fluid className="dashboard-page">
    <CaregiverHeader />

    <Row style={{ minHeight: "85vh" }}>
      <Col lg="2" md="3" className="settings-sidebar">
        <CaregiverSettingsSidebar />
      </Col>

      <Col lg="10" md="9" className="p-5">
        <h2 className="mb-4">Link Patient Account</h2>

        {/* Card 1: Find patient */}
        <Card className="w-100 mb-4">
          <CardBody>
            <h5 className="mb-2">Find Patient</h5>

            <p className="text-muted">
              Enter the code shared by the patient to review
              limited information before sending a link request.
            </p>

            <label>Patient Link Code</label>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Example: MM-EA0C1S"
              value={patientLinkCode}
              onChange={(event) => {
                setPatientLinkCode(
                  event.target.value.toUpperCase()
                );

                setPatientPreview(null);
                setPreviewMessage("");
                setLinkMessage("");
                setLinkMessageType("");
              }}
            />

            <Button
              color="primary"
              outline
              type="button"
              onClick={handlePreviewPatient}
              disabled={isLoadingPreview}
            >
              {isLoadingPreview
                ? "Loading Preview..."
                : "Preview Patient"}
            </Button>

            {previewMessage && (
              <div className="alert alert-danger mt-3 mb-0">
                {previewMessage}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Card 2: Patient preview */}
        {patientPreview && (
          <Card className="w-100 mb-4">
            <CardBody>
              <h5 className="mb-3">Patient Preview</h5>

              <div className="d-flex align-items-center mb-4">
                <img
                  src={
                    patientPreview.profilePicture
                      ? `http://localhost:3002${patientPreview.profilePicture}`
                      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt={patientPreview.name || "Patient"}
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: "15px",
                    border: "2px solid #dee2e6",
                  }}
                  onError={(event) => {
                    event.currentTarget.src =
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                  }}
                />

                <div>
                  <h5 className="mb-1">
                    {patientPreview.name || "Patient"}
                  </h5>

                  <p className="text-muted mb-0">
                    Limited information shown before linking
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <strong>Medical Conditions</strong>

                {patientPreview.medicalConditions?.length > 0 ? (
                  <div
                    className="mt-2"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {patientPreview.medicalConditions.map(
                      (condition) => (
                        <span
                          key={condition}
                          className="badge bg-light text-dark border"
                          style={{
                            padding: "8px 12px",
                            fontSize: "13px",
                          }}
                        >
                          {condition}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted mt-2 mb-0">
                    No medical conditions provided.
                  </p>
                )}
              </div>

              <Row>
                <Col md="6" className="mb-3 mb-md-0">
                  <div
                    className="border rounded p-3"
                    style={{ height: "100%" }}
                  >
                    <strong>Current Medications</strong>

                    <h4 className="mt-2 mb-0">
                      {patientPreview.activeMedicationCount ?? 0}
                    </h4>

                    <small className="text-muted">
                      Active medication records
                    </small>
                  </div>
                </Col>

                <Col md="6">
                  <div
                    className="border rounded p-3"
                    style={{ height: "100%" }}
                  >
                    <strong>Uploaded Prescriptions</strong>

                    <h4 className="mt-2 mb-0">
                      {patientPreview.prescriptionCount ?? 0}
                    </h4>

                    <small className="text-muted">
                      Prescription files available
                    </small>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        )}

        {/* Card 3: Relationship and request */}
        <Card className="w-100">
          <CardBody>
            <h5 className="mb-3">Send Link Request</h5>

            {!patientPreview && (
              <div className="alert alert-light border">
                Preview a patient first before sending a request.
              </div>
            )}

            <label>Relationship to Patient</label>

            <select
              className="form-control mb-3"
              value={relationship}
              disabled={!patientPreview}
              onChange={(event) => {
                setRelationship(event.target.value);
                setOtherRelationship("");
                setLinkMessage("");
                setLinkMessageType("");
              }}
            >
              <option value="">Select Relationship</option>
              <option value="Parent">Parent</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Sibling">Sibling</option>
              <option value="Spouse">Spouse</option>
              <option value="Relative">Relative</option>
              <option value="Friend">Friend</option>
              <option value="Neighbor">Neighbor</option>

              <option value="Professional Caregiver">
                Professional Caregiver
              </option>

              <option value="Other">Other</option>
            </select>

            {relationship === "Other" && (
              <>
                <label>Specify Relationship</label>

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter relationship"
                  value={otherRelationship}
                  onChange={(event) => {
                    setOtherRelationship(event.target.value);
                    setLinkMessage("");
                    setLinkMessageType("");
                  }}
                />
              </>
            )}

            <Button
              color="success"
              type="button"
              onClick={handleLinkPatient}
              disabled={!patientPreview || isSendingLink}
            >
              {isSendingLink
                ? "Sending Request..."
                : "Send Link Request"}
            </Button>

            {linkMessage && (
              <div
                className={
                  linkMessageType === "success"
                    ? "alert alert-success mt-3 mb-0"
                    : "alert alert-danger mt-3 mb-0"
                }
              >
                {linkMessage}
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>

    <Footer />
  </Container>

  );
};

export default LinkPatient;