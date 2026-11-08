import { Card, CardBody, Button } from "reactstrap";

import { useEffect, useState } from "react";

import {
  useSelector,
  useDispatch,
} from "react-redux";

import axios from "axios";


import {
  updateUser,
} from "../features/UserSlice";

const ProfileSettings = () => {
  const [uiLanguage, setUiLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );
  const isArabic = uiLanguage === "ar";
  const t = (en, ar) => isArabic ? ar : en;

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
  const [locationSuccess, setLocationSuccess] = useState(false);

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
      setLocationSuccess(false);

      if (
        !navigator.geolocation
      ) {
        setLocationMessage(
          t('Geolocation is not supported by this browser.', 'المتصفح لا يدعم تحديد الموقع.')
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

            setLocationSuccess(true);
            setLocationMessage(
              t('Location detected successfully.', 'تم تحديد الموقع بنجاح.')
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
              t('Coordinates detected successfully. The location name could not be loaded.', 'تم تحديد الإحداثيات بنجاح، لكن تعذر تحميل اسم الموقع.')
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
              t('Location permission was denied.', 'تم رفض إذن الوصول إلى الموقع.')
            );
          } else if (
            error.code ===
            error.POSITION_UNAVAILABLE
          ) {
            setLocationMessage(
              t('Your current location is unavailable.', 'موقعك الحالي غير متاح.')
            );
          } else if (
            error.code ===
            error.TIMEOUT
          ) {
            setLocationMessage(
              t('Location request timed out.', 'انتهت مهلة طلب الموقع.')
            );
          } else {
            setLocationMessage(
              t('Unable to detect your current location.', 'تعذر تحديد موقعك الحالي.')
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
          t('Please log in again.', 'يرجى تسجيل الدخول مجددًا.')
        );

        setProfileMessageType(
          "error"
        );

        return;
      }

      if (!profilePicture) {
        setProfileMessage(
          t('Please select a profile picture.', 'يرجى اختيار صورة شخصية.')
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
          t('Profile picture updated successfully.', 'تم تحديث الصورة الشخصية بنجاح.')
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
          t('Unable to upload profile picture.', 'تعذر رفع الصورة الشخصية.')
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
          t('Please log in again.', 'يرجى تسجيل الدخول مجددًا.')
        );

        setProfileMessageType(
          "error"
        );

        return;
      }

      if (!name.trim()) {
        setProfileMessage(
          t('Please enter your name.', 'يرجى إدخال الاسم.')
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
          t('Please enter your phone number.', 'يرجى إدخال رقم الهاتف.')
        );

        setProfileMessageType(
          "error"
        );

        return;
      }

      
      // Validate patient age.
      if (
        age !== "" &&
        (
          !Number.isInteger(Number(age)) ||
          Number(age) < 0 ||
          Number(age) > 120
        )
      ) {
        setProfileMessage(
          t('Please enter a valid age between 0 and 120 (whole numbers only).', 'يرجى إدخال عمر صحيح بين 0 و120 (أرقام صحيحة فقط).')
        );

        setProfileMessageType("error");
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
            t(`Please enter a valid ${label.toLowerCase()}.`,
              `يرجى إدخال قيمة صحيحة لـ ${({Age:"العمر", Height:"الطول", Weight:"الوزن"})[label] || label}.`)
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
          t('Patient profile updated successfully.', 'تم تحديث الملف الشخصي بنجاح.')
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
          t('Unable to update patient profile.', 'تعذر تحديث الملف الشخصي.')
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
          t('No invitation code is available.', 'لا يوجد رمز دعوة متاح.')
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
          t('Invitation code copied successfully.', 'تم نسخ رمز الدعوة بنجاح.')
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
          t('Unable to copy the invitation code.', 'تعذر نسخ رمز الدعوة.')
        );

        setProfileMessageType(
          "error"
        );
      }
    };

  return (
    <div
      className="profile-settings-page"
      dir={isArabic ? "rtl" : "ltr"}
    >

      <style>{`
        .profile-settings-page { font-size: 16px; width: 100%; min-width: 0; box-sizing: border-box; }
        .profile-settings-page label { display: block; font-weight: 600; margin-bottom: 6px; }
        .profile-settings-page .form-control { font-size: 15px; min-height: 42px; }
        .profile-settings-page h2 { font-size: 30px; font-weight: 700; margin-bottom: 22px; }
        .profile-settings-page .text-muted { font-size: 14px; }
        .profile-settings-page[dir="rtl"] { text-align: right; }
        .profile-settings-page[dir="rtl"] input:not([type="email"]):not([type="number"]) { text-align: right; }
        .profile-settings-page[dir="rtl"] input[type="email"],
        .profile-settings-page[dir="rtl"] input[type="number"] { direction: ltr; text-align: left; }
        body.dark-theme .profile-settings-page { --ps-code-bg: #21374e; }
        body.dark-theme .profile-settings-page .form-control {
          background-color: #21374e !important;
          color: #f1f5f9 !important;
          border-color: #48627c !important;
        }
        body.dark-theme .profile-settings-page .form-control::placeholder { color: #b8c8d8; }
        body.dark-theme .profile-settings-page .form-control:disabled { opacity: .8; }
        body.dark-theme .profile-settings-page .text-muted { color: #c1cedd !important; }
        body.dark-theme .profile-settings-page .card { background-color: #17283a; color: #f1f5f9; border-color: #31475f; }
      `}</style>
          <h2>{t('Profile Settings', 'إعدادات الملف الشخصي')}</h2>

          <Card>
            <CardBody>
              <label>{t('Username', 'اسم المستخدم')}</label>

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

              <label>{t('Age', 'العمر')}</label>

              <input
                type="number"
                className="form-control mb-3"
                placeholder="24"
                min="0"
                max="120"
                step="1"
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
  {t("Height", "الطول")}{" "}
  <small>({t("cm", "سم")})</small>
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
  {t("Weight", "الوزن")}{" "}
  <small>({t("kg", "كجم")})</small>
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

              <label>{t('Blood Type', 'فصيلة الدم')}</label>

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
                <option value="">{t('Select Blood Type', 'اختر فصيلة الدم')}</option>

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

                <option value="Unknown">{t('Unknown', 'غير معروف')}</option>
              </select>

              <label>{t('Allergies', 'الحساسية')}</label>

              <input
                type="text"
                className="form-control mb-2"
                placeholder={t('Example: Penicillin, Peanuts', 'مثال: البنسلين، الفول السوداني')}
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

              <small className="text-muted d-block mb-3">{t('Separate multiple allergies with commas.', 'افصل بين أنواع الحساسية باستخدام الفواصل.')}</small>

              <label>{t('Emergency Contact', 'جهة الاتصال للطوارئ')}</label>

              <input
                type="text"
                className="form-control mb-3"
                placeholder={t('Example: 91234567', 'مثال: 91234567')}
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

              <label>{t('Email', 'البريد الإلكتروني')}</label>

              <input
                type="email"
                className="form-control mb-3"
                value={
                  user?.email || ""
                }
                disabled
                readOnly
              />

              <label>{t('Phone Number', 'رقم الهاتف')}</label>

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

              <label>{t('Location', 'الموقع')}</label>

              <div className="mb-3">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder={t('Example: Muscat, Oman', 'مثال: مسقط، عُمان')}
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
                    ? t('Detecting Location...', 'جارٍ تحديد الموقع...')
                    : t('📍 Use Current Location', '📍 استخدام الموقع الحالي')}
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
                >{t('Location data © OpenStreetMap contributors', 'بيانات الموقع © مساهمو OpenStreetMap')}</small>
              </div>

              <hr className="my-4" />

              <h5 className="mb-2">{t('Connect with a Caregiver', 'الارتباط بمقدم رعاية')}</h5>

              <p className="text-muted mb-3">{t('Share this invitation code with a family member, friend, or trusted caregiver who already knows you. They can use it to send you a connection request.', 'شارك رمز الدعوة هذا مع أحد أفراد العائلة أو صديق أو مقدم رعاية موثوق يعرفك. يمكنه استخدامه لإرسال طلب ارتباط إليك.')}</p>

              <label className="mb-2">{t('Your Caregiver Invitation Code', 'رمز دعوة مقدم الرعاية الخاص بك')}</label>

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

                      color: "#1e293b",
