
import { useEffect, useState } from "react";
import axios from "axios";
import {Button,Card,CardBody,Col,Container,FormGroup,Label,Row,} from "reactstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import medimindlogo from "../assets/medimindlogo.jpg";
import Footer from "./Footer";

const CaregiverLinkPatient = () => {
  const navigate = useNavigate();

  const caregiverEmail = useSelector(
    (state) => state.user?.user?.email
  );

  const [language, setLanguage] = useState(
    () =>
      localStorage.getItem("medimindLanguage") === "ar"
        ? "ar"
        : "en"
  );

  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("medimind-theme") === "dark"
        ? "dark"
        : "light"
  );

  const [patientLinkCode, setPatientLinkCode] = useState("");
  const [relationship, setRelationship] = useState("");
  const [otherRelationship, setOtherRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isArabic = language === "ar";

  useEffect(() => {
    const syncPreferences = () => {
      setLanguage(
        localStorage.getItem("medimindLanguage") === "ar"
          ? "ar"
          : "en"
      );

      setTheme(
        localStorage.getItem("medimind-theme") === "dark"
          ? "dark"
          : "light"
      );
    };

    window.addEventListener(
      "medimind-language-change",
      syncPreferences
    );
    window.addEventListener(
      "medimindLanguageChanged",
      syncPreferences
    );
    window.addEventListener(
      "medimind-theme-change",
      syncPreferences
    );
    window.addEventListener(
      "medimindThemeChanged",
      syncPreferences
    );
    window.addEventListener("storage", syncPreferences);

    return () => {
      window.removeEventListener(
        "medimind-language-change",
        syncPreferences
      );
      window.removeEventListener(
        "medimindLanguageChanged",
        syncPreferences
      );
      window.removeEventListener(
        "medimind-theme-change",
        syncPreferences
      );
      window.removeEventListener(
        "medimindThemeChanged",
        syncPreferences
      );
      window.removeEventListener("storage", syncPreferences);
    };
  }, []);

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessage();

    const finalRelationship =
      relationship === "Other"
        ? otherRelationship.trim()
        : relationship;

    if (!caregiverEmail) {
      setMessage(
        isArabic
          ? "لم يتم العثور على بيانات مقدم الرعاية. يُرجى تسجيل الدخول مجددًا."
          : "Caregiver information was not found. Please log in again."
      );
      setMessageType("error");
      return;
    }

    if (!patientLinkCode.trim()) {
      setMessage(
        isArabic
          ? "يُرجى إدخال رمز ربط المريض."
          : "Please enter the patient link code."
      );
      setMessageType("error");
      return;
    }

    if (!finalRelationship) {
      setMessage(
        isArabic
          ? "يُرجى اختيار العلاقة بالمريض أو إدخالها."
          : "Please select or enter your relationship to the patient."
      );
      setMessageType("error");
      return;
    }

    try {
      setIsLoading(true);

      await axios.post(
        "http://localhost:3002/caregiver/request-link",
        {
          caregiverEmail,
          patientLinkCode: patientLinkCode
            .trim()
            .toUpperCase(),
          relationship: finalRelationship,
        }
      );

      setMessage(
        isArabic
          ? "تم إرسال طلب الربط بنجاح."
          : "Link request sent successfully."
      );
      setMessageType("success");

      setPatientLinkCode("");
      setRelationship("");
      setOtherRelationship("");
    } catch (error) {
      console.error("Link Request Error:", error);

      setMessage(
        isArabic
          ? "تعذّر إرسال طلب الربط. يُرجى المحاولة مرة أخرى."
          : error.response?.data?.message ||
              "Unable to send the link request. Please try again."
      );

      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const relationshipOptions = [
    {
      value: "Parent",
      en: "Parent",
      ar: "أب / أم",
    },
    {
      value: "Son",
      en: "Son",
      ar: "ابن",
    },
    {
      value: "Daughter",
      en: "Daughter",
      ar: "ابنة",
    },
    {
      value: "Sibling",
      en: "Sibling",
      ar: "أخ / أخت",
    },
    {
      value: "Spouse",
      en: "Spouse",
      ar: "زوج / زوجة",
    },
    {
      value: "Relative",
      en: "Relative",
      ar: "قريب",
    },
    {
      value: "Friend",
      en: "Friend",
      ar: "صديق",
    },
    {
      value: "Neighbor",
      en: "Neighbor",
      ar: "جار",
    },
    {
      value: "Professional Caregiver",
      en: "Professional Caregiver",
      ar: "مقدم رعاية محترف",
    },
    {
      value: "Other",
      en: "Other",
      ar: "أخرى",
    },
  ];

  return (
    <div
      className={`mm-caregiver-link-page ${
        theme === "dark" ? "mm-cl-dark" : ""
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .mm-caregiver-link-page {
          min-height: 100vh;
          background: #f3f7fd;
          color: #1c2b43;
          display: flex;
          flex-direction: column;
        }

        .mm-caregiver-link-page .mm-cl-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 38px 16px;
        }

        .mm-caregiver-link-page .mm-cl-card {
          width: 100%;
          max-width: 570px;
          border: 1px solid #e2e8f2;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 12px 35px rgba(24,65,140,.09);
        }

        .mm-caregiver-link-page .mm-cl-card .card-body {
          padding: 30px 34px;
        }

        .mm-caregiver-link-page .mm-cl-logo {
          display: block;
          max-width: 115px;
          max-height: 115px;
          width: auto;
          height: auto;
          object-fit: contain;
          margin: 0 auto 16px;
          border-radius: 12px;
        }

        .mm-caregiver-link-page h2 {
          color: #17418c;
          font-size: 1.65rem;
          font-weight: 750;
          margin-bottom: 12px;
        }

        .mm-caregiver-link-page .mm-cl-subtitle {
          color: #66758a;
          margin-bottom: 26px;
        }

        .mm-caregiver-link-page label {
          font-weight: 600;
          margin-bottom: 8px;
        }

        .mm-caregiver-link-page .form-group {
          margin-bottom: 20px;
        }

        .mm-caregiver-link-page .form-control {
          min-height: 45px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #1c2b43;
        }

        .mm-caregiver-link-page .form-control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }

        .mm-caregiver-link-page .mm-cl-submit {
          min-height: 46px;
          background: #17418c;
          border-color: #17418c;
          border-radius: 10px;
          font-weight: 600;
        }

        .mm-caregiver-link-page .mm-cl-back {
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          background: transparent;
          color: inherit;
          margin-bottom: 20px;
        }

        .mm-caregiver-link-page .mm-cl-message {
          border-radius: 10px;
          padding: 12px 14px;
          text-align: center;
          overflow-wrap: anywhere;
        }

        .mm-caregiver-link-page .mm-cl-message.success {
          color: #11623d;
          background: #e7f6ed;
        }

        .mm-caregiver-link-page .mm-cl-message.error {
          color: #a51e2b;
          background: #fff0f1;
        }

        .mm-caregiver-link-page.mm-cl-dark {
          background: #101827;
          color: #e8edf6;
        }

        .mm-caregiver-link-page.mm-cl-dark .mm-cl-card {
          background: #1d293b;
          border-color: #35445b;
          box-shadow: 0 12px 35px rgba(0,0,0,.2);
        }

        .mm-caregiver-link-page.mm-cl-dark h2 {
          color: #9fc4ff;
        }

        .mm-caregiver-link-page.mm-cl-dark .mm-cl-subtitle {
          color: #b5c2d5;
        }

        .mm-caregiver-link-page.mm-cl-dark .form-control {
          background: #111b2b;
          border-color: #4b5c74;
          color: #f1f5f9;
        }

        .mm-caregiver-link-page.mm-cl-dark .form-control::placeholder {
          color: #a3afc0;
        }

        .mm-caregiver-link-page.mm-cl-dark .mm-cl-back {
          border-color: #4b5c74;
          color: #e8edf6;
        }

        .mm-caregiver-link-page.mm-cl-dark .mm-cl-message.success {
          color: #a3f2c5;
          background: #153c2b;
        }

        .mm-caregiver-link-page.mm-cl-dark .mm-cl-message.error {
          color: #ffb5bc;
          background: #4a2029;
        }

        @media (max-width: 600px) {
          .mm-caregiver-link-page .mm-cl-main {
            padding: 22px 12px;
          }

          .mm-caregiver-link-page .mm-cl-card .card-body {
            padding: 22px 18px;
          }

          .mm-caregiver-link-page h2 {
            font-size: 1.4rem;
          }
        }
      `}</style>

      <Container fluid className="mm-cl-main">
        <Row className="w-100 justify-content-center m-0">
          <Col
            xs="12"
            className="d-flex justify-content-center p-0"
          >
            <Card className="mm-cl-card">
              <CardBody>
                <Button
                  type="button"
                  className="mm-cl-back"
                  onClick={() => navigate(-1)}
                >
                  {isArabic ? "رجوع" : "Go Back"}
                </Button>

                <img
                  src={medimindlogo}
                  alt="MediMind logo"
                  className="mm-cl-logo"
                />

                <h2 className="text-center">
                  {isArabic
                    ? "ربط حساب مريض"
                    : "Link to a Patient"}
                </h2>

                <p className="text-center mm-cl-subtitle">
                  {isArabic
                    ? "أدخل الرمز الذي شاركه المريض معك لطلب الوصول إلى حسابه."
                    : "Enter the code shared by the patient to request access."}
                </p>

                <form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label htmlFor="caregiver-patient-link-code">
                      {isArabic
                        ? "رمز ربط المريض"
                        : "Patient Link Code"}
                    </Label>

                    <input
                      id="caregiver-patient-link-code"
                      type="text"
                      className="form-control"
                      dir="ltr"
                      placeholder={
                        isArabic
                          ? "مثال: MM-EA0C1S"
                          : "Example: MM-EA0C1S"
                      }
                      value={patientLinkCode}
                      onChange={(event) => {
                        setPatientLinkCode(
                          event.target.value.toUpperCase()
                        );
                        clearMessage();
                      }}
                      autoComplete="off"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="caregiver-patient-relationship">
                      {isArabic
                        ? "صلة القرابة أو العلاقة بالمريض"
                        : "Relationship to Patient"}
                    </Label>

                    <select
                      id="caregiver-patient-relationship"
                      className="form-control"
                      value={relationship}
                      onChange={(event) => {
                        setRelationship(event.target.value);
                        setOtherRelationship("");
                        clearMessage();
                      }}
                    >
                      <option value="">
                        {isArabic
                          ? "اختر العلاقة"
                          : "Select Relationship"}
                      </option>

                      {relationshipOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {isArabic ? option.ar : option.en}
                        </option>
                      ))}
                    </select>
                  </FormGroup>

                  {relationship === "Other" && (
                    <FormGroup>
                      <Label htmlFor="caregiver-other-relationship">
                        {isArabic
                          ? "حدّد العلاقة"
                          : "Specify Relationship"}
                      </Label>

                      <input
                        id="caregiver-other-relationship"
                        type="text"
                        className="form-control"
                        placeholder={
                          isArabic
                            ? "أدخل علاقتك بالمريض"
                            : "Enter relationship"
                        }
                        value={otherRelationship}
                        onChange={(event) => {
                          setOtherRelationship(
                            event.target.value
                          );
                          clearMessage();
                        }}
                      />
                    </FormGroup>
                  )}

                  <FormGroup>
                    <Button
                      color="primary"
                      type="submit"
                      className="w-100 mm-cl-submit"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? isArabic
                          ? "جارٍ إرسال الطلب..."
                          : "Sending Request..."
                        : isArabic
                        ? "إرسال طلب الربط"
                        : "Send Link Request"}
                    </Button>
                  </FormGroup>

                  {message && (
                    <div
                      className={`mm-cl-message ${
                        messageType === "success"
                          ? "success"
                          : "error"
                      }`}
                      role="status"
                    >
                      {message}
                    </div>
                  )}
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
};

export default CaregiverLinkPatient;
