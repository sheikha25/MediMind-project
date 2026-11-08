import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { useSelector } from "react-redux";
import axios from "axios";
import CaregiverHeader from "./CaregiverHeader";
import CaregiverSettingsSidebar from "./CaregiverSettingsSidebar";
import Footer from "./Footer";
import lightBackground from "../assets/medimind-bg-light.png";
import darkBackground from "../assets/medimind-bg-dark.png";

const LinkPatient = () => {
  const user = useSelector((state) => state.user.user);
  const t = (en, ar) => (isArabic ? ar : en);
  const [isArabic, setIsArabic] = useState(() => localStorage.getItem("medimindLanguage") === "ar");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("medimind-theme") === "dark");
  const [patientLinkCode, setPatientLinkCode] = useState("");
  const [relationship, setRelationship] = useState("");
  const [otherRelationship, setOtherRelationship] = useState("");
  const [patientPreview, setPatientPreview] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [linkMessage, setLinkMessage] = useState("");
  const [linkMessageType, setLinkMessageType] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsArabic(localStorage.getItem("medimindLanguage") === "ar");
      setIsDark(localStorage.getItem("medimind-theme") === "dark");
    };
    const events = ["storage", "medimind-language-change", "medimindLanguageChanged", "medimind-theme-change", "medimindThemeChanged"];
    events.forEach((name) => window.addEventListener(name, sync));
    return () => events.forEach((name) => window.removeEventListener(name, sync));
  }, []);

  const handlePreviewPatient = async () => {
    setPreviewMessage("");
    setPatientPreview(null);
    setLinkMessage("");
    setLinkMessageType("");
    if (!patientLinkCode.trim()) {
      setPreviewMessage(t("Please enter the patient link code.", "يرجى إدخال رمز ربط المريض."));
      return;
    }
    try {
      setIsLoadingPreview(true);
      const formattedCode = patientLinkCode.trim().toUpperCase();
      const response = await axios.get(
        `http://localhost:3002/caregiver/patient-preview/${encodeURIComponent(formattedCode)}`
      );
      setPatientPreview(response.data?.patient || null);
      if (!response.data?.patient) {
        setPreviewMessage(t("No patient preview was found.", "لم يتم العثور على معلومات المريض."));
      }
    } catch (error) {
      console.error("Patient preview error:", error);
      setPreviewMessage(error.response?.data?.message || (t("Unable to load patient preview.", "تعذر تحميل معاينة المريض.")));
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleLinkPatient = async () => {
    setLinkMessage("");
    setLinkMessageType("");
    const finalRelationship = relationship === "Other" ? otherRelationship.trim() : relationship;
    const fail = (arabic, english) => {
      setLinkMessage(isArabic ? arabic : english);
      setLinkMessageType("error");
    };
    if (!user?.email) return fail("يرجى تسجيل الدخول مجددًا.", "Please log in again.");
    if (!patientLinkCode.trim()) return fail("يرجى إدخال رمز ربط المريض.", "Please enter the patient link code.");
    if (!patientPreview) return fail("يرجى معاينة المريض قبل إرسال الطلب.", "Please preview the patient before sending the request.");
    if (!finalRelationship) return fail("يرجى تحديد صلة القرابة أو العلاقة بالمريض.", "Please select or enter your relationship to the patient.");
    try {
      setIsSendingLink(true);
      const response = await axios.post("http://localhost:3002/caregiver/request-link", {
        caregiverEmail: user.email,
        patientLinkCode: patientLinkCode.trim().toUpperCase(),
        relationship: finalRelationship,
      });
      setLinkMessage(response.data?.message || (t("Link request sent successfully.", "تم إرسال طلب الربط بنجاح.")));
      setLinkMessageType("success");
      setPatientLinkCode("");
      setRelationship("");
      setOtherRelationship("");
      setPatientPreview(null);
    } catch (error) {
      console.error("Link Patient Error:", error);
      setLinkMessage(error.response?.data?.message || (t("Unable to send the link request.", "تعذر إرسال طلب الربط.")));
      setLinkMessageType("error");
    } finally {
      setIsSendingLink(false);
    }
  };

  return (
    <Container
  fluid
  className={`dashboard-page mm-link-patient ${
    isDark ? "mm-link-patient-dark" : ""
  }`}
  dir={t("ltr", "rtl")}
  style={{
    minHeight: "100vh",
    backgroundImage: `url(${isDark ? darkBackground : lightBackground})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  }}
>
      <style>{`
        .mm-link-patient { min-height:100vh; background:#f7f9fc; color:#25344a; padding:0; }
        .mm-link-patient .mm-link-content { padding:32px; min-width:0; }
        .mm-link-patient .card { border-radius:16px; border:1px solid #e3eaf4; }
        .mm-link-patient .form-control { min-height:42px; }
        .mm-link-patient .mm-patient-avatar { width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid #dee2e6; flex-shrink:0; }
        .mm-link-patient .mm-patient-profile { display:flex; align-items:center; gap:15px; flex-wrap:wrap; }
        .mm-link-patient .mm-medical-badge { display:inline-block; padding:8px 12px; font-size:13px; border-radius:8px; border:1px solid #d5dfed; background:#f3f6fa; margin:4px; }
        .mm-link-patient-dark { background:#101827; color:#e8edf6; }
        .mm-link-patient-dark .card { background:#1d293b; border-color:#35445b; color:#e8edf6; }
        .mm-link-patient-dark .text-muted { color:#b8c6da !important; }
        .mm-link-patient-dark .form-control { background:#111b2b; border-color:#50617a; color:#f1f5f9; }
        .mm-link-patient-dark .form-control::placeholder { color:#9eb0c8; }
        .mm-link-patient-dark .form-control:disabled { background:#27354b; color:#bdc8d7; }
        .mm-link-patient-dark .mm-medical-badge { background:#2b3a51; border-color:#4b5b72; color:#f1f5f9; }
        .mm-link-patient-dark .mm-info-panel { border-color:#4b5b72 !important; }
        .mm-link-patient-dark .alert-light { background:#29394e; border-color:#53647a; color:#e8edf6; }
        .mm-link-patient-dark h2, .mm-link-patient-dark h5, .mm-link-patient-dark strong { color:#e8edf6; }
        @media(max-width:767px) { .mm-link-patient .mm-link-content { padding:20px 14px; } }
      `}</style>
      <CaregiverHeader />
      <Row className="g-0" style={{ minHeight: "85vh" }}>
        <Col lg="2" md="3" className="settings-sidebar"><CaregiverSettingsSidebar /></Col>
        <Col lg="10" md="9" className="mm-link-content">
         <h2
  className="mb-4"
  style={{
    color: isDark ? "#b8d3ff" : "#1e3a8a",
    fontWeight: "700",
  }}
>
  {t("Link Patient Account", "ربط حساب المريض")}
</h2>
          <Card className="w-100 mb-4"><CardBody>
            <h5 className="mb-2">{t("Find Patient", "البحث عن مريض")}</h5>
            <p className="text-muted">{t("Enter the code shared by the patient to review limited information before sending a link request.", "أدخل الرمز الذي شاركه المريض لمراجعة معلومات محدودة قبل إرسال طلب الربط.")}</p>
            <label htmlFor="patient-link-code">{t("Patient Link Code", "رمز ربط المريض")}</label>
            <input id="patient-link-code" type="text" className="form-control mb-3" placeholder={t("Example: MM-EA0C1S", "مثال: MM-EA0C1S")} value={patientLinkCode} onChange={(event) => {
              setPatientLinkCode(event.target.value.toUpperCase());
              setPatientPreview(null); setPreviewMessage(""); setLinkMessage(""); setLinkMessageType("");
            }} />
            <Button color="primary" outline type="button" onClick={handlePreviewPatient} disabled={isLoadingPreview}>
              {isLoadingPreview ? (t("Loading Preview...", "جارٍ تحميل المعاينة...")) : (t("Preview Patient", "معاينة المريض"))}
            </Button>
            {previewMessage && <div className="alert alert-danger mt-3 mb-0">{previewMessage}</div>}
          </CardBody></Card>

          {patientPreview && <Card className="w-100 mb-4"><CardBody>
            <h5 className="mb-3">{t("Patient Preview", "معاينة المريض")}</h5>
            <div className="mm-patient-profile mb-4">
              <img className="mm-patient-avatar"
                src={patientPreview.profilePicture ? `http://localhost:3002${patientPreview.profilePicture}` : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt={patientPreview.name || (t("Patient", "المريض"))}
                onError={(event) => { event.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; }}
              />
              <div>
                <h5 className="mb-1">{patientPreview.name || (t("Patient", "المريض"))}</h5>
                <p className="text-muted mb-0">{t("Limited information shown before linking", "تُعرض معلومات محدودة قبل الربط")}</p>
              </div>
            </div>
            <div className="mb-4">
              <strong>{t("Medical Conditions", "الحالات الطبية")}</strong>
              {patientPreview.medicalConditions?.length > 0
                ? <div className="mt-2 d-flex flex-wrap gap-1">{patientPreview.medicalConditions.map((condition) =>
                    <span key={condition} className="mm-medical-badge">{condition}</span>
                  )}</div>
                : <p className="text-muted mt-2 mb-0">{t("No medical conditions provided.", "لم تُذكر أي حالات طبية.")}</p>}
            </div>
            <Row>
              <Col md="6" className="mb-3 mb-md-0"><div className="border rounded p-3 mm-info-panel h-100">
                <strong>{t("Current Medications", "الأدوية الحالية")}</strong>
                <h4 className="mt-2 mb-0">{patientPreview.activeMedicationCount ?? 0}</h4>
                <small className="text-muted">{t("Active medication records", "سجلات الأدوية النشطة")}</small>
              </div></Col>
              <Col md="6"><div className="border rounded p-3 mm-info-panel h-100">
                <strong>{t("Uploaded Prescriptions", "الوصفات الطبية المرفوعة")}</strong>
                <h4 className="mt-2 mb-0">{patientPreview.prescriptionCount ?? 0}</h4>
                <small className="text-muted">{t("Prescription files available", "ملفات الوصفات الطبية المتاحة")}</small>
              </div></Col>
            </Row>
          </CardBody></Card>}

          <Card className="w-100"><CardBody>
            <h5 className="mb-3">{t("Send Link Request", "إرسال طلب الربط")}</h5>
            {!patientPreview && <div className="alert alert-light border">{t("Preview a patient first before sending a request.", "يرجى معاينة المريض أولًا قبل إرسال الطلب.")}</div>}
            <label htmlFor="patient-relationship">{t("Relationship to Patient", "العلاقة بالمريض")}</label>
            <select id="patient-relationship" className="form-control mb-3" value={relationship} disabled={!patientPreview} onChange={(event) => {
              setRelationship(event.target.value); setOtherRelationship(""); setLinkMessage(""); setLinkMessageType("");
            }}>
              <option value="">{t("Select Relationship", "اختر العلاقة")}</option>
              <option value="Parent">{t("Parent", "أب أو أم")}</option>
              <option value="Son">{t("Son", "ابن")}</option>
              <option value="Daughter">{t("Daughter", "ابنة")}</option>
              <option value="Sibling">{t("Sibling", "أخ أو أخت")}</option>
              <option value="Spouse">{t("Spouse", "زوج أو زوجة")}</option>
              <option value="Relative">{t("Relative", "قريب")}</option>
              <option value="Friend">{t("Friend", "صديق")}</option>
              <option value="Neighbor">{t("Neighbor", "جار")}</option>
              <option value="Professional Caregiver">{t("Professional Caregiver", "مقدم رعاية محترف")}</option>
              <option value="Other">{t("Other", "أخرى")}</option>
            </select>
            {relationship === "Other" && <>
              <label htmlFor="other-relationship">{t("Specify Relationship", "حدد العلاقة")}</label>
              <input id="other-relationship" type="text" className="form-control mb-3"
                placeholder={t("Enter relationship", "أدخل العلاقة")} value={otherRelationship}
                onChange={(event) => { setOtherRelationship(event.target.value); setLinkMessage(""); setLinkMessageType(""); }}
              />
            </>}
            <Button color="success" type="button" onClick={handleLinkPatient} disabled={!patientPreview || isSendingLink}>
              {isSendingLink ? (t("Sending Request...", "جارٍ إرسال الطلب...")) : (t("Send Link Request", "إرسال طلب الربط"))}
            </Button>
            {linkMessage && <div className={linkMessageType === "success" ? "alert alert-success mt-3 mb-0" : "alert alert-danger mt-3 mb-0"}>{linkMessage}</div>}
          </CardBody></Card>
        </Col>
      </Row>
      <Footer />
    </Container>
  );
};

export default LinkPatient;
