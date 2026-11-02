import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
} from "reactstrap";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import AdminHeader from "./AdminHeader";

const AdminHome = () => {
  const admin = useSelector((state) => state.user.user);
  const [users, setUsers] = useState([]);
const [deletionRequests, setDeletionRequests] = useState([]);
const [loadingDeletionRequests, setLoadingDeletionRequests] = useState(true);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    patients: 0,
    caregivers: 0,
  });

  const [selectedDeletionRequest, setSelectedDeletionRequest] = useState(null);
const [adminPassword, setAdminPassword] = useState("");
const [deletionAction, setDeletionAction] = useState("");
const [processingDeletion, setProcessingDeletion] = useState(false);
const [deletionError, setDeletionError] = useState("");

  const [loading, setLoading] = useState(true);

  const [selectedCaregiver, setSelectedCaregiver] =
    useState(null);

  const [reviewOpen, setReviewOpen] = useState(false);

  const [updating, setUpdating] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:3002/admin/users"
      );

      setUsers(response.data?.users || []);

      setSummary(
        response.data?.summary || {
          totalUsers: 0,
          patients: 0,
          caregivers: 0,
        }
      );
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDeletionRequests = async () => {
  try {
    setLoadingDeletionRequests(true);

    const response = await axios.get(
      "http://localhost:3002/admin/deletion-requests"
    );

    setDeletionRequests(response.data?.requests || []);
  } catch (error) {
    console.error("Failed to load deletion requests:", error);
  } finally {
    setLoadingDeletionRequests(false);
  }
};


  useEffect(() => {
  loadUsers();
  loadDeletionRequests();
}, []);

