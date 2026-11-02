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
import Footer from "./footer";

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

  const [medications, setMedications] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("danger");
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  const fetchMedications = async () => {
    if (!user?.email) {
      setMessage("Please log in to view your medications.");
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
        error.response?.data?.message ||
          "An error occurred while loading medications."
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
      "Are you sure you want to delete this medication?"
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

        setMessage("Medication deleted successfully.");
        setMessageType("success");
      } else {
        setMessage(
          response.data.message ||
            "Medication could not be deleted."
        );

        setMessageType("danger");
      }
    } catch (error) {
      console.error("Medication delete error:", error);

      setMessage(
        error.response?.data?.message ||
          "An error occurred while deleting the medication."
      );

      setMessageType("danger");
    }
  };

  const exportMedications = () => {
    if (medications.length === 0) {
      setMessage("There are no medications to export.");
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
    <Container fluid className="dashboard-page">
      <Header />

      <Row className="p-4 align-items-center">
        <Col md="6">
          <h2
            style={{
              color: "#1e3a8a",
              fontWeight: "700",
              marginBottom: "4px",
            }}
          >
            Medications
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginBottom: 0,
            }}
          >
            Manage all your medications in one place.
          </p>
        </Col>

        <Col
          md="6"
          className="text-md-end mt-3 mt-md-0"
        >
          <button
            type="button"
            className="btn btn-outline-primary me-2"
            onClick={exportMedications}
            style={{
              minHeight: "42px",
              padding: "0 16px",
              borderRadius: "9px",
              fontWeight: "600",
            }}
          >
            <FaFileExport
              size={14}
              style={{ marginRight: "7px" }}
            />
            Export
          </button>

          <button
            type="button"
            className="btn btn-success"
            onClick={() => navigate("/medications/add")}
            style={{
              minHeight: "42px",
              padding: "0 16px",
              borderRadius: "9px",
              fontWeight: "600",
            }}
          >
            <FaPlus
              size={13}
              style={{ marginRight: "7px" }}
            />
            Add Medication
          </button>
        </Col>
      </Row>

      <Row className="px-4">
        <Col>
          <Card
            className="dashboard-card"
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
                className="mb-4"
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "420px",
                  marginLeft: "auto",
                }}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search medication name..."
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                  style={{
                    paddingLeft: "42px",
                    minHeight: "42px",
                    borderRadius: "9px",
                  }}
                />

                <FaSearch
                  size={15}
                  color="#6b7280"
                  style={{
                    position: "absolute",
                    left: "14px",
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
                    Loading medications...
                  </p>
                </div>
              ) : filteredMedications.length === 0 ? (
                <div className="text-center py-5">
                  <h5 style={{ color: "#1e3a8a" }}>
                    {searchText
                      ? "No matching medication found"
                      : "No medications yet"}
                  </h5>

                  <p style={{ color: "#6b7280" }}>
                    {searchText
                      ? "Try another medication name."
                      : "Add your first medication to get started."}
                  </p>

                  {!searchText && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        navigate("/medications/add")
                      }
                    >
                      Add Medication
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                       {[
  "Name",
  "Dosage",
  "Frequency",
  "Timing",
  "Start Date",
  "End Date",
  "Instructions",
  "Status",
  "Actions",
].map((heading) => (
                          <th
                            key={heading}
                            style={{
                              backgroundColor: "#1e3a8a",
                              color: "white",
                              padding: "13px 14px",
                              textAlign: "left",
                              fontSize: "14px",
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
                                {medication.dosage}
                              </td>

                              <td
                                style={{
                                  padding: "16px 14px",
                                  borderBottom:
                                    "1px solid #e5e7eb",
                                }}
                              >
                                {medication.frequency}
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
                                  {medication.timing}
                                </span>
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
                                    backgroundColor: "#e8f7ee",
                                    color: "#198754",
                                    padding: "6px 11px",
                                    borderRadius: "15px",
                                    fontWeight: "700",
                                    fontSize: "13px",
                                  }}
                                >
                                  ● Active
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
                                  aria-label={`Edit ${medication.medicationName}`}
                                  title="Edit medication"
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
                                  aria-label={`Delete ${medication.medicationName}`}
                                  title="Delete medication"
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