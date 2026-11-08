
import mongoose from "mongoose";

const CaregiverLinkSchema = new mongoose.Schema({
  caregiverEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  patientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  relationship: {
    type: String,
  },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },

  medicationManagementPermission: {
    type: Boolean,
    default: false,
  },

  patientLinkCode: {
    type: String,
    required: true,
  },

  requestedBy: {
    type: String,
    enum: ["caregiver", "patient"],
    default: "caregiver",
  },

  requestedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate link records for the same pair.
CaregiverLinkSchema.index(
  { caregiverEmail: 1, patientEmail: 1 },
  { unique: true }
);

// One patient can have only one Accepted caregiver.
CaregiverLinkSchema.index(
  { patientEmail: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "Accepted",
    },
  }
);

// Speeds up checking the caregiver's active patients.
CaregiverLinkSchema.index({
  caregiverEmail: 1,
  status: 1,
});

const CaregiverLinkModel = mongoose.model(
  "CaregiverLinksTbl",
  CaregiverLinkSchema,
  "CaregiverLinksTbl"
);

export default CaregiverLinkModel;