const handleDeletionDecision = async () => {
  if (!selectedDeletionRequest || processingDeletion) return;

  if (!admin?.email || !adminPassword.trim()) {
    setDeletionError("Administrator credentials are required.");
    return;
  }

  try {
    setProcessingDeletion(true);
    setDeletionError("");

    const url = `http://localhost:3002/admin/deletion-requests/${selectedDeletionRequest._id}`;

    if (deletionAction === "approve") {
      await axios.delete(`${url}/approve`, {
        data: {
          adminEmail: admin.email,
          adminPassword,
        },
      });
    } else if (deletionAction === "reject") {
      await axios.put(`${url}/reject`, {
        adminEmail: admin.email,
        adminPassword,
      });
    } else {
      return;
    }

    setSelectedDeletionRequest(null);
    setAdminPassword("");
    setDeletionAction("");

    await Promise.all([
      loadDeletionRequests(),
      loadUsers(),
    ]);

    alert(
      deletionAction === "approve"
        ? "Account permanently deleted."
        : "Deletion request rejected."
    );
  } catch (error) {
    setDeletionError(
      error.response?.data?.message ||
      "Unable to process deletion request."
    );
  } finally {
    setProcessingDeletion(false);
  }
};

  const openReview = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setReviewOpen(true);
  };

  const closeReview = () => {
    if (updating) {
      return;
    }

    setReviewOpen(false);
    setSelectedCaregiver(null);
  };

  const updateVerification = async (status) => {
    if (!selectedCaregiver?._id) {
      return;
    }

    try {
      setUpdating(true);

      const response = await axios.put(
        `http://localhost:3002/admin/caregivers/${selectedCaregiver._id}/verification`,
        {
          status,
        }
      );

      if (response.data?.success) {
        await loadUsers();

        setReviewOpen(false);
        setSelectedCaregiver(null);

        alert(response.data.message);
      }
    } catch (error) {
      console.error(
        "Verification update error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to update caregiver verification."
      );
    } finally {
      setUpdating(false);
    }
  };

  const getCaregiverStatus = (user) => {
    if (user.role !== "caregiver") {
      return "Active";
    }

    return (
      user.professionalVerificationStatus ||
      "Not Submitted"
    );
  };

  const getStatusColor = (status) => {
    if (status === "Verified") {
      return "success";
    }

    if (status === "Pending") {
      return "warning";
    }

    if (status === "Rejected") {
      return "danger";
    }

    if (status === "Active") {
      return "success";
    }

    return "secondary";
  };

  return (
    <Container fluid className="dashboard-page">
      <AdminHeader />

      <Row className="p-4">
        <Col>
          <h2>Admin Dashboard</h2>

          <p>
            Manage users, roles, and professional
            verification.
          </p>
        </Col>
      </Row>

      <Row className="px-4">
        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Total Users</h5>
              <h2>{summary.totalUsers}</h2>
              <p>Registered accounts</p>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Patients</h5>
              <h2>{summary.patients}</h2>
              <p>Registered patients</p>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Caregivers</h5>
              <h2>{summary.caregivers}</h2>
              <p>Registered caregivers</p>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="dashboard-card">
            <CardBody>
              <h5>Pending Reviews</h5>

              <h2>
                {
                  users.filter(
                    (user) =>
                      user.role === "caregiver" &&
                      user.professionalVerificationStatus ===
                        "Pending"
                  ).length
                }
              </h2>

              <p>Professional verification</p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="p-4">
        <Col>
          <Card className="dashboard-card">
            <CardBody>
              <h4>User Management</h4>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center"
                      >
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length > 0 ? (
                    users.map((user) => {
                      const status =
                        getCaregiverStatus(user);

                      return (
                        <tr key={user._id}>
                          <td>{user.name}</td>

                          <td>{user.email}</td>

                          <td
                            style={{
                              textTransform:
                                "capitalize",
                            }}
                          >
                            {user.role}
                          </td>

                          <td>
                            <Badge
                              color={getStatusColor(
                                status
                              )}
                            >
                              {status}
                            </Badge>
                          </td>

                          <td>
                            {user.role ===
                            "caregiver" ? (
                              <Button
                                color="primary"
                                size="sm"
                                onClick={() =>
                                  openReview(user)
                                }
                              >
                                Review
                              </Button>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </Col>
      </Row>
<Row className="px-4 pb-4">
  <Col>
    <Card className="dashboard-card">
      <CardBody>
        <h4>Account Deletion Requests</h4>

        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loadingDeletionRequests ? (
              <tr>
                <td colSpan="5" className="text-center">
                  Loading requests...
                </td>
              </tr>
            ) : deletionRequests.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No pending deletion requests.
                </td>
              </tr>
            ) : (
              deletionRequests.map((request) => (
  <tr key={request._id}>
    <td>{request.name}</td>
    <td>{request.email}</td>
    <td>{request.role}</td>

    <td>
      <Badge color="warning">
        {request.accountDeletionStatus}
      </Badge>
    </td>

    <td>
      <Button
        color="success"
        size="sm"
        className="me-2"
        onClick={() => {
          setSelectedDeletionRequest(request);
          setDeletionAction("approve");
          setAdminPassword("");
          setDeletionError("");
        }}
      >
        Approve
      </Button>

      <Button
  color="danger"
  size="sm"
  outline
  disabled={processingDeletion}
  onClick={async () => {
    if (!window.confirm(`Reject deletion request for ${request.name}?`)) {
      return;
    }

    try {
      setProcessingDeletion(true);

      await axios.put(
        `http://localhost:3002/admin/deletion-requests/${request._id}/reject`
      );

      await loadDeletionRequests();
      await loadUsers();

      alert("Deletion request rejected successfully.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to reject deletion request."
      );
    } finally {
      setProcessingDeletion(false);
    }
  }}
>
  Reject
</Button>
    </td>
  </tr>
))
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  </Col>
</Row>
<Modal
  isOpen={!!selectedDeletionRequest}
  toggle={() => {
    if (!processingDeletion) {
      setSelectedDeletionRequest(null);
      setAdminPassword("");
      setDeletionError("");
    }
  }}
  centered
>
  <ModalHeader>
    {deletionAction === "approve"
      ? "Approve Account Deletion"
      : "Reject Account Deletion"}
  </ModalHeader>

  <ModalBody>
    <p>
      <strong>User:</strong> {selectedDeletionRequest?.name}
    </p>

    <p>
      <strong>Email:</strong> {selectedDeletionRequest?.email}
    </p>

    {deletionAction === "approve" && (
      <p className="text-danger">
        Warning: Approval will permanently delete this account
        and its associated data. This cannot be undone.
      </p>
    )}

    <label>Enter your Admin password:</label>

    <input
      type="password"
      className="form-control"
      value={adminPassword}
      onChange={(e) => setAdminPassword(e.target.value)}
      placeholder="Admin password"
    />

    {deletionError && (
      <p className="text-danger mt-2">{deletionError}</p>
    )}
  </ModalBody>

  <ModalFooter>
    <Button
      color="secondary"
      outline
      disabled={processingDeletion}
      onClick={() => {
        setSelectedDeletionRequest(null);
        setAdminPassword("");
        setDeletionError("");
      }}
    >
      Cancel
    </Button>

    <Button
      color={deletionAction === "approve" ? "danger" : "primary"}
      disabled={!adminPassword.trim() || processingDeletion}
      onClick={handleDeletionDecision}
    >
      {processingDeletion
        ? "Processing..."
        : deletionAction === "approve"
        ? "Confirm Permanent Deletion"
        : "Confirm Rejection"}
    </Button>
  </ModalFooter>
</Modal>
      <Modal
        isOpen={reviewOpen}
        toggle={closeReview}
        size="lg"
        centered
      >
        <ModalHeader toggle={closeReview}>
          Professional Verification
        </ModalHeader>

        <ModalBody>
          {selectedCaregiver && (
            <>
              <Row>
                <Col md="6">
                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedCaregiver.name}
                  </p>
                </Col>

                <Col md="6">
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedCaregiver.email}
                  </p>
                </Col>
              </Row>

              <Row>
                <Col md="6">
                  <p>
                    <strong>Degree:</strong>{" "}
                    {selectedCaregiver.degree ||
                      "Not provided"}
                  </p>
                </Col>

                <Col md="6">
                  <p>
                    <strong>Experience:</strong>{" "}
                    {selectedCaregiver.experience !==
                      undefined &&
                    selectedCaregiver.experience !==
                      null
                      ? `${selectedCaregiver.experience} years`
                      : "Not provided"}
                  </p>
                </Col>
              </Row>

              <Row>
                <Col md="6">
                  <p>
                    <strong>Location:</strong>{" "}
                    {selectedCaregiver.location ||
                      "Not provided"}
                  </p>
                </Col>

                <Col md="6">
                  <p>
                    <strong>Current Status:</strong>{" "}
                    <Badge
                      color={getStatusColor(
                        getCaregiverStatus(
                          selectedCaregiver
                        )
                      )}
                    >
                      {getCaregiverStatus(
                        selectedCaregiver
                      )}
                    </Badge>
                  </p>
                </Col>
              </Row>

              <hr />

              <h5>Professional Certificates</h5>

              {selectedCaregiver.certificates &&
              selectedCaregiver.certificates.length >
                0 ? (
                selectedCaregiver.certificates.map(
                  (certificate, index) => (
                    <Card
                      className="mb-2"
                      key={index}
                    >
                      <CardBody className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>
                            {
                              certificate.certificateName
                            }
                          </strong>
                        </div>

                        <Button
                          color="info"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `http://localhost:3002${certificate.certificateFile}`,
                              "_blank"
                            )
                          }
                        >
                          View File
                        </Button>
                      </CardBody>
                    </Card>
                  )
                )
              ) : (
                <p>
                  No professional certificates
                  submitted.
                </p>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            disabled={
              updating ||
              !selectedCaregiver?.certificates
                ?.length
            }
            onClick={() =>
              updateVerification("Rejected")
            }
          >
            {updating ? "Updating..." : "Reject"}
          </Button>

          <Button
            color="success"
            disabled={
              updating ||
              !selectedCaregiver?.certificates
                ?.length
            }
            onClick={() =>
              updateVerification("Verified")
            }
          >
            {updating ? "Updating..." : "Verify"}
          </Button>

          <Button
            color="secondary"
            disabled={updating}
            onClick={closeReview}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default AdminHome;