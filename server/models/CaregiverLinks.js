import mongoose from "mongoose";

const CaregiverLinkSchema = mongoose.Schema({
  caregiverEmail: {
    type: String,
    required: true,
  },

  patientEmail: {
    type: String,
    required: true,
  },

  relationship: {
    type: String,
  },

  status: {
    type: String,
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

const CaregiverLinkModel = mongoose.model(
  "CaregiverLinksTbl",
  CaregiverLinkSchema,
  "CaregiverLinksTbl"
);

export default CaregiverLinkModel;