import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Alert,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFileExport,
  FaUtensils,
} from "react-icons/fa";

import Header from "./Header";
import Footer from "./Footer";

const formatMedicationDate = (dateValue) => {
  if (!dateValue) return "—";

  const datePart = String(dateValue).slice(0, 10);
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return "—";

  return `${match[3]}/${match[2]}/${match[1]}`;
};

const Medication = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const [language, setLanguage] = useState(
  () => localStorage.getItem("medimindLanguage") || "en"
);

const isArabic = language === "ar";

const t = (english, arabic) =>
  isArabic ? arabic : english;

useEffect(() => {
  const handleLanguageChange = () => {
    setLanguage(
      localStorage.getItem("medimindLanguage") || "en"
    );
  };

  window.addEventListener(
    "medimind-language-change",
    handleLanguageChange
  );

  return () => {
    window.removeEventListener(
      "medimind-language-change",
      handleLanguageChange
    );
  };
}, []);

  const [medications, setMedications] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("danger");
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  const fetchMedications = async () => {
    if (!user?.email) {
      setMessage(
  t("Please log in to view your medications.","يرجى تسجيل الدخول لعرض أدويتك.")
);
      setMessageType("danger");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      const response = await axios.get(
        `http://localhost:3002/medications/${encodeURIComponent(
          user.email
        )}`
      );

      setMedications(response.data.medications || []);
    } catch (error) {
      console.error("Medication fetch error:", error);

      setMessage(
  t(
    "An error occurred while loading medications.",
    "حدث خطأ أثناء تحميل الأدوية."
  )
);

      setMessageType("danger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [user?.email]);

  const filteredMedications = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    if (!normalizedSearch) {
      return medications;
    }

    return medications.filter((medication) =>
      medication.medicationName
        ?.toLowerCase()
        .includes(normalizedSearch)
    );
  }, [medications, searchText]);

  const deleteMedication = async (medicationId) => {
    const shouldDelete = window.confirm(
     t(
    "Are you sure you want to delete this medication?",
    "هل أنت متأكد من رغبتك في حذف هذا الدواء؟"
  )
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:3002/medications/${medicationId}`
      );

      if (
        response.data.message ===
        "Medication deleted successfully"
      ) {
        setMedications((previousMedications) =>
          previousMedications.filter(
            (medication) => medication._id !== medicationId
          )
        );

        setMessage(t(
    "Medication deleted successfully.",
    "تم حذف الدواء بنجاح."
  )
);
        setMessageType("success");
      } else {
        setMessage(
  t(
    "Medication could not be deleted.",
    "تعذر حذف الدواء."
  )
);

        setMessageType("danger");
      }
    } catch (error) {
      console.error("Medication delete error:", error);

      setMessage(
  t(
    "An error occurred while deleting the medication.",
    "حدث خطأ أثناء حذف الدواء."
  )
);

      setMessageType("danger");
    }
  };

  const exportMedications = () => {
    if (medications.length === 0) {
      setMessage(
  t(
    "There are no medications to export.",
    "لا توجد أدوية لتصديرها."
  )
);
      setMessageType("danger");
      return;
    }

    const header = [
  "Name",
  "Dosage",
  "Frequency",
  "Timing",
  "Start Date",
  "End Date",
  "Instructions",
];

   const rows = medications.map((medication) => [
  medication.medicationName || "",
  medication.dosage || "",
  medication.frequency || "",
  medication.timing || "",
  formatMedicationDate(medication.startDate),
  formatMedicationDate(medication.endDate),
  medication.instructions || "",
]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const csvBlob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const downloadUrl = URL.createObjectURL(csvBlob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "medications.csv";
    link.click();

    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <Container fluid className="dashboard-page medications-page"  dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      <Row className="p-4 align-items-center">
        <Col md="6">
         <h2
  className="medications-title"
  style={{
    fontWeight: "700",
    marginBottom: "4px",
  }}
>
            {t("My Medications", "أدويتي")}
          </h2>

         <p
  className="medications-description"
  style={{ marginBottom: 0 }}
>
           {t(
    "Manage all your medications in one place.",
    "إدارة جميع أدويتك في مكان واحد."
  )}
          </p>
        </Col>

        
<Col
  md="6"
  className="mt-3 mt-md-0"
>
  <div className="medications-actions">
    <button
      type="button"
      className="btn btn-primary"
      onClick={exportMedications}
    >
      <FaFileExport size={17} />
      <span>{t("Export", "تصدير")}</span>
    </button>

    <button
      type="button"
      className="btn btn-success"
      onClick={() => navigate("/medications/add")}
    >
      <FaPlus size={17} />
      <span>{t("Add Medication", "إضافة دواء")}</span>
    </button>
  </div>
</Col>

      </Row>

      <Row className="px-4">
        <Col>
          <Card
className="dashboard-card medications-card"
            style={{
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              boxShadow:
                "0 5px 18px rgba(30, 58, 138, 0.06)",
            }}
          >
            <CardBody style={{ padding: "24px" }}>
              {message && (
                <Alert color={messageType}>
                  {message}
                </Alert>
              )}

              <div
  className="mb-4 medications-search"
  style={{
    position: "relative",
    width: "100%",
    maxWidth: "420px",
    marginInlineStart: "auto",
  }}
>
                <input
                  type="text"
                  className="form-control"
                 placeholder={t(
  "Search medication name...",
  "ابحث عن اسم الدواء بالإنجليزية..."
)}
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                  style={{
                    paddingInlineStart: "42px",
                    minHeight: "42px",
                    borderRadius: "9px",
                  }}
                />

                <FaSearch
                  size={15}
                  color="#6b7280"
                  style={{
                    position: "absolute",
                    insetInlineStart: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              </div>

              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner color="primary" />

                  <p
                    style={{
                      color: "#6b7280",
                      marginTop: "12px",
                    }}
                  >
                   {t("Loading medications...", "جارٍ تحميل الأدوية...")}
                  </p>
                </div>
              ) : filteredMedications.length === 0 ? (
                <div className="text-center py-5">
                  <h5 style={{ color: "#1e3a8a" }}>
                    {searchText
  ? t("No matching medication found", "لم يتم العثور على دواء مطابق")
  : t("No medications yet", "لا توجد أدوية حتى الآن")}
                  </h5>

                  <p style={{ color: "#6b7280" }}>
                    {searchText
  ? t("Try another medication name.", "جرّب البحث باسم دواء آخر.")
  : t(
      "Add your first medication to get started.",
      "أضف دواءك الأول للبدء."
    )}
                  </p>

                  {!searchText && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        navigate("/medications/add")
                      }
                    >
                     {t("Add Medication", "إضافة دواء")}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                  className="medications-table"
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                       
{[
  t("Name", "اسم الدواء"),
  t("Dosage", "الجرعة"),
  t("Frequency", "التكرار"),
  t("Timing", "وقت التناول"),
  t("Reminder Time", "وقت التذكير"),
  t("Start Date", "تاريخ البدء"),
  t("End Date", "تاريخ الانتهاء"),
  t("Instructions", "التعليمات"),
  t("Status", "الحالة"),
  t("Actions", "الإجراءات"),
].map((heading) => (

                          <th
                            key={heading}
                            style={{
                              backgroundColor: "#1e3a8a",
                              color: "white",
                              padding: "13px 14px",
                              textAlign: "left",
                              fontSize: "17px",
                            }}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredMedications.map(
                        (medication) => {
                          const isHovered =
                            hoveredRow === medication._id;

                            
const translateWeekday = (day) => {
  if (!isArabic || !day) return day;

  const days = {
    Monday: "الاثنين",
    Tuesday: "الثلاثاء",
    Wednesday: "الأربعاء",
    Thursday: "الخميس",
    Friday: "الجمعة",
    Saturday: "السبت",
    Sunday: "الأحد",
  };

  return days[day] || day;
};

const translateFrequency = (frequency, weeklyDay) => {
  if (!frequency) return "—";

  if (!isArabic) {
    return frequency === "Weekly" && weeklyDay
      ? `Weekly (${weeklyDay})`
      : frequency;
  }

  const translations = {
    "Once daily": "مرة واحدة يوميًا",
    "Twice daily": "مرتين يوميًا",
    "Three times daily": "ثلاث مرات يوميًا",
    "Four times daily": "أربع مرات يوميًا",
    Daily: "يوميًا",
    Weekly: "أسبوعيًا",
    "Once weekly": "مرة واحدة أسبوعيًا",
    "As needed": "عند الحاجة",
    PRN: "عند الحاجة",
    "Custom interval": "فاصل زمني مخصص",
  };

  const hourlyMatch = frequency.match(
    /^Every\s+(\d+)\s+hours?$/i
  );

  if (hourlyMatch) {
    const hours = Number(hourlyMatch[1]);

    if (hours === 1) return "كل ساعة";
    if (hours === 2) return "كل ساعتين";
    if (hours >= 3 && hours <= 10) {
      return `كل ${hours} ساعات`;
    }
    return `كل ${hours} ساعة`;
  }

  if (frequency === "Weekly" && weeklyDay) {
    return `أسبوعيًا (${translateWeekday(weeklyDay)})`;
  }

  return translations[frequency] || frequency;
};


const translateTiming = (timing) => {
  if (!timing) return "—";
  if (!isArabic) return timing;

  const translations = {
    Breakfast: "الإفطار",
    Lunch: "الغداء",
    Dinner: "العشاء",
    "Before Breakfast": "قبل الإفطار",
    "After Breakfast": "بعد الإفطار",
    "Before Lunch": "قبل الغداء",
    "After Lunch": "بعد الغداء",
    "Before Dinner": "قبل العشاء",
    "After Dinner": "بعد العشاء",
    "Before Meal": "قبل الطعام",
    "After Meal": "بعد الطعام",
    "With Meal": "مع الطعام",
    "With Food": "مع الطعام",
    "Without Food": "بدون طعام",
    "Any Time": "في أي وقت",
    Morning: "الصباح",
    Afternoon: "بعد الظهر",
    Evening: "المساء",
    Night: "الليل",
    Bedtime: "وقت النوم",
  };

  return translations[timing] || timing;
};


const translateDosage = (dosage) => {
  if (!dosage || !isArabic) return dosage || "—";

  const units = {
    tablets: "أقراص",
    tablet: "قرص",
    capsules: "كبسولات",
    capsule: "كبسولة",
    drops: "قطرات",
    drop: "قطرة",
    puffs: "بخات",
    puff: "بخة",
    pills: "حبوب",
    pill: "حبة",
    teaspoons: "ملاعق صغيرة",
    teaspoon: "ملعقة صغيرة",
    tablespoons: "ملاعق كبيرة",
    tablespoon: "ملعقة كبيرة",
    ml: "مل",
    mg: "ملغ",
    mcg: "ميكروغرام",
    g: "غرام",
    units: "وحدات",
    unit: "وحدة",
  };

  return String(dosage).replace(
    /\b(tablets|tablet|capsules|capsule|drops|drop|puffs|puff|pills|pill|teaspoons|teaspoon|tablespoons|tablespoon|mcg|mg|ml|g|units|unit)\b/gi,
    (match) => units[match.toLowerCase()] || match
  );
};




                          return (
                            <tr
                              key={medication._id}
                              onMouseEnter={() =>
                                setHoveredRow(
                                  medication._id
                                )
                              }
                              onMouseLeave={() =>
                                setHoveredRow(null)
                              }
                              style={{
                                backgroundColor: isHovered
                                  ? "#f8fbff"
                                  : "white",
                                transition:
                                  "background-color 0.2s ease",
                              }}
                            >
                              <td
                                style={{
                                  padding: "16px 14px",
                                  borderBottom:
                                    "1px solid #e5e7eb",
                                  color: "#1e3a8a",
                                  fontWeight: "700",
                                  textTransform: "capitalize",
                                }}
                              >
                                {medication.medicationName}
                              </td>

                              <td
                                style={{
                                  padding: "16px 14px",
                                  borderBottom:
                                    "1px solid #e5e7eb",
                                }}
                              >
                                {translateDosage(medication.dosage)}
                              </td>

                              <td
                                style={{
                                  padding: "16px 14px",
                                  borderBottom:
                                    "1px solid #e5e7eb",
                                }}
                              >
                              {translateFrequency(
  medication.frequency,
  medication.weeklyDay
)}
                              </td>

                              <td
                                style={{
                                  padding: "16px 14px",
                                  borderBottom:
                                    "1px solid #e5e7eb",
                                }}
                              >
                                <span
                                  style={{
                                    backgroundColor: "#eef4ff",
                                    color: "#1e3a8a",
                                    padding: "6px 10px",
                                    borderRadius: "14px",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <FaUtensils size={11} />
                                  {translateTiming(medication.timing)}
                                </span>
                              </td>

                              <td
  style={{
    padding: "16px 14px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  }}
>
  {Array.isArray(medication.reminderTimes)
    ? medication.reminderTimes.join(", ") || "—"
    : "—"}
</td>

<td
  style={{
    padding: "16px 14px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  }}
>
  {formatMedicationDate(medication.startDate)}
</td>

<td
  style={{
    padding: "16px 14px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  }}
>
  {formatMedicationDate(medication.endDate)}
</td>
                              <td
                                style={{
                                  padding: "16px 14px",
                                  borderBottom:
                                    "1px solid #e5e7eb",
                                }}
                              >
                                {medication.instructions || "—"}
                              </td>

                              <td
                                style={{
                                  padding: "16px 14px",
                                  borderBottom:
                                    "1px solid #e5e7eb",
                                }}
                              >
                                <span
                                  style={{
                                   backgroundColor:
  medication.isActive === false ? "#f3f4f6" : "#e8f7ee",
color:
  medication.isActive === false ? "#6b7280" : "#198754",
                                    padding: "6px 11px",
                                    borderRadius: "15px",
                                    fontWeight: "700",
                                    fontSize: "13px",
                                  }}
                                >
                                {medication.isActive === false
  ? t("● Inactive", "● غير نشط")
  : t("● Active", "● نشط")}
                                </span>
                              </td>

                              <td
                                style={{
                                  padding: "16px 14px",
                                  borderBottom:
                                    "1px solid #e5e7eb",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/medications/edit/${medication._id}`
                                    )
                                  }
                                  aria-label={t(
  `Edit ${medication.medicationName}`,
  `تعديل ${medication.medicationName}`
)}
title={t("Edit medication", "تعديل الدواء")}
                                  style={{
                                    border: "none",
                                    background:
                                      "transparent",
                                    color: "#198754",
                                    cursor: "pointer",
                                    marginRight: "14px",
                                    padding: "4px",
                                  }}
                                >
                                  <FaEdit size={18} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteMedication(
                                      medication._id
                                    )
                                  }
                                  aria-label={t(
  `Delete ${medication.medicationName}`,
  `حذف ${medication.medicationName}`
)}
title={t("Delete medication", "حذف الدواء")}
                                  style={{
                                    border: "none",
                                    background:
                                      "transparent",
                                    color: "#dc3545",
                                    cursor: "pointer",
                                    padding: "4px",
                                  }}
                                >
                                  <FaTrash size={17} />
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Footer />
    </Container>
  );
};

export default Medication;
