import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Label } from "reactstrap";
import { useSelector } from "react-redux";
import medimindlogo from "../assets/medimindlogo.jpg";
import CaregiverHeader from "./CaregiverHeader";
import Footer from "./Footer";

const Caregiver = () => {
  const user = useSelector((state) => state.user?.user);
  const [language, setLanguage] = useState(() => localStorage.getItem("medimindLanguage") === "ar" ? "ar" : "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("medimind-theme") === "dark" ? "dark" : "light");
  const [patientEmail, setPatientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const isArabic = language === "ar";

  useEffect(() => {
    const syncPreferences = () => {
      setLanguage(localStorage.getItem("medimindLanguage") === "ar" ? "ar" : "en");
      setTheme(localStorage.getItem("medimind-theme") === "dark" ? "dark" : "light");
    };
    const events = ["medimind-language-change", "medimindLanguageChanged", "medimind-theme-change", "medimindThemeChanged", "storage"];
    events.forEach((event) => window.addEventListener(event, syncPreferences));
    return () => events.forEach((event) => window.removeEventListener(event, syncPreferences));
  }, []);

  const getPatients = useCallback(async () => {
    if (!user?.email) {
      setPatients([]);
      return;
    }
    setLoadingPatients(true);
    try {
      const response = await axios.get(
        `http://localhost:3002/getPatients/${encodeURIComponent(user.email)}`
      );
      setPatients(Array.isArray(response.data) ? response.data : response.data?.patients || []);
    } catch (error) {
      console.error("Error loading patients", error);
      setMessage(isArabic ? "تعذّر تحميل المرضى المرتبطين." : "Unable to load linked patients.");
      setMessageType("error");
    } finally {
      setLoadingPatients(false);
    }
  }, [user?.email, isArabic]);

  useEffect(() => {
    getPatients();
  }, [getPatients]);

  const addCaregiverLink = async (event) => {
    event.preventDefault();
    if (!user?.email) {
      setMessage(isArabic ? "يُرجى تسجيل الدخول أولًا." : "Please log in first.");
      setMessageType("error");
      return;
    }
    const email = patientEmail.trim();
    if (!email) {
      setMessage(isArabic ? "يُرجى إدخال البريد الإلكتروني للمريض." : "Please enter the patient's email.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      // Preserve this component's existing email-based API until backend integration is reviewed.
      const response = await axios.post("http://localhost:3002/addCaregiverLink", {
        patientEmail: email,
        caregiverEmail: user.email,
      });
      setMessage(response.data?.message || (isArabic ? "تم إرسال طلب الربط بنجاح." : "Link request sent successfully."));
      setMessageType("success");
      setPatientEmail("");
      await getPatients();
    } catch (error) {
      console.error("Error linking patient", error);
      setMessage(error.response?.data?.message || (isArabic ? "حدث خطأ أثناء ربط المريض." : "Error linking patient."));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mm-caregiver-panel ${theme === "dark" ? "mm-caregiver-panel-dark" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        .mm-caregiver-panel { min-height: 100vh; display: flex; flex-direction: column; background: #f3f7fd; color: #1c2b43; }
        .mm-caregiver-panel .mm-cp-main { flex: 1; padding: 30px 14px 48px; }
        .mm-caregiver-panel .mm-cp-card { background: #fff; border: 1px solid #e1e8f3; border-radius: 16px; box-shadow: 0 8px 24px rgba(23,65,140,.06); }
        .mm-caregiver-panel h2, .mm-caregiver-panel h5 { color: #17418c; }
        .mm-caregiver-panel .mm-cp-input { min-height: 44px; border-radius: 9px; }
        .mm-caregiver-panel .mm-cp-patient { border-bottom: 1px solid #e1e8f3; padding: 12px 0; overflow-wrap: anywhere; }
        .mm-caregiver-panel .mm-cp-patient:last-child { border-bottom: none; }
        .mm-caregiver-panel .mm-cp-status { margin-top: 12px; overflow-wrap: anywhere; }
        .mm-caregiver-panel-dark { background: #101827; color: #e8edf6; }
        .mm-caregiver-panel-dark .mm-cp-card { background: #1d293b; border-color: #35445b; color: #e8edf6; }
        .mm-caregiver-panel-dark h2, .mm-caregiver-panel-dark h5 { color: #a9c9ff; }
        .mm-caregiver-panel-dark .mm-cp-input { background: #111b2b; color: #f1f5f9; border-color: #4b5c74; }
        .mm-caregiver-panel-dark .mm-cp-input::placeholder { color: #a3afc0; }
        .mm-caregiver-panel-dark .mm-cp-patient { border-color: #35445b; }
        .mm-caregiver-panel-dark .text-muted { color: #b7c4d6 !important; }
        @media (max-width: 600px) { .mm-caregiver-panel .mm-cp-main { padding: 20px 10px 30px; } .mm-caregiver-panel .mm-cp-card .card-body { padding: 18px; } }
      `}</style>
      <CaregiverHeader />
      <Container fluid className="mm-cp-main">
        <Row className="justify-content-center m-0">
          <Col xs="12" md="10" lg="8" xl="7" className="p-0">
            <div className="text-center mb-4">
              <img src={medimindlogo} alt="MediMind" width="86" height="86" style={{ objectFit: "contain", borderRadius: 12 }} />
              <h2 className="mt-3">{isArabic ? "لوحة مقدم الرعاية" : "Caregiver Panel"}</h2>
            </div>
            <Card className="mm-cp-card">
              <CardBody>
                <h5>{isArabic ? "ربط مريض" : "Link Patient"}</h5>
                <form onSubmit={addCaregiverLink}>
                  <FormGroup>
                    <Label htmlFor="caregiver-patient-email">{isArabic ? "البريد الإلكتروني للمريض" : "Patient Email"}</Label>
                    <input
                      id="caregiver-patient-email"
                      type="email"
                      className="form-control mm-cp-input"
                      placeholder={isArabic ? "أدخل البريد الإلكتروني للمريض" : "Enter patient email"}
                      value={patientEmail}
                      onChange={(event) => { setPatientEmail(event.target.value); setMessage(""); }}
                      required
                      dir="ltr"
                    />
                  </FormGroup>
                  <Button color="primary" className="w-100" type="submit" disabled={loading || !user?.email}>
                    {loading ? (isArabic ? "جارٍ إرسال الطلب..." : "Sending request...") : (isArabic ? "ربط المريض" : "Link Patient")}
                  </Button>
                </form>
                {message && (
                  <p className={`text-center mm-cp-status ${messageType === "error" ? "text-danger" : "text-success"}`} role="status">{message}</p>
                )}
              </CardBody>
            </Card>
            <Card className="mm-cp-card mt-4">
              <CardBody>
                <h5>{isArabic ? "مرضاي" : "My Patients"}</h5>
                {loadingPatients ? (
                  <p className="text-muted">{isArabic ? "جارٍ تحميل المرضى..." : "Loading patients..."}</p>
                ) : patients.length === 0 ? (
                  <p className="text-muted mb-0">{isArabic ? "لا يوجد مرضى مرتبطون بعد." : "No patients linked yet."}</p>
                ) : (
                  patients.map((patient, index) => (
                    <div className="mm-cp-patient" key={patient._id || patient.patientEmail || index}>
                      <div><strong>{isArabic ? "البريد الإلكتروني للمريض:" : "Patient Email:"}</strong>{" "}<span dir="ltr">{patient.patientEmail || "—"}</span></div>
                      <div className="mt-1"><strong>{isArabic ? "الحالة:" : "Status:"}</strong>{" "}
                        {patient.status === "Pending" ? (isArabic ? "قيد الانتظار" : "Pending") :
                         patient.status === "Accepted" ? (isArabic ? "مقبول" : "Accepted") :
                         patient.status === "Rejected" ? (isArabic ? "مرفوض" : "Rejected") :
                         patient.status || (isArabic ? "غير محدد" : "Not provided")}
                      </div>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default Caregiver;
