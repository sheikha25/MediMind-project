import mongoose from "mongoose";

const MedicationSchema = mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    trim: true,
  },

  medicationName: {
    type: String,
    required: true,
    trim: true,
  },

  // Medication reference information
medicationCatalogId: {
  type: String,
  default: "",
  trim: true,
},

activeIngredient1: {
  type: String,
  default: "",
  trim: true,
},

activeIngredient2: {
  type: String,
  default: "",
  trim: true,
},

  medicationForm: {
    type: String,
    required: true,
    enum: [
      "Tablet",
      "Capsule",
      "Injection",
      "Cream/Ointment",
      "Inhaler",
      "Eye Drops",
      "Ear Drops",
      "Liquid/Syrup",
      "Patch",
      "Suppository",
      "Other",
    ],
  },

  topicalDosage: {
    type: String,
    default: "",
    trim: true,
  },

  // Existing field, retained for compatibility
  // Example: "2 capsules"
  dosage: {
    type: String,
    required: true,
  },

  // New: quantity administered at each scheduled dose
  doseQuantity: {
    type: Number,
    min: 0,
    default: null,
  },

  // New: capsule, tablet, ml, etc.
  doseUnit: {
    type: String,
    default: "",
  },

  // New: e.g. "500 mg per capsule"
  medicationStrength: {
    type: String,
    default: "",
    trim: true,
  },

  // New: quantity dispensed or currently available
  suppliedQuantity: {
    type: Number,
    min: 0,
    default: null,
  },

  frequency: {
    type: String,
    required: true,
  },

  timing: {
    type: String,
    required: true,
  },

  timingOffsetMinutes: {
    type: Number,
    min: 0,
    default: 0,
  },

  reminderTimes: {
    type: [String],
    default: [],
  },

  
weeklyDay: {
  type: [
    {
      type: String,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
  ],
  default: [],
},


  startDate: {
    type: Date,
    default: Date.now,
  },

  endDate: {
    type: Date,
    default: null,
    validate: {
      validator: function (value) {
        if (!value || !this.startDate) {
          return true;
        }

        return value >= this.startDate;
      },

      message: "End date cannot be earlier than start date.",
    },
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  instructions: {
    type: String,
    default: "",
  },

  prescriptionImage: {
    type: String,
    default: "",
  },
});

const MedicationModel = mongoose.model(
  "MedicationsTbl",
  MedicationSchema,
  "MedicationsTbl"
);

export default MedicationModel;
