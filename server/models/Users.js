import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phoneNumber: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  isEmailVerified: {
  type: Boolean,
  default: false,
},

emailVerificationToken: {
  type: String,
  default: "",
},

emailVerificationExpires: {
  type: Date,
},

  role: {
    type: String,
    required: true,
  },

    accountDeletionStatus: {
    type: String,
    enum: ["None", "Pending", "Approved", "Rejected"],
    default: "None",
  },

  medicalCondition: {
    type: [String],
    default: undefined,
  },

  age: {
    type: Number,
    min: 0,
  },

  gender: {
    type: String,
    enum: ["Male", "Female"],
    trim: true,
  },

  height: {
    type: Number,
    min: 0,
  },

  weight: {
    type: Number,
    min: 0,
  },

  bloodType: {
    type: String,
    trim: true,
  },

  allergies: {
    type: [String],
    default: undefined,
  },

  emergencyContact: {
    type: String,
    trim: true,
  },

  

dailyRoutine: {
  breakfast: {
    type: String,
    default: "",
  },

  lunch: {
    type: String,
    default: "",
  },

  dinner: {
    type: String,
    default: "",
  },

  wake: {
    type: String,
    default: "",
  },

  sleep: {
    type: String,
    default: "",
  },
},


routineSetupCompleted: {
  type: Boolean,
  default: false,
},

routineSetupDeferred: {
  type: Boolean,
  default: false,
},


  notificationsEnabled: {
    type: Boolean,
    default: true,
  },

  profilepic: {
    type: String,
    default: "",
  },

  patientLinkCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
  },

  degree: {
    type: String,
  },

  experience: {
    type: Number,
  },

  certificates: [
    {
      certificateName: {
        type: String,
        required: true,
      },

      certificateFile: {
        type: String,
        required: true,
      },
    },
  ],


  professionalVerificationStatus: {
  type: String,
  enum: ["Not Submitted", "Pending", "Verified", "Rejected"],
  default: "Not Submitted",
},

professionalVerifiedAt: {
  type: Date,
  default: null,
},

  languages: {
    type: [String],
    default: undefined,
  },

  availability: {
    type: [String],
    default: undefined,
  },

  availableTimes: {
    type: [String],
    default: undefined,
  },

  location: {
    type: String,
  },

  bio: {
    type: String,
  },

  latitude: {
  type: Number,
},

longitude: {
  type: Number,
},
});

const UserModel = mongoose.model(
  "UsersTbl",
  UserSchema,
  "UsersTbl"
);

export default UserModel;