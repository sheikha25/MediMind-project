import { useState, useRef, useEffect } from "react";

import {
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




// Values saved to the database stay in English so caregiver search filters remain consistent.
const LANGUAGE_OPTIONS = [
  "Arabic",
  "English",
  "Hindi",
  "Urdu",
  "Malayalam",
  "Bengali",
  "Swahili",
  "Filipino (Tagalog)",
  "Turkish",
];

const ARABIC_LANGUAGE_LABELS = {
  Arabic: "العربية",
  English: "الإنجليزية",
  Hindi: "الهندية",
  Urdu: "الأوردية",
  Malayalam: "المالايالامية",
  Bengali: "البنغالية",
  Swahili: "السواحيلية",
  "Filipino (Tagalog)": "الفلبينية (تاغالوغ)",
  Turkish: "التركية",
};

const CaregiverProfileSettings = () => {
  const dispatch = useDispatch();
  const [language, setLanguage] = useState(() => localStorage.getItem("medimindLanguage") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("medimind-theme") || "light");
  const isArabic = language === "ar";
  useEffect(() => {
    const sync = () => {
      setLanguage(localStorage.getItem("medimindLanguage") || "en");
      setTheme(localStorage.getItem("medimind-theme") || "light");
    };
    window.addEventListener("storage", sync);
    window.addEventListener("medimind-language-change", sync);
    window.addEventListener("medimindLanguageChanged", sync);
    window.addEventListener("medimind-theme-change", sync);
    window.addEventListener("medimindThemeChanged", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("medimind-language-change", sync);
      window.removeEventListener("medimindLanguageChanged", sync);
      window.removeEventListener("medimind-theme-change", sync);
      window.removeEventListener("medimindThemeChanged", sync);
    };
  }, []);


  const user = useSelector(
    (state) => state.user.user
  );


  const [
    profilePicture,
    setProfilePicture,
  ] = useState(null);

  const profilePictureUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `http://localhost:3002${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const [
    profilePreview,
    setProfilePreview,
  ] = useState(() => profilePictureUrl(user?.profilepic));

  useEffect(() => {
    if (!profilePicture) {
      setProfilePreview(profilePictureUrl(user?.profilepic));
      return;
    }
    const objectUrl = URL.createObjectURL(profilePicture);
    setProfilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePicture, user?.profilepic]);

  // Hydrate the editable form only when the logged-in caregiver changes.
  // Updating certificates or profile photo must not erase unsaved edits.
  useEffect(() => {
    if (!user?.email) return;
    setGender(user?.gender || "");
    setDegree(user?.degree || "");
    setExperience(user?.experience ?? "");
    setLocation(user?.location || "");
    setLatitude(user?.latitude ?? null);
    setLongitude(user?.longitude ?? null);
    setBio(user?.bio || "");
    const savedLanguages = Array.isArray(user?.languages) ? user.languages : [];
    // Older profiles may have stored the "Other" placeholder; never save it as a language.
    setLanguages(savedLanguages.filter((item) => item !== "Other"));
    setShowOtherLanguage(
      savedLanguages.some((item) => !LANGUAGE_OPTIONS.includes(item))
    );
    setAvailability(Array.isArray(user?.availability) ? user.availability : []);
    setAvailableTimes(Array.isArray(user?.availableTimes) ? user.availableTimes : []);
    setCertificates(Array.isArray(user?.certificates) ? user.certificates : []);
  }, [user?.email]);

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

  const [showOtherLanguage, setShowOtherLanguage] = useState(() =>
    Array.isArray(user?.languages) &&
    user.languages.some((item) => !LANGUAGE_OPTIONS.includes(item))
  );
  const [languageError, setLanguageError] = useState("");

  const customLanguages = languages.filter(
    (item) => item !== "Other" && !LANGUAGE_OPTIONS.includes(item)
  );
  const otherSelected = showOtherLanguage || customLanguages.length > 0;

  const addCustomLanguage = () => {
    const newLanguage = languageInput.trim();
    if (!newLanguage) return;
    if (newLanguage.length > 50) {
      setLanguageError(isArabic
        ? "يجب ألا يتجاوز اسم اللغة 50 حرفًا."
        : "Language name must be 50 characters or fewer.");
      return;
    }
    if (newLanguage.toLowerCase() === "other" ||
        languages.some((item) => item.toLowerCase() === newLanguage.toLowerCase())) {
      setLanguageError(isArabic ? "هذه اللغة مضافة بالفعل." : "This language is already selected.");
      return;
    }
    setLanguages((current) => [...current, newLanguage]);
    setLanguageInput("");
    setLanguageError("");
    setDetailsMessage("");
  };

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

  const handleSaveProfilePicture =
    async () => {
      setProfileMessage("");

      if (!user?.email) {
        setProfileMessage(
          (isArabic ? "يرجى تسجيل الدخول مجددًا." : "Please log in again.")
        );

        return;
      }

      if (!profilePicture) {
        setProfileMessage(
          (isArabic ? "يرجى اختيار صورة شخصية." : "Please select a profile picture.")
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
            updateUser({
              ...user,
              ...response.data.user,
            })
          );
        }

        setProfileMessage(
          response.data?.message ||
            (isArabic ? "تم تحديث الصورة الشخصية بنجاح." : "Profile picture updated successfully.")
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
            (isArabic ? "تعذر رفع الصورة الشخصية." : "Unable to upload profile picture.")
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
          (isArabic ? "يرجى اختيار ملف PDF أو JPG أو JPEG أو PNG." : "Please select a PDF, JPG, JPEG, or PNG file.")
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
          (isArabic ? "يجب أن يكون حجم الشهادة أقل من 5 ميجابايت." : "The certificate file must be smaller than 5 MB.")
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
          (isArabic ? "يرجى تسجيل الدخول مجددًا." : "Please log in again.")
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
          (isArabic ? "يرجى إدخال اسم الشهادة." : "Please enter the certificate name.")
        );

        setCertificateMessageType(
          "error"
        );

        return;
      }

      if (!certificateFile) {
        setCertificateMessage(
          (isArabic ? "يرجى اختيار ملف الشهادة." : "Please select a certificate file.")
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
            ...user,
            certificates: updatedCertificates,
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
            (isArabic ? "تم رفع الشهادة بنجاح." : "Certificate uploaded successfully.")
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
            (isArabic ? "تعذر رفع الشهادة." : "Unable to upload the certificate.")
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
          (isArabic ? "هل أنت متأكد من حذف هذه الشهادة؟" : "Are you sure you want to remove this certificate?")
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
            ...user,
            certificates: updatedCertificates,
          })
        );

        setCertificateMessage(
          response.data?.message ||
            (isArabic ? "تم حذف الشهادة بنجاح." : "Certificate removed successfully.")
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
            (isArabic ? "تعذر حذف الشهادة." : "Unable to remove the certificate.")
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
        (isArabic ? "هذا المتصفح لا يدعم تحديد الموقع." : "Geolocation is not supported by this browser.")
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
                "Accept-Language": isArabic ? "ar" : "en",
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
            (isArabic ? "تم تحديد الموقع بنجاح." : "Location detected successfully.")
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
            (isArabic ? "تم تحديد الإحداثيات، لكن تعذر تحميل اسم الموقع." : "Coordinates detected successfully. The location name could not be loaded.")
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
            (isArabic ? "تم رفض إذن الوصول إلى الموقع." : "Location permission was denied.")
          );
        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          setLocationMessage(
            (isArabic ? "موقعك الحالي غير متاح." : "Your current location is unavailable.")
          );
        } else if (
          error.code ===
          error.TIMEOUT
        ) {
          setLocationMessage(
            (isArabic ? "انتهت مهلة طلب تحديد الموقع." : "Location request timed out.")
          );
        } else {
          setLocationMessage(
            (isArabic ? "تعذر تحديد موقعك الحالي." : "Unable to detect your current location.")
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
          (isArabic ? "يرجى تسجيل الدخول مجددًا." : "Please log in again.")
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
          (isArabic ? "يرجى اختيار جنس صحيح." : "Please select a valid gender.")
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
          (isArabic ? "يرجى إدخال عدد صحيح لسنوات الخبرة." : "Please enter a valid number of experience years.")
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

              languages: languages.filter((item) => item !== "Other"),

              availability,

              availableTimes,
            }
          );

        if (
          response.data?.user
        ) {
          dispatch(
            updateUser({
              ...user,
              ...response.data.user,
            })
          );
        }

        setDetailsMessage(
          response.data?.message ||
            (isArabic ? "تم تحديث الملف الشخصي بنجاح." : "Profile updated successfully.")
        );
      } catch (error) {
        console.error(
          "Caregiver profile update error:",
          error
        );

        setDetailsMessage(
          error.response?.data
            ?.message ||
            (isArabic ? "تعذر تحديث ملفك الشخصي." : "Unable to update your profile.")
        );
      } finally {
        setIsSavingDetails(
          false
        );
      }
    };

  return (
    <div className={`mm-caregiver-profile ${theme === "dark" ? "mm-cp-dark" : "mm-cp-light"}`} dir={isArabic ? "rtl" : "ltr"} style={{ minWidth: 0, width: "100%" }}>
      <style>{`
        .mm-caregiver-profile { --cp-bg:#ffffff; --cp-text:#1d2939; --cp-border:#dbe3ef; --cp-muted:#64748b; color:var(--cp-text); }
        .mm-caregiver-profile.mm-cp-dark { --cp-bg:#182235; --cp-text:#f1f5f9; --cp-border:#39465b; --cp-muted:#b5c1d2; }
        .mm-caregiver-profile .card, .mm-caregiver-profile .card-body { background:var(--cp-bg)!important; color:var(--cp-text)!important; border-color:var(--cp-border)!important; }
        .mm-caregiver-profile .form-control, .mm-caregiver-profile select, .mm-caregiver-profile textarea { background:var(--cp-bg)!important; color:var(--cp-text)!important; border-color:var(--cp-border)!important; max-width:100%; }
        .mm-caregiver-profile .text-muted, .mm-caregiver-profile small.text-muted { color:var(--cp-muted)!important; }
        .mm-caregiver-profile label { color:var(--cp-text); }
        .mm-caregiver-profile button:not(.btn) { color:var(--cp-text); }
        .mm-caregiver-profile .badge.bg-light { background:var(--cp-border)!important; color:var(--cp-text)!important; }
        .mm-caregiver-profile .card-body { min-width:0; }
        .mm-caregiver-profile h2 { font-size:clamp(1.25rem,2.5vw,1.75rem); margin-bottom:1.25rem; }
        .mm-caregiver-profile [style*="grid-template-columns"] { min-width:0; }
        /* Account identity is always displayed from the signed-in user, never editable here. */
        .mm-caregiver-profile .mm-cp-account-identity {
          cursor: default;
          caret-color: transparent;
          background: var(--cp-bg) !important;
          color: var(--cp-text) !important;
          opacity: 1 !important;
          -webkit-text-fill-color: var(--cp-text) !important;
        }
        .mm-caregiver-profile .mm-cp-account-warning {
          border: 1px solid #e0a03b;
          background: rgba(240, 164, 43, 0.12);
          color: var(--cp-text);
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .mm-caregiver-profile .mm-cp-language-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(155px,1fr)); gap:10px; }
        .mm-caregiver-profile .mm-cp-language-choice { display:flex; align-items:center; gap:10px; padding:8px 10px; border:1px solid var(--cp-border); border-radius:9px; background:var(--cp-bg); color:var(--cp-text)!important; text-align:start; cursor:pointer; min-width:0; }
        .mm-caregiver-profile .mm-cp-language-choice[aria-pressed="true"] { border-color:#198754; background:rgba(25,135,84,.09); }
        .mm-caregiver-profile .mm-cp-language-dot { display:inline-block; width:17px; height:17px; border:2px solid #94a3b8; background:var(--cp-bg); border-radius:50%; flex-shrink:0; }
        .mm-caregiver-profile .mm-cp-language-dot.selected { background:#198754; border-color:#198754; box-shadow:inset 0 0 0 3px var(--cp-bg); }
        .mm-caregiver-profile .mm-cp-other-languages { border:1px solid var(--cp-border); border-radius:10px; padding:14px; min-width:0; }
        .mm-caregiver-profile .mm-cp-other-language-entry { display:flex; align-items:stretch; gap:8px; flex-wrap:wrap; }
        .mm-caregiver-profile .mm-cp-other-language-entry input { flex:1 1 180px; min-width:0; }
        .mm-caregiver-profile .mm-cp-custom-languages { display:flex; gap:8px; flex-wrap:wrap; }
        .mm-caregiver-profile .mm-cp-language-chip { border:1px solid var(--cp-border); border-radius:999px; background:var(--cp-bg); color:var(--cp-text)!important; padding:5px 12px; cursor:pointer; }
        .mm-caregiver-profile .mm-cp-language-chip:hover { border-color:#dc3545; }
        @media(max-width:600px) { .mm-caregiver-profile .card-body { padding:12px!important; } .mm-caregiver-profile button { overflow-wrap:anywhere; } .mm-caregiver-profile .mm-cp-language-grid {grid-template-columns:repeat(auto-fit,minmax(135px,1fr));} }
      `}</style>
      <h2>{(isArabic ? "إعدادات الملف الشخصي لمقدم الرعاية" : "Caregiver Profile Settings")}</h2>

      {(!user?.name || !user?.email) && (
        <div className="mm-cp-account-warning" role="alert">
          {isArabic
            ? "بيانات الحساب الأساسية غير متاحة حاليًا. لا تحفظ معلومات جديدة قبل تسجيل الخروج ثم الدخول مجددًا، وتأكد من ظهور الاسم والبريد الإلكتروني."
            : "Your account details are missing from the current session. Do not save new profile changes yet. Sign out and sign in again, then verify your name and email appear."}
        </div>
      )}

              <Card>
                <CardBody>
                  <label>{(isArabic ? "اسم المستخدم" : "Username")}</label>

                  <input
                    type="text"
                    className="form-control mb-3 mm-cp-account-identity"
                    value={user?.name || ""}
                    readOnly
                    aria-readonly="true"
                    autoComplete="off"
                    title={isArabic ? "اسم المستخدم من بيانات الحساب، غير قابل للتعديل" : "Account username — cannot be edited"}
                  />

                  <label>{(isArabic ? "البريد الإلكتروني" : "Email")}</label>

                  <input
                    type="email"
                    className="form-control mb-3 mm-cp-account-identity"
                    value={user?.email || ""}
                    readOnly
                    aria-readonly="true"
                    autoComplete="off"
                    title={isArabic ? "البريد الإلكتروني من بيانات الحساب، غير قابل للتعديل" : "Account email — cannot be edited"}
                  />

                  <label>{(isArabic ? "رقم الهاتف" : "Phone Number")}</label>

                  <input
                    type="text"
                    className="form-control mb-3"
                    value={user?.phoneNumber || ""} readOnly
                    placeholder="91234567"
                  />

                  <div className="mb-3">
                    <label>{(isArabic ? "الصورة الشخصية" : "Profile Picture")}</label>

                    {profilePreview && <img src={profilePreview} alt={(isArabic ? "الصورة الشخصية" : "Profile Picture")} style={{width:88,height:88,borderRadius:"50%",objectFit:"cover",display:"block",marginBottom:12,border:"2px solid var(--cp-border)"}} />}
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
                        ? (isArabic ? "جارٍ الرفع..." : "Uploading...")
                        : (isArabic ? "رفع الصورة الشخصية" : "Upload Profile Picture")}
                    </Button>
                  </div>

                  {profileMessage && (
                    <div className="alert alert-info">
                      {
                        profileMessage
                      }
                    </div>
                  )}

                  <label>{(isArabic ? "الدور" : "Role")}</label>

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

                  <label>{(isArabic ? "الجنس" : "Gender")}</label>

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
                    <option value="">{(isArabic ? "اختر الجنس" : "Select Gender")}</option>

                    <option value="Female">{(isArabic ? "أنثى" : "Female")}</option>

                    <option value="Male">{(isArabic ? "ذكر" : "Male")}</option>
                  </select>

                  <label>{(isArabic ? "الدرجة العلمية أو المؤهل" : "Degree or Qualification")}</label>

                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder={(isArabic ? "مثال: بكالوريوس التمريض" : "Example: Bachelor of Nursing")}
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

                  <label>{(isArabic ? "سنوات الخبرة" : "Years of Experience")}</label>

                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder={(isArabic ? "مثال: 3" : "Example: 3")}
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

                  <label>{(isArabic ? "الموقع" : "Location")}</label>

                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder={(isArabic ? "مثال: مسقط، عمان" : "Example: Muscat, Oman")}
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
                        ? (isArabic ? "جارٍ تحديد الموقع..." : "Detecting Location...")
                        : (isArabic ? "📍 استخدام موقعي الحالي" : "📍 Use Current Location")}
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
                    >{(isArabic ? "بيانات الموقع © مساهمو OpenStreetMap" : "Location data © OpenStreetMap contributors")}</small>
                  </div>

                  <label>{(isArabic ? "نبذة شخصية" : "Bio")}</label>

                  <textarea
                    className="form-control mb-3"
                    rows="4"
                    placeholder={(isArabic ? "اكتب نبذة قصيرة عن خبرتك في تقديم الرعاية." : "Write a short description about your caregiving experience.")}
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
                    {isArabic ? "اللغات التي تتحدثها" : "Languages Spoken"}
                  </label>
                  <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                    {isArabic
                      ? "يمكنك اختيار أكثر من لغة للتواصل مع المرضى."
                      : "Choose all languages you can use to communicate with patients."}
                  </p>

                  <div className="mb-4">
                    <div className="mm-cp-language-grid">
                      {[...LANGUAGE_OPTIONS, "Other"].map((languageName) => {
                        const isOther = languageName === "Other";
                        const isSelected = isOther
                          ? otherSelected
                          : languages.includes(languageName);
                        const displayName = isOther
                          ? (isArabic ? "أخرى" : "Other")
                          : (isArabic
                              ? ARABIC_LANGUAGE_LABELS[languageName]
                              : languageName);

                        return (
                          <button
                            key={languageName}
                            type="button"
                            className="mm-cp-language-choice"
                            aria-pressed={isSelected}
                            onClick={() => {
                              if (isOther) {
                                if (otherSelected) {
                                  setLanguages((current) => current.filter(
                                    (item) => LANGUAGE_OPTIONS.includes(item)
                                  ));
                                  setShowOtherLanguage(false);
                                  setLanguageInput("");
                                  setLanguageError("");
                                } else {
                                  setShowOtherLanguage(true);
                                }
                              } else {
                                setLanguages((current) =>
                                  current.includes(languageName)
                                    ? current.filter((item) => item !== languageName)
                                    : [...current, languageName]
                                );
                              }
                              setDetailsMessage("");
                            }}
                          >
                            <span
                              className={`mm-cp-language-dot ${isSelected ? "selected" : ""}`}
                              aria-hidden="true"
                            />
                            <span>{displayName}</span>
                          </button>
                        );
                      })}
                    </div>

                    {otherSelected && (
                      <div className="mm-cp-other-languages mt-3">
                        <label htmlFor="mm-cp-other-language" className="d-block mb-2">
                          {isArabic ? "حدد لغة أخرى" : "Specify another language"}
                        </label>
                        <div className="mm-cp-other-language-entry">
                          <input
                            id="mm-cp-other-language"
                            type="text"
                            className="form-control"
                            value={languageInput}
                            maxLength={51}
                            placeholder={isArabic ? "مثال: التركية، النيبالية..." : "e.g. Nepali, Sinhala..."}
                            onChange={(event) => {
                              setLanguageInput(event.target.value);
                              setLanguageError("");
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addCustomLanguage();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            color="primary"
                            disabled={!languageInput.trim()}
                            onClick={addCustomLanguage}
                          >
                            {isArabic ? "إضافة" : "Add"}
                          </Button>
                        </div>
                        {languageError && (
                          <p className="text-danger mt-2 mb-0" role="alert">{languageError}</p>
                        )}
                        {customLanguages.length > 0 && (
                          <div className="mm-cp-custom-languages mt-3">
                            {customLanguages.map((customLanguage) => (
                              <button
                                key={customLanguage}
                                type="button"
                                className="mm-cp-language-chip"
                                onClick={() => {
                                  setLanguages((current) => current.filter(
                                    (item) => item !== customLanguage
                                  ));
                                  setDetailsMessage("");
                                }}
                                aria-label={isArabic
                                  ? `حذف اللغة ${customLanguage}`
                                  : `Remove ${customLanguage}`}
                                title={isArabic ? "إزالة اللغة" : "Remove language"}
                              >
                                {customLanguage} <span aria-hidden="true">×</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <label className="mb-2 d-block">{(isArabic ? "أيام التوفر" : "Available Days")}</label>

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
                                    {isArabic
                                      ? ({ Sunday: "الأحد", Monday: "الاثنين",
                                           Tuesday: "الثلاثاء", Wednesday: "الأربعاء",
                                           Thursday: "الخميس", Friday: "الجمعة",
                                           Saturday: "السبت" }[day] || day)
                                      : day}
                                  </span>
                                </button>
                              );
                            }
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <label className="mb-2 d-block">{(isArabic ? "الوقت المفضل" : "Preferred Time")}</label>

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
                              {isArabic
                                ? ({ Morning: "الصباح", Afternoon: "بعد الظهر",
                                     Evening: "المساء" }[time] || time)
                                : time}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>

                  <hr className="my-4" />

                  <div className="mb-4">
                    <h5 className="mb-3">{(isArabic ? "الشهادات المهنية" : "Professional Certificates")}</h5>

                    <label>{(isArabic ? "اسم الشهادة" : "Certificate Name")}</label>

                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder={(isArabic ? "مثال: شهادة الإسعافات الأولية" : "Example: First Aid Certificate")}
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

                    <label>{(isArabic ? "ملف الشهادة" : "Certificate File")}</label>

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
                        <FaCloudUploadAlt className="me-2" />{(isArabic ? "اختيار شهادة" : "Upload Certificate")}</>
                    </Button>

                    <small className="text-muted d-block mt-2">{(isArabic ? "الصيغ المقبولة: PDF وJPG وJPEG وPNG. الحد الأقصى: 5 ميجابايت." : "Accepted formats: PDF, JPG, JPEG, PNG. Maximum size: 5 MB.")}</small>

                    {certificateFile && (
                      <div className="mt-2">
                        {isArabic ? "الملف المحدد:" : "Selected file:"}{" "}
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
                        ? (isArabic ? "جارٍ الرفع..." : "Uploading...")
                        : (isArabic ? "إضافة شهادة" : "Add Certificate")}
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
                        <h6>{(isArabic ? "شهاداتي" : "My Certificates")}</h6>

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

                                background: "var(--cp-bg)",
                                color: "var(--cp-text)",
                                border: "1px solid var(--cp-border)",

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
                                    title={(isArabic ? "شهادة PDF" : "PDF certificate")}
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
                                    title={(isArabic ? "شهادة مصورة" : "Image certificate")}
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
                                  title={(isArabic ? "عرض الشهادة" : "View certificate")}
                                  aria-label={isArabic ? `عرض ${certificate.certificateName}` : `View ${certificate.certificateName}`}
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
                                  title={(isArabic ? "حذف الشهادة" : "Delete certificate")}
                                  aria-label={isArabic ? `حذف ${certificate.certificateName}` : `Delete ${certificate.certificateName}`}
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
                      ? (isArabic ? "جارٍ الحفظ..." : "Saving...")
                      : (isArabic ? "حفظ التغييرات" : "Save Changes")}
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
    </div>
  );
};

export default CaregiverProfileSettings;
