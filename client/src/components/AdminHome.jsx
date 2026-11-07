import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, Badge } from "reactstrap";
import axios from "axios";
import { useSelector } from "react-redux";
import Footer from "./Footer";
import AdminHeader from "./AdminHeader";

const API = "http://localhost:3002";

const AdminHome = () => {
  const admin = useSelector((state) => state.user.user);
  const [language, setLanguage] = useState(() => localStorage.getItem("medimindLanguage") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("medimind-theme") || "light");
  const isArabic = language === "ar";
  const isDark = theme === "dark";
  const t = (en, ar) => (isArabic ? ar : en);

  const [users, setUsers] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loadingDeletionRequests, setLoadingDeletionRequests] = useState(true);
  const [summary, setSummary] = useState({ totalUsers: 0, patients: 0, caregivers: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDeletionRequest, setSelectedDeletionRequest] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [deletionAction, setDeletionAction] = useState("");
  const [processingDeletion, setProcessingDeletion] = useState(false);
  const [deletionError, setDeletionError] = useState("");
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const sync = () => {
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
      setTheme(localStorage.getItem("medimind-theme") || "light");
    };
    const events = ["storage", "medimind-language-change", "medimindLanguageChanged", "medimind-theme-change", "medimindThemeChanged"];
    events.forEach((event) => window.addEventListener(event, sync));
    return () => events.forEach((event) => window.removeEventListener(event, sync));
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data?.users || []);
      setSummary(response.data?.summary || { totalUsers: 0, patients: 0, caregivers: 0 });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      setPageError(t("Unable to load users.", "تعذر تحميل المستخدمين."));
    } finally {
      setLoading(false);
    }
  };

  const loadDeletionRequests = async () => {
    try {
      setLoadingDeletionRequests(true);
      const response = await axios.get(`${API}/admin/deletion-requests`);
      setDeletionRequests(response.data?.requests || []);
    } catch (error) {
      console.error("Failed to load deletion requests:", error);
      setPageError(t("Unable to load deletion requests.", "تعذر تحميل طلبات حذف الحسابات."));
    } finally {
      setLoadingDeletionRequests(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadDeletionRequests();
    // Load on mount; language/theme changes don't need to refetch server data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDeletionDecision = (request, action) => {
    setSelectedDeletionRequest(request);
    setDeletionAction(action);
    setAdminPassword("");
    setDeletionError("");
  };

  const closeDeletionDecision = () => {
    if (processingDeletion) return;
    setSelectedDeletionRequest(null);
    setAdminPassword("");
    setDeletionAction("");
    setDeletionError("");
  };

  const handleDeletionDecision = async () => {
    if (!selectedDeletionRequest || processingDeletion || !["approve", "reject"].includes(deletionAction)) return;
    if (!admin?.email || !adminPassword.trim()) {
      setDeletionError(t("Administrator credentials are required.", "بيانات اعتماد المسؤول مطلوبة."));
      return;
    }
    const action = deletionAction;
    try {
      setProcessingDeletion(true);
      setDeletionError("");
      const url = `${API}/admin/deletion-requests/${selectedDeletionRequest._id}`;
      if (action === "approve") {
        await axios.delete(`${url}/approve`, { data: { adminEmail: admin.email, adminPassword } });
      } else {
        await axios.put(`${url}/reject`, { adminEmail: admin.email, adminPassword });
      }
      closeDeletionDecisionAfterSuccess();
      await Promise.all([loadDeletionRequests(), loadUsers()]);
      alert(action === "approve" ? t("Account permanently deleted.", "تم حذف الحساب نهائيًا.") : t("Deletion request rejected.", "تم رفض طلب حذف الحساب."));
    } catch (error) {
      setDeletionError(error.response?.data?.message || t("Unable to process deletion request.", "تعذرت معالجة طلب حذف الحساب."));
    } finally {
      setProcessingDeletion(false);
    }
  };

  const closeDeletionDecisionAfterSuccess = () => {
    setSelectedDeletionRequest(null);
    setAdminPassword("");
    setDeletionAction("");
    setDeletionError("");
  };

  const openReview = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setReviewOpen(true);
  };
  const closeReview = () => {
    if (updating) return;
    setReviewOpen(false);
    setSelectedCaregiver(null);
  };
  const updateVerification = async (status) => {
    if (!selectedCaregiver?._id || updating) return;
    try {
      setUpdating(true);
      const response = await axios.put(`${API}/admin/caregivers/${selectedCaregiver._id}/verification`, { status });
      if (response.data?.success) {
        await loadUsers();
        setReviewOpen(false);
        setSelectedCaregiver(null);
        alert(t("Verification status updated successfully.", "تم تحديث حالة التحقق بنجاح."));
      } else {
        alert(response.data?.message || t("Unable to update caregiver verification.", "تعذر تحديث التحقق من مقدم الرعاية."));
      }
    } catch (error) {
      console.error("Verification update error:", error);
      alert(error.response?.data?.message || t("Unable to update caregiver verification.", "تعذر تحديث التحقق من مقدم الرعاية."));
    } finally {
      setUpdating(false);
    }
  };

  const getCaregiverStatus = (user) => user.role !== "caregiver" ? "Active" : (user.professionalVerificationStatus || "Not Submitted");
  const getStatusColor = (status) => ({ Verified: "success", Pending: "warning", Rejected: "danger", Active: "success" }[status] || "secondary");
  const statusLabel = (status) => ({
    Verified: t("Verified", "تم التحقق"),
    Pending: t("Pending", "قيد المراجعة"),
    Rejected: t("Rejected", "مرفوض"),
    Active: t("Active", "نشط"),
    "Not Submitted": t("Not Submitted", "لم يُقدَّم"),
    Requested: t("Requested", "تم الطلب"),
  }[status] || status || t("Unknown", "غير معروف"));
  const roleLabel = (role) => ({
    patient: t("Patient", "مريض"),
    caregiver: t("Caregiver", "مقدم رعاية"),
    admin: t("Admin", "مسؤول"),
  }[role] || role || "—");

  return (
    <Container fluid className={`dashboard-page admin-home-page ${isDark ? "admin-home-dark" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        .admin-home-page { min-height: 100vh; background: transparent; color: #1f2937; padding-inline: 0 !important; }
        .admin-home-page .admin-home-main { padding: 24px; }
        .admin-home-page .dashboard-card { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; color: inherit; height: 100%; box-shadow: 0 3px 12px rgba(15,23,42,.05); }
        .admin-home-page .dashboard-card .card-body { padding: 20px; }
        .admin-home-page .dashboard-table { width: 100%; border-collapse: collapse; }
        .admin-home-page .dashboard-table th, .admin-home-page .dashboard-table td { padding: 12px; text-align: start; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
        .admin-home-page:not(.admin-home-dark) .dashboard-table th {
  background-color: #edf3fc !important;
  color: #1e3a8a !important;
  font-weight: 700;
  white-space: nowrap;
}
        .admin-home-page .admin-table-scroll { overflow-x: auto; }
        .admin-home-page .admin-summary-note { color: #64748b; margin-bottom: 0; }
        .admin-home-page .admin-home-title { color: #1e3a8a; }
        .admin-home-dark { background: transparent; color: #e5e7eb; }
        .admin-home-dark .dashboard-card { background: #1c2940; border-color: #334155; color: #e5e7eb; }
       .admin-home-page.admin-home-dark .dashboard-table th {
  background-color: #293a55 !important;
  color: #f1f5f9 !important;
  font-weight: 700;
}
        .admin-home-dark .dashboard-table td, .admin-home-dark .dashboard-table th { border-color: #40516a; }
        .admin-home-dark .admin-summary-note { color: #cbd5e1; }
        .admin-home-dark .admin-home-title { color: #b8d0ff; }
        .admin-home-page .admin-action-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
        @media(max-width: 767px) { .admin-home-page .admin-home-main { padding: 15px; } .admin-home-page .dashboard-card .card-body { padding: 16px; } }
      `}</style>
      <AdminHeader />
      <div className="admin-home-main">
        <Row className="mb-3"><Col>
          <h2 className="admin-home-title">{t("Admin Dashboard", "لوحة تحكم المسؤول")}</h2>
          <p>{t("Manage users, roles, and professional verification.", "إدارة المستخدمين والأدوار والتحقق من المؤهلات المهنية.")}</p>
          {pageError && <p className="text-danger" role="alert">{pageError}</p>}
        </Col></Row>

        <Row className="g-3 mb-4">
          {[
            { label: t("Total Users", "إجمالي المستخدمين"), value: summary.totalUsers, note: t("Registered accounts", "الحسابات المسجلة") },
            { label: t("Patients", "المرضى"), value: summary.patients, note: t("Registered patients", "المرضى المسجلون") },
            { label: t("Caregivers", "مقدمو الرعاية"), value: summary.caregivers, note: t("Registered caregivers", "مقدمو الرعاية المسجلون") },
            { label: t("Pending Reviews", "طلبات التحقق المعلقة"), value: users.filter((u) => u.role === "caregiver" && u.professionalVerificationStatus === "Pending").length, note: t("Professional verification", "التحقق من المؤهلات المهنية") },
          ].map((item) => <Col xs="12" sm="6" lg="3" key={item.label}><Card className="dashboard-card"><CardBody>
            <h5>{item.label}</h5><h2>{item.value}</h2><p className="admin-summary-note">{item.note}</p>
          </CardBody></Card></Col>)}
        </Row>

        <Row className="mb-4"><Col><Card className="dashboard-card"><CardBody>
          <h4>{t("User Management", "إدارة المستخدمين")}</h4>
          <div className="admin-table-scroll"><table className="dashboard-table"><thead><tr>
            <th>{t("Name", "الاسم")}</th><th>{t("Email", "البريد الإلكتروني")}</th><th>{t("Role", "الدور")}</th><th>{t("Status", "الحالة")}</th><th>{t("Action", "الإجراء")}</th>
          </tr></thead><tbody>
              {loading ? <tr><td colSpan="5" className="text-center">{t("Loading users...", "جارٍ تحميل المستخدمين...")}</td></tr>
                : users.length ? users.map((person) => {
                  const status = getCaregiverStatus(person);
                  return <tr key={person._id}><td>{person.name}</td><td>{person.email}</td><td>{roleLabel(person.role)}</td>
                    <td><Badge color={getStatusColor(status)}>{statusLabel(status)}</Badge></td>
                    <td>{person.role === "caregiver" ? <Button color="primary" size="sm" onClick={() => openReview(person)}>{t("Review", "مراجعة")}</Button> : "—"}</td>
                  </tr>;
                }) : <tr><td colSpan="5" className="text-center">{t("No users found.", "لم يتم العثور على مستخدمين.")}</td></tr>}
            </tbody></table></div>
        </CardBody></Card></Col></Row>

        <Row><Col><Card className="dashboard-card"><CardBody>
          <h4>{t("Account Deletion Requests", "طلبات حذف الحسابات")}</h4>
          <div className="admin-table-scroll"><table className="dashboard-table"><thead><tr>
            <th>{t("Name", "الاسم")}</th><th>{t("Email", "البريد الإلكتروني")}</th><th>{t("Role", "الدور")}</th><th>{t("Status", "الحالة")}</th><th>{t("Action", "الإجراء")}</th>
          </tr></thead><tbody>
              {loadingDeletionRequests ? <tr><td colSpan="5" className="text-center">{t("Loading requests...", "جارٍ تحميل الطلبات...")}</td></tr>
                : deletionRequests.length === 0 ? <tr><td colSpan="5" className="text-center">{t("No pending deletion requests.", "لا توجد طلبات حذف معلقة.")}</td></tr>
                  : deletionRequests.map((request) => <tr key={request._id}>
                    <td>{request.name}</td><td>{request.email}</td><td>{roleLabel(request.role)}</td>
                    <td><Badge color="warning">{statusLabel(request.accountDeletionStatus)}</Badge></td>
                    <td><div className="admin-action-buttons">
                      <Button color="success" size="sm" disabled={processingDeletion} onClick={() => openDeletionDecision(request, "approve")}>{t("Approve", "موافقة")}</Button>
                      <Button color="danger" outline size="sm" disabled={processingDeletion} onClick={() => openDeletionDecision(request, "reject")}>{t("Reject", "رفض")}</Button>
                    </div></td>
                  </tr>)}
            </tbody></table></div>
        </CardBody></Card></Col></Row>
      </div>

      <Modal isOpen={!!selectedDeletionRequest} toggle={closeDeletionDecision} centered contentClassName={isDark ? "admin-modal-dark" : ""}>
        <ModalHeader toggle={closeDeletionDecision}>{deletionAction === "approve" ? t("Approve Account Deletion", "الموافقة على حذف الحساب") : t("Reject Account Deletion", "رفض حذف الحساب")}</ModalHeader>
        <ModalBody dir={isArabic ? "rtl" : "ltr"}>
          <p><strong>{t("User:", "المستخدم:")}</strong> {selectedDeletionRequest?.name}</p>
          <p><strong>{t("Email:", "البريد الإلكتروني:")}</strong> {selectedDeletionRequest?.email}</p>
          {deletionAction === "approve" && <p className="text-danger">{t("Warning: Approval will permanently delete this account and its associated data. This cannot be undone.", "تحذير: ستؤدي الموافقة إلى حذف هذا الحساب والبيانات المرتبطة به نهائيًا، ولا يمكن التراجع عن ذلك.")}</p>}
          <label htmlFor="admin-deletion-password">{t("Enter your Admin password:", "أدخل كلمة مرور المسؤول:")}</label>
          <input id="admin-deletion-password" type="password" className="form-control" autoComplete="current-password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder={t("Admin password", "كلمة مرور المسؤول")} />
          {deletionError && <p className="text-danger mt-2" role="alert">{deletionError}</p>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline disabled={processingDeletion} onClick={closeDeletionDecision}>{t("Cancel", "إلغاء")}</Button>
          <Button color={deletionAction === "approve" ? "danger" : "primary"} disabled={!adminPassword.trim() || processingDeletion} onClick={handleDeletionDecision}>
            {processingDeletion ? t("Processing...", "جارٍ المعالجة...") : deletionAction === "approve" ? t("Confirm Permanent Deletion", "تأكيد الحذف النهائي") : t("Confirm Rejection", "تأكيد الرفض")}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={reviewOpen} toggle={closeReview} size="lg" centered contentClassName={isDark ? "admin-modal-dark" : ""}>
        <ModalHeader toggle={closeReview}>{t("Professional Verification", "التحقق من المؤهلات المهنية")}</ModalHeader>
        <ModalBody dir={isArabic ? "rtl" : "ltr"}>
          {selectedCaregiver && <>
            <Row><Col md="6"><p><strong>{t("Name:", "الاسم:")}</strong> {selectedCaregiver.name}</p></Col>
              <Col md="6"><p><strong>{t("Email:", "البريد الإلكتروني:")}</strong> {selectedCaregiver.email}</p></Col></Row>
            <Row><Col md="6"><p><strong>{t("Degree:", "المؤهل العلمي:")}</strong> {selectedCaregiver.degree || t("Not provided", "غير متوفر")}</p></Col>
              <Col md="6"><p><strong>{t("Experience:", "الخبرة:")}</strong> {selectedCaregiver.experience !== undefined && selectedCaregiver.experience !== null ? `${selectedCaregiver.experience} ${t("years", "سنوات")}` : t("Not provided", "غير متوفر")}</p></Col></Row>
            <Row><Col md="6"><p><strong>{t("Location:", "الموقع:")}</strong> {selectedCaregiver.location || t("Not provided", "غير متوفر")}</p></Col>
              <Col md="6"><p><strong>{t("Current Status:", "الحالة الحالية:")}</strong> <Badge color={getStatusColor(getCaregiverStatus(selectedCaregiver))}>{statusLabel(getCaregiverStatus(selectedCaregiver))}</Badge></p></Col></Row>
            <hr />
            <h5>{t("Professional Certificates", "الشهادات المهنية")}</h5>
            {selectedCaregiver.certificates?.length ? selectedCaregiver.certificates.map((certificate, index) => <Card className="mb-2" key={certificate.certificateFile || index}><CardBody className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <strong>{certificate.certificateName}</strong>
              <Button color="info" size="sm" onClick={() => window.open(`${API}${certificate.certificateFile}`, "_blank", "noopener,noreferrer")}>{t("View File", "عرض الملف")}</Button>
            </CardBody></Card>) : <p>{t("No professional certificates submitted.", "لم تُقدَّم أي شهادات مهنية.")}</p>}
          </>}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" disabled={updating || !selectedCaregiver?.certificates?.length} onClick={() => updateVerification("Rejected")}>{updating ? t("Updating...", "جارٍ التحديث...") : t("Reject", "رفض")}</Button>
          <Button color="success" disabled={updating || !selectedCaregiver?.certificates?.length} onClick={() => updateVerification("Verified")}>{updating ? t("Updating...", "جارٍ التحديث...") : t("Verify", "تحقق")}</Button>
          <Button color="secondary" disabled={updating} onClick={closeReview}>{t("Close", "إغلاق")}</Button>
        </ModalFooter>
      </Modal>
      <style>{`
        .admin-modal-dark { background: #1c2940; color: #e5e7eb; border: 1px solid #334155; }
        .admin-modal-dark .modal-header, .admin-modal-dark .modal-footer { border-color: #40516a; }
        .admin-modal-dark .btn-close { filter: invert(1); }
        .admin-modal-dark .card { background: #25344d; color: #e5e7eb; border-color: #40516a; }
        .admin-modal-dark .form-control { background: #111b2b; color: #f8fafc; border-color: #475569; }
        .admin-modal-dark .form-control::placeholder { color: #94a3b8; }
      `}</style>
      <Footer />
    </Container>
  );
};

export default AdminHome;
