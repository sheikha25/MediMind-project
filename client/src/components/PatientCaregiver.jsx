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

const PatientCaregiver = () => {
  const user = useSelector(
    (state) => state.user.user
  );
console.log("Patient Redux user:", user);
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
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
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
          "Unable to load your caregiver."
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
        ? "Medication management permission granted."
        : "Medication management permission revoked."
    );
  } catch (error) {
    console.error(
      "Medication permission error:",
      error
    );

    setMedicationPermissionMessage(
      error.response?.data?.message ||
        "Unable to update medication permission."
    );
  } finally {
    setUpdatingMedicationPermission(false);
  }
};


const handleDisconnectCaregiver = async () => {
  if (!user?.email || !myCaregiver?.email) return;

  const confirmed = window.confirm(
    `Disconnect from ${myCaregiver.name}? They will lose access to your medication information.`
  );

  if (!confirmed) return;

  try {
    const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

    if (!token) {
      alert("Please log in again.");
      return;
    }

    await axios.delete(
      "http://localhost:3002/caregiver-links/disconnect",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          patientEmail: user.email,
          caregiverEmail: myCaregiver.email,
        },
      }
    );

    setMyCaregiver(null);
    setMedicationPermissionMessage("");
    setMessage("Caregiver disconnected successfully.");
    setMessageType("success");
  } catch (error) {
    console.error("Disconnect caregiver error:", error);

    alert(
      error.response?.data?.message ||
        "Unable to disconnect caregiver."
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
          "Unable to search caregivers."
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
        "Please log in again."
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
          "Caregiver request sent."
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
          "Unable to send caregiver request."
      );

      setMessageType("danger");
    } finally {
      setSendingRequest(false);
    }
  };

  const cardStyle = {
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
      className="p-0"
      style={{
        minHeight: "100vh",

        backgroundColor:
          "#f8f9fb",
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
          >
            Caregiver
          </h2>

          <p
            className="text-muted"
            style={{
              maxWidth:
                "600px",

              margin:
                "0 auto",
            }}
          >
            Manage your caregiver or
            find someone who can
            support your medication
            care.
          </p>
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
            >
              My Caregiver
            </button>

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
            >
              Search for Caregiver
            </button>
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
              >
                My Caregiver
              </h4>

              <p className="text-muted">
                View the caregiver
                currently connected to
                your account.
              </p>
            </div>

            {loadingMyCaregiver ? (
              <div className="text-center py-5">
                <Spinner />

                <p className="text-muted mt-3">
                  Loading your
                  caregiver...
                </p>
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

                  <h4>
                    No caregiver
                    connected
                  </h4>

                  <p
                    className="text-muted"
                    style={{
                      maxWidth:
                        "450px",

                      margin:
                        "10px auto 22px",
                    }}
                  >
                    Find a registered
                    caregiver and send
                    them a request to
                    connect with your
                    account.
                  </p>

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
                  >
                    Find a Caregiver
                  </Button>
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
                              "Qualification not provided"}
                          </p>

                          <div
  style={{
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  }}
>
  <Badge color="success">
    Connected
  </Badge>

  {myCaregiver.professionalVerificationStatus ===
    "Verified" && (
    <Badge color="primary">
      ✓ Verified
    </Badge>
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
                          <small className="text-muted">
                            Experience
                          </small>

                          <p className="fw-semibold mb-0">
                            {myCaregiver.experience !==
                              undefined &&
                            myCaregiver.experience !==
                              null
                              ? `${myCaregiver.experience} years`
                              : "Not provided"}
                          </p>
                        </Col>

                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">
                            Location
                          </small>

                          <p className="fw-semibold mb-0">
                            {myCaregiver.location ||
                              "Not provided"}
                          </p>
                        </Col>

                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">
                            Relationship
                          </small>

                          <p className="fw-semibold mb-0">
                            {myCaregiver.relationship ||
                              "Not provided"}
                          </p>
                        </Col>

                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">
                            Languages
                          </small>

                          <p className="fw-semibold mb-0">
                            {myCaregiver.languages
                              ?.length
                              ? myCaregiver.languages.join(
                                  ", "
                                )
                              : "Not provided"}
                          </p>
                        </Col>

                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">
                            Available Days
                          </small>

                          <p className="fw-semibold mb-0">
                            {myCaregiver.availability
                              ?.length
                              ? myCaregiver.availability.join(
                                  ", "
                                )
                              : "Not provided"}
                          </p>
                        </Col>

                        <Col
                          sm="6"
                          lg="4"
                        >
                          <small className="text-muted">
                            Preferred Times
                          </small>

                          <p className="fw-semibold mb-0">
                            {myCaregiver.availableTimes
                              ?.length
                              ? myCaregiver.availableTimes.join(
                                  ", "
                                )
                              : "Not provided"}
                          </p>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <hr />

                  <Row>
                    <Col md="6">
                      <small className="text-muted">
                        Connected Since
                      </small>

                      <p className="fw-semibold">
                        {formatLinkedDate(
                          myCaregiver.linkedSince
                        )}
                      </p>
                    </Col>

                    <Col md="6">
                      <small className="text-muted">
                        Phone Number
                      </small>

                      <p className="fw-semibold">
                        {myCaregiver.phoneNumber ||
                          "Not provided"}
                      </p>
                    </Col>
                  </Row>

                  {myCaregiver.bio && (
                    <>
                      <small className="text-muted">
                        About
                      </small>

                      <p className="mt-1">
                        {
                          myCaregiver.bio
                        }
                      </p>
                    </>
                  )}

                  <small className="text-muted">
                    Certificates
                  </small>

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
                    <p className="text-muted mt-1 mb-0">
                      No certificates
                      uploaded.
                    </p>
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
      >
        Medication Management
      </h6>

      <p
        className="text-muted mb-0"
        style={{
          fontSize: "13px",
          maxWidth: "600px",
        }}
      >
        Allow {myCaregiver.name} to add, edit,
        and delete medications on your behalf.
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
      >
        Not Allowed
      </span>

      <button
        type="button"
        disabled={updatingMedicationPermission}
        onClick={handleMedicationPermission}
        aria-label="Medication management permission"
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
      >
        Allowed
      </span>
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
  >
    Disconnect Caregiver
  </Button>
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
              >
                Find a Caregiver
              </h4>

              <p className="text-muted mb-2">
                Choose what matters to
                you and find a
                caregiver who matches
                your preferences.
              </p>

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

                  <span>
                    Searching near{" "}
                    <strong>
                      {user?.location ||
                        "your current location"}
                    </strong>
                  </span>
                </div>
              ) : (
                <Alert
                  color="warning"
                  className="mt-3 mb-0"
                >
                  Add your current
                  location in Profile
                  Settings to see
                  caregiver distance.
                </Alert>
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
                      placeholder="Search by name or qualification..."
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
                        aria-label="Clear search"
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
                        <FaSearch className="me-2" />
                        Search
                      </>
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
                  >
                    Filter by preference
                  </small>

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
                    >
                      Clear all
                    </button>
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
                      style={filterInputStyle(
                        gender,
                        "165px"
                      )}
                    >
                      <option value="">
                        Any Gender
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Male">
                        Male
                      </option>
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
                      style={filterInputStyle(
                        language,
                        "185px"
                      )}
                    >
                      <option value="">
                        Any Language
                      </option>

                      <option value="Arabic">
                        Arabic
                      </option>

                      <option value="English">
                        English
                      </option>

                      <option value="Hindi">
                        Hindi
                      </option>

                      <option value="Urdu">
                        Urdu
                      </option>

                      <option value="Swahili">
                        Swahili
                      </option>

                      <option value="Bengali">
                        Bengali
                      </option>

                      <option value="Malayalam">
                        Malayalam
                      </option>

                      <option value="Tamil">
                        Tamil
                      </option>

                      <option value="Filipino (Tagalog)">
                        Filipino
                        (Tagalog)
                      </option>
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
                      style={filterInputStyle(
                        minExperience,
                        "190px"
                      )}
                    >
                      <option value="">
                        Any Experience
                      </option>

                      <option value="1">
                        1+ year
                      </option>

                      <option value="2">
                        2+ years
                      </option>

                      <option value="3">
                        3+ years
                      </option>

                      <option value="5">
                        5+ years
                      </option>

                      <option value="10">
                        10+ years
                      </option>
                    </Input>
                  </div>
                </div>

                <div className="mb-4">
                  <div
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
                    <FaCalendarAlt />

                    Available Days
                  </div>

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

                            {day}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div>
                  <div
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
                    <FaClock />

                    Preferred Time
                  </div>

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

                            {time}
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
                  >
                    Find the right
                    caregiver
                  </h5>

                  <p
                    className="text-muted"
                    style={{
                      maxWidth:
                        "440px",

                      margin:
                        "0 auto",
                    }}
                  >
                    Select your
                    preferences above
                    and search for
                    caregivers who match
                    what you need.
                  </p>
                </div>
              )}

            {hasSearched &&
              loadingSearch && (
                <div className="text-center py-5">
                  <Spinner />

                  <p className="text-muted mt-3">
                    Finding matching
                    caregivers...
                  </p>
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

                    <h5>
                      No matching
                      caregivers
                    </h5>

                    <p className="text-muted mb-0">
                      Try removing one or
                      two filters to see
                      more caregivers.
                    </p>
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
                      <h5 className="mb-1">
                        Caregivers
                      </h5>

                      <small className="text-muted">
                        {
                          caregivers.length
                        }{" "}
                        {caregivers.length ===
                        1
                          ? "caregiver"
                          : "caregivers"}{" "}
                        found
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
                        <FaMapMarkerAlt className="me-1" />
                        Nearest results
                        first
                      </small>
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
                                            km
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
                                        <Badge color="success">
                                          Your
                                          Caregiver
                                        </Badge>
                                      )}
{caregiver.professionalVerificationStatus ===
  "Verified" && (
  <Badge color="primary">
    ✓ Verified
  </Badge>
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
                                    <small className="text-muted">
                                      Experience
                                    </small>

                                    <p>
                                      {caregiver.experience !==
                                        undefined &&
                                      caregiver.experience !==
                                        null
                                        ? `${caregiver.experience} years`
                                        : "Not provided"}
                                    </p>
                                  </Col>

                                  <Col sm="6">
                                    <small className="text-muted">
                                      Location
                                    </small>

                                    <p>
                                      {caregiver.location ||
                                        "Not provided"}
                                    </p>
                                  </Col>
                                </Row>

                                <small className="text-muted">
                                  Languages
                                </small>

                                <p>
                                  {caregiver.languages
                                    ?.length
                                    ? caregiver.languages.join(
                                        ", "
                                      )
                                    : "Not provided"}
                                </p>

                                <small className="text-muted">
                                  Available
                                  Days
                                </small>

                                <p>
                                  {caregiver.availability
                                    ?.length
                                    ? caregiver.availability.join(
                                        ", "
                                      )
                                    : "Not provided"}
                                </p>

                                <small className="text-muted">
                                  Preferred
                                  Times
                                </small>

                                <p>
                                  {caregiver.availableTimes
                                    ?.length
                                    ? caregiver.availableTimes.join(
                                        ", "
                                      )
                                    : "Not provided"}
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
                                >
                                  View Profile
                                </Button>
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
        isOpen={showProfile}
        toggle={closeProfile}
        size="lg"
        centered
      >
        <ModalHeader
          toggle={closeProfile}
        >
          Caregiver Profile
        </ModalHeader>

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
                        km away
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
    <Badge color="success">
      Connected
    </Badge>
  )}

  {selectedCaregiver.professionalVerificationStatus ===
    "Verified" && (
    <Badge color="primary">
      ✓ Verified
    </Badge>
  )}

  {selectedCaregiver.gender && (
    <Badge
      color="light"
      className="text-dark border"
    >
      {selectedCaregiver.gender}
    </Badge>
  )}
</div>
                </div>
              </div>

              <Row>
                <Col md="6">
                  <p>
                    <strong>
                      Experience
                    </strong>

                    <br />

                    {selectedCaregiver.experience !==
                      undefined &&
                    selectedCaregiver.experience !==
                      null
                      ? `${selectedCaregiver.experience} years`
                      : "Not provided"}
                  </p>
                </Col>

                <Col md="6">
                  <p>
                    <strong>
                      Location
                    </strong>

                    <br />

                    {selectedCaregiver.location ||
                      "Not provided"}
                  </p>
                </Col>
              </Row>

              {selectedCaregiver.gender && (
                <p>
                  <strong>
                    Gender
                  </strong>

                  <br />

                  {
                    selectedCaregiver.gender
                  }
                </p>
              )}

              <p>
                <strong>
                  Languages
                </strong>

                <br />

                {selectedCaregiver.languages
                  ?.length
                  ? selectedCaregiver.languages.join(
                      ", "
                    )
                  : "Not provided"}
              </p>

              <p>
                <strong>
                  Available Days
                </strong>

                <br />

                {selectedCaregiver.availability
                  ?.length
                  ? selectedCaregiver.availability.join(
                      ", "
                    )
                  : "Not provided"}
              </p>

              <p>
                <strong>
                  Preferred Times
                </strong>

                <br />

                {selectedCaregiver.availableTimes
                  ?.length
                  ? selectedCaregiver.availableTimes.join(
                      ", "
                    )
                  : "Not provided"}
              </p>

              <p>
                <strong>
                  About
                </strong>

                <br />

                {selectedCaregiver.bio ||
                  "No bio provided."}
              </p>

              <p>
                <strong>
                  Certificates
                </strong>
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
                <p className="text-muted">
                  No certificates
                  uploaded.
                </p>
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
          >
            Close
          </Button>

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
                  ? "Sending..."
                  : "Send Request"}
              </Button>
            )}
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default PatientCaregiver;