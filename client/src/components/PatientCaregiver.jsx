import { useEffect, useState } from "react";
import axios from "axios";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Alert,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Spinner,
} from "reactstrap";

import { useSelector } from "react-redux";

import {
  FaSearch,
  FaMapMarkerAlt,
  FaVenusMars,
  FaLanguage,
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

import Header from "./Header";
import Footer from "./Footer";

const PatientCaregiver = () => {
  const user = useSelector(
    (state) => state.user.user
  );
console.log("Patient Redux user:", user);
  const [uiLanguage, setUiLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );
  const isArabic = uiLanguage === "ar";
  const t = (english, arabic) => isArabic ? arabic : english;

  useEffect(() => {
    const syncLanguage = () =>
      setUiLanguage(localStorage.getItem("medimindLanguage") || "en");
    window.addEventListener("medimind-language-change", syncLanguage);
    window.addEventListener("storage", syncLanguage);
    return () => {
      window.removeEventListener("medimind-language-change", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const translateValue = (value) => {
    if (!isArabic || value == null) return value;
    const labels = {
      Sunday:"الأحد", Monday:"الاثنين", Tuesday:"الثلاثاء",
      Wednesday:"الأربعاء", Thursday:"الخميس", Friday:"الجمعة",
      Saturday:"السبت", Morning:"الصباح", Afternoon:"بعد الظهر",
      Evening:"المساء", Night:"الليل", Male:"ذكر", Female:"أنثى",
      Arabic:"العربية", English:"الإنجليزية", Hindi:"الهندية",
      Urdu:"الأردية", Swahili:"السواحيلية", Bengali:"البنغالية",
      Malayalam:"المالايالامية", Tamil:"التاميلية",
      "Filipino (Tagalog)":"الفلبينية (تاغالوغ)",
      Caregiver:"مقدم رعاية", Verified:"موثّق"
    };
    return labels[value] || value;
  };
  const translateList = (values) =>
    values?.length ? values.map(translateValue).join(", ") : t("Not provided", "غير متوفر");

  const [activeSection, setActiveSection] =
    useState("my");

  const [myCaregiver, setMyCaregiver] =
    useState(null);

    const [
  updatingMedicationPermission,
  setUpdatingMedicationPermission,
] = useState(false);

const [
  medicationPermissionMessage,
  setMedicationPermissionMessage,
] = useState("");

  const [caregivers, setCaregivers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [language, setLanguage] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [
    minExperience,
    setMinExperience,
  ] = useState("");

  const [
    availability,
    setAvailability,
  ] = useState([]);

  const [
    availableTime,
    setAvailableTime,
  ] = useState([]);

  const [
    loadingMyCaregiver,
    setLoadingMyCaregiver,
  ] = useState(false);

  const [
    loadingSearch,
    setLoadingSearch,
  ] = useState(false);

  const [
    hasSearched,
    setHasSearched,
  ] = useState(false);

  const [
    selectedCaregiver,
    setSelectedCaregiver,
  ] = useState(null);

  const [
    showProfile,
    setShowProfile,
  ] = useState(false);

  const [
    sendingRequest,
    setSendingRequest,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [
    messageType,
    setMessageType,
  ] = useState("info");

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const times = [
    "Morning",
    "Afternoon",
    "Evening",
  ];

  const getImageUrl = (image) => {
    if (!image) {
      return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `http://localhost:3002${image}`;
  };

  const formatLinkedDate = (date) => {
    if (!date) {
      return t("Not available", "غير متوفر");
    }

    return new Date(date).toLocaleDateString(
      isArabic ? "ar-OM" : "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const loadMyCaregiver = async () => {
    if (!user?.email) {
      return;
    }

    try {
      setLoadingMyCaregiver(true);

      const response =
        await axios.get(
          `http://localhost:3002/patient/my-caregiver/${encodeURIComponent(
            user.email
          )}`
        );

      setMyCaregiver(
        response.data?.caregiver ||
          null
      );
    } catch (error) {
      console.error(
        "Load my caregiver error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          t('Unable to load your caregiver.', 'تعذر تحميل بيانات مقدم الرعاية.')
      );

      setMessageType("danger");
    } finally {
      setLoadingMyCaregiver(
        false
      );
    }
  };

  const handleMedicationPermission = async () => {
  if (!user?.email || !myCaregiver?.email) {
    return;
  }

  const newPermission =
    !myCaregiver.medicationManagementPermission;

  try {
    setUpdatingMedicationPermission(true);
    setMedicationPermissionMessage("");

    const response = await axios.put(
      "http://localhost:3002/patient/caregiver-medication-permission",
      {
        patientEmail: user.email,
        caregiverEmail: myCaregiver.email,
        allowed: newPermission,
      }
    );

    setMyCaregiver((current) => ({
      ...current,
      medicationManagementPermission:
        response.data.medicationManagementPermission,
    }));

    setMedicationPermissionMessage(
      newPermission
        ? t('Medication management permission granted.', 'تم منح إذن إدارة الأدوية.')
        : t('Medication management permission revoked.', 'تم إلغاء إذن إدارة الأدوية.')
    );
  } catch (error) {
    console.error(
      "Medication permission error:",
      error
    );

    setMedicationPermissionMessage(
      error.response?.data?.message ||
        t('Unable to update medication permission.', 'تعذر تحديث إذن إدارة الأدوية.')
    );
  } finally {
    setUpdatingMedicationPermission(false);
  }
};


const handleDisconnectCaregiver = async () => {
  if (!user?.email || !myCaregiver?.email) return;

  const confirmed = window.confirm(
    t(`Disconnect from ${myCaregiver.name}? They will lose access to your medication information.`,
      `هل تريد فصل ${myCaregiver.name}؟ سيفقد الوصول إلى معلومات أدويتك.`)
  );

  if (!confirmed) return;

  try {
    await axios.delete(
      "http://localhost:3002/caregiver-links/disconnect",
      {
        data: {
          patientEmail: user.email,
          caregiverEmail: myCaregiver.email,
        },
      }
    );

    setMyCaregiver(null);
    setMedicationPermissionMessage("");
    setMessage(t('Caregiver disconnected successfully.', 'تم فصل مقدم الرعاية بنجاح.'));
    setMessageType("success");
  } catch (error) {
    console.error("Disconnect caregiver error:", error);

    alert(
      error.response?.data?.message ||
        t('Unable to disconnect caregiver.', 'تعذر فصل مقدم الرعاية.')
    );
  }
};

  const searchCaregivers = async () => {
    try {
      setLoadingSearch(true);
      setMessage("");
      setHasSearched(true);

      const response =
        await axios.get(
          "http://localhost:3002/patient/search-caregivers",
          {
            params: {
              search,
              language,
              gender,
              minExperience,
              availability,
              availableTime,

              patientLatitude:
                user?.latitude ?? "",

              patientLongitude:
                user?.longitude ?? "",
            },

            paramsSerializer: (
              params
            ) => {
              const query =
                new URLSearchParams();

              if (params.search) {
                query.append(
                  "search",
                  params.search
                );
              }

              if (params.language) {
                query.append(
                  "language",
                  params.language
                );
              }

              if (params.gender) {
                query.append(
                  "gender",
                  params.gender
                );
              }

              if (
                params.minExperience
              ) {
                query.append(
                  "minExperience",
                  params.minExperience
                );
              }

              params.availability.forEach(
                (day) => {
                  query.append(
                    "availability",
                    day
                  );
                }
              );

              params.availableTime.forEach(
                (time) => {
                  query.append(
                    "availableTime",
                    time
                  );
                }
              );

              if (
                params.patientLatitude !==
                ""
              ) {
                query.append(
                  "patientLatitude",
                  params.patientLatitude
                );
              }

              if (
                params.patientLongitude !==
                ""
              ) {
                query.append(
                  "patientLongitude",
                  params.patientLongitude
                );
              }

              return query.toString();
            },
          }
        );

      setCaregivers(
        response.data?.caregivers ||
          []
      );
    } catch (error) {
      console.error(
        "Search caregivers error:",
        error
      );

      setCaregivers([]);

      setMessage(
        error.response?.data?.message ||
          t('Unable to search caregivers.', 'تعذر البحث عن مقدمي الرعاية.')
      );

      setMessageType("danger");
    } finally {
      setLoadingSearch(false);
    }
  };

  const clearSearchFilters = () => {
    setSearch("");
    setLanguage("");
    setGender("");
    setMinExperience("");
    setAvailability([]);
    setAvailableTime([]);
    setCaregivers([]);
    setHasSearched(false);
    setMessage("");
  };

  const toggleDay = (day) => {
    setAvailability(
      (currentDays) => {
        if (
          currentDays.includes(day)
        ) {
          return currentDays.filter(
            (item) => item !== day
          );
        }

        return [
          ...currentDays,
          day,
        ];
      }
    );

    setHasSearched(false);
    setCaregivers([]);
  };

  const toggleTime = (time) => {
    setAvailableTime(
      (currentTimes) => {
        if (
          currentTimes.includes(
            time
          )
        ) {
          return currentTimes.filter(
            (item) => item !== time
          );
        }

        return [
          ...currentTimes,
          time,
        ];
      }
    );

    setHasSearched(false);
    setCaregivers([]);
  };

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    loadMyCaregiver();
  }, [user?.email]);

  const openProfile = (
    caregiver
  ) => {
    setSelectedCaregiver(
      caregiver
    );

    setShowProfile(true);
    setMessage("");
  };

  const closeProfile = () => {
    setShowProfile(false);
    setSelectedCaregiver(null);
  };

  const isAlreadyLinked = (
    caregiverEmail
  ) => {
    return (
      myCaregiver?.email ===
      caregiverEmail
    );
  };

  const sendRequest = async (
    caregiver
  ) => {
    if (!user?.email) {
      setMessage(
        t('Please log in again.', 'يرجى تسجيل الدخول مجددًا.')
      );

      setMessageType("danger");
      return;
    }

    try {
      setSendingRequest(true);
      setMessage("");

      const response =
        await axios.post(
          "http://localhost:3002/patient/request-caregiver",
          {
            patientEmail:
              user.email,

            caregiverEmail:
              caregiver.email,

            relationship:
              "Caregiver",
          }
        );

      setMessage(
        response.data?.message ||
          t('Caregiver request sent.', 'تم إرسال طلب الارتباط بمقدم الرعاية.')
      );

      setMessageType(
        response.data?.success
          ? "success"
          : "warning"
      );

      if (
        response.data?.success
      ) {
        setShowProfile(false);
      }
    } catch (error) {
      console.error(
        "Send caregiver request error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          t('Unable to send caregiver request.', 'تعذر إرسال طلب الارتباط.')
      );

      setMessageType("danger");
    } finally {
      setSendingRequest(false);
    }
  };

  const cardStyle = {
    backgroundColor: "var(--pc-card-bg)",
    color: "var(--pc-text)",
    border:
      "1px solid #e8ebef",

    borderRadius: "18px",

    boxShadow:
      "0 4px 18px rgba(0, 0, 0, 0.04)",
  };

  const filterIconStyle = (
    selected
  ) => ({
    position: "absolute",

    left: "14px",

    top: "50%",

    transform:
      "translateY(-50%)",

    color: selected
      ? "#1e3a8a"
      : "#73849a",

    pointerEvents: "none",

    zIndex: 1,
  });

  const filterInputStyle = (
    selected,
    width
  ) => ({
    width,

    height: "44px",

    borderRadius: "22px",

    paddingLeft: "38px",

    border: selected
      ? "1px solid #8fb2df"
      : "1px solid #dfe5ec",

    backgroundColor: selected
      ? "#edf5ff"
      : "#ffffff",

    color: selected
      ? "#1e3a8a"
      : "#536274",

    fontWeight: selected
      ? "600"
      : "500",

    cursor: "pointer",
  });

  const chipStyle = (
    selected
  ) => ({
    border: selected
      ? "1px solid #8fb2df"
      : "1px solid #dfe5ec",

    backgroundColor: selected
      ? "#edf5ff"
      : "#ffffff",

    color: selected
      ? "#1e3a8a"
      : "#536274",

    borderRadius: "22px",

    padding: "9px 15px",

    fontSize: "14px",

    fontWeight: selected
      ? "600"
      : "500",

    cursor: "pointer",

    display: "inline-flex",

    alignItems: "center",

    gap: "7px",

    transition:
      "all 0.2s ease",
  });

  const hasPatientLocation =
    user?.latitude !== null &&
    user?.latitude !==
      undefined &&
    user?.longitude !== null &&
    user?.longitude !==
      undefined;

  return (
    <Container
      fluid
      className={`p-0 patient-caregiver-page ${isArabic ? "patient-caregiver-ar" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",

        backgroundColor: "var(--pc-page-bg)",
      }}
    >
      <Header />

      <div
        style={{
          maxWidth: "1150px",

          margin: "0 auto",

          padding:
            "35px 28px 60px",
        }}
      >
        <div className="text-center mb-4">
          <h2
            style={{
              fontWeight: "700",

              marginBottom:
                "8px",
            }}
          >{t('Caregiver', 'مقدم الرعاية')}</h2>

          <p
            className="text-muted"
            style={{
              maxWidth:
                "600px",

              margin:
                "0 auto",
            }}
          >{t('Manage your caregiver or find someone who can support your medication care.', 'إدارة مقدم الرعاية المرتبط بحسابك أو البحث عن شخص يساعدك في رعاية أدويتك.')}</p>
        </div>

        <div
          style={{
            width: "100%",

            margin:
              "0 auto 35px",

            borderRadius:
              "22px",

            overflow: "hidden",

            boxShadow:
              "0 12px 30px rgba(30, 58, 138, 0.10)",
          }}
        >
          <div
            style={{
              display: "flex",

              backgroundColor:
                "#c5d8f0",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  "my"
                )
              }
              style={{
                flex: 1,

                border:
                  "none",

                outline:
                  "none",

                backgroundColor:
                  activeSection ===
                  "my"
                    ? "#dce9f8"
                    : "#c5d8f0",

                color:
                  "#1e3a8a",

                padding:
                  "18px 10px",

                fontSize:
                  "16px",

                fontWeight:
                  activeSection ===
                  "my"
                    ? "700"
                    : "500",

                cursor:
                  "pointer",

                transition:
                  "all 0.2s ease",
              }}
            >{t('My Caregiver', 'مقدم الرعاية الخاص بي')}</button>

            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  "search"
                )
              }
              style={{
                flex: 1,

                border:
                  "none",

                outline:
                  "none",

                backgroundColor:
                  activeSection ===
                  "search"
                    ? "#dce9f8"
                    : "#c5d8f0",

                color:
                  "#1e3a8a",

                padding:
                  "18px 10px",

                fontSize:
                  "16px",

                fontWeight:
                  activeSection ===
                  "search"
                    ? "700"
                    : "500",

                cursor:
                  "pointer",

                transition:
                  "all 0.2s ease",
              }}
            >{t('Search for Caregiver', 'البحث عن مقدم رعاية')}</button>
          </div>
        </div>

        {message && (
          <Alert
            color={messageType}
          >
            {message}
          </Alert>
        )}

        {activeSection ===
          "my" && (
          <>
            <div className="mb-3">
              <h4
                style={{
                  fontWeight:
                    "650",
                }}
              >{t('My Caregiver', 'مقدم الرعاية الخاص بي')}</h4>

              <p className="text-muted">{t('View the caregiver currently connected to your account.', 'عرض مقدم الرعاية المرتبط حاليًا بحسابك.')}</p>
            </div>

            {loadingMyCaregiver ? (
              <div className="text-center py-5">
                <Spinner />

                <p className="text-muted mt-3">{t('Loading your caregiver...', 'جارٍ تحميل بيانات مقدم الرعاية...')}</p>
              </div>
            ) : !myCaregiver ? (
              <Card
                style={cardStyle}
              >
                <CardBody
                  className="text-center"
                  style={{
                    padding:
                      "60px 25px",
                  }}
                >
                  <div
                    style={{
                      width:
                        "70px",

                      height:
                        "70px",

                      margin:
                        "0 auto 20px",

                      borderRadius:
                        "50%",

                      backgroundColor:
                        "#eef4ff",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      fontSize:
                        "30px",
                    }}
                  >
                    ♡
                  </div>

                  <h4>{t('No caregiver connected', 'لا يوجد مقدم رعاية مرتبط')}</h4>

                  <p
                    className="text-muted"
                    style={{
                      maxWidth:
                        "450px",

                      margin:
                        "10px auto 22px",
                    }}
                  >{t('Find a registered caregiver and send them a request to connect with your account.', 'ابحث عن مقدم رعاية مسجل وأرسل إليه طلب ارتباط بحسابك.')}</p>

                  <Button
                    color="primary"
                    style={{
                      borderRadius:
                        "10px",

                      padding:
                        "10px 24px",
                    }}
                    onClick={() =>
                      setActiveSection(
                        "search"
                      )
                    }
                  >{t('Find a Caregiver', 'البحث عن مقدم رعاية')}</Button>
                </CardBody>
              </Card>
            ) : (
              <Card
                style={cardStyle}
                className="mb-4"
              >
                <CardBody
                  style={{
                    padding:
                      "30px",
                  }}
                >
                  <Row className="align-items-center">
                    <Col
                      md="4"
                      className="mb-4 mb-md-0"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={getImageUrl(
                            myCaregiver.profilepic
                          )}
                          alt={
                            myCaregiver.name
                          }
                          style={{
                            width:
                              "95px",

                            height:
                              "95px",

                            borderRadius:
                              "50%",

                            objectFit:
                              "cover",

                            border:
                              "4px solid #f1f3f5",

                            marginRight:
                              "18px",
                          }}
                        />

                        <div>
                          <h4 className="mb-1">
                            {
                              myCaregiver.name
                            }
                          </h4>

                          <p className="text-muted mb-2">
                            {myCaregiver.degree ||
                              t("Qualification not provided", "المؤهل غير متوفر")}
                          </p>

                          <div
  style={{
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  }}
>
  <Badge color="success">{t('Connected', 'مرتبط')}</Badge>

  {myCaregiver.professionalVerificationStatus ===
    "Verified" && (
    <Badge color="primary">{t('✓ Verified', '✓ موثّق')}</Badge>
  )}
</div>
                        </div>
                      </div>
                    </Col>

                    <Col md="8">
                      <Row className="g-3">
                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">{t('Experience', 'الخبرة')}</small>

                          <p className="fw-semibold mb-0">
                            {myCaregiver.experience !==
                              undefined &&
                            myCaregiver.experience !==
                              null
                              ? `${myCaregiver.experience} ${t("years", "سنوات")}`
                              : t("Not provided", "غير متوفر")}
                          </p>
                        </Col>

                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">{t('Location', 'الموقع')}</small>

                          <p className="fw-semibold mb-0">
                            {myCaregiver.location ||
                              t("Not provided", "غير متوفر")}
                          </p>
                        </Col>

                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">{t('Relationship', 'صلة العلاقة')}</small>

                          <p className="fw-semibold mb-0">
                            {myCaregiver.relationship ||
                              t("Not provided", "غير متوفر")}
                          </p>
                        </Col>

                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">{t('Languages', 'اللغات')}</small>

                          <p className="fw-semibold mb-0">
                            {translateList(myCaregiver.languages)}
                          </p>
                        </Col>

                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">{t('Available Days', 'أيام التوفر')}</small>

                          <p className="fw-semibold mb-0">
                            {translateList(myCaregiver.availability)}
                          </p>
                        </Col>

                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">{t('Preferred Times', 'الأوقات المفضلة')}</small>

                          <p className="fw-semibold mb-0">
                            {translateList(myCaregiver.availableTimes)}
                          </p>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <hr />

                  <Row>
                    <Col md="6">
                      <small className="text-muted">{t('Connected Since', 'مرتبط منذ')}</small>

                      <p className="fw-semibold">
                        {formatLinkedDate(
                          myCaregiver.linkedSince
                        )}
                      </p>
                    </Col>

                    <Col md="6">
                      <small className="text-muted">{t('Phone Number', 'رقم الهاتف')}</small>

                      <p className="fw-semibold">
                        {myCaregiver.phoneNumber ||
                          t("Not provided", "غير متوفر")}
                      </p>
                    </Col>
                  </Row>

                  {myCaregiver.bio && (
                    <>
                      <small className="text-muted">{t('About', 'نبذة')}</small>

                      <p className="mt-1">
                        {
                          myCaregiver.bio
                        }
                      </p>
                    </>
                  )}

                  <small className="text-muted">{t('Certificates', 'الشهادات')}</small>

                  {myCaregiver.certificates
                    ?.length ? (
                    <div className="mt-2">
                      {myCaregiver.certificates.map(
                        (
                          certificate
                        ) => (
                          <div
                            key={
                              certificate._id
                            }
                            className="mb-2"
                          >
                            <a
                              href={`http://localhost:3002${certificate.certificateFile}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {
                                certificate.certificateName
                              }
                            </a>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-muted mt-1 mb-0">{t('No certificates uploaded.', 'لم تُرفع أي شهادات.')}</p>
                  )}
                  <hr className="my-4" />

<div
  style={{
    padding: "18px 20px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e8ebef",
    borderRadius: "14px",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
      flexWrap: "wrap",
    }}
  >
    <div>
      <h6
        style={{
          fontWeight: "700",
          marginBottom: "5px",
        }}
      >{t('Medication Management', 'إدارة الأدوية')}</h6>

      <p
        className="text-muted mb-0"
        style={{
          fontSize: "13px",
          maxWidth: "600px",
        }}
      >
        {t(`Allow ${myCaregiver.name} to add, edit, and delete medications on your behalf.`,
          `السماح لـ ${myCaregiver.name} بإضافة الأدوية وتعديلها وحذفها نيابةً عنك.`)}
      </p>
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span
        style={{
          fontWeight: "600",
          color:
            !myCaregiver.medicationManagementPermission
              ? "#dc3545"
              : "#9ca3af",
        }}
      >{t('Not Allowed', 'غير مسموح')}</span>

      <button
        type="button"
        disabled={updatingMedicationPermission}
        onClick={handleMedicationPermission}
        aria-label={t("Medication management permission", "إذن إدارة الأدوية")}
        style={{
          width: "58px",
          height: "30px",
          border: "none",
          borderRadius: "20px",
          padding: "3px",
          cursor: updatingMedicationPermission
            ? "not-allowed"
            : "pointer",

          backgroundColor:
            myCaregiver.medicationManagementPermission
              ? "#198754"
              : "#ced4da",

          transition: "all 0.25s ease",
        }}
      >
        <span
          style={{
            display: "block",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",

            transform:
              myCaregiver.medicationManagementPermission
                ? "translateX(28px)"
                : "translateX(0)",

            transition: "all 0.25s ease",

            boxShadow:
              "0 1px 4px rgba(0,0,0,0.25)",
          }}
        />
      </button>

      <span
        style={{
          fontWeight: "700",
          color:
            myCaregiver.medicationManagementPermission
              ? "#198754"
              : "#9ca3af",
        }}
      >{t('Allowed', 'مسموح')}</span>
    </div>
  </div>

  {medicationPermissionMessage && (
    <small
      className="d-block mt-2"
      style={{
        color:
          myCaregiver.medicationManagementPermission
            ? "#198754"
            : "#6c757d",
      }}
    >
      {medicationPermissionMessage}
    </small>
  )}
</div>

<div className="text-end mt-4">
  <Button
    color="danger"
    outline
    onClick={handleDisconnectCaregiver}
    style={{
      borderRadius: "10px",
      padding: "10px 20px",
      fontWeight: "600",
    }}
  >{t('Disconnect Caregiver', 'فصل مقدم الرعاية')}</Button>
</div>

                </CardBody>
              </Card>
            )}
          </>
        )}

        {activeSection ===
          "search" && (
          <>
            <div className="mb-3">
              <h4
                style={{
                  fontWeight:
                    "650",

                  marginBottom:
                    "6px",
                }}
              >{t('Find a Caregiver', 'البحث عن مقدم رعاية')}</h4>

              <p className="text-muted mb-2">{t('Choose what matters to you and find a caregiver who matches your preferences.', 'حدد تفضيلاتك للعثور على مقدم رعاية يناسب احتياجاتك.')}</p>

              {hasPatientLocation ? (
                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: "7px",

                    color:
                      "#5677a8",

                    fontSize:
                      "14px",

                    fontWeight:
                      "500",
                  }}
                >
                  <FaMapMarkerAlt />

                  <span className="pc-location-line">
                    {t("Searching near", "البحث بالقرب من")}{" "}
                    <strong>
                      {user?.location || t("your current location", "موقعك الحالي")}
                    </strong>
                  </span>
                </div>
              ) : (
                <Alert
                  color="warning"
                  className="mt-3 mb-0"
                >{t('Add your current location in Profile Settings to see caregiver distance.', 'أضف موقعك الحالي في إعدادات الملف الشخصي لعرض المسافة إلى مقدمي الرعاية.')}</Alert>
              )}
            </div>

            <Card
              style={{
                ...cardStyle,

                border: "none",

                boxShadow:
                  "0 8px 30px rgba(30, 58, 138, 0.07)",
              }}
              className="mb-4"
            >
              <CardBody
                style={{
                  padding: "28px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "stretch",

                    gap: "10px",

                    marginBottom:
                      "24px",
                  }}
                >
                  <div
                    style={{
                      position:
                        "relative",

                      flex: 1,
                    }}
                  >
                    <FaSearch
                      style={{
                        position:
                          "absolute",

                        left: "18px",

                        top: "50%",

                        transform:
                          "translateY(-50%)",

                        color:
                          "#7c8da5",

                        fontSize:
                          "17px",

                        pointerEvents:
                          "none",
                      }}
                    />

                    <Input
                      value={search}
                      placeholder={t("Search by name or qualification...", "ابحث بالاسم أو المؤهل...")}
                      onChange={(
                        event
                      ) =>
                        setSearch(
                          event.target
                            .value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          searchCaregivers();
                        }
                      }}
                      style={{
                        height:
                          "52px",

                        borderRadius:
                          "16px",

                        paddingLeft:
                          "48px",

                        paddingRight:
                          search
                            ? "45px"
                            : "18px",

                        border:
                          "1px solid #dde4ee",

                        backgroundColor:
                          "#f8fafc",

                        fontSize:
                          "15px",

                        boxShadow:
                          "none",
                      }}
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch("")
                        }
                        aria-label={t("Clear search", "مسح البحث")}
                        style={{
                          position:
                            "absolute",

                          right:
                            "16px",

                          top: "50%",

                          transform:
                            "translateY(-50%)",

                          border:
                            "none",

                          background:
                            "transparent",

                          color:
                            "#8a97a8",

                          cursor:
                            "pointer",

                          padding:
                            "4px",
                        }}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  <Button
                    color="primary"
                    onClick={
                      searchCaregivers
                    }
                    disabled={
                      loadingSearch
                    }
                    style={{
                      minWidth:
                        "150px",

                      height:
                        "52px",

                      borderRadius:
                        "16px",

                      fontWeight:
                        "600",

                      padding:
                        "0 22px",
                    }}
                  >
                    {loadingSearch ? (
                      <Spinner
                        size="sm"
                      />
                    ) : (
                      <>
                        <FaSearch style={{ marginInlineEnd: "8px" }} />{t('Search', 'بحث')}</>
                    )}
                  </Button>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "space-between",

                    marginBottom:
                      "14px",
                  }}
                >
                  <small
                    style={{
                      color:
                        "#6b7280",

                      fontWeight:
                        "600",
                    }}
                    className="pc-filter-heading"
                  >{t('Filter by preference', 'تصفية حسب التفضيلات')}</small>

                  {(search ||
                    gender ||
                    language ||
                    minExperience ||
                    availability.length >
                      0 ||
                    availableTime.length >
                      0) && (
                    <button
                      type="button"
                      onClick={
                        clearSearchFilters
                      }
                      style={{
                        border:
                          "none",

                        background:
                          "transparent",

                        color:
                          "#5677a8",

                        fontSize:
                          "13px",

                        fontWeight:
                          "600",

                        cursor:
                          "pointer",
                      }}
                    >{t('Clear all', 'مسح الكل')}</button>
                  )}
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    flexWrap:
                      "wrap",

                    gap: "10px",

                    marginBottom:
                      "24px",
                  }}
                >
                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <FaVenusMars
                      style={filterIconStyle(
                        gender
                      )}
                    />

                    <Input
                      type="select"
                      value={gender}
                      onChange={(
                        event
                      ) =>
                        setGender(
                          event.target
                            .value
                        )
                      }
                      className="pc-filter-select"
                      style={filterInputStyle(
                        gender,
                        "165px"
                      )}
                    >
                      <option value="">{t('Any Gender', 'أي جنس')}</option>

                      <option value="Female">{t('Female', 'أنثى')}</option>

                      <option value="Male">{t('Male', 'ذكر')}</option>
                    </Input>
                  </div>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <FaLanguage
                      style={filterIconStyle(
                        language
                      )}
                    />

                    <Input
                      type="select"
                      value={language}
                      onChange={(
                        event
                      ) =>
                        setLanguage(
                          event.target
                            .value
                        )
                      }
                      className="pc-filter-select"
                      style={filterInputStyle(
                        language,
                        "185px"
                      )}
                    >
                      <option value="">{t('Any Language', 'أي لغة')}</option>

                      <option value="Arabic">{t('Arabic', 'العربية')}</option>

                      <option value="English">{t('English', 'الإنجليزية')}</option>

                      <option value="Hindi">{t('Hindi', 'الهندية')}</option>

                      <option value="Urdu">{t('Urdu', 'الأردية')}</option>

                      <option value="Swahili">{t('Swahili', 'السواحيلية')}</option>

                      <option value="Bengali">{t('Bengali', 'البنغالية')}</option>

                      <option value="Malayalam">{t('Malayalam', 'المالايالامية')}</option>

                      <option value="Tamil">{t('Tamil', 'التاميلية')}</option>

                      <option value="Filipino (Tagalog)">{t('Filipino (Tagalog)', 'الفلبينية (تاغالوغ)')}</option>
                    </Input>
                  </div>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <FaBriefcase
                      style={filterIconStyle(
                        minExperience
                      )}
                    />

                    <Input
                      type="select"
                      value={
                        minExperience
                      }
                      onChange={(
                        event
                      ) =>
                        setMinExperience(
                          event.target
                            .value
                        )
                      }
                      className="pc-filter-select"
                      style={filterInputStyle(
                        minExperience,
                        "190px"
                      )}
                    >
                      <option value="">{t('Any Experience', 'أي خبرة')}</option>

                      <option value="1">{t('1+ year', 'سنة فأكثر')}</option>

                      <option value="2">{t('2+ years', 'سنتان فأكثر')}</option>

                      <option value="3">{t('3+ years', '٣ سنوات فأكثر')}</option>

                      <option value="5">{t('5+ years', '٥ سنوات فأكثر')}</option>

                      <option value="10">{t('10+ years', '١٠ سنوات فأكثر')}</option>
                    </Input>
                  </div>
                </div>

                <div className="mb-4">
                  <div
                    className="pc-filter-heading"
                    style={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap: "8px",

                      marginBottom:
                        "11px",

                      color:
                        "#536274",

                      fontWeight:
                        "600",

                      fontSize:
                        "14px",
                    }}
                  >
                    <FaCalendarAlt />{t('Available Days', 'أيام التوفر')}</div>

                  <div
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap: "9px",
                    }}
                  >
                    {days.map(
                      (day) => {
                        const selected =
                          availability.includes(
                            day
                          );

                        return (
                          <button
                            key={
                              day
                            }
                            type="button"
                            onClick={() =>
                              toggleDay(
                                day
                              )
                            }
                            className="pc-filter-chip"
                            aria-pressed={selected}
                            style={chipStyle(
                              selected
                            )}
                          >
                            {selected && (
                              <FaCheck
                                size={
                                  11
                                }
                              />
                            )}

                            {translateValue(day)}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div>
                  <div
                    className="pc-filter-heading"
                    style={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap: "8px",

                      marginBottom:
                        "11px",

                      color:
                        "#536274",

                      fontWeight:
                        "600",

                      fontSize:
                        "14px",
                    }}
                  >
                    <FaClock />{t('Preferred Time', 'الوقت المفضل')}</div>

                  <div
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap: "9px",
                    }}
                  >
                    {times.map(
                      (time) => {
                        const selected =
                          availableTime.includes(
                            time
                          );

                        return (
                          <button
                            key={
                              time
                            }
                            type="button"
                            onClick={() =>
                              toggleTime(
                                time
                              )
                            }
                            className="pc-filter-chip"
                            aria-pressed={selected}
                            style={chipStyle(
                              selected
                            )}
                          >
                            {selected && (
                              <FaCheck
                                size={
                                  11
                                }
                              />
                            )}

                            {translateValue(time)}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {!hasSearched &&
              !loadingSearch && (
                <div
                  className="text-center"
                  style={{
                    padding:
                      "55px 20px",
                  }}
                >
                  <div
                    style={{
                      width:
                        "72px",

                      height:
                        "72px",

                      borderRadius:
                        "50%",

                      backgroundColor:
                        "#eaf2fc",

                      color:
                        "#5677a8",

                      margin:
                        "0 auto 18px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      fontSize:
                        "25px",
                    }}
                  >
                    <FaSearch />
                  </div>

                  <h5
                    style={{
                      fontWeight:
                        "650",

                      marginBottom:
                        "8px",
                    }}
                  >{t('Find the right caregiver', 'اعثر على مقدم الرعاية المناسب')}</h5>

                  <p
                    className="text-muted"
                    style={{
                      maxWidth:
                        "440px",

                      margin:
                        "0 auto",
                    }}
                  >{t('Select your preferences above and search for caregivers who match what you need.', 'اختر تفضيلاتك أعلاه وابحث عن مقدمي الرعاية المناسبين.')}</p>
                </div>
              )}

            {hasSearched &&
              loadingSearch && (
                <div className="text-center py-5">
                  <Spinner />

                  <p className="text-muted mt-3">{t('Finding matching caregivers...', 'جارٍ البحث عن مقدمي رعاية مناسبين...')}</p>
                </div>
              )}

            {hasSearched &&
              !loadingSearch &&
              caregivers.length ===
                0 && (
                <Card
                  style={cardStyle}
                >
                  <CardBody
                    className="text-center"
                    style={{
                      padding:
                        "55px 25px",
                    }}
                  >
                    <div
                      style={{
                        width:
                          "65px",

                        height:
                          "65px",

                        borderRadius:
                          "50%",

                        backgroundColor:
                          "#eef4ff",

                        color:
                          "#6c83a5",

                        margin:
                          "0 auto 16px",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        fontSize:
                          "23px",
                      }}
                    >
                      <FaSearch />
                    </div>

                    <h5>{t('No matching caregivers', 'لا يوجد مقدمو رعاية مطابقون')}</h5>

                    <p className="text-muted mb-0">{t('Try removing one or two filters to see more caregivers.', 'جرّب إزالة فلتر أو اثنين لعرض المزيد.')}</p>
                  </CardBody>
                </Card>
              )}

            {hasSearched &&
              !loadingSearch &&
              caregivers.length >
                0 && (
                <>
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{
                      margin:
                        "30px 2px 18px",
                    }}
                  >
                    <div>
                      <h5 className="mb-1">{t('Caregivers', 'مقدمو الرعاية')}</h5>

                      <small className="text-muted">
                        {
                          caregivers.length
                        }{" "}
                        {t(
                          `${caregivers.length === 1 ? "caregiver" : "caregivers"} found`,
                          "تم العثور على مقدمي رعاية"
                        )}
                      </small>
                    </div>

                    {hasPatientLocation && (
                      <small
                        style={{
                          color:
                            "#5677a8",

                          fontWeight:
                            "500",
                        }}
                      >
                        <FaMapMarkerAlt className="me-1" />{t('Nearest results first', 'الأقرب أولًا')}</small>
                    )}
                  </div>

                  <Row>
                    {caregivers.map(
                      (
                        caregiver
                      ) => {
                        const linked =
                          isAlreadyLinked(
                            caregiver.email
                          );

                        return (
                          <Col
                            lg="6"
                            key={
                              caregiver._id
                            }
                            className="mb-4"
                          >
                            <Card
                              style={
                                cardStyle
                              }
                              className="h-100"
                            >
                              <CardBody
                                style={{
                                  padding:
                                    "25px",
                                }}
                              >
                                <div className="d-flex align-items-start mb-4">
                                  <img
                                    src={getImageUrl(
                                      caregiver.profilepic
                                    )}
                                    alt={
                                      caregiver.name
                                    }
                                    style={{
                                      width:
                                        "78px",

                                      height:
                                        "78px",

                                      borderRadius:
                                        "50%",

                                      objectFit:
                                        "cover",

                                      border:
                                        "3px solid #f1f3f5",

                                      marginRight:
                                        "18px",
                                    }}
                                  />

                                  <div
                                    style={{
                                      flex: 1,
                                    }}
                                  >
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h5 className="mb-1">
                                          {
                                            caregiver.name
                                          }
                                        </h5>

                                        <p className="text-muted mb-2">
                                          {caregiver.degree ||
                                            "Caregiver"}
                                        </p>
                                      </div>

                                      {caregiver.distanceKm !==
                                        null &&
                                        caregiver.distanceKm !==
                                          undefined && (
                                          <span
                                            style={{
                                              backgroundColor:
                                                "#eef4ff",

                                              color:
                                                "#456c9e",

                                              padding:
                                                "6px 10px",

                                              borderRadius:
                                                "14px",

                                              fontSize:
                                                "12px",

                                              fontWeight:
                                                "600",

                                              whiteSpace:
                                                "nowrap",

                                              marginLeft:
                                                "8px",
                                            }}
                                          >
                                            <FaMapMarkerAlt className="me-1" />
                                            {
                                              caregiver.distanceKm
                                            }{" "}
                                            {t("km", "كم")}
                                          </span>
                                        )}
                                    </div>

                                    <div
                                      style={{
                                        display:
                                          "flex",

                                        gap:
                                          "7px",

                                        flexWrap:
                                          "wrap",
                                      }}
                                    >
                                      {linked && (
                                        <Badge color="success">{t('Your Caregiver', 'مقدم الرعاية الخاص بك')}</Badge>
                                      )}
{caregiver.professionalVerificationStatus ===
  "Verified" && (
  <Badge color="primary">{t('✓ Verified', '✓ موثّق')}</Badge>
)}
                                      {caregiver.gender && (
                                        <Badge
                                          color="light"
                                          className="text-dark border"
                                        >
                                          {
                                            caregiver.gender
                                          }
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <Row>
                                  <Col sm="6">
                                    <small className="text-muted">{t('Experience', 'الخبرة')}</small>

                                    <p>
                                      {caregiver.experience !==
                                        undefined &&
                                      caregiver.experience !==
                                        null
                                        ? `${caregiver.experience} ${t("years", "سنوات")}`
                                        : t("Not provided", "غير متوفر")}
                                    </p>
                                  </Col>

                                  <Col sm="6">
                                    <small className="text-muted">{t('Location', 'الموقع')}</small>

                                    <p>
                                      {caregiver.location ||
                                        t("Not provided", "غير متوفر")}
                                    </p>
                                  </Col>
                                </Row>

                                <small className="text-muted">{t('Languages', 'اللغات')}</small>

                                <p>
                                  {translateList(caregiver.languages)}
                                </p>

                                <small className="text-muted">{t('Available Days', 'أيام التوفر')}</small>

                                <p>
                                  {translateList(caregiver.availability)}
                                </p>

                                <small className="text-muted">{t('Preferred Times', 'الأوقات المفضلة')}</small>

                                <p>
                                  {translateList(caregiver.availableTimes)}
                                </p>

                                <Button
                                  color="primary"
                                  outline
                                  className="w-100 mt-2"
                                  style={{
                                    borderRadius:
                                      "10px",

                                    padding:
                                      "9px",
                                  }}
                                  onClick={() =>
                                    openProfile(
                                      caregiver
                                    )
                                  }
                                >{t('View Profile', 'عرض الملف الشخصي')}</Button>
                              </CardBody>
                            </Card>
                          </Col>
                        );
                      }
                    )}
                  </Row>
                </>
              )}
          </>
        )}
      </div>

      <Modal
        modalClassName={`patient-caregiver-modal ${isArabic ? "patient-caregiver-ar" : ""}`}
        isOpen={showProfile}
        toggle={closeProfile}
        size="lg"
        centered
        dir={isArabic ? "rtl" : "ltr"}
      >
        <ModalHeader
          toggle={closeProfile}
        >{t('Caregiver Profile', 'الملف الشخصي لمقدم الرعاية')}</ModalHeader>

        <ModalBody>
          {selectedCaregiver && (
            <>
              <div className="d-flex align-items-center mb-4">
                <img
                  src={getImageUrl(
                    selectedCaregiver.profilepic
                  )}
                  alt={
                    selectedCaregiver.name
                  }
                  style={{
                    width: "90px",

                    height: "90px",

                    borderRadius:
                      "50%",

                    objectFit:
                      "cover",

                    marginRight:
                      "20px",
                  }}
                />

                <div>
                  <h4 className="mb-1">
                    {
                      selectedCaregiver.name
                    }
                  </h4>

                  <p className="text-muted mb-1">
                    {selectedCaregiver.degree ||
                      "Caregiver"}
                  </p>

                  {selectedCaregiver.distanceKm !==
                    null &&
                    selectedCaregiver.distanceKm !==
                      undefined && (
                      <p
                        className="mb-2"
                        style={{
                          color:
                            "#5677a8",

                          fontWeight:
                            "600",
                        }}
                      >
                        <FaMapMarkerAlt className="me-1" />

                        {
                          selectedCaregiver.distanceKm
                        }{" "}
                        {t("km away", "كم بعيدًا")}
                      </p>
                    )}

                 <div
  style={{
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  }}
>
  {isAlreadyLinked(
    selectedCaregiver.email
  ) && (
    <Badge color="success">{t('Connected', 'مرتبط')}</Badge>
  )}

  {selectedCaregiver.professionalVerificationStatus ===
    "Verified" && (
    <Badge color="primary">{t('✓ Verified', '✓ موثّق')}</Badge>
  )}

  {selectedCaregiver.gender && (
    <Badge
      color="light"
      className="text-dark border"
    >
      {translateValue(selectedCaregiver.gender)}
    </Badge>
  )}
</div>
                </div>
              </div>

              <Row>
                <Col md="6">
                  <p>
                    <strong>{t('Experience', 'الخبرة')}</strong>

                    <br />

                    {selectedCaregiver.experience !==
                      undefined &&
                    selectedCaregiver.experience !==
                      null
                      ? `${selectedCaregiver.experience} ${t("years", "سنوات")}`
                      : t("Not provided", "غير متوفر")}
                  </p>
                </Col>

                <Col md="6">
                  <p>
                    <strong>{t('Location', 'الموقع')}</strong>

                    <br />

                    {selectedCaregiver.location ||
                      t("Not provided", "غير متوفر")}
                  </p>
                </Col>
              </Row>

              {selectedCaregiver.gender && (
                <p>
                  <strong>{t('Gender', 'الجنس')}</strong>

                  <br />

                  {
                    selectedCaregiver.gender
                  }
                </p>
              )}

              <p>
                <strong>{t('Languages', 'اللغات')}</strong>

                <br />

                {translateList(selectedCaregiver.languages)}
              </p>

              <p>
                <strong>{t('Available Days', 'أيام التوفر')}</strong>

                <br />

                {translateList(selectedCaregiver.availability)}
              </p>

              <p>
                <strong>{t('Preferred Times', 'الأوقات المفضلة')}</strong>

                <br />

                {translateList(selectedCaregiver.availableTimes)}
              </p>

              <p>
                <strong>{t('About', 'نبذة')}</strong>

                <br />

                {selectedCaregiver.bio ||
                  "No bio provided."}
              </p>

              <p>
                <strong>{t('Certificates', 'الشهادات')}</strong>
              </p>

              {selectedCaregiver.certificates
                ?.length ? (
                selectedCaregiver.certificates.map(
                  (
                    certificate
                  ) => (
                    <div
                      key={
                        certificate._id
                      }
                      className="mb-2"
                    >
                      <a
                        href={`http://localhost:3002${certificate.certificateFile}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {
                          certificate.certificateName
                        }
                      </a>
                    </div>
                  )
                )
              ) : (
                <p className="text-muted">{t('No certificates uploaded.', 'لم تُرفع أي شهادات.')}</p>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="secondary"
            outline
            onClick={
              closeProfile
            }
          >{t('Close', 'إغلاق')}</Button>

          {selectedCaregiver &&
            !isAlreadyLinked(
              selectedCaregiver.email
            ) && (
              <Button
                color="primary"
                disabled={
                  sendingRequest
                }
                onClick={() =>
                  sendRequest(
                    selectedCaregiver
                  )
                }
              >
                {sendingRequest
                  ? t("Sending...", "جارٍ الإرسال...")
                  : t("Send Request", "إرسال الطلب")}
              </Button>
            )}
        </ModalFooter>
      </Modal>


      <style>{`
        .patient-caregiver-page {
          --pc-page-bg: #f8f9fb;
          --pc-card-bg: #fff;
          --pc-text: #24364c;
          color: var(--pc-text);
          font-size: 16px;
        }
        .patient-caregiver-page h2 { font-size: 34px; }
        .patient-caregiver-page h4 { font-size: 24px; }
        .patient-caregiver-page h5 { font-size: 21px; }
        .patient-caregiver-page .text-muted { font-size: 15px; }
        .patient-caregiver-page .card { background: var(--pc-card-bg) !important; color: var(--pc-text) !important; }
        .patient-caregiver-page .patient-caregiver-ar,
        .patient-caregiver-page.patient-caregiver-ar { text-align: right; font-family: Tahoma, Arial, sans-serif; }
        .patient-caregiver-page.patient-caregiver-ar .text-end { text-align: left !important; }
        .patient-caregiver-page.patient-caregiver-ar img { margin-inline-end: 18px; margin-right: 0 !important; }
        .patient-caregiver-page.patient-caregiver-ar .form-control { text-align: right; }
        body.dark-theme .patient-caregiver-page {
          --pc-page-bg: #101c2a;
          --pc-card-bg: #17283a;
          --pc-text: #f1f5f9;
        }
        body.dark-theme .patient-caregiver-page .text-muted { color: #c1cedd !important; }
        body.dark-theme .patient-caregiver-page .pc-filter-select {
          background-color: #21374e !important;
          color: #eaf2ff !important;
          border-color: #56728f !important;
        }
        body.dark-theme .patient-caregiver-page .pc-filter-chip {
          background-color: #21374e !important;
          color: #eaf2ff !important;
          border: 1px solid #56728f !important;
        }
        body.dark-theme .patient-caregiver-page .pc-filter-chip[aria-pressed="true"] {
          background-color: #274d78 !important;
          border-color: #85b8ff !important;
          color: #ffffff !important;
        }
        body.dark-theme .patient-caregiver-page .pc-filter-heading {
          color: #d8e7fa !important;
        }
        body.dark-theme .patient-caregiver-page .pc-location-line {
          color: #a8cbff !important;
        }
        body.dark-theme .patient-caregiver-page h2,
        body.dark-theme .patient-caregiver-page h4,
        body.dark-theme .patient-caregiver-page h5,
        body.dark-theme .patient-caregiver-page h6 { color: #e8f1ff !important; }
        body.dark-theme .patient-caregiver-page .card small { color: #c1cedd; }
        body.dark-theme .patient-caregiver-page .card p[style*="color"] { color: #e8f1ff !important; }
        body.dark-theme .patient-caregiver-page .card div[style*="background-color: rgb(238, 244, 255)"] { background-color: #21374e !important; }
        body.dark-theme .patient-caregiver-page .card,
        body.dark-theme .patient-caregiver-page .modal-content { border-color: #31475f !important; }
        body.dark-theme .patient-caregiver-page .form-control {
          background: #21374e !important;
          color: #f1f5f9 !important;
          border-color: #48627c !important;
        }
        body.dark-theme .patient-caregiver-page .form-control::placeholder { color: #b7c8da !important; }
        body.dark-theme .patient-caregiver-page select option { background: #21374e; color: #fff; }
        body.dark-theme .patient-caregiver-page .card div[style*="background-color: rgb(248, 250, 252)"],
        body.dark-theme .patient-caregiver-page .card div[style*="background-color: #f8fafc"] {
          background-color: #21374e !important;
        }
        body.dark-theme .patient-caregiver-modal .modal-content {
          background: #17283a !important;
          color: #f1f5f9 !important;
          border-color: #31475f !important;
        }
        body.dark-theme .patient-caregiver-modal .text-muted { color: #c1cedd !important; }
        .patient-caregiver-modal.patient-caregiver-ar { direction: rtl; text-align: right; }
      `}</style>
      <Footer/>
    </Container>
  );
};

export default PatientCaregiver;
