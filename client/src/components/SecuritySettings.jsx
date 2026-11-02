import {
  Container, Row, Col, Card, CardBody, Button,
  Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const SecuritySettings = () => {
 const user = useSelector((state) => state.user.user);
const dispatch = useDispatch();
const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [deletePassword, setDeletePassword] = useState("");
const [isDeleting, setIsDeleting] = useState(false);
const [deleteError, setDeleteError] = useState("");
const closeDeleteModal = () => {
  setDeleteModalOpen(false);
  setDeletePassword("");
};

const handleDeleteAccount = async () => {
  if (!deletePassword.trim() || isDeleting) return;

  setDeleteError("");
  setIsDeleting(true);

  try {
    const response = await axios.post(
      "http://localhost:3002/account/deletion-request",
      {
        email: user.email,
        password: deletePassword,
      }
    );

    if (response.data.success) {
      setDeletePassword("");
      setDeleteModalOpen(false);

      alert(
        "Your account deletion request has been submitted successfully. It is now pending administrator review."
      );

      dispatch({ type: "user/logout" });
      navigate("/", { replace: true });
    }
  } catch (error) {
    setDeleteError(
      error.response?.data?.message ||
      "Unable to submit your deletion request. Please try again."
    );
  } finally {
    setIsDeleting(false);
  }
};

  return (
    <Container fluid className="dashboard-page">
      <Header />
      <Row style={{ minHeight: "85vh" }}>
        <Col md="3"><SettingsSidebar /></Col>
        <Col md="9" className="p-5">
          <h2>Security</h2>
          <Card>
            <CardBody>
              <input type="password" className="form-control mb-3" placeholder="Current Password" />
              <input type="password" className="form-control mb-3" placeholder="New Password" />
              <Button color="primary" className="w-100">Change Password</Button>
            </CardBody>
          </Card>
          <Card className="mt-4 border-danger">
  <CardBody>
    <h5 className="text-danger">Delete Account</h5>

    <p className="text-muted">
  Request permanent deletion of your account and associated data.
  Your request will be reviewed by the administrator before
  any data is deleted.
</p>

    <Button
  color="danger"
  outline
  onClick={() => setDeleteModalOpen(true)}
>
  Delete My Account
</Button>
  </CardBody>
</Card>
        </Col>
      </Row>
      <Modal isOpen={deleteModalOpen} toggle={closeDeleteModal} centered>
  <ModalHeader toggle={closeDeleteModal}>
    Confirm Account Deletion
  </ModalHeader>

  <ModalBody>
    <p className="text-danger fw-bold">
  Are you sure you want to request account deletion?
</p>

<p>
  Your request will be sent to the administrator for review.
  Your account and associated data will not be deleted
  until the request is approved.
</p>

    <label className="mb-2">Enter your password to confirm:</label>

    <input
      type="password"
      className="form-control"
      placeholder="Current password"
      value={deletePassword}
      onChange={(e) => setDeletePassword(e.target.value)}
    />
    {deleteError && (
  <p className="text-danger mt-2">
    {deleteError}
  </p>
)}
  </ModalBody>

  <ModalFooter>
    <Button color="secondary" outline onClick={closeDeleteModal}>
      Cancel
    </Button>

    <Button
  color="danger"
  onClick={handleDeleteAccount}
  disabled={!deletePassword.trim() || isDeleting}
>
 {isDeleting ? "Submitting..." : "Submit Deletion Request"}
</Button>
  </ModalFooter>
</Modal>
    </Container>
  );
};

export default SecuritySettings;