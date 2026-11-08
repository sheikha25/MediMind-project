import mongoose from "mongoose";

const DoseRecordSchema = mongoose.Schema(
  {
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicationsTbl",
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    medicationName: {
      type: String,
      required: true,
    },

    dosage: {
      type: String,
      required: true,
    },

    scheduledDate: {
      type: String,
      required: true,
    },

    scheduledTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Upcoming", "Taken", "Missed", "Skipped"],
      default: "Upcoming",
    },

    takenAt: {
      type: Date,
      default: null,
    },

    notificationDismissed: {
      type: Boolean,
      default: false,
    },

    snoozedUntil: {
  type: Date,
  default: null,
},
snoozeCount: {
  type: Number,
  default: 0,
  min: 0,
  max: 2,
},
  },
  {
    timestamps: true,
  }
);

DoseRecordSchema.index(
  {
    medicationId: 1,
    userEmail: 1,
    scheduledDate: 1,
    scheduledTime: 1,
  },
  {
    unique: true,
  }
);

const DoseRecordModel = mongoose.model(
  "DoseRecordsTbl",
  DoseRecordSchema,
  "DoseRecordsTbl"
);

export default DoseRecordModel;
