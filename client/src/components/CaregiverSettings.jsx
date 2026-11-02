import { useState, useRef } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
} from "reactstrap";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  FaEye,
  FaTrashAlt,
  FaFilePdf,
  FaImage,
  FaCloudUploadAlt,
} from "react-icons/fa";

import axios from "axios";

import {
  updateUser,
} from "../features/UserSlice";

import CaregiverHeader from "./CaregiverHeader";
import CaregiverSettingsSidebar from "./CaregiverSettingsSidebar";
import Footer from "./footer";

const CaregiverSettings = () => {
  const dispatch = useDispatch();

  const user = useSelector(
    (state) => state.user.user
  );

  const [activePage, setActivePage] =
    useState("profile");

  const [
    patientLinkCode,
    setPatientLinkCode,
  ] = useState("");

  const [
    relationship,
    setRelationship,
  ] = useState("");

  const [
    otherRelationship,
    setOtherRelationship,
  ] = useState("");

  const [
    linkMessage,
    setLinkMessage,
  ] = useState("");

  const [
    linkMessageType,
    setLinkMessageType,
  ] = useState("");

  const [
    isSendingLink,
    setIsSendingLink,
  ] = useState(false);

  const [
    profilePicture,
    setProfilePicture,
  ] = useState(null);

  const [
    profilePreview,
    setProfilePreview,
  ] = useState(
    user?.profilepic
      ? `http://localhost:3002${user.profilepic}`
      : ""
  );

  const [
    profileMessage,
    setProfileMessage,
  ] = useState("");

  const [
    isSavingProfile,
    setIsSavingProfile,
  ] = useState(false);

  /* NEW */
  const [gender, setGender] =
    useState(user?.gender || "");

  const [degree, setDegree] =
    useState(user?.degree || "");

  const [
    experience,
    setExperience,
  ] = useState(
    user?.experience ?? ""
  );

  const [
    location,
    setLocation,
  ] = useState(
    user?.location || ""
  );

  const [latitude, setLatitude] = useState(
    user?.latitude ?? null
  );

  const [longitude, setLongitude] = useState(
    user?.longitude ?? null
  );

  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");

  const [
    isGettingLocation,
    setIsGettingLocation,
  ] = useState(false);

  const [bio, setBio] =
    useState(user?.bio || "");

  const [
    languages,
    setLanguages,
  ] = useState(
    user?.languages || []
  );

  const [
    languageInput,
    setLanguageInput,
  ] = useState("");

  const [
    availability,
    setAvailability,
  ] = useState(
    user?.availability || []
  );

  const [
    availableTimes,
    setAvailableTimes,
  ] = useState(
    user?.availableTimes || []
  );

  const [
    certificateName,
    setCertificateName,
  ] = useState("");

  const [
    certificateFile,
    setCertificateFile,
  ] = useState(null);

  const [
    certificates,
    setCertificates,
  ] = useState(
    user?.certificates || []
  );

  const [
    certificateMessage,
    setCertificateMessage,
  ] = useState("");

  const [
    certificateMessageType,
    setCertificateMessageType,
  ] = useState("");

  const [
    isUploadingCertificate,
    setIsUploadingCertificate,
  ] = useState(false);

  const certificateFileRef =
    useRef(null);

  const [
    detailsMessage,
    setDetailsMessage,
  ] = useState("");

  const [
    isSavingDetails,
    setIsSavingDetails,
  ] = useState(false);

  const [
    patientPreview,
    setPatientPreview,
  ] = useState(null);

  const [
    isLoadingPreview,
    setIsLoadingPreview,
  ] = useState(false);

  const [
    previewMessage,
    setPreviewMessage,
  ] = useState("");

  const handleLinkPatient =
    async () => {
      setLinkMessage("");
      setLinkMessageType("");

      const finalRelationship =
        relationship === "Other"
          ? otherRelationship.trim()
          : relationship;

      if (!user?.email) {
        setLinkMessage(
          "Please log in again."
        );

        setLinkMessageType(
          "error"
        );

        return;
      }

      if (
        !patientLinkCode.trim()
      ) {
        setLinkMessage(
          "Please enter the patient link code."
        );

        setLinkMessageType(
          "error"
        );

        return;
      }

      if (!finalRelationship) {
        setLinkMessage(
          "Please select or enter your relationship to the patient."
        );

        setLinkMessageType(
          "error"
        );

        return;
      }

      try {
        setIsSendingLink(true);

        const response =
          await axios.post(
            "http://localhost:3002/caregiver/request-link",
            {
              caregiverEmail:
                user.email,

              patientLinkCode:
                patientLinkCode
                  .trim()
                  .toUpperCase(),

              relationship:
                finalRelationship,
            }
          );

        setLinkMessage(
          response.data?.message ||
            "Link request sent successfully."
        );

        setLinkMessageType(
          "success"
        );

        setPatientLinkCode("");
        setRelationship("");
        setOtherRelationship("");
      } catch (error) {
        console.error(
          "Link Patient Error:",
          error
        );

        const errorMessage =
          error.response?.data
            ?.message ||
          "Unable to send the link request.";

        setLinkMessage(
          errorMessage
        );

        setLinkMessageType(
          "error"
        );
      } finally {
        setIsSendingLink(
          false
        );
      }
    };

  const handleSaveProfilePicture =
    async () => {
      setProfileMessage("");

      if (!user?.email) {
        setProfileMessage(
          "Please log in again."
        );

        return;
      }

      if (!profilePicture) {
        setProfileMessage(
          "Please select a profile picture."
        );

        return;
      }

      try {
        setIsSavingProfile(true);

        const formData =
          new FormData();

        formData.append(
          "email",
          user.email
        );

        formData.append(
          "profilepic",
          profilePicture
        );

        const response =
          await axios.put(
            "http://localhost:3002/user/profile-picture",
            formData
          );

        console.log(
          "Profile upload response:",
          response.data
        );

        if (
          response.data?.user
        ) {
          dispatch(
            updateUser(
              response.data.user
            )
          );
        }

        setProfileMessage(
          response.data?.message ||
            "Profile picture updated successfully."
        );

        setProfilePicture(
          null
        );
      } catch (error) {
        console.error(
          "Profile picture upload error:",
          error
        );

        setProfileMessage(
          error.response?.data
            ?.message ||
            "Unable to upload profile picture."
        );
      } finally {
        setIsSavingProfile(
          false
        );
      }
    };

  const handleCertificateFileChange =
    (event) => {
      const selectedFile =
        event.target.files?.[0];

      if (!selectedFile) {
        setCertificateFile(
          null
        );

        return;
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ];

      if (
        !allowedTypes.includes(
          selectedFile.type
        )
      ) {
        setCertificateFile(
          null
        );

        setCertificateMessage(
          "Please select a PDF, JPG, JPEG, or PNG file."
        );

        setCertificateMessageType(
          "error"
        );

        event.target.value =
          "";

        return;
      }

      if (
        selectedFile.size >
        5 * 1024 * 1024
      ) {
        setCertificateFile(
          null
        );

        setCertificateMessage(
          "The certificate file must be smaller than 5 MB."
        );

        setCertificateMessageType(
          "error"
        );

        event.target.value =
          "";

        return;
      }

      setCertificateFile(
        selectedFile
      );

      setCertificateMessage(
        ""
      );

      setCertificateMessageType(
        ""
      );
    };

  const handleAddCertificate =
    async () => {
      setCertificateMessage(
        ""
      );

      setCertificateMessageType(
        ""
      );

      if (!user?.email) {
        setCertificateMessage(
          "Please log in again."
        );

        setCertificateMessageType(
          "error"
        );

        return;
      }

      if (
        !certificateName.trim()
      ) {
        setCertificateMessage(
          "Please enter the certificate name."
        );

        setCertificateMessageType(
          "error"
        );

        return;
      }

      if (!certificateFile) {
        setCertificateMessage(
          "Please select a certificate file."
        );

        setCertificateMessageType(
          "error"
        );

        return;
      }

      try {
        setIsUploadingCertificate(
          true
        );

        const formData =
          new FormData();

        formData.append(
          "email",
          user.email
        );

        formData.append(
          "certificateName",
          certificateName.trim()
        );

        formData.append(
          "certificateFile",
          certificateFile
        );

        const response =
          await axios.put(
            "http://localhost:3002/caregiver/certificates",
            formData
          );

        const updatedCertificates =
          response.data
            ?.certificates ||
          [];

        setCertificates(
          updatedCertificates
        );

        dispatch(
          updateUser({
            certificates:
              updatedCertificates,
          })
        );

        setCertificateName(
          ""
        );

        setCertificateFile(
          null
        );

        if (
          certificateFileRef.current
        ) {
          certificateFileRef.current.value =
            "";
        }

        setCertificateMessage(
          response.data?.message ||
            "Certificate uploaded successfully."
        );

        setCertificateMessageType(
          "success"
        );
      } catch (error) {
        console.error(
          "Certificate upload error:",
          error
        );

        setCertificateMessage(
          error.response?.data
            ?.message ||
            "Unable to upload the certificate."
        );

        setCertificateMessageType(
          "error"
        );
      } finally {
        setIsUploadingCertificate(
          false
        );
      }
    };

  const handleRemoveCertificate =
    async (certificateId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to remove this certificate?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setCertificateMessage(
          ""
        );

        setCertificateMessageType(
          ""
        );

        const response =
          await axios.delete(
            `http://localhost:3002/caregiver/certificates/${certificateId}`,
            {
              data: {
                email:
                  user.email,
              },
            }
          );

        const updatedCertificates =
          response.data
            ?.certificates ||
          [];

        setCertificates(
          updatedCertificates
        );

        dispatch(
          updateUser({
            certificates:
              updatedCertificates,
          })
        );

        setCertificateMessage(
          response.data?.message ||
            "Certificate removed successfully."
        );

        setCertificateMessageType(
          "success"
        );
      } catch (error) {
        console.error(
          "Certificate removal error:",
          error
        );

        setCertificateMessage(
          error.response?.data
            ?.message ||
            "Unable to remove the certificate."
        );

        setCertificateMessageType(
          "error"
        );
      }
    };

  const handleUseCurrentLocation = () => {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLatitude =
          position.coords.latitude;

        const currentLongitude =
          position.coords.longitude;

        setLatitude(currentLatitude);
        setLongitude(currentLongitude);

        try {
          const response = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                lat: currentLatitude,
                lon: currentLongitude,
                format: "jsonv2",
                addressdetails: 1,
              },
              headers: {
                "Accept-Language": "en",
              },
            }
          );

          const address = response.data?.address || {};

          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            "";

          const state =
            address.state || "";

          const country =
            address.country || "";

          const readableLocation = [
            city,
            state,
            country,
          ]
            .filter(Boolean)
            .filter(
              (item, index, array) =>
                array.indexOf(item) === index
            )
            .join(", ");

          setLocation(
            readableLocation ||
              response.data?.display_name ||
              `${currentLatitude.toFixed(
                5
              )}, ${currentLongitude.toFixed(5)}`
          );

          setLocationMessage(
            "Location detected successfully."
          );
        } catch (error) {
          console.error(
            "Reverse geocoding error:",
            error
          );

          setLocation(
            `${currentLatitude.toFixed(
              5
            )}, ${currentLongitude.toFixed(5)}`
          );

          setLocationMessage(
            "Coordinates detected successfully. The location name could not be loaded."
          );
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          setLocationMessage(
            "Location permission was denied."
          );
        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          setLocationMessage(
            "Your current location is unavailable."
          );
        } else if (
          error.code ===
          error.TIMEOUT
        ) {
          setLocationMessage(
            "Location request timed out."
          );
        } else {
          setLocationMessage(
            "Unable to detect your current location."
          );
        }

        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSaveDetails =
    async () => {
      setDetailsMessage("");

      if (!user?.email) {
        setDetailsMessage(
          "Please log in again."
        );

        return;
      }

      if (
        gender &&
        ![
          "Male",
          "Female",
        ].includes(gender)
      ) {
        setDetailsMessage(
          "Please select a valid gender."
        );

        return;
      }

      if (
        experience !== "" &&
        (Number(experience) <
          0 ||
          Number.isNaN(
            Number(experience)
          ))
      ) {
        setDetailsMessage(
          "Please enter a valid number of experience years."
        );

        return;
      }

      try {
        setIsSavingDetails(
          true
        );

        const response =
          await axios.put(
            "http://localhost:3002/caregiver/profile",
            {
              email: user.email,

              gender,

              degree,

              experience,

              location,

              latitude,

              longitude,

              bio,

              languages,

              availability,

              availableTimes,
            }
          );

        if (
          response.data?.user
        ) {
          dispatch(
            updateUser(
              response.data.user
            )
          );
        }

        setDetailsMessage(
          response.data?.message ||
            "Profile updated successfully."
        );
      } catch (error) {
        console.error(
          "Caregiver profile update error:",
          error
        );

        setDetailsMessage(
          error.response?.data
            ?.message ||
            "Unable to update your profile."
        );
      } finally {
        setIsSavingDetails(
          false
        );
      }
    };

  const handlePreviewPatient =
    async () => {
      setPreviewMessage(
        ""
      );

      setPatientPreview(
        null
      );

      if (
        !patientLinkCode.trim()
      ) {
        setPreviewMessage(
          "Please enter the patient link code."
        );

        return;
      }

      try {
        setIsLoadingPreview(
          true
        );

        const response =
          await axios.get(
            `http://localhost:3002/caregiver/patient-preview/${encodeURIComponent(
              patientLinkCode
                .trim()
                .toUpperCase()
            )}`
          );

        setPatientPreview(
          response.data?.patient ||
            null
        );
      } catch (error) {
        console.error(
          "Patient preview error:",
          error
        );

        setPreviewMessage(
          error.response?.data
            ?.message ||
            "Unable to load patient preview."
        );
      } finally {
        setIsLoadingPreview(
          false
        );
      }
    };

  return (
    <Container
      fluid
      className="dashboard-page"
    >
      <CaregiverHeader />

      <Row
        style={{
          minHeight: "85vh",
        }}
      >
        <Col
          md="3"
          className="settings-sidebar"
        >
          <CaregiverSettingsSidebar />
        </Col>

        <Col
          md="9"
          className="p-5"
        >
          {activePage ===
            "profile" && (
            <>
              <h2>
                Caregiver Profile
                Settings
              </h2>

              <Card>
                <CardBody>
                  <label>
                    Username
                  </label>

                  <input
                    type="text"
                    className="form-control mb-3"
                    defaultValue={
                      user?.name ||
                      ""
                    }
                  />

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control mb-3"
                    defaultValue={
                      user?.email ||
                      ""
                    }
                  />

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="text"
                    className="form-control mb-3"
                    defaultValue={
                      user?.phoneNumber ||
                      ""
                    }
                    placeholder="91234567"
                  />

                  <div className="mb-3">
                    <label>
                      Profile Picture
                    </label>

                    <input
                      type="file"
                      className="form-control mb-2"
                      accept=".jpg,.jpeg,.png"
                      onChange={(
                        event
                      ) => {
                        const selectedFile =
                          event
                            .target
                            .files?.[0];

                        if (
                          selectedFile
                        ) {
                          setProfilePicture(
                            selectedFile
                          );

                          setProfileMessage(
                            ""
                          );
                        }
                      }}
                    />

                    <Button
                      color="secondary"
                      type="button"
                      onClick={
                        handleSaveProfilePicture
                      }
                      disabled={
                        isSavingProfile
                      }
                    >
                      {isSavingProfile
                        ? "Uploading..."
                        : "Upload Profile Picture"}
                    </Button>
                  </div>

                  {profileMessage && (
                    <div className="alert alert-info">
                      {
                        profileMessage
                      }
                    </div>
                  )}

                  <label>
                    Role
                  </label>

                  <input
                    type="text"
                    className="form-control mb-3"
                    value={
                      user?.role ||
                      "caregiver"
                    }
                    disabled
                    readOnly
                  />

                  {/* GENDER */}

                  <label>
                    Gender
                  </label>

                  <select
                    className="form-control mb-3"
                    value={gender}
                    onChange={(
                      event
                    ) => {
                      setGender(
                        event.target
                          .value
                      );

                      setDetailsMessage(
                        ""
                      );
                    }}
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Male">
                      Male
                    </option>
                  </select>

                  <label>
                    Degree or
                    Qualification
                  </label>

                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Example: Bachelor of Nursing"
                    value={degree}
                    onChange={(
                      event
                    ) =>
                      setDegree(
                        event.target
                          .value
                      )
                    }
                  />

                  <label>
                    Years of
                    Experience
                  </label>

                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Example: 3"
                    min="0"
                    value={
                      experience
                    }
                    onChange={(
                      event
                    ) =>
                      setExperience(
                        event.target
                          .value
                      )
                    }
                  />

                  <label>
                    Location
                  </label>

                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Example: Muscat, Oman"
                      value={location}
                      onChange={(
                        event
                      ) => {
                        setLocation(
                          event.target
                            .value
                        );

                        setLatitude(null);
                        setLongitude(null);
                        setLocationMessage("");
                      }}
                    />

                    <Button
                      color="primary"
                      outline
                      type="button"
                      onClick={
                        handleUseCurrentLocation
                      }
                      disabled={
                        isGettingLocation
                      }
                      style={{
                        borderRadius:
                          "10px",
                      }}
                    >
                      {isGettingLocation
                        ? "Detecting Location..."
                        : "📍 Use Current Location"}
                    </Button>

                    {locationMessage && (
                      <small
                        className="d-block mt-2"
                        style={{
                          color:
                            locationMessage.includes(
                              "successfully"
                            )
                              ? "#198754"
                              : "#6c757d",
                        }}
                      >
                        {locationMessage}
                      </small>
                    )}

                    <small
                      className="d-block mt-1 text-muted"
                      style={{ fontSize: "11px" }}
                    >
                      Location data © OpenStreetMap contributors
                    </small>
                  </div>

                  <label>
                    Bio
                  </label>

                  <textarea
                    className="form-control mb-3"
                    rows="4"
                    placeholder="Write a short description about your caregiving experience."
                    value={bio}
                    onChange={(
                      event
                    ) =>
                      setBio(
                        event.target
                          .value
                      )
                    }
                  />

                  <label className="mb-2 d-block">
                    Languages Spoken
                  </label>

                  <div className="mb-4">
                    {[
                      [
                        "Arabic",
                        "English",
                        "Hindi",
                      ],

                      [
                        "Urdu",
                        "Swahili",
                        "Bengali",
                      ],

                      [
                        "Malayalam",
                        "Tamil",
                        "Filipino (Tagalog)",
                      ],

                      ["Other"],
                    ].map(
                      (
                        row,
                        rowIndex
                      ) => (
                        <div
                          key={
                            rowIndex
                          }
                          style={{
                            display:
                              "grid",

                            gridTemplateColumns:
                              row.length ===
                              1
                                ? "repeat(1, minmax(0, 1fr))"
                                : "repeat(3, minmax(0, 1fr))",

                            gap:
                              "12px",

                            marginBottom:
                              "12px",
                          }}
                        >
                          {row.map(
                            (
                              language
                            ) => {
                              const isSelected =
                                languages.includes(
                                  language
                                );

                              return (
                                <button
                                  key={
                                    language
                                  }
                                  type="button"
                                  onClick={() => {
                                    if (
                                      isSelected
                                    ) {
                                      setLanguages(
                                        (
                                          currentLanguages
                                        ) =>
                                          currentLanguages.filter(
                                            (
                                              item
                                            ) =>
                                              item !==
                                              language
                                          )
                                      );
                                    } else {
                                      setLanguages(
                                        (
                                          currentLanguages
                                        ) => [
                                          ...currentLanguages,
                                          language,
                                        ]
                                      );
                                    }

                                    setDetailsMessage(
                                      ""
                                    );
                                  }}
                                  style={{
                                    display:
                                      "flex",

                                    alignItems:
                                      "center",

                                    justifyContent:
                                      "flex-start",

                                    gap:
                                      "8px",

                                    border:
                                      "none",

                                    background:
                                      "transparent",

                                    padding:
                                      "4px 0",

                                    cursor:
                                      "pointer",

                                    fontSize:
                                      "15px",

                                    textAlign:
                                      "left",
                                  }}
                                >
                                  <span
                                    style={{
                                      width:
                                        "18px",

                                      height:
                                        "18px",

                                      borderRadius:
                                        "50%",

                                      display:
                                        "inline-block",

                                      flexShrink:
                                        0,

                                      backgroundColor:
                                        isSelected
                                          ? "#198754"
                                          : "#ffffff",

                                      border:
                                        isSelected
                                          ? "2px solid #198754"
                                          : "2px solid #adb5bd",
                                    }}
                                  />

                                  <span>
                                    {
                                      language
                                    }
                                  </span>
                                </button>
                              );
                            }
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <label className="mb-2 d-block">
                    Available Days
                  </label>

                  <div className="mb-4">
                    {[
                      [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                      ],

                      [
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ],
                    ].map(
                      (
                        row,
                        rowIndex
                      ) => (
                        <div
                          key={
                            rowIndex
                          }
                          style={{
                            display:
                              "grid",

                            gridTemplateColumns:
                              row.length ===
                              4
                                ? "repeat(4, minmax(0, 1fr))"
                                : "repeat(3, minmax(0, 1fr))",

                            gap:
                              "12px",

                            marginBottom:
                              "12px",
                          }}
                        >
                          {row.map(
                            (day) => {
                              const isSelected =
                                availability.includes(
                                  day
                                );

                              return (
                                <button
                                  key={
                                    day
                                  }
                                  type="button"
                                  onClick={() => {
                                    if (
                                      isSelected
                                    ) {
                                      setAvailability(
                                        (
                                          currentAvailability
                                        ) =>
                                          currentAvailability.filter(
                                            (
                                              item
                                            ) =>
                                              item !==
                                              day
                                          )
                                      );
                                    } else {
                                      setAvailability(
                                        (
                                          currentAvailability
                                        ) => [
                                          ...currentAvailability,
                                          day,
                                        ]
                                      );
                                    }

                                    setDetailsMessage(
                                      ""
                                    );
                                  }}
                                  style={{
                                    display:
                                      "flex",

                                    alignItems:
                                      "center",

                                    gap:
                                      "8px",

                                    border:
                                      "none",

                                    background:
                                      "transparent",

                                    padding:
                                      "4px 0",

                                    cursor:
                                      "pointer",

                                    fontSize:
                                      "15px",

                                    textAlign:
                                      "left",
                                  }}
                                >
                                  <span
                                    style={{
                                      width:
                                        "18px",

                                      height:
                                        "18px",

                                      borderRadius:
                                        "50%",

                                      flexShrink:
                                        0,

                                      backgroundColor:
                                        isSelected
                                          ? "#198754"
                                          : "#ffffff",

                                      border:
                                        isSelected
                                          ? "2px solid #198754"
                                          : "2px solid #adb5bd",
                                    }}
                                  />

                                  <span>
                                    {
                                      day
                                    }
                                  </span>
                                </button>
                              );
                            }
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <label className="mb-2 d-block">
                    Preferred Time
                  </label>

                  <div
                    className="mb-4"
                    style={{
                      display: "grid",

                      gridTemplateColumns:
                        "repeat(3, minmax(0, 1fr))",

                      gap: "12px",
                    }}
                  >
                    {[
                      "Morning",
                      "Afternoon",
                      "Evening",
                    ].map(
                      (time) => {
                        const isSelected =
                          availableTimes.includes(
                            time
                          );

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              if (
                                isSelected
                              ) {
                                setAvailableTimes(
                                  (
                                    currentTimes
                                  ) =>
                                    currentTimes.filter(
                                      (
                                        item
                                      ) =>
                                        item !==
                                        time
                                    )
                                );
                              } else {
                                setAvailableTimes(
                                  (
                                    currentTimes
                                  ) => [
                                    ...currentTimes,
                                    time,
                                  ]
                                );
                              }

                              setDetailsMessage(
                                ""
                              );
                            }}
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "8px",

                              border:
                                "none",

                              background:
                                "transparent",

                              padding:
                                "4px 0",

                              cursor:
                                "pointer",

                              fontSize:
                                "15px",

                              textAlign:
                                "left",
                            }}
                          >
                            <span
                              style={{
                                width:
                                  "18px",

                                height:
                                  "18px",

                                borderRadius:
                                  "50%",

                                flexShrink:
                                  0,

                                backgroundColor:
                                  isSelected
                                    ? "#198754"
                                    : "#ffffff",

                                border:
                                  isSelected
                                    ? "2px solid #198754"
                                    : "2px solid #adb5bd",
                              }}
                            />

                            <span>
                              {
                                time
                              }
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>

                  <hr className="my-4" />

                  <div className="mb-4">
                    <h5 className="mb-3">
                      Professional
                      Certificates
                    </h5>

                    <label>
                      Certificate Name
                    </label>

                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Example: First Aid Certificate"
                      value={
                        certificateName
                      }
                      onChange={(
                        event
                      ) => {
                        setCertificateName(
                          event.target
                            .value
                        );

                        setCertificateMessage(
                          ""
                        );

                        setCertificateMessageType(
                          ""
                        );
                      }}
                    />

                    <label>
                      Certificate File
                    </label>

                    <input
                      ref={
                        certificateFileRef
                      }
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{
                        display:
                          "none",
                      }}
                      onChange={
                        handleCertificateFileChange
                      }
                    />

                    <Button
                      color="secondary"
                      outline
                      type="button"
                      className="w-100 py-3"
                      onClick={() =>
                        certificateFileRef.current?.click()
                      }
                    >
                      <>
                        <FaCloudUploadAlt className="me-2" />

                        Upload
                        Certificate
                      </>
                    </Button>

                    <small className="text-muted d-block mt-2">
                      Accepted formats:
                      PDF, JPG, JPEG,
                      PNG. Maximum size:
                      5 MB.
                    </small>

                    {certificateFile && (
                      <div className="mt-2">
                        Selected file:{" "}
                        <strong>
                          {
                            certificateFile.name
                          }
                        </strong>
                      </div>
                    )}

                    <Button
                      color="success"
                      type="button"
                      className="mt-3"
                      disabled={
                        isUploadingCertificate
                      }
                      onClick={
                        handleAddCertificate
                      }
                    >
                      {isUploadingCertificate
                        ? "Uploading..."
                        : "Add Certificate"}
                    </Button>

                    {certificateMessage && (
                      <div
                        className={`alert mt-3 ${
                          certificateMessageType ===
                          "success"
                            ? "alert-success"
                            : "alert-danger"
                        }`}
                      >
                        {
                          certificateMessage
                        }
                      </div>
                    )}

                    {certificates.length >
                      0 && (
                      <div className="mt-4">
                        <h6>
                          My
                          Certificates
                        </h6>

                        {certificates.map(
                          (
                            certificate
                          ) => (
                            <div
                              key={
                                certificate._id ||
                                certificate.certificateFile
                              }
                              style={{
                                display:
                                  "flex",

                                justifyContent:
                                  "space-between",

                                alignItems:
                                  "center",

                                gap:
                                  "12px",

                                padding:
                                  "14px 18px",

                                marginBottom:
                                  "12px",

                                background:
                                  "#ffffff",

                                border:
                                  "1px solid #dee2e6",

                                borderRadius:
                                  "12px",

                                boxShadow:
                                  "0 2px 6px rgba(0, 0, 0, 0.05)",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  gap:
                                    "10px",

                                  minWidth:
                                    0,
                                }}
                              >
                                {certificate.certificateFile
                                  ?.toLowerCase()
                                  .endsWith(
                                    ".pdf"
                                  ) ? (
                                  <FaFilePdf
                                    title="PDF certificate"
                                    style={{
                                      color:
                                        "#dc3545",

                                      fontSize:
                                        "22px",

                                      flexShrink:
                                        0,
                                    }}
                                  />
                                ) : (
                                  <FaImage
                                    title="Image certificate"
                                    style={{
                                      color:
                                        "#198754",

                                      fontSize:
                                        "22px",

                                      flexShrink:
                                        0,
                                    }}
                                  />
                                )}

                                <strong
                                  style={{
                                    overflowWrap:
                                      "anywhere",
                                  }}
                                >
                                  {
                                    certificate.certificateName
                                  }
                                </strong>
                              </div>

                              <div
                                style={{
                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  gap:
                                    "14px",

                                  flexShrink:
                                    0,
                                }}
                              >
                                <a
                                  href={`http://localhost:3002${certificate.certificateFile}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View certificate"
                                  aria-label={`View ${certificate.certificateName}`}
                                  style={{
                                    display:
                                      "inline-flex",

                                    alignItems:
                                      "center",

                                    justifyContent:
                                      "center",

                                    color:
                                      "#0d6efd",

                                    fontSize:
                                      "20px",

                                    textDecoration:
                                      "none",
                                  }}
                                >
                                  <FaEye />
                                </a>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveCertificate(
                                      certificate._id
                                    )
                                  }
                                  title="Delete certificate"
                                  aria-label={`Delete ${certificate.certificateName}`}
                                  style={{
                                    display:
                                      "inline-flex",

                                    alignItems:
                                      "center",

                                    justifyContent:
                                      "center",

                                    border:
                                      "none",

                                    background:
                                      "transparent",

                                    color:
                                      "#dc3545",

                                    fontSize:
                                      "19px",

                                    cursor:
                                      "pointer",

                                    padding:
                                      0,
                                  }}
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <hr />

                  <h5>
                    Link Patient Account
                  </h5>

                  <p className="text-muted">
                    Enter the code shared
                    by the patient and
                    select your
                    relationship to them.
                  </p>

                  <label>
                    Patient Link Code
                  </label>

                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Example: MM-EA0C1S"
                    value={
                      patientLinkCode
                    }
                    onChange={(
                      event
                    ) => {
                      setPatientLinkCode(
                        event.target.value.toUpperCase()
                      );

                      setLinkMessage(
                        ""
                      );

                      setLinkMessageType(
                        ""
                      );
                    }}
                  />

                  <Button
                    color="primary"
                    outline
                    type="button"
                    className="mb-3"
                    onClick={
                      handlePreviewPatient
                    }
                    disabled={
                      isLoadingPreview
                    }
                  >
                    {isLoadingPreview
                      ? "Loading Preview..."
                      : "Preview Patient"}
                  </Button>

                  {previewMessage && (
                    <div className="alert alert-danger">
                      {
                        previewMessage
                      }
                    </div>
                  )}

                  {patientPreview && (
                    <Card className="mb-4 border">
                      <CardBody>
                        <div className="d-flex align-items-center mb-3">
                          <img
                            src={
                              patientPreview.profilePicture
                                ? `http://localhost:3002${patientPreview.profilePicture}`
                                : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            }
                            alt={
                              patientPreview.name ||
                              "Patient"
                            }
                            style={{
                              width:
                                "65px",

                              height:
                                "65px",

                              borderRadius:
                                "50%",

                              objectFit:
                                "cover",

                              marginRight:
                                "15px",

                              border:
                                "2px solid #dee2e6",
                            }}
                          />

                          <div>
                            <h5 className="mb-1">
                              {patientPreview.name ||
                                "Patient"}
                            </h5>

                            <p className="text-muted mb-0">
                              Limited patient
                              preview
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <strong>
                            Medical
                            Conditions
                          </strong>

                          {patientPreview
                            .medicalConditions
                            ?.length >
                          0 ? (
                            <div
                              className="mt-2"
                              style={{
                                display:
                                  "flex",

                                flexWrap:
                                  "wrap",

                                gap:
                                  "8px",
                              }}
                            >
                              {patientPreview.medicalConditions.map(
                                (
                                  condition
                                ) => (
                                  <span
                                    key={
                                      condition
                                    }
                                    className="badge bg-light text-dark border"
                                    style={{
                                      padding:
                                        "8px 12px",

                                      fontSize:
                                        "13px",
                                    }}
                                  >
                                    {
                                      condition
                                    }
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-muted mt-2 mb-0">
                              No medical
                              conditions
                              provided.
                            </p>
                          )}
                        </div>

                        <Row>
                          <Col md="6">
                            <strong>
                              Current
                              Medications
                            </strong>

                            <p className="text-muted mb-0">
                              {patientPreview.activeMedicationCount ??
                                0}
                            </p>
                          </Col>

                          <Col md="6">
                            <strong>
                              Uploaded
                              Prescriptions
                            </strong>

                            <p className="text-muted mb-0">
                              {patientPreview.prescriptionCount ??
                                0}
                            </p>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  )}

                  <label>
                    Relationship to
                    Patient
                  </label>

                  <select
                    className="form-control mb-3"
                    value={
                      relationship
                    }
                    onChange={(
                      event
                    ) => {
                      setRelationship(
                        event.target.value
                      );

                      setOtherRelationship(
                        ""
                      );

                      setLinkMessage(
                        ""
                      );

                      setLinkMessageType(
                        ""
                      );
                    }}
                  >
                    <option value="">
                      Select
                      Relationship
                    </option>

                    <option value="Parent">
                      Parent
                    </option>

                    <option value="Son">
                      Son
                    </option>

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
                      Professional
                      Caregiver
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                  {relationship ===
                    "Other" && (
                    <>
                      <label>
                        Specify
                        Relationship
                      </label>

                      <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Enter relationship"
                        value={
                          otherRelationship
                        }
                        onChange={(
                          event
                        ) => {
                          setOtherRelationship(
                            event
                              .target
                              .value
                          );

                          setLinkMessage(
                            ""
                          );

                          setLinkMessageType(
                            ""
                          );
                        }}
                      />
                    </>
                  )}

                  <Button
                    color="success"
                    type="button"
                    className="mb-3"
                    onClick={
                      handleLinkPatient
                    }
                    disabled={
                      isSendingLink
                    }
                  >
                    {isSendingLink
                      ? "Sending Request..."
                      : "Send Link Request"}
                  </Button>

                  {linkMessage && (
                    <div
                      className={
                        linkMessageType ===
                        "success"
                          ? "alert alert-success"
                          : "alert alert-danger"
                      }
                    >
                      {
                        linkMessage
                      }
                    </div>
                  )}

                  <Button
                    color="primary"
                    type="button"
                    className="w-100"
                    onClick={
                      handleSaveDetails
                    }
                    disabled={
                      isSavingDetails
                    }
                  >
                    {isSavingDetails
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>

                  {detailsMessage && (
                    <div
                      className={`alert mt-3 ${
                        detailsMessage
                          .toLowerCase()
                          .includes(
                            "success"
                          )
                          ? "alert-success"
                          : "alert-danger"
                      }`}
                    >
                      {
                        detailsMessage
                      }
                    </div>
                  )}
                </CardBody>
              </Card>
            </>
          )}

          {activePage ===
            "notification" && (
            <>
              <h2>
                Notification Settings
              </h2>

              <Card>
                <CardBody>
                  <select className="form-control mb-3">
                    <option>
                      Enable Medication
                      Reminder Alerts
                    </option>

                    <option>
                      Enable Missed Dose
                      Alerts
                    </option>

                    <option>
                      Disable
                      Notifications
                    </option>
                  </select>

                  <Button
                    color="primary"
                    className="w-100"
                  >
                    Save
                  </Button>
                </CardBody>
              </Card>
            </>
          )}

          {activePage ===
            "language" && (
            <>
              <h2>
                Language
              </h2>

              <Card>
                <CardBody>
                  <select className="form-control">
                    <option>
                      English
                    </option>

                    <option>
                      Arabic
                    </option>
                  </select>
                </CardBody>
              </Card>
            </>
          )}

          {activePage ===
            "theme" && (
            <>
              <h2>
                Theme
              </h2>

              <Card>
                <CardBody>
                  <select className="form-control">
                    <option>
                      Light Mode
                    </option>

                    <option>
                      Dark Mode
                    </option>
                  </select>
                </CardBody>
              </Card>
            </>
          )}

          {activePage ===
            "security" && (
            <>
              <h2>
                Security
              </h2>

              <Card>
                <CardBody>
                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Current Password"
                  />

                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="New Password"
                  />

                  <Button
                    color="primary"
                    className="w-100"
                  >
                    Change Password
                  </Button>
                </CardBody>
              </Card>
            </>
          )}

          {activePage ===
            "about" && (
            <>
              <h2>
                About MediMind
              </h2>

              <Card>
                <CardBody>
                  <p
                    style={{
                      fontSize:
                        "16px",

                      lineHeight:
                        "1.8",
                    }}
                  >
                    MediMind is a smart
                    web-based medication
                    reminder system that
                    helps users take
                    their medicines on
                    time. It provides
                    personalized
                    reminders, tracks
                    medication intake,
                    and generates
                    adherence reports.
                  </p>

                  <p
                    style={{
                      fontSize:
                        "16px",

                      lineHeight:
                        "1.8",
                    }}
                  >
                    Caregivers can
                    monitor linked
                    patients, view
                    reports, and receive
                    alerts for missed
                    medication doses.
                  </p>

                  <p>
                    <strong>
                      Version:
                    </strong>{" "}
                    1.0
                  </p>

                  <p>
                    <strong>
                      Year:
                    </strong>{" "}
                    2026
                  </p>

                  <h5>
                    Developed by:
                  </h5>

                  <ul>
                    <li>
                      Sheikha Qasim
                      Al-Qusaimi —
                      16s18247
                    </li>

                    <li>
                      Rawan Salim
                      Al-Hosni —
                      16s18120
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </>
          )}

          {activePage ===
            "feedback" && (
            <>
              <h2>
                Feedback
              </h2>

              <Card
                style={{
                  maxWidth:
                    "600px",
                }}
              >
                <CardBody>
                  <label>
                    Your Name
                  </label>

                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter your name"
                  />

                  <label>
                    Your Email
                  </label>

                  <input
                    type="email"
                    className="form-control mb-3"
                  />

                  <label>
                    Your Feedback
                  </label>

                  <textarea
                    className="form-control mb-3"
                    rows="4"
                    placeholder="Tell us what you think..."
                  />

                  <div className="mb-3">
                    <span
                      style={{
                        fontSize:
                          "28px",

                        color:
                          "#9ca3af",
                      }}
                    >
                      ★★★★★
                    </span>

                    <span
                      style={{
                        marginLeft:
                          "10px",

                        textDecoration:
                          "underline",
                      }}
                    >
                      Select Rating
                    </span>
                  </div>

                  <Button
                    color="primary"
                    className="w-100"
                  >
                    Send Feedback
                  </Button>
                </CardBody>
              </Card>
            </>
          )}
        </Col>
      </Row>

      <Footer />
    </Container>
  );
};

export default CaregiverSettings;