direction: "ltr",
textAlign: "center",
                  }}
                >
                  {user?.patientLinkCode ||
                    t('No invitation code available', 'لا يوجد رمز دعوة متاح')}
                </span>

                <Button
                  color="primary"
                  size="sm"
                  type="button"
                  disabled={
                    !user?.patientLinkCode
                  }
                  onClick={
                    handleCopyCode
                  }
                >{t('Copy Code', 'نسخ الرمز')}</Button>
              </div>

              <small className="text-muted d-block mb-1">{t('Sharing this code does not give the caregiver immediate access to your account.', 'مشاركة هذا الرمز لا تمنح مقدم الرعاية وصولًا فوريًا إلى حسابك.')}</small>

              <small className="text-muted d-block mb-4">{t("You will receive a request and can review the caregiver's profile before accepting or rejecting it.", 'سيصلك طلب ويمكنك مراجعة الملف الشخصي لمقدم الرعاية قبل قبوله أو رفضه.')}</small>

              <hr className="my-4" />

              <label>{t('Profile Picture', 'الصورة الشخصية')}</label>

             <div className="mb-3">
  <label
    htmlFor="profile-picture-upload"
    className="btn btn-outline-primary"
    style={{ cursor: "pointer" }}
  >
    {t("Choose Picture", "اختيار صورة")}
  </label>

  <input
    id="profile-picture-upload"
    type="file"
    accept=".jpg,.jpeg,.png"
    style={{ display: "none" }}
    onChange={(event) => {
      const selectedFile = event.target.files?.[0];

      if (selectedFile) {
        setProfilePicture(selectedFile);
        clearMessage();
      }
    }}
  />

  <span className="mx-3">
    {profilePicture
      ? profilePicture.name
      : t("No file selected", "لم يتم اختيار ملف")}
  </span>
</div>

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
                  ? t('Uploading...', 'جارٍ الرفع...')
                  : t('Upload Profile Picture', 'رفع الصورة الشخصية')}
              </Button>

              <label>{t('Role', 'الدور')}</label>

              <input
                type="text"
                className="form-control mb-3"
                value={
  isArabic
    ? (
        {
          patient: "مريض",
          caregiver: "مقدم رعاية",
          admin: "مسؤول",
        }[user?.role] || user?.role || "مريض"
      )
    : (user?.role || "patient")
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
                  ? t('Saving...', 'جارٍ الحفظ...')
                  : t('Save Changes', 'حفظ التغييرات')}
              </Button>

              {profileMessage && (
                <div
                  className={`alert mt-3 ${profileMessageType ===
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
          
    </div>
    
  );
  
};

export default ProfileSettings;
