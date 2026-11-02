import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
} from "reactstrap";

import { useState } from "react";

import {
  useSelector,
  useDispatch,
} from "react-redux";

import axios from "axios";

import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

import {
  updateUser,
} from "../features/UserSlice";

const ProfileSettings = () => {
  const user = useSelector(
    (state) => state.user.user
  );

  const dispatch = useDispatch();

  const [name, setName] = useState(
    user?.name || ""
  );

  const [phoneNumber, setPhoneNumber] =
    useState(
      user?.phoneNumber || ""
    );

  const [age, setAge] = useState(
    user?.age ?? ""
  );

  const [height, setHeight] = useState(
    user?.height ?? ""
  );

  const [weight, setWeight] = useState(
    user?.weight ?? ""
  );

  const [bloodType, setBloodType] =
    useState(
      user?.bloodType || ""
    );

  const [
    allergiesInput,
    setAllergiesInput,
  ] = useState(
    Array.isArray(
      user?.allergies
    )
      ? user.allergies.join(", ")
      : ""
  );

  const [
    emergencyContact,
    setEmergencyContact,
  ] = useState(
    user?.emergencyContact || ""
  );

  const [location, setLocation] =
    useState(
      user?.location || ""
    );

  const [
    latitude,
    setLatitude,
  ] = useState(
    user?.latitude ?? null
  );

  const [
    longitude,
    setLongitude,
  ] = useState(
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

  const [
    profilePicture,
    setProfilePicture,
  ] = useState(null);

  const [
    profileMessage,
    setProfileMessage,
  ] = useState("");

  const [
    profileMessageType,
    setProfileMessageType,
  ] = useState("");

  const [
    isSavingProfile,
    setIsSavingProfile,
  ] = useState(false);

  const [
    isSavingDetails,
    setIsSavingDetails,
  ] = useState(false);

  const clearMessage = () => {
    setProfileMessage("");
    setProfileMessageType("");
  };

  const handleUseCurrentLocation =
    () => {
      setLocationMessage("");

      if (
        !navigator.geolocation
      ) {
        setLocationMessage(
          "Geolocation is not supported by this browser."
        );

        return;
      }

      setIsGettingLocation(
        true
      );

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLatitude =
            position.coords
              .latitude;

          const currentLongitude =
            position.coords
              .longitude;

          setLatitude(
            currentLatitude
          );

          setLongitude(
            currentLongitude
          );

          try {
            const response =
              await axios.get(
                "https://nominatim.openstreetmap.org/reverse",
                {
                  params: {
                    lat:
                      currentLatitude,

                    lon:
                      currentLongitude,

                    format:
                      "jsonv2",

                    addressdetails:
                      1,
                  },

                  headers: {
                    "Accept-Language":
                      "en",
                  },
                }
              );

            const address =
              response.data
                ?.address || {};

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

            const readableLocation =
              [
                city,
                state,
                country,
              ]
                .filter(Boolean)
                .filter(
                  (
                    item,
                    index,
                    array
                  ) =>
                    array.indexOf(
                      item
                    ) === index
                )
                .join(", ");

            setLocation(
              readableLocation ||
                response.data
                  ?.display_name ||
                `${currentLatitude.toFixed(
                  5
                )}, ${currentLongitude.toFixed(
                  5
                )}`
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
              )}, ${currentLongitude.toFixed(
                5
              )}`
            );

            setLocationMessage(
              "Coordinates detected successfully. The location name could not be loaded."
            );
          } finally {
            setIsGettingLocation(
              false
            );
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

          setIsGettingLocation(
            false
          );
        },

        {
          enableHighAccuracy:
            true,

          timeout: 10000,

          maximumAge:
            60000,
        }
      );
    };

  const handleSaveProfilePicture =
    async () => {
      clearMessage();

      if (!user?.email) {
        setProfileMessage(
          "Please log in again."
        );

        setProfileMessageType(
          "error"
        );

        return;
      }

      if (!profilePicture) {
        setProfileMessage(
          "Please select a profile picture."
        );

        setProfileMessageType(
          "error"
        );

        return;
      }

      try {
        setIsSavingProfile(
          true
        );

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

        setProfileMessageType(
          "success"
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

        setProfileMessageType(
          "error"
        );
      } finally {
        setIsSavingProfile(
          false
        );
      }
    };

  const handleSaveDetails =
    async () => {
      clearMessage();

      if (!user?.email) {
        setProfileMessage(
          "Please log in again."
        );

        setProfileMessageType(
          "error"
        );

        return;
      }

      if (!name.trim()) {
        setProfileMessage(
          "Please enter your name."
        );

        setProfileMessageType(
          "error"
        );

        return;
      }

      if (
        !phoneNumber.trim()
      ) {
        setProfileMessage(
          "Please enter your phone number."
        );

        setProfileMessageType(
          "error"
        );

        return;
      }

      const numericFields = [
        ["Age", age],
        ["Height", height],
        ["Weight", weight],
      ];

      for (
        const [
          label,
          value,
        ] of numericFields
      ) {
        if (
          value !== "" &&
          (Number.isNaN(
            Number(value)
          ) ||
            Number(value) <
              0)
        ) {
          setProfileMessage(
            `Please enter a valid ${label.toLowerCase()}.`
          );

          setProfileMessageType(
            "error"
          );

          return;
        }
      }

      const allergies =
        allergiesInput
          .split(",")
          .map((allergy) =>
            allergy.trim()
          )
          .filter(Boolean);

      try {
        setIsSavingDetails(
          true
        );

        const response =
          await axios.put(
            "http://localhost:3002/patient/profile",
            {
              email:
                user.email,

              name:
                name.trim(),

              phoneNumber:
                phoneNumber.trim(),

              age,

              height,

              weight,

              bloodType,

              allergies,

              emergencyContact:
                emergencyContact.trim(),

              location,

              latitude,

              longitude,
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

        setProfileMessage(
          response.data?.message ||
            "Patient profile updated successfully."
        );

        setProfileMessageType(
          "success"
        );
      } catch (error) {
        console.error(
          "Patient profile update error:",
          error
        );

        setProfileMessage(
          error.response?.data
            ?.message ||
            "Unable to update patient profile."
        );

        setProfileMessageType(
          "error"
        );
      } finally {
        setIsSavingDetails(
          false
        );
      }
    };

  const handleCopyCode =
    async () => {
      clearMessage();

      if (
        !user?.patientLinkCode
      ) {
        setProfileMessage(
          "No invitation code is available."
        );

        setProfileMessageType(
          "error"
        );

        return;
      }

      try {
        await navigator.clipboard.writeText(
          user.patientLinkCode
        );

        setProfileMessage(
          "Invitation code copied successfully."
        );

        setProfileMessageType(
          "success"
        );
      } catch (error) {
        console.error(
          "Copy invitation code error:",
          error
        );

        setProfileMessage(
          "Unable to copy the invitation code."
        );

        setProfileMessageType(
          "error"
        );
      }
    };

  return (
    <Container
      fluid
      className="dashboard-page"
    >
      <Header />

      <Row
        style={{
          minHeight: "85vh",
        }}
      >
        <Col
          md="2"
          className="settings-sidebar"
        >
          <SettingsSidebar />
        </Col>

        <Col
          md="9"
          className="p-5"
        >
          <h2>
            Profile Settings
          </h2>

          <Card>
            <CardBody>
              <label>
                Username
              </label>

              <input
                type="text"
                className="form-control mb-3"
                value={name}
                onChange={(
                  event
                ) => {
                  setName(
                    event.target
                      .value
                  );

                  clearMessage();
                }}
              />

              <label>
                Age
              </label>

              <input
                type="number"
                className="form-control mb-3"
                placeholder="24"
                min="0"
                value={age}
                onChange={(
                  event
                ) => {
                  setAge(
                    event.target
                      .value
                  );

                  clearMessage();
                }}
              />

              <label>
                Height{" "}
                <small>
                  (cm)
                </small>
              </label>

              <input
                type="number"
                className="form-control mb-3"
                placeholder="162"
                min="0"
                value={height}
                onChange={(
                  event
                ) => {
                  setHeight(
                    event.target
                      .value
                  );

                  clearMessage();
                }}
              />

              <label>
                Weight{" "}
                <small>
                  (kg)
                </small>
              </label>

              <input
                type="number"
                className="form-control mb-3"
                placeholder="64"
                min="0"
                value={weight}
                onChange={(
                  event
                ) => {
                  setWeight(
                    event.target
                      .value
                  );

                  clearMessage();
                }}
              />

              <label>
                Blood Type
              </label>

              <select
                className="form-control mb-3"
                value={
                  bloodType
                }
                onChange={(
                  event
                ) => {
                  setBloodType(
                    event.target
                      .value
                  );

                  clearMessage();
                }}
              >
                <option value="">
                  Select Blood
                  Type
                </option>

                <option value="A+">
                  A+
                </option>

                <option value="A-">
                  A-
                </option>

                <option value="B+">
                  B+
                </option>

                <option value="B-">
                  B-
                </option>

                <option value="AB+">
                  AB+
                </option>

                <option value="AB-">
                  AB-
                </option>

                <option value="O+">
                  O+
                </option>

                <option value="O-">
                  O-
                </option>

                <option value="Unknown">
                  Unknown
                </option>
              </select>

              <label>
                Allergies
              </label>

              <input
                type="text"
                className="form-control mb-2"
                placeholder="Example: Penicillin, Peanuts"
                value={
                  allergiesInput
                }
                onChange={(
                  event
                ) => {
                  setAllergiesInput(
                    event.target
                      .value
                  );

                  clearMessage();
                }}
              />

              <small className="text-muted d-block mb-3">
                Separate multiple
                allergies with commas.
              </small>

              <label>
                Emergency Contact
              </label>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Example: 91234567"
                value={
                  emergencyContact
                }
                onChange={(
                  event
                ) => {
                  setEmergencyContact(
                    event.target
                      .value
                  );

                  clearMessage();
                }}
              />

              <label>
                Email
              </label>

              <input
                type="email"
                className="form-control mb-3"
                value={
                  user?.email || ""
                }
                disabled
                readOnly
              />

              <label>
                Phone Number
              </label>

              <input
                type="text"
                className="form-control mb-3"
                value={
                  phoneNumber
                }
                onChange={(
                  event
                ) => {
                  setPhoneNumber(
                    event.target
                      .value
                  );

                  clearMessage();
                }}
              />

              <label>
                Location
              </label>

              <div className="mb-3">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Example: Muscat, Oman"
                  value={
                    location
                  }
                  onChange={(
                    event
                  ) => {
                    setLocation(
                      event.target
                        .value
                    );

                    setLatitude(
                      null
                    );

                    setLongitude(
                      null
                    );

                    setLocationMessage(
                      ""
                    );

                    clearMessage();
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
                    {
                      locationMessage
                    }
                  </small>
                )}

                <small
                  className="d-block mt-1 text-muted"
                  style={{
                    fontSize:
                      "11px",
                  }}
                >
                  Location data ©
                  OpenStreetMap
                  contributors
                </small>
              </div>

              <hr className="my-4" />

              <h5 className="mb-2">
                Connect with a
                Caregiver
              </h5>

              <p className="text-muted mb-3">
                Share this invitation
                code with a family
                member, friend, or
                trusted caregiver who
                already knows you.
                They can use it to send
                you a connection
                request.
              </p>

              <label className="mb-2">
                Your Caregiver
                Invitation Code
              </label>

              <div
                className="d-flex align-items-center mb-2"
                style={{
                  border:
                    "1px solid #dee2e6",

                  borderRadius:
                    "10px",

                  padding:
                    "12px 14px",

                  backgroundColor:
                    "#f8f9fa",

                  gap:
                    "12px",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontWeight:
                      "600",

                    letterSpacing:
                      "1px",

                    fontSize:
                      "16px",
                  }}
                >
                  {user?.patientLinkCode ||
                    "No invitation code available"}
                </span>

                <Button
                  color="primary"
                  outline
                  size="sm"
                  type="button"
                  disabled={
                    !user?.patientLinkCode
                  }
                  onClick={
                    handleCopyCode
                  }
                >
                  Copy Code
                </Button>
              </div>

              <small className="text-muted d-block mb-1">
                Sharing this code does
                not give the caregiver
                immediate access to
                your account.
              </small>

              <small className="text-muted d-block mb-4">
                You will receive a
                request and can review
                the caregiver's profile
                before accepting or
                rejecting it.
              </small>

              <hr className="my-4" />

              <label>
                Profile Picture
              </label>

              <input
                type="file"
                className="form-control mb-3"
                accept=".jpg,.jpeg,.png"
                onChange={(
                  event
                ) => {
                  const selectedFile =
                    event.target
                      .files?.[0];

                  if (
                    selectedFile
                  ) {
                    setProfilePicture(
                      selectedFile
                    );

                    clearMessage();
                  }
                }}
              />

              <Button
                color="secondary"
                type="button"
                className="w-100 mb-3"
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

              <label>
                Role
              </label>

              <input
                type="text"
                className="form-control mb-3"
                value={
                  user?.role ||
                  "patient"
                }
                disabled
                readOnly
              />

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

              {profileMessage && (
                <div
                  className={`alert mt-3 ${
                    profileMessageType ===
                    "success"
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {
                    profileMessage
                  }
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileSettings;