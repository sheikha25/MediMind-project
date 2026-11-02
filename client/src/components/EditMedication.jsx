import { useEffect, useState } from "react";
import axios from "axios";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  FormGroup,
  Label,
  Input,
  Alert,
  Spinner,
} from "reactstrap";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Header from "./Header";
import Footer from "./footer";

const standardFrequencies = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "Weekly",
  "As needed",
];

const getRequiredTimeCount = (
  selectedFrequency
) => {
  switch (selectedFrequency) {
    case "Once daily":
      return 1;

    case "Twice daily":
      return 2;

    case "Three times daily":
      return 3;

    case "Every 6 hours":
      return 4;

    case "Every 8 hours":
      return 3;

    case "Every 12 hours":
      return 2;

    case "Weekly":
      return 1;

    case "As needed":
      return 0;

    case "Other":
      return 1;

    default:
      return 0;
  }
};

const medicationDosageUnits = {
  Tablet: ["tablet", "tablets", "mg", "mcg"],
  Capsule: ["capsule", "capsules", "mg", "mcg"],
  Injection: ["units", "ml", "mg", "mcg"],
  "Cream/Ointment": ["g", "mg", "application", "applications"],
  Inhaler: ["puff", "puffs"],
  "Eye Drops": ["drop", "drops"],
  "Ear Drops": ["drop", "drops"],
  "Liquid/Syrup": ["ml", "mg"],
  Patch: ["patch", "patches"],
  Suppository: ["suppository", "suppositories"],
  Other: [
    "mg", "g", "mcg", "ml", "units",
    "tablet", "tablets",
    "capsule", "capsules",
    "drop", "drops",
    "puff", "puffs",
    "patch", "patches",
    "application", "applications",
    "suppository", "suppositories",
  ],
};

const EditMedication = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [
    medicationName,
    setMedicationName,
  ] = useState("");

  const [dosage, setDosage] =
    useState("");

    const [medicationForm, setMedicationForm] = useState("");

const [dosageAmount, setDosageAmount] = useState("");

const [dosageUnit, setDosageUnit] = useState("");

const [topicalDosage, setTopicalDosage] = useState("");

  const [frequency, setFrequency] =
    useState("");

    const [weeklyDay, setWeeklyDay] =
  useState("");

  const [
    customFrequency,
    setCustomFrequency,
  ] = useState("");

  const [timing, setTiming] =
    useState("Before Meal");

  const [
    timingOffsetHours,
    setTimingOffsetHours,
  ] = useState("");

  const [
    timingOffsetMinutes,
    setTimingOffsetMinutes,
  ] = useState("");

  const [
    reminderTimes,
    setReminderTimes,
  ] = useState([]);

  const [startDate, setStartDate] =
    useState("");

    const [endDate, setEndDate] =
  useState("");

  const [isActive, setIsActive] =
    useState(true);

  const [
    instructions,
    setInstructions,
  ] = useState("");

  const [
    prescriptionImage,
    setPrescriptionImage,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [
    messageType,
    setMessageType,
  ] = useState("danger");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const clearMessage = () => {
    setMessage("");
  };

  const getFinalFrequency = () => {
    if (frequency === "Other") {
      return customFrequency.trim();
    }

    return frequency.trim();
  };

  const updateReminderTimeCount = (
    selectedFrequency
  ) => {
    const requiredCount =
      getRequiredTimeCount(
        selectedFrequency
      );

    if (requiredCount === 0) {
      setReminderTimes([]);
      return;
    }

    setReminderTimes(
      (currentTimes) =>
        Array.from(
          {
            length: requiredCount,
          },
          (_, index) =>
            currentTimes[index] || ""
        )
    );
  };

  const getDoseLabel = (time, index) => {
  if (!time) return `Dose ${index + 1}`;

  const hour = Number(time.split(":")[0]);

  if (hour >= 5 && hour < 12) {
    return "Morning Dose";
  }

  if (hour >= 12 && hour < 17) {
    return "Afternoon Dose";
  }

  if (hour >= 17 && hour < 21) {
    return "Evening Dose";
  }

  return "Night Dose";
};

  const handleReminderTimeChange = (
    index,
    value
  ) => {
    setReminderTimes(
      (currentTimes) =>
        currentTimes.map(
          (
            currentTime,
            timeIndex
          ) =>
            timeIndex === index
              ? value
              : currentTime
        )
    );

    clearMessage();
  };

  useEffect(() => {
    const fetchMedication =
      async () => {
        try {
          setIsLoading(true);
          setMessage("");

          const response =
            await axios.get(
              `http://localhost:3002/medications/item/${id}`
            );

          const medication =
            response.data?.medication;

          if (!medication) {
            setMessage(
              "Medication not found."
            );

            setMessageType("danger");
            return;
          }

          setMedicationName(
            medication.medicationName ||
              ""
          );

          setDosage(
            medication.dosage || ""
          );
          const savedDosage = (medication.dosage || "").trim();

const dosageMatch = savedDosage.match(
  /^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)$/
);

setDosageAmount(dosageMatch ? dosageMatch[1] : "");
setDosageUnit(dosageMatch ? dosageMatch[2] : "");

          setMedicationForm(medication.medicationForm || "");
setTopicalDosage(medication.topicalDosage || "");

          setWeeklyDay(medication.weeklyDay || "");

          const savedFrequency =
            medication.frequency || "";

          if (
            standardFrequencies.includes(
              savedFrequency
            )
          ) {
            setFrequency(
              savedFrequency
            );

            setCustomFrequency("");
          } else {
            setFrequency("Other");

            setCustomFrequency(
              savedFrequency
            );
          }

          setTiming(
            medication.timing ||
              "Before Meal"
          );


          const savedOffset =
            Number(
              medication.timingOffsetMinutes ||
                0
            );

          setTimingOffsetHours(
            savedOffset > 0
              ? String(
                  Math.floor(
                    savedOffset / 60
                  )
                )
              : ""
          );

          setTimingOffsetMinutes(
            savedOffset > 0
              ? String(
                  savedOffset % 60
                )
              : ""
          );

          setReminderTimes(
            Array.isArray(
              medication.reminderTimes
            )
              ? medication.reminderTimes
              : []
          );

          setStartDate(
            medication.startDate
              ? new Date(
                  medication.startDate
                )
                  .toISOString()
                  .split("T")[0]
              : new Date()
                  .toISOString()
                  .split("T")[0]
          );

          setEndDate(
  medication.endDate
    ? new Date(medication.endDate)
        .toISOString()
        .split("T")[0]
    : ""
);

          setIsActive(
            medication.isActive !==
              false
          );

          setInstructions(
            medication.instructions ||
              ""
          );

          setPrescriptionImage(
            medication.prescriptionImage ||
              ""
          );
        } catch (error) {
          console.error(
            "Medication fetch error:",
            error
          );

          setMessage(
            error.response?.data
              ?.message ||
              "An error occurred while loading the medication."
          );

          setMessageType("danger");
        } finally {
          setIsLoading(false);
        }
      };

    fetchMedication();
  }, [id]);

  const updateMedication = async () => {
    const finalFrequency =
      getFinalFrequency();

    setMessage("");

    if (
      !medicationName.trim() || !dosageAmount.trim() || !finalFrequency ||
      !timing.trim() ||
      !startDate
    ) {
      setMessage(
        "Please complete all required medication fields."
      );

      setMessageType("danger");
      return;
    }

    if (!endDate) {
  setMessage("Medication end date is required.");
  setMessageType("danger");
  return;
}

if (endDate < startDate) {
  setMessage("End date cannot be earlier than start date.");
  setMessageType("danger");
  return;
}

if (frequency === "Weekly" && !weeklyDay) {
  setMessage("Please select a weekday.");
  setMessageType("danger");
  return;
}

if (!medicationForm || !medicationDosageUnits[medicationForm]) {
  setMessage("Please select a valid medication form.");
  setMessageType("danger");
  return;
}

if (
  !dosageAmount.trim() ||
  !Number.isFinite(Number(dosageAmount)) ||
  Number(dosageAmount) <= 0
) {
  setMessage("Please enter a valid dosage amount.");
  setMessageType("danger");
  return;
}

if (!medicationDosageUnits[medicationForm].includes(dosageUnit)) {
  setMessage("Please select a valid dosage unit for this medication form.");
  setMessageType("danger");
  return;
}

    const needsTimingOffset = [
      "Before Meal",
      "After Meal",
    ].includes(timing);


    let totalTimingOffsetMinutes = 0;

    if (needsTimingOffset) {
      const hours =
        timingOffsetHours === ""
          ? 0
          : Number(
              timingOffsetHours
            );

      const minutes =
        timingOffsetMinutes === ""
          ? 0
          : Number(
              timingOffsetMinutes
            );

      if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        minutes < 0 ||
        minutes > 59
      ) {
        setMessage(
          "Please enter a valid timing offset."
        );

        setMessageType("danger");
        return;
      }

      totalTimingOffsetMinutes =
        hours * 60 + minutes;

      if (
        totalTimingOffsetMinutes === 0
      ) {
        setMessage(
          "Please enter how long before or after the meal this medication should be taken."
        );

        setMessageType("danger");
        return;
      }
    }

    if (
      frequency !== "As needed" &&
      reminderTimes.length === 0
    ) {
      setMessage(
        "Please provide at least one reminder time."
      );

      setMessageType("danger");
      return;
    }

    if (
      frequency !== "As needed" &&
      reminderTimes.some(
        (reminderTime) =>
          !reminderTime
      )
    ) {
      setMessage(
        "Please complete all reminder times."
      );

      setMessageType("danger");
      return;
    }

    const duplicateTimes =
      new Set(reminderTimes).size !==
      reminderTimes.length;

    if (
      frequency !== "As needed" &&
      duplicateTimes
    ) {
      setMessage(
        "Please select a different time for each dose."
      );

      setMessageType("danger");
      return;
    }

    try {
      setIsSaving(true);

      const response =
        await axios.put(
          `http://localhost:3002/medications/${id}`,
          {
            medicationName:
              medicationName.trim(),

           dosage: `${dosageAmount.trim()} ${dosageUnit}`,
medicationForm,
topicalDosage:
  medicationForm === "Cream/Ointment"
    ? topicalDosage.trim()
    : "",

           frequency: finalFrequency,
weeklyDay: frequency === "Weekly" ? weeklyDay : "",
timing: timing.trim(),

           mealType: "",

            timingOffsetMinutes:
              totalTimingOffsetMinutes,

            reminderTimes,
startDate,
endDate,
isActive,

            instructions:
              instructions.trim(),

            prescriptionImage,
          }
        );

      if (
        response.data?.message ===
        "Medication updated successfully"
      ) {
        setMessage(
          "Medication updated successfully."
        );

        setMessageType("success");

        setTimeout(() => {
          navigate("/medications");
        }, 900);
      } else {
        setMessage(
          response.data?.message ||
            "The medication could not be updated."
        );

        setMessageType("danger");
      }
    } catch (error) {
      console.error(
        "Medication update error:",
        error
      );

      setMessage(
        error.response?.data
          ?.message ||
          "An error occurred while updating the medication."
      );

      setMessageType("danger");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container
      fluid
      className="dashboard-page"
    >
      <Header />

      <Row className="py-5 px-3 justify-content-center">
        <Col lg="8" xl="7">
          <div className="mb-4">
            <h2
              style={{
                color: "#1e3a8a",
                fontWeight: "700",
              }}
            >
              Edit Medication
            </h2>

            <p
              style={{
                color: "#6b7280",
              }}
            >
              Update the medication
              information and schedule, then
              save your changes.
            </p>
          </div>

          <Card
            style={{
              borderRadius: "16px",
              border:
                "1px solid #e5e7eb",
              boxShadow:
                "0 8px 24px rgba(30, 58, 138, 0.08)",
            }}
          >
            <CardBody className="p-4">
              {message && (
                <Alert
                  color={messageType}
                >
                  {message}
                </Alert>
              )}

              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner color="primary" />

                  <p
                    style={{
                      color: "#6b7280",
                      marginTop: "12px",
                    }}
                  >
                    Loading medication...
                  </p>
                </div>
              ) : (
                <>
                  <FormGroup>
                    <Label>
                      Medication Name{" "}
                      <span
                        style={{
                          color:
                            "#dc3545",
                        }}
                      >
                        *
                      </span>
                    </Label>

                    <Input
                      type="text"
                      value={
                        medicationName
                      }
                      onChange={(
                        event
                      ) => {
                        setMedicationName(
                          event.target
                            .value
                        );

                        clearMessage();
                      }}
                    />
                  </FormGroup>

<FormGroup>
  <Label>
    Medication Form <span className="text-danger">*</span>
  </Label>

  <Input
    type="select"
    value={medicationForm}
    onChange={(event) => {
      const selectedForm = event.target.value;

      setMedicationForm(selectedForm);
      setDosageUnit(
        medicationDosageUnits[selectedForm]?.[0] || ""
      );
      clearMessage();
    }}
  >
    <option value="">Select medication form</option>
    {Object.keys(medicationDosageUnits).map((form) => (
      <option key={form} value={form}>
        {form}
      </option>
    ))}
  </Input>
</FormGroup>

{medicationForm === "Cream/Ointment" && (
  <FormGroup>
    <Label>Application Instructions</Label>

    <Input
      type="text"
      placeholder="e.g. Apply a thin layer to the affected area"
      value={topicalDosage}
      onChange={(event) => {
        setTopicalDosage(event.target.value);
        clearMessage();
      }}
    />
  </FormGroup>
)}
                  <FormGroup>
                    <Label>
                      Dosage{" "}
                      <span
                        style={{
                          color:
                            "#dc3545",
                        }}
                      >
                        *
                      </span>
                    </Label>

                    <Row>
  <Col sm="7" className="mb-2 mb-sm-0">
    <Input
      type="number"
      min="0"
      step="any"
      placeholder="For example, 500"
      value={dosageAmount}
      onChange={(event) => {
        setDosageAmount(event.target.value);
        clearMessage();
      }}
    />
  </Col>

  <Col sm="5">
    <Input
      type="select"
      value={dosageUnit}
      onChange={(event) => {
        setDosageUnit(event.target.value);
        clearMessage();
      }}
    >
      {(medicationDosageUnits[medicationForm] || []).map((unit) => (
        <option key={unit} value={unit}>
          {unit}
        </option>
      ))}
    </Input>
  </Col>
</Row>
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      Frequency{" "}
                      <span
                        style={{
                          color:
                            "#dc3545",
                        }}
                      >
                        *
                      </span>
                    </Label>

                    <Input
                      type="select"
                      value={frequency}
                      onChange={(
                        event
                      ) => {
                        const selectedFrequency =
                          event.target
                            .value;

                        setFrequency(
                          selectedFrequency
                        );
                        if (selectedFrequency !== "Weekly") {
  setWeeklyDay("");
}

                        if (
                          selectedFrequency !==
                          "Other"
                        ) {
                          setCustomFrequency(
                            ""
                          );
                        }

                        updateReminderTimeCount(
                          selectedFrequency
                        );

                        clearMessage();
                      }}
                    >
                      <option value="">
                        Select frequency
                      </option>

                      <option value="Once daily">
                        Once daily
                      </option>

                      <option value="Twice daily">
                        Twice daily
                      </option>

                      <option value="Three times daily">
                        Three times daily
                      </option>

                      <option value="Every 6 hours">
                        Every 6 hours
                      </option>

                      <option value="Every 8 hours">
                        Every 8 hours
                      </option>

                      <option value="Every 12 hours">
                        Every 12 hours
                      </option>

                      <option value="Weekly">
                        Weekly
                      </option>

                      <option value="As needed">
                        As needed
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </Input>
                  </FormGroup>

{frequency === "Weekly" && (
  <FormGroup>
    <Label>
      Select Weekday <span style={{ color: "#dc3545" }}>*</span>
    </Label>

    <Input
      type="select"
      value={weeklyDay}
      onChange={(event) => {
        setWeeklyDay(event.target.value);
        clearMessage();
      }}
    >
      <option value="">Select a day</option>
      {[
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ].map((day) => (
        <option key={day} value={day}>
          {day}
        </option>
      ))}
    </Input>
  </FormGroup>
)}

                  {frequency ===
                    "Other" && (
                    <FormGroup>
                      <Label>
                        Enter Frequency{" "}
                        <span
                          style={{
                            color:
                              "#dc3545",
                          }}
                        >
                          *
                        </span>
                      </Label>

                      <Input
                        type="text"
                        placeholder="For example, every other day"
                        value={
                          customFrequency
                        }
                        onChange={(
                          event
                        ) => {
                          setCustomFrequency(
                            event.target
                              .value
                          );

                          clearMessage();
                        }}
                      />
                    </FormGroup>
                  )}

                  <FormGroup>
                    <Label>
                      Timing{" "}
                      <span
                        style={{
                          color:
                            "#dc3545",
                        }}
                      >
                        *
                      </span>
                    </Label>

                    <Input
                      type="select"
                      value={timing}
                      onChange={(
                        event
                      ) => {
                        const selectedTiming =
                          event.target
                            .value;

                        setTiming(
                          selectedTiming
                        );

                        const isMealTiming =
                          [
                            "Before Meal",
                            "With Meal",
                            "After Meal",
                          ].includes(
                            selectedTiming
                          );


                        if (
                          selectedTiming ===
                            "With Meal" ||
                          !isMealTiming
                        ) {
                          setTimingOffsetHours(
                            ""
                          );

                          setTimingOffsetMinutes(
                            ""
                          );
                        }

                        clearMessage();
                      }}
                    >
                      <option value="Before Meal">
                        Before Meal
                      </option>

                      <option value="With Meal">
                        With Meal
                      </option>

                      <option value="After Meal">
                        After Meal
                      </option>

                      <option value="Morning">
                        Morning
                      </option>

<option value="At Wake Time">
  At Wake Time
</option>
                      <option value="Afternoon">
                        Afternoon
                      </option>

                      <option value="Evening">
                        Evening
                      </option>

                      <option value="Before Sleep">
                        Before Sleep
                      </option>

                      <option value="Any Time">
                        Any Time
                      </option>
                    </Input>
                  </FormGroup>

                  {[
                    "Before Meal",
                    "With Meal",
                    "After Meal",
                  ].includes(timing) && (
                    <>
                      <FormGroup>
                       
                      </FormGroup>

                      {timing !==
                        "With Meal" && (
                        <FormGroup>
                          <Label>
                            How long{" "}
                            {timing ===
                            "After Meal"
                              ? "after"
                              : "before"}{" "}
                            the meal?{" "}
                            <span
                              style={{
                                color:
                                  "#dc3545",
                              }}
                            >
                              *
                            </span>
                          </Label>

                          <Row>
                            <Col
                              md="6"
                              className="mb-2 mb-md-0"
                            >
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="Hours"
                                value={
                                  timingOffsetHours
                                }
                                onChange={(
                                  event
                                ) => {
                                  setTimingOffsetHours(
                                    event
                                      .target
                                      .value
                                  );

                                  clearMessage();
                                }}
                              />
                            </Col>

                            <Col md="6">
                              <Input
                                type="number"
                                min="0"
                                max="59"
                                step="1"
                                placeholder="Minutes"
                                value={
                                  timingOffsetMinutes
                                }
                                onChange={(
                                  event
                                ) => {
                                  setTimingOffsetMinutes(
                                    event
                                      .target
                                      .value
                                  );

                                  clearMessage();
                                }}
                              />
                            </Col>
                          </Row>

                          <small className="text-muted">
                            Enter the timing
                            given in the
                            medication
                            instructions or by
                            your healthcare
                            provider.
                          </small>
                        </FormGroup>
                      )}
                    </>
                  )}

                  <FormGroup>
                    <Label>
                      Medication Start Date{" "}
                      <span
                        style={{
                          color:
                            "#dc3545",
                        }}
                      >
                        *
                      </span>
                    </Label>

                    <Input
                      type="date"
                      value={startDate}
                      onChange={(
                        event
                      ) => {
                        setStartDate(
                          event.target
                            .value
                        );

                        clearMessage();
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
  <Label>
    Medication End Date{" "}
    <span style={{ color: "#dc3545" }}>*</span>
  </Label>

  <Input
    type="date"
    value={endDate}
    min={startDate}
    onChange={(event) => {
      setEndDate(event.target.value);
      clearMessage();
    }}
  />
</FormGroup>

                  {frequency &&
                    frequency !==
                      "As needed" && (
                      <FormGroup>
                        <Label>
                          Reminder Time
                          {reminderTimes.length >
                          1
                            ? "s"
                            : ""}{" "}
                          <span
                            style={{
                              color:
                                "#dc3545",
                            }}
                          >
                            *
                          </span>
                        </Label>

                        <p
                          style={{
                            color:
                              "#6b7280",
                            fontSize:
                              "14px",
                            marginBottom:
                              "10px",
                          }}
                        >
                          Choose the time for
                          each scheduled dose.
                        </p>

                        <Row>
                          {reminderTimes.map(
                            (
                              reminderTime,
                              index
                            ) => (
                              <Col
                                md="6"
                                className="mb-3"
                                key={index}
                              >
                                <Label>
  {getDoseLabel(reminderTime, index)}
</Label>

                                <Input
                                  type="time"
                                  value={
                                    reminderTime
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleReminderTimeChange(
                                      index,
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                />
                              </Col>
                            )
                          )}
                        </Row>
                      </FormGroup>
                    )}

                  {frequency ===
                    "As needed" && (
                    <Alert color="info">
                      Reminder times are
                      optional for medication
                      taken only when needed.
                    </Alert>
                  )}

                  <FormGroup switch>
                    <Input
                      type="switch"
                      id="medicationStatus"
                      checked={isActive}
                      onChange={(
                        event
                      ) => {
                        setIsActive(
                          event.target
                            .checked
                        );

                        clearMessage();
                      }}
                    />

                    <Label
                      for="medicationStatus"
                      check
                    >
                      Medication is active
                    </Label>
                  </FormGroup>

                  <small className="text-muted d-block mb-4">
                    Inactive medications will
                    remain in your list but
                    will not generate new
                    daily doses.
                  </small>

                  <FormGroup>
                    <Label>
                      Instructions
                    </Label>

                    <Input
                      type="textarea"
                      rows="4"
                      placeholder="Enter any additional instructions"
                      value={instructions}
                      onChange={(
                        event
                      ) => {
                        setInstructions(
                          event.target
                            .value
                        );

                        clearMessage();
                      }}
                    />
                  </FormGroup>

                  {prescriptionImage && (
                    <div
                      style={{
                        backgroundColor:
                          "#eef4ff",
                        color:
                          "#1e3a8a",
                        border:
                          "1px solid #c8d8ff",
                        padding:
                          "12px 14px",
                        borderRadius:
                          "10px",
                        marginBottom:
                          "18px",
                      }}
                    >
                      <strong>
                        Existing Prescription
                      </strong>

                      <div className="mt-2">
                        <a
                          href={`http://localhost:3002${prescriptionImage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color:
                              "#0d6efd",
                            textDecoration:
                              "underline",
                          }}
                        >
                          View Prescription
                        </a>
                      </div>
                    </div>
                  )}

                  <div
                    className="d-flex justify-content-end"
                    style={{
                      gap: "10px",
                    }}
                  >
                    <Button
                      type="button"
                      color="light"
                      disabled={isSaving}
                      onClick={() =>
                        navigate(
                          "/medications"
                        )
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      color="success"
                      onClick={
                        updateMedication
                      }
                      disabled={isSaving}
                    >
                      {isSaving
                        ? "Saving Changes..."
                        : "Save Changes"}
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Footer />
    </Container>
  );
};

export default EditMedication;