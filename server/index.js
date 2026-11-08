
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UserModel from "./models/Users.js";
import MedicationModel from "./models/Medications.js";
import CaregiverLinkModel from "./models/CaregiverLinks.js";
import DoseRecordModel from "./models/DoseRecordModel.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const omanMedications = require("../client/src/data/omanmedications.json");




const normalizeActiveIngredient = (value) => {
  const ingredient = String(value || "")
    .toLowerCase()
    .trim();

  if (
    !ingredient ||
    ingredient === "unknown" ||
    ingredient === "n/a"
  ) {
    return "";
  }

  return ingredient
    // Remove strength values such as 500 MG or 5 ML
    .replace(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|%)\b/gi, "")
    // Remove spaces and punctuation
    .replace(/[^a-z0-9]/g, "");
};

const getMedicationIngredients = (medication) => {
  return [
    medication?.activeIngredient1,
    medication?.activeIngredient2,
  ]
    .map(normalizeActiveIngredient)
    .filter(Boolean);
};

const findSharedIngredients = (firstMedication, secondMedication) => {
  const firstIngredients = getMedicationIngredients(firstMedication);
  const secondIngredients = getMedicationIngredients(secondMedication);

  return firstIngredients.filter((ingredient) =>
    secondIngredients.includes(ingredient)
  );
};

const normalizeMedicationName = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\b\d+(?:\.\d+)?\s*(mg|mcg|g|ml|iu)\b/g, " ")
    .replace(/\b(tablets?|capsules?|soft\s*gelatin|softgels?)\b/g, " ")
    .replace(/[^a-z0-9]/g, "");



const medicationNameDistance = (first, second) => {
  const a = normalizeMedicationName(first);
  const b = normalizeMedicationName(second);

  const rows = a.length + 1;
  const columns = b.length + 1;

  const distances = Array.from(
    { length: rows },
    () => Array(columns).fill(0)
  );

  for (let i = 0; i < rows; i++) {
    distances[i][0] = i;
  }

  for (let j = 0; j < columns; j++) {
    distances[0][j] = j;
  }

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < columns; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      distances[i][j] = Math.min(
        distances[i - 1][j] + 1,
        distances[i][j - 1] + 1,
        distances[i - 1][j - 1] + cost
      );

      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        distances[i][j] = Math.min(
          distances[i][j],
          distances[i - 2][j - 2] + 1
        );
      }
    }
  }

  return distances[a.length][b.length];
};



const uploadsDirectory = "uploads";

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadsDirectory);
  },

  filename: (req, file, callback) => {
    const uniqueFileName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    callback(null, uniqueFileName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          "Only PDF, JPG, JPEG, and PNG files are allowed."
        )
      );
    }
  },
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "MediMindproject@gmail.com",
    pass: "puvenkivfsahgwdc",
  },
});
/*const multer = require("multer");
const path = require("path");
const fs = require("fs");*/


app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send({
        success: false,
        message:
          "The certificate file must be smaller than 5 MB",
      });
    }

    return res.status(400).send({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).send({
      success: false,
      message: error.message,
    });
  }

  next();
});



app.get("/admin/users", async (req, res) => {
  try {
    const users = await UserModel.find(
      {},
      {
        password: 0,
      }
    ).sort({ name: 1 });

    const patients = users.filter(
      (user) => user.role === "patient"
    );

    const caregivers = users.filter(
      (user) => user.role === "caregiver"
    );

    res.send({
      success: true,
      users,
      summary: {
        totalUsers: users.length,
        patients: patients.length,
        caregivers: caregivers.length,
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);

    res.status(500).send({
      success: false,
      users: [],
      message: "Unable to load users.",
    });
  }
});

// Admin - View Account Deletion Requests
app.get("/admin/deletion-requests", async (req, res) => {
  try {
    const requests = await UserModel.find(
      {
        role: { $in: ["patient", "caregiver"] },
        accountDeletionStatus: "Pending",
      },
      {
        name: 1,
        email: 1,
        role: 1,
        accountDeletionStatus: 1,
      }
    ).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Deletion requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load deletion requests.",
    });
  }
});

// Admin - Reject Account Deletion Request
app.put("/admin/deletion-requests/:userId/reject", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        role: { $in: ["patient", "caregiver"] },
        accountDeletionStatus: "Pending",
      },
      {
        $set: {
          accountDeletionStatus: "Rejected",
        },
      },
      { new: true }
    ).select("name email role accountDeletionStatus");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pending deletion request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account deletion request rejected.",
      user,
    });
  } catch (error) {
    console.error("Reject deletion request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject deletion request.",
    });
  }
});

// Admin - Approve Account Deletion
app.delete("/admin/deletion-requests/:userId/approve", async (req, res) => {
  let session;

  try {
    const { userId } = req.params;
    const { adminEmail, adminPassword } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (
      typeof adminEmail !== "string" ||
      !adminEmail.trim() ||
      typeof adminPassword !== "string" ||
      !adminPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin email and password are required.",
      });
    }

    // Verify administrator credentials
    const admin = await UserModel.findOne({
      email: adminEmail.trim().toLowerCase(),
      role: "admin",
    });

    if (!admin || !(await bcrypt.compare(adminPassword, admin.password))) {
      return res.status(403).json({
        success: false,
        message: "Invalid administrator credentials.",
      });
    }

    const user = await UserModel.findOne({
      _id: userId,
      role: { $in: ["patient", "caregiver"] },
      accountDeletionStatus: "Pending",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pending deletion request not found.",
      });
    }

    const email = user.email.trim().toLowerCase();

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const account = await UserModel.findOne({
        _id: userId,
        role: { $in: ["patient", "caregiver"] },
        accountDeletionStatus: "Pending",
      }).session(session);

      if (!account) {
        throw new Error("Pending deletion request no longer exists.");
      }

      if (account.role === "patient") {
        const medications = await MedicationModel.find({
          userEmail: email,
        })
          .select("_id")
          .session(session);

        const medicationIds = medications.map((medication) => medication._id);

        await DoseRecordModel.deleteMany(
          {
            $or: [
              { userEmail: email },
              { medicationId: { $in: medicationIds } },
            ],
          },
          { session }
        );

        await MedicationModel.deleteMany(
          { userEmail: email },
          { session }
        );

        await CaregiverLinkModel.deleteMany(
          { patientEmail: email },
          { session }
        );
      }

      if (account.role === "caregiver") {
        await CaregiverLinkModel.deleteMany(
          { caregiverEmail: email },
          { session }
        );
      }

      await UserModel.deleteOne(
        { _id: account._id },
        { session }
      );
    });

    return res.status(200).json({
      success: true,
      message: "Account permanently deleted.",
    });
  } catch (error) {
    console.error("Approve deletion request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve account deletion.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

app.put(
  "/admin/caregivers/:id/verification",
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["Verified", "Rejected"].includes(status)) {
        return res.status(400).send({
          success: false,
          message: "Invalid verification status",
        });
      }

      const caregiver = await UserModel.findOne({
        _id: id,
        role: "caregiver",
      });

      if (!caregiver) {
        return res.status(404).send({
          success: false,
          message: "Caregiver not found",
        });
      }

      if (
        !caregiver.certificates ||
        caregiver.certificates.length === 0
      ) {
        return res.status(400).send({
          success: false,
          message:
            "Caregiver has not submitted a professional certificate",
        });
      }

      caregiver.professionalVerificationStatus =
        status;

      caregiver.professionalVerifiedAt =
        status === "Verified"
          ? new Date()
          : null;

      await caregiver.save();

      res.send({
        success: true,
        message:
          status === "Verified"
            ? "Caregiver verified successfully"
            : "Caregiver verification rejected",
        caregiver,
      });
    } catch (error) {
      console.log(
        "Caregiver Verification Error:",
        error
      );

      res.status(500).send({
        success: false,
        message:
          "Unable to update caregiver verification",
      });
    }
  }
);

app.get(
  "/caregiver/my-patients/:caregiverEmail",
  async (req, res) => {
    try {
      const caregiverEmail = decodeURIComponent(
        req.params.caregiverEmail
      );

      const currentUser = await UserModel.findOne({
        email: caregiverEmail,
        role: "caregiver",
      }).select("email role");

      if (
        !currentUser ||
        currentUser.role !== "caregiver" ||
        currentUser.email.toLowerCase() !== caregiverEmail.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to patient information.",
        });
      }

      const patients =
        await CaregiverLinkModel.aggregate([
          {
            $match: {
              caregiverEmail: currentUser.email,
              status: "Accepted",
            },
          },
          {
            $lookup: {
              from: "UsersTbl",
              localField: "patientEmail",
              foreignField: "email",
              as: "patientDetails",
            },
          },
          {
            $unwind: {
              path: "$patientDetails",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $project: {
              relationship: 1,
              patientEmail: 1,
              medicationManagementPermission: 1,

              patientName:
                "$patientDetails.name",

              patientPhoneNumber:
                "$patientDetails.phoneNumber",

              patientProfilePicture:
                "$patientDetails.profilepic",

              medicalConditions:
                "$patientDetails.medicalCondition",

              age: "$patientDetails.age",
              height: "$patientDetails.height",
              weight: "$patientDetails.weight",
              bloodType:
                "$patientDetails.bloodType",
              allergies:
                "$patientDetails.allergies",
              emergencyContact:
                "$patientDetails.emergencyContact",
            },
          },
          {
            $sort: {
              patientName: 1,
            },
          },
        ]);

      res.send({
        success: true,
        patients,
      });
    } catch (error) {
      console.error(
        "Fetch linked patients error:",
        error
      );

      res.status(500).send({
        success: false,
        patients: [],
        message:
          "Unable to load linked patients.",
      });
    }
  }
);

app.put("/patient/profile", async (req, res) => {
  try {
    const {
      email,
      name,
      phoneNumber,
      age,
      height,
      weight,
      bloodType,
      allergies,
      emergencyContact,
      location,
      latitude,
      longitude,
    } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Patient email is required.",
      });
    }


    // Validate patient age before updating the database.
    if (
      age !== "" &&
      age !== null &&
      age !== undefined
    ) {
      const numericAge = Number(age);

      if (
        !Number.isInteger(numericAge) ||
        numericAge < 0 ||
        numericAge > 120
      ) {
        return res.status(400).send({
          success: false,
          message:
            "Please enter a valid age between 0 and 120 (whole numbers only).",
        });
      }
    }

    const formattedAllergies = Array.isArray(allergies)
      ? allergies
        .map((allergy) => allergy.trim())
        .filter(Boolean)
      : [];

    const updatedPatient =
      await UserModel.findOneAndUpdate(
        {
          email,
          role: "patient",
        },
        {
          $set: {
            name: name?.trim() || "",

            phoneNumber:
              phoneNumber?.trim() || "",

            age:
              age === "" ||
                age === null ||
                age === undefined
                ? null
                : Number(age),

            height:
              height === "" ||
                height === null ||
                height === undefined
                ? undefined
                : Number(height),

            weight:
              weight === "" ||
                weight === null ||
                weight === undefined
                ? undefined
                : Number(weight),

            bloodType:
              bloodType?.trim() || "",

            allergies:
              formattedAllergies,

            emergencyContact:
              emergencyContact?.trim() || "",

            location:
              location?.trim() || "",

            latitude:
              latitude === "" ||
                latitude === null ||
                latitude === undefined
                ? undefined
                : Number(latitude),

            longitude:
              longitude === "" ||
                longitude === null ||
                longitude === undefined
                ? undefined
                : Number(longitude),
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!updatedPatient) {
      return res.status(404).send({
        success: false,
        message: "Patient account not found.",
      });
    }

    return res.send({
      success: true,
      message:
        "Patient profile updated successfully.",
      user: updatedPatient,
    });
  } catch (error) {
    console.error(
      "Patient profile update error:",
      error
    );

    return res.status(500).send({
      success: false,
      message:
        "Unable to update patient profile.",
    });
  }
});



app.get(
  "/caregiver/patient-medications/:caregiverEmail/:patientEmail",
  async (req, res) => {
    try {
      const caregiverEmail = decodeURIComponent(
        req.params.caregiverEmail
      );

      const patientEmail = decodeURIComponent(
        req.params.patientEmail
      );

      const currentUser = await UserModel.findOne({
        email: caregiverEmail,
        role: "caregiver",
      }).select("email role");

      if (
        !currentUser ||
        currentUser.role !== "caregiver" ||
        currentUser.email.toLowerCase() !== caregiverEmail.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          medications: [],
          message: "Unauthorized access to patient medications.",
        });
      }

      const acceptedLink =
        await CaregiverLinkModel.findOne({
          caregiverEmail: currentUser.email,
          patientEmail,
          status: "Accepted",
        });

      if (!acceptedLink) {
        return res.status(403).send({
          success: false,
          medications: [],
          message:
            "You do not have permission to view this patient's medications.",
        });
      }

      const medications =
        await MedicationModel.find({
          userEmail: patientEmail,
        }).sort({
          medicationName: 1,
        });

      res.send({
        success: true,
        medications,
      });
    } catch (error) {
      console.error(
        "Fetch patient medications error:",
        error
      );

      res.status(500).send({
        success: false,
        medications: [],
        message:
          "Unable to load patient medications.",
      });
    }
  }
);

app.put(
  "/patient/caregiver-medication-permission",
  async (req, res) => {
    try {
      const {
        patientEmail,
        caregiverEmail,
        allowed,
      } = req.body;

      if (
        !patientEmail ||
        !caregiverEmail ||
        typeof allowed !== "boolean"
      ) {
        return res.status(400).send({
          success: false,
          message: "Invalid permission request.",
        });
      }

      const link =
        await CaregiverLinkModel.findOneAndUpdate(
          {
            patientEmail,
            caregiverEmail,
            status: "Accepted",
          },
          {
            medicationManagementPermission:
              allowed,
          },
          {
            returnDocument: "after",
          }
        );

      if (!link) {
        return res.status(404).send({
          success: false,
          message:
            "Accepted caregiver connection not found.",
        });
      }

      res.send({
        success: true,
        medicationManagementPermission:
          link.medicationManagementPermission,
        message: allowed
          ? "Medication management permission granted."
          : "Medication management permission revoked.",
      });
    } catch (error) {
      console.error(
        "Medication permission error:",
        error
      );

      res.status(500).send({
        success: false,
        message:
          "Unable to update medication management permission.",
      });
    }
  }
);


app.delete(
  "/caregiver/patient-medications/:caregiverEmail/:patientEmail/:medicationId",
  async (req, res) => {
    try {
      const { caregiverEmail, patientEmail, medicationId } = req.params;
      const decodedCaregiverEmail = decodeURIComponent(caregiverEmail);
      const decodedPatientEmail = decodeURIComponent(patientEmail);

      const currentUser = await UserModel.findOne({
        email: decodedCaregiverEmail,
        role: "caregiver",
      }).select("email role");

      if (
        !currentUser ||
        currentUser.role !== "caregiver" ||
        currentUser.email.toLowerCase() !==
        decodedCaregiverEmail.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized medication management.",
        });
      }
      const link = await CaregiverLinkModel.findOne({
        caregiverEmail: currentUser.email,
        patientEmail: decodedPatientEmail,
        status: "Accepted",
        medicationManagementPermission: true,
      });

      if (!link) {
        return res.status(403).send({
          success: false,
          message: "Patient has not allowed medication management.",
        });
      }

      const medication = await MedicationModel.findOneAndDelete({
        _id: medicationId,
        userEmail: decodedPatientEmail,
      });

      if (!medication) {
        return res.status(404).send({
          success: false,
          message: "Medication not found.",
        });
      }

      await DoseRecordModel.deleteMany({
        medicationId: medicationId,
      });

      return res.send({
        success: true,
        message: "Medication deleted successfully.",
      });
    } catch (error) {
      console.error("Caregiver delete medication error:", error);

      return res.status(500).send({
        success: false,
        message: "Unable to delete medication.",
      });
    }
  }
);


app.put(
  "/caregiver/patient-medications/:caregiverEmail/:patientEmail/:medicationId",
  async (req, res) => {
    try {
      const {
        caregiverEmail,
        patientEmail,
        medicationId,
      } = req.params;

      const decodedCaregiverEmail =
        decodeURIComponent(caregiverEmail);

      const decodedPatientEmail =
        decodeURIComponent(patientEmail);

      const currentUser = await UserModel.findOne({
        email: decodedCaregiverEmail,
        role: "caregiver",
      }).select("email role");

      if (
        !currentUser ||
        currentUser.role !== "caregiver" ||
        currentUser.email.toLowerCase() !==
        decodedCaregiverEmail.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized medication management.",
        });
      }

      const link = await CaregiverLinkModel.findOne({
        caregiverEmail: currentUser.email,
        patientEmail: decodedPatientEmail,
        status: "Accepted",
        medicationManagementPermission: true,
      });

      if (!link) {
        return res.status(403).send({
          success: false,
          message:
            "Patient has not allowed medication management.",
        });
      }

      const {
        medicationName,
        dosage,
        frequency,
        timing,
        timingOffsetMinutes,
        reminderTimes,
        startDate,
        isActive,
        instructions,
        prescriptionImage,
      } = req.body;

      if (
        !medicationName ||
        !dosage ||
        !frequency ||
        !timing ||
        !startDate
      ) {
        return res.status(400).send({
          success: false,
          message:
            "Please complete all required medication fields.",
        });
      }

      let parsedReminderTimes = reminderTimes;

      if (typeof reminderTimes === "string") {
        try {
          parsedReminderTimes =
            JSON.parse(reminderTimes);
        } catch {
          return res.status(400).send({
            success: false,
            message:
              "Reminder times are not formatted correctly.",
          });
        }
      }

      if (!Array.isArray(parsedReminderTimes)) {
        parsedReminderTimes = [];
      }

      const currentMedication =
        await MedicationModel.findOne({
          _id: medicationId,
          userEmail: decodedPatientEmail,
        });

      if (!currentMedication) {
        return res.status(404).send({
          success: false,
          message: "Medication not found.",
        });
      }

      const updatedMedication =
        await MedicationModel.findOneAndUpdate(
          {
            _id: medicationId,
            userEmail: decodedPatientEmail,
          },
          {
            $set: {
              medicationName: medicationName.trim(),
              dosage: dosage.trim(),
              frequency: frequency.trim(),
              timing: timing.trim(),


              timingOffsetMinutes:
                Number(timingOffsetMinutes || 0),

              reminderTimes:
                parsedReminderTimes,

              startDate:
                new Date(startDate),

              isActive:
                typeof isActive === "boolean"
                  ? isActive
                  : isActive !== "false",

              instructions:
                instructions?.trim() || "",

              prescriptionImage:
                prescriptionImage ||
                currentMedication.prescriptionImage ||
                "",
            },
          },
          {
            returnDocument: "after",
            runValidators: true,
          }
        );

      await DoseRecordModel.deleteMany({
        medicationId,
        status: "Upcoming",
      });

      return res.send({
        success: true,
        message:
          "Medication updated successfully.",
        medication: updatedMedication,
      });
    } catch (error) {
      console.error(
        "Caregiver update medication error:",
        error
      );

      return res.status(500).send({
        success: false,
        message:
          "Unable to update medication.",
      });
    }
  }
);




app.post(
  "/caregiver/patient-medications/:caregiverEmail/:patientEmail",
  upload.single("prescription"),
  async (req, res) => {
    try {
      const caregiverEmail = decodeURIComponent(
        req.params.caregiverEmail
      );

      const patientEmail = decodeURIComponent(
        req.params.patientEmail
      );

      // 1. Verify caregiver
      const currentUser = await UserModel.findOne({
        email: caregiverEmail,
        role: "caregiver",
      }).select("email role");

      if (
        !currentUser ||
        currentUser.role !== "caregiver" ||
        currentUser.email.toLowerCase() !== caregiverEmail.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized medication management.",
        });
      }

      // 2. Check accepted connection and permission
      const link = await CaregiverLinkModel.findOne({
        caregiverEmail: currentUser.email,
        patientEmail,
        status: "Accepted",
        medicationManagementPermission: true,
      });

      if (!link) {
        return res.status(403).json({
          success: false,
          message: "Patient has not allowed medication management.",
        });
      }

      const {
        medicationName,
        medicationForm,
        topicalDosage,
        dosage,
        frequency,
        timing,
        timingOffsetMinutes,
        reminderTimes,
        startDate,
        weeklyDay,
        endDate,
        instructions,
      } = req.body || {};

      // 3. Validate required fields
      const validForms = [
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
      ];

      if (!validForms.includes(medicationForm)) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid medication form.",
        });
      }

      if (
        typeof medicationName !== "string" ||
        !medicationName.trim() ||
        typeof dosage !== "string" ||
        !dosage.trim() ||
        typeof frequency !== "string" ||
        !frequency.trim() ||
        typeof timing !== "string" ||
        !timing.trim() ||
        !startDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Please complete all required medication fields.",
        });
      }

      const cleanName = medicationName
        .trim()
        .replace(/\s+/g, " ");

      const cleanFrequency = frequency.trim();
      const cleanTiming = timing.trim();

      // 4. PREVENT DUPLICATE MEDICATION NAMES
      const normalizeName = (value) =>
        String(value || "")
          .normalize("NFKC")
          .trim()
          .replace(/\s+/g, " ")
          .toLowerCase();

      const previousNames = await MedicationModel.find({
        userEmail: patientEmail,
      }).select("medicationName");

      const duplicateExists = previousNames.some(
        (item) =>
          normalizeName(item.medicationName) ===
          normalizeName(cleanName)
      );

      if (duplicateExists) {
        return res.status(409).json({
          success: false,
          message:
            "This medication is already added. Please edit the existing medication instead.",
        });
      }

      // 5. Check medication form against Oman dataset
      const matchingMedications = omanMedications.filter(
        (entry) =>
          normalizeName(entry.tradeName) ===
          normalizeName(cleanName)
      );

      const formKeywords = {
        Tablet: ["tablet"],
        Capsule: ["capsule"],
        Injection: ["injection", "injectable"],
        "Cream/Ointment": ["cream", "ointment"],
        Inhaler: ["inhaler"],
        "Eye Drops": ["ophthalmic", "eye drop"],
        "Ear Drops": ["otic", "ear drop"],
        "Liquid/Syrup": [
          "syrup",
          "oral liquid",
          "oral solution",
        ],
        Patch: ["patch"],
        Suppository: ["suppository"],
      };

      const recognizedForms = new Set();

      for (const entry of matchingMedications) {
        const form = String(
          entry.dosageForm || entry.form || ""
        ).toLowerCase();

        for (const [formName, keywords] of Object.entries(
          formKeywords
        )) {
          if (keywords.some((word) => form.includes(word))) {
            recognizedForms.add(formName);
          }
        }
      }

      if (
        recognizedForms.size > 0 &&
        !recognizedForms.has(medicationForm)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid medication form for the selected Oman dataset medicine.",
        });
      }

      // 6. Validate dosage and units
      const unitsByForm = {
        Tablet: ["tablet", "tablets", "mg", "mcg", "iu"],
        Capsule: ["capsule", "capsules", "mg", "mcg", "iu"],
        Injection: ["units", "ml", "mg", "mcg"],
        "Cream/Ointment": [
          "g",
          "mg",
          "application",
          "applications",
        ],
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

      const dosageMatch = dosage.trim().match(
        /^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)$/
      );

      const amount = dosageMatch
        ? Number(dosageMatch[1])
        : NaN;

      const unit = dosageMatch?.[2].toLowerCase();

      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !unitsByForm[medicationForm].includes(unit)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid dosage amount and unit for the medication form.",
        });
      }

      // 7. Validate timing offset
      let offset = Number(timingOffsetMinutes ?? 0);

      if (!Number.isFinite(offset) || offset < 0) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid timing offset.",
        });
      }

      if (cleanTiming === "With Meal") {
        offset = 0;
      }

      // 8. Parse reminder times
      let parsedReminderTimes = reminderTimes;

      if (typeof parsedReminderTimes === "string") {
        try {
          parsedReminderTimes = JSON.parse(
            parsedReminderTimes
          );
        } catch {
          return res.status(400).json({
            success: false,
            message: "Reminder times are not formatted correctly.",
          });
        }
      }

      if (!Array.isArray(parsedReminderTimes)) {
        return res.status(400).json({
          success: false,
          message: "Reminder times must be an array.",
        });
      }

      parsedReminderTimes = parsedReminderTimes.map(
        (value) =>
          typeof value === "string"
            ? value.trim()
            : value
      );

      // 9. Validate frequency and schedule
      const schedule = validateMedicationSchedule(
        cleanFrequency,
        parsedReminderTimes
      );

      if (!schedule.valid) {
        return res.status(400).json({
          success: false,
          message: schedule.message,
        });
      }

      // 10. Validate weekly days
      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      let parsedWeeklyDays = [];

      if (cleanFrequency === "Weekly") {
        try {
          if (Array.isArray(weeklyDay)) {
            parsedWeeklyDays = weeklyDay;
          } else if (
            typeof weeklyDay === "string" &&
            weeklyDay.trim()
          ) {
            const value = weeklyDay.trim();

            parsedWeeklyDays = value.startsWith("[")
              ? JSON.parse(value)
              : [value];
          }
        } catch {
          return res.status(400).json({
            success: false,
            message: "Weekly days are not formatted correctly.",
          });
        }

        if (
          !Array.isArray(parsedWeeklyDays) ||
          parsedWeeklyDays.length === 0 ||
          parsedWeeklyDays.some(
            (day) => !weekdays.includes(day)
          ) ||
          new Set(parsedWeeklyDays).size !==
            parsedWeeklyDays.length
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Please select valid, non-duplicate weekly days.",
          });
        }
      } else if (
        weeklyDay != null &&
        weeklyDay !== "" &&
        !(
          Array.isArray(weeklyDay) &&
          weeklyDay.length === 0
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Weekly days are only allowed for weekly medications.",
        });
      }

      // 11. Validate dates
      const validDate = (value) =>
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) ===
          value;

      if (
        !validDate(startDate) ||
        (endDate && !validDate(endDate))
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter valid medication dates.",
        });
      }

      if (endDate && endDate < startDate) {
        return res.status(400).json({
          success: false,
          message:
            "End date cannot be earlier than start date.",
        });
      }

      // 12. Save medication to the selected patient
      const catalogEntry = matchingMedications[0];

      const medication = new MedicationModel({
        userEmail: patientEmail,
        medicationName: cleanName,
        medicationCatalogId:
          catalogEntry?.id ||
          catalogEntry?.registrationNumber ||
          "",
        activeIngredient1:
          catalogEntry?.activeIngredient1 ||
          catalogEntry?.activeIngredient1Raw ||
          "",
        activeIngredient2:
          catalogEntry?.activeIngredient2 ||
          catalogEntry?.activeIngredient2Raw ||
          "",
        medicationForm,
        topicalDosage:
          medicationForm === "Cream/Ointment"
            ? String(topicalDosage || "").trim()
            : "",
        dosage: dosage.trim(),
        frequency: cleanFrequency,
        timing: cleanTiming,
        timingOffsetMinutes: offset,
        reminderTimes: parsedReminderTimes,
        startDate: new Date(startDate),
        weeklyDay:
          cleanFrequency === "Weekly"
            ? parsedWeeklyDays
            : [],
        endDate: endDate
          ? new Date(endDate)
          : null,
        isActive: true,
        instructions:
          typeof instructions === "string"
            ? instructions.trim()
            : "",
        prescriptionImage: req.file
          ? `/uploads/${req.file.filename}`
          : "",
      });

      await medication.save();

      return res.status(201).json({
        success: true,
        message: "Medication added successfully.",
        medication,
      });

    } catch (error) {
      console.error(
        "Caregiver Add Medication Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to add medication.",
      });
    }
  }
);



app.post(
  "/patient/generate-today-doses",
  async (req, res) => {
    try {
      const { userEmail } = req.body;

      if (!userEmail) {
        return res.status(400).send({
          success: false,
          message: "Patient email is required.",
        });
      }

      const today = new Date()
        .toISOString()
        .split("T")[0];

      // Get the patient's saved daily routine
      const patient = await UserModel.findOne({
        email: userEmail,
        role: "patient",
      });

      if (!patient) {
        return res.status(404).send({
          success: false,
          message: "Patient account not found.",
        });
      }

      const dailyRoutine =
        patient.dailyRoutine || {};

      // Convert HH:MM into minutes
      const timeToMinutes = (timeString) => {
        if (!timeString) {
          return null;
        }

        const [hours, minutes] =
          timeString
            .split(":")
            .map(Number);

        return hours * 60 + minutes;
      };

      // Convert total minutes back into HH:MM
      const minutesToTime = (
        totalMinutes
      ) => {
        const minutesInDay =
          24 * 60;

        const normalizedMinutes =
          ((totalMinutes %
            minutesInDay) +
            minutesInDay) %
          minutesInDay;

        const hours = Math.floor(
          normalizedMinutes / 60
        );

        const minutes =
          normalizedMinutes % 60;

        return `${String(hours).padStart(
          2,
          "0"
        )}:${String(minutes).padStart(
          2,
          "0"
        )}`;
      };

      // Calculate a reminder time from meal rules

      const medications =
        await MedicationModel.find({
          userEmail,
          isActive: true,
          startDate: {
            $lte: new Date(
              `${today}T23:59:59.999Z`
            ),
          },
        });

      let createdCount = 0;

      for (const medication of medications) {

        const todayDate = new Date(`${today}T12:00:00Z`);

        // Do not automatically schedule as-needed medication
        if (medication.frequency === "As needed") {
          continue;
        }

        // Do not schedule medication after its end date
        if (medication.endDate) {
          const endDateString = new Date(medication.endDate)
            .toISOString()
            .split("T")[0];

          if (today > endDateString) {
            continue;
          }
        }

        const customDateFrequency =
          /^Every ([1-9]\d*) (days?|weeks?)$/.exec(
            medication.frequency
          );

        if (customDateFrequency) {
          const interval = Number(customDateFrequency[1]);
          const unit = customDateFrequency[2];

          const intervalDays =
            unit.startsWith("week")
              ? interval * 7
              : interval;

          const startDay = Date.parse(
            new Date(medication.startDate)
              .toISOString()
              .slice(0, 10) + "T00:00:00Z"
          );

          const todayDay = Date.parse(today + "T00:00:00Z");

          const daysSinceStart =
            Math.round((todayDay - startDay) / 86400000);

          if (
            daysSinceStart < 0 ||
            daysSinceStart % intervalDays !== 0
          ) {
            continue;
          }
        }


        // Weekly medication: schedule on any selected weekday
        if (medication.frequency === "Weekly") {
          const weekdays = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];

          const todayWeekday = weekdays[todayDate.getUTCDay()];

          const selectedDays = Array.isArray(medication.weeklyDay)
            ? medication.weeklyDay
            : medication.weeklyDay
              ? [medication.weeklyDay]
              : [];

          if (!selectedDays.includes(todayWeekday)) {
            continue;
          }
        }


        let scheduledTimes = [
          ...(medication.reminderTimes ||
            []),
        ];



        // Wake-time reminder
        if (
          medication.timing === "At Wake Time" &&
          dailyRoutine.wakeTime &&
          medication.reminderTimes?.length === 1
        ) {
          if (
            scheduledTimes.length > 0
          ) {
            scheduledTimes[0] =
              dailyRoutine.wakeTime;
          } else {
            scheduledTimes = [
              dailyRoutine.wakeTime,
            ];
          }
        }

        // Remove duplicate times
        scheduledTimes = [
          ...new Set(
            scheduledTimes.filter(
              Boolean
            )
          ),
        ];

        for (const scheduledTime of scheduledTimes) {
          const result =
            await DoseRecordModel.updateOne(
              {
                medicationId:
                  medication._id,
                userEmail,
                scheduledDate: today,
                scheduledTime,
              },
              {
                $setOnInsert: {
                  medicationId:
                    medication._id,

                  userEmail,

                  medicationName:
                    medication.medicationName,

                  dosage:
                    medication.dosage,

                  scheduledDate: today,

                  scheduledTime,

                  status: "Upcoming",
                },
              },
              {
                upsert: true,
              }
            );

          if (
            result.upsertedCount > 0
          ) {
            createdCount += 1;
          }
        }
      }

      res.send({
        success: true,
        message:
          "Today’s doses are ready.",
        createdCount,
      });
    } catch (error) {
      console.error(
        "Generate today doses error:",
        error
      );

      res.status(500).send({
        success: false,
        message:
          "Unable to prepare today’s medication schedule.",
      });
    }
  }
);

app.get(
  "/patient/daily-report/:email",
  async (req, res) => {
    try {
      const { email } = req.params;

      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Muscat",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      const doses =
        await DoseRecordModel.find({
          userEmail: email,
          scheduledDate: today,
        }).sort({
          scheduledTime: 1,
        });

      const total = doses.length;

      const taken = doses.filter(
        (dose) =>
          dose.status === "Taken"
      ).length;

      const missed = doses.filter(
        (dose) =>
          dose.status === "Missed"
      ).length;

      const skipped = doses.filter(
        (dose) =>
          dose.status === "Skipped"
      ).length;

      const upcoming = doses.filter(
        (dose) =>
          dose.status === "Upcoming"
      ).length;

      const completedDoses =
        taken + missed + skipped;

      const adherenceRate =
        completedDoses > 0
          ? Math.round(
            (taken /
              completedDoses) *
            100
          )
          : 0;

      res.send({
        success: true,

        report: {
          date: today,
          total,
          taken,
          missed,
          skipped,
          upcoming,
          adherenceRate,
          doses,
        },
      });
    } catch (error) {
      console.error(
        "Daily report error:",
        error
      );

      res.status(500).send({
        success: false,
        message:
          "Unable to generate daily report.",
      });
    }
  }
);

app.get(
  "/patient/weekly-report/:email",
  async (req, res) => {
    try {
      const { email } = req.params;

      const endDate =
        new Date();

      const startDate =
        new Date();

      startDate.setDate(
        endDate.getDate() - 6
      );

      const formatDate = (date) =>
        date
          .toISOString()
          .split("T")[0];

      const startDateString =
        formatDate(startDate);

      const endDateString =
        formatDate(endDate);

      const doses =
        await DoseRecordModel.find({
          userEmail: email,

          scheduledDate: {
            $gte: startDateString,
            $lte: endDateString,
          },
        }).sort({
          scheduledDate: 1,
          scheduledTime: 1,
        });

      const total =
        doses.length;

      const taken =
        doses.filter(
          (dose) =>
            dose.status ===
            "Taken"
        ).length;

      const missed =
        doses.filter(
          (dose) =>
            dose.status ===
            "Missed"
        ).length;

      const skipped =
        doses.filter(
          (dose) =>
            dose.status ===
            "Skipped"
        ).length;

      const upcoming =
        doses.filter(
          (dose) =>
            dose.status ===
            "Upcoming"
        ).length;

      const completedDoses =
        taken +
        missed +
        skipped;

      const adherenceRate =
        completedDoses > 0
          ? Math.round(
            (taken /
              completedDoses) *
            100
          )
          : 0;

      const dailyBreakdown = [];

      for (
        let index = 0;
        index < 7;
        index++
      ) {
        const currentDate =
          new Date(startDate);

        currentDate.setDate(
          startDate.getDate() +
          index
        );

        const dateString =
          formatDate(
            currentDate
          );

        const dayDoses =
          doses.filter(
            (dose) =>
              dose.scheduledDate ===
              dateString
          );

        const dayTaken =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Taken"
          ).length;

        const dayMissed =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Missed"
          ).length;

        const daySkipped =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Skipped"
          ).length;

        const dayCompleted =
          dayTaken +
          dayMissed +
          daySkipped;

        const dayAdherence =
          dayCompleted > 0
            ? Math.round(
              (dayTaken /
                dayCompleted) *
              100
            )
            : 0;

        dailyBreakdown.push({
          date: dateString,

          dayName:
            currentDate.toLocaleDateString(
              "en-US",
              {
                weekday:
                  "short",
              }
            ),

          taken:
            dayTaken,

          missed:
            dayMissed,

          skipped:
            daySkipped,

          total:
            dayDoses.length,

          adherenceRate:
            dayAdherence,
        });
      }

      res.send({
        success: true,

        report: {
          startDate:
            startDateString,

          endDate:
            endDateString,

          total,
          taken,
          missed,
          skipped,
          upcoming,
          adherenceRate,
          dailyBreakdown,
          doses,
        },
      });
    } catch (error) {
      console.error(
        "Weekly report error:",
        error
      );

      res.status(500).send({
        success: false,

        message:
          "Unable to generate weekly report.",
      });
    }
  }
);

app.get(
  "/patient/monthly-report/:email",
  async (req, res) => {
    try {
      const { email } = req.params;

      const now =
        new Date();

      const year =
        now.getFullYear();

      const month =
        now.getMonth();

      const startDate =
        new Date(
          year,
          month,
          1
        );

      const endDate =
        new Date(
          year,
          month + 1,
          0
        );


      const formatDate = (date) => {
        const year = date.getFullYear();

        const month = String(
          date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
      };


      const startDateString =
        formatDate(startDate);

      const endDateString =
        formatDate(endDate);

      console.log("MONTHLY REPORT DATE CHECK:", {
        startDateString,
        endDateString,
      });


      const doses =
        await DoseRecordModel.find({
          userEmail: email,

          scheduledDate: {
            $gte:
              startDateString,

            $lte:
              endDateString,
          },
        }).sort({
          scheduledDate: 1,
          scheduledTime: 1,
        });

      const total =
        doses.length;

      const taken =
        doses.filter(
          (dose) =>
            dose.status ===
            "Taken"
        ).length;

      const missed =
        doses.filter(
          (dose) =>
            dose.status ===
            "Missed"
        ).length;

      const skipped =
        doses.filter(
          (dose) =>
            dose.status ===
            "Skipped"
        ).length;

      const upcoming =
        doses.filter(
          (dose) =>
            dose.status ===
            "Upcoming"
        ).length;

      const completedDoses =
        taken +
        missed +
        skipped;

      const adherenceRate =
        completedDoses > 0
          ? Math.round(
            (taken /
              completedDoses) *
            100
          )
          : 0;

      const dailyBreakdown = [];

      const daysInMonth =
        endDate.getDate();

      for (
        let day = 1;
        day <= daysInMonth;
        day++
      ) {
        const currentDate =
          new Date(
            year,
            month,
            day
          );

        const dateString =
          formatDate(
            currentDate
          );

        const dayDoses =
          doses.filter(
            (dose) =>
              dose.scheduledDate ===
              dateString
          );

        const dayTaken =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Taken"
          ).length;

        const dayMissed =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Missed"
          ).length;

        const daySkipped =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Skipped"
          ).length;

        const dayUpcoming =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Upcoming"
          ).length;

        const dayCompleted =
          dayTaken +
          dayMissed +
          daySkipped;

        const dayAdherence =
          dayCompleted > 0
            ? Math.round(
              (dayTaken /
                dayCompleted) *
              100
            )
            : 0;

        dailyBreakdown.push({
          date:
            dateString,

          dayNumber:
            day,

          dayName:
            currentDate
              .toLocaleDateString(
                "en-US",
                {
                  weekday:
                    "short",
                }
              ),

          taken:
            dayTaken,

          missed:
            dayMissed,

          skipped:
            daySkipped,

          upcoming:
            dayUpcoming,

          total:
            dayDoses.length,

          adherenceRate:
            dayAdherence,
        });
      }

      res.send({
        success: true,

        report: {
          month:
            now.toLocaleDateString(
              "en-US",
              {
                month:
                  "long",
                year:
                  "numeric",
              }
            ),

          startDate:
            startDateString,

          endDate:
            endDateString,

          total,
          taken,
          missed,
          skipped,
          upcoming,
          adherenceRate,

          dailyBreakdown,

          doses,
        },
      });
    } catch (error) {
      console.error(
        "Monthly report error:",
        error
      );

      res.status(500).send({
        success: false,

        message:
          "Unable to generate monthly report.",
      });
    }
  }
);

app.get(
  "/caregiver/patient-daily-report/:caregiverEmail/:patientEmail",
  async (req, res) => {
    try {
      const {
        caregiverEmail,
        patientEmail,
      } = req.params;

      const currentUser = await UserModel.findOne({
        email: caregiverEmail,
        role: "caregiver",
      }).select("email role");

      if (
        !currentUser ||
        currentUser.role !== "caregiver" ||
        currentUser.email.toLowerCase() !== caregiverEmail.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized report access.",
        });
      }

      const acceptedLink =
        await CaregiverLinkModel.findOne({
          caregiverEmail: currentUser.email,
          patientEmail,
          status: "Accepted",
        });

      if (!acceptedLink) {
        return res.status(403).send({
          success: false,
          message:
            "You do not have permission to view this patient's report.",
        });
      }

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const doses =
        await DoseRecordModel.find({
          userEmail:
            patientEmail,
          scheduledDate:
            today,
        }).sort({
          scheduledTime: 1,
        });

      const total =
        doses.length;

      const taken =
        doses.filter(
          (dose) =>
            dose.status ===
            "Taken"
        ).length;

      const missed =
        doses.filter(
          (dose) =>
            dose.status ===
            "Missed"
        ).length;

      const skipped =
        doses.filter(
          (dose) =>
            dose.status ===
            "Skipped"
        ).length;

      const upcoming =
        doses.filter(
          (dose) =>
            dose.status ===
            "Upcoming"
        ).length;

      const completedDoses =
        taken +
        missed +
        skipped;

      const adherenceRate =
        completedDoses > 0
          ? Math.round(
            (taken /
              completedDoses) *
            100
          )
          : 0;

      return res.send({
        success: true,

        report: {
          date: today,
          total,
          taken,
          missed,
          skipped,
          upcoming,
          adherenceRate,
          doses,
        },
      });
    } catch (error) {
      console.error(
        "Caregiver daily report error:",
        error
      );

      return res.status(500).send({
        success: false,
        message:
          "Unable to generate patient daily report.",
      });
    }
  }
);

app.get(
  "/caregiver/patient-weekly-report/:caregiverEmail/:patientEmail",
  async (req, res) => {
    try {
      const {
        caregiverEmail,
        patientEmail,
      } = req.params;

      const currentUser = await UserModel.findOne({
        email: caregiverEmail.trim().toLowerCase(),
        role: "caregiver",
      }).select("email role");
      if (
        !currentUser ||
        currentUser.role !== "caregiver" ||
        currentUser.email.toLowerCase() !== caregiverEmail.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized report access.",
        });
      }

      const acceptedLink =
        await CaregiverLinkModel.findOne({
          caregiverEmail: currentUser.email,
          patientEmail,
          status: "Accepted",
        });

      if (!acceptedLink) {
        return res.status(403).send({
          success: false,
          message:
            "You do not have permission to view this patient's report.",
        });
      }

      const endDate =
        new Date();

      const startDate =
        new Date();

      startDate.setDate(
        endDate.getDate() - 6
      );

      const formatDate = (
        date
      ) =>
        date
          .toISOString()
          .split("T")[0];

      const startDateString =
        formatDate(
          startDate
        );

      const endDateString =
        formatDate(
          endDate
        );

      const doses =
        await DoseRecordModel.find({
          userEmail:
            patientEmail,

          scheduledDate: {
            $gte:
              startDateString,

            $lte:
              endDateString,
          },
        }).sort({
          scheduledDate: 1,
          scheduledTime: 1,
        });

      const total =
        doses.length;

      const taken =
        doses.filter(
          (dose) =>
            dose.status ===
            "Taken"
        ).length;

      const missed =
        doses.filter(
          (dose) =>
            dose.status ===
            "Missed"
        ).length;

      const skipped =
        doses.filter(
          (dose) =>
            dose.status ===
            "Skipped"
        ).length;

      const upcoming =
        doses.filter(
          (dose) =>
            dose.status ===
            "Upcoming"
        ).length;

      const completedDoses =
        taken +
        missed +
        skipped;

      const adherenceRate =
        completedDoses > 0
          ? Math.round(
            (taken /
              completedDoses) *
            100
          )
          : 0;

      const dailyBreakdown =
        [];

      for (
        let index = 0;
        index < 7;
        index++
      ) {
        const currentDate =
          new Date(
            startDate
          );

        currentDate.setDate(
          startDate.getDate() +
          index
        );

        const dateString =
          formatDate(
            currentDate
          );

        const dayDoses =
          doses.filter(
            (dose) =>
              dose.scheduledDate ===
              dateString
          );

        const dayTaken =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Taken"
          ).length;

        const dayMissed =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Missed"
          ).length;

        const daySkipped =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Skipped"
          ).length;

        const dayUpcoming =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Upcoming"
          ).length;

        const dayCompleted =
          dayTaken +
          dayMissed +
          daySkipped;

        const dayAdherence =
          dayCompleted > 0
            ? Math.round(
              (dayTaken /
                dayCompleted) *
              100
            )
            : 0;

        dailyBreakdown.push({
          date:
            dateString,

          dayName:
            currentDate.toLocaleDateString(
              "en-US",
              {
                weekday:
                  "short",
              }
            ),

          taken:
            dayTaken,

          missed:
            dayMissed,

          skipped:
            daySkipped,

          upcoming:
            dayUpcoming,

          total:
            dayDoses.length,

          adherenceRate:
            dayAdherence,
        });
      }

      return res.send({
        success: true,

        report: {
          startDate:
            startDateString,

          endDate:
            endDateString,

          total,
          taken,
          missed,
          skipped,
          upcoming,
          adherenceRate,
          dailyBreakdown,
          doses,
        },
      });
    } catch (error) {
      console.error(
        "Caregiver weekly report error:",
        error
      );

      return res.status(500).send({
        success: false,
        message:
          "Unable to generate patient weekly report.",
      });
    }
  }
);


app.get(
  "/caregiver/patient-monthly-report/:caregiverEmail/:patientEmail",
  async (req, res) => {
    try {
      const {
        caregiverEmail,
        patientEmail,
      } = req.params;

      const currentUser = await UserModel.findOne({
        email: caregiverEmail.trim().toLowerCase(),
        role: "caregiver",
      }).select("email role");

      if (
        !currentUser ||
        currentUser.role !== "caregiver" ||
        currentUser.email.toLowerCase() !== caregiverEmail.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized report access.",
        });
      }

      const acceptedLink =
        await CaregiverLinkModel.findOne({
          caregiverEmail: currentUser.email,
          patientEmail,
          status: "Accepted",
        });

      if (!acceptedLink) {
        return res.status(403).send({
          success: false,
          message:
            "You do not have permission to view this patient's report.",
        });
      }

      const now =
        new Date();

      const year =
        now.getFullYear();

      const month =
        now.getMonth();

      const startDate =
        new Date(
          year,
          month,
          1
        );

      const endDate =
        new Date(
          year,
          month + 1,
          0
        );

      const formatDate = (
        date
      ) =>
        date
          .toISOString()
          .split("T")[0];

      const startDateString =
        formatDate(
          startDate
        );

      const endDateString =
        formatDate(
          endDate
        );

      const doses =
        await DoseRecordModel.find({
          userEmail:
            patientEmail,

          scheduledDate: {
            $gte:
              startDateString,

            $lte:
              endDateString,
          },
        }).sort({
          scheduledDate: 1,
          scheduledTime: 1,
        });

      const total =
        doses.length;

      const taken =
        doses.filter(
          (dose) =>
            dose.status ===
            "Taken"
        ).length;

      const missed =
        doses.filter(
          (dose) =>
            dose.status ===
            "Missed"
        ).length;

      const skipped =
        doses.filter(
          (dose) =>
            dose.status ===
            "Skipped"
        ).length;

      const upcoming =
        doses.filter(
          (dose) =>
            dose.status ===
            "Upcoming"
        ).length;

      const completedDoses =
        taken +
        missed +
        skipped;

      const adherenceRate =
        completedDoses > 0
          ? Math.round(
            (taken /
              completedDoses) *
            100
          )
          : 0;

      const dailyBreakdown =
        [];

      const daysInMonth =
        endDate.getDate();

      for (
        let day = 1;
        day <= daysInMonth;
        day++
      ) {
        const currentDate =
          new Date(
            year,
            month,
            day
          );

        const dateString =
          formatDate(
            currentDate
          );

        const dayDoses =
          doses.filter(
            (dose) =>
              dose.scheduledDate ===
              dateString
          );

        const dayTaken =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Taken"
          ).length;

        const dayMissed =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Missed"
          ).length;

        const daySkipped =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Skipped"
          ).length;

        const dayUpcoming =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Upcoming"
          ).length;

        const dayCompleted =
          dayTaken +
          dayMissed +
          daySkipped;

        const dayAdherence =
          dayCompleted > 0
            ? Math.round(
              (dayTaken /
                dayCompleted) *
              100
            )
            : 0;

        dailyBreakdown.push({
          date:
            dateString,

          dayNumber:
            day,

          dayName:
            currentDate.toLocaleDateString(
              "en-US",
              {
                weekday:
                  "short",
              }
            ),

          taken:
            dayTaken,

          missed:
            dayMissed,

          skipped:
            daySkipped,

          upcoming:
            dayUpcoming,

          total:
            dayDoses.length,

          adherenceRate:
            dayAdherence,
        });
      }

      return res.send({
        success: true,

        report: {
          month:
            now.toLocaleDateString(
              "en-US",
              {
                month:
                  "long",
                year:
                  "numeric",
              }
            ),

          startDate:
            startDateString,

          endDate:
            endDateString,

          total,
          taken,
          missed,
          skipped,
          upcoming,
          adherenceRate,
          dailyBreakdown,
          doses,
        },
      });
    } catch (error) {
      console.error(
        "Caregiver monthly report error:",
        error
      );

      return res.status(500).send({
        success: false,
        message:
          "Unable to generate patient monthly report.",
      });
    }
  }
);


app.get(
  "/patient/today-doses/:userEmail",
  async (req, res) => {
    try {
      const userEmail = decodeURIComponent(
        req.params.userEmail
      );


      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Muscat",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());


      // Get today's doses
      const doses =
        await DoseRecordModel.find({
          userEmail,
          scheduledDate: today,
        }).sort({
          scheduledTime: 1,
        });

      res.send({
        success: true,
        doses,
      });
    } catch (error) {
      console.error(
        "Fetch today doses error:",
        error
      );

      res.status(500).send({
        success: false,
        doses: [],
        message:
          "Unable to load today's medications.",
      });
    }
  }
);

app.put(
  "/patient/dose/:doseId/status",
  async (req, res) => {
    try {
      const { doseId } = req.params;
      const { userEmail, status } = req.body;

      if (!userEmail) {
        return res.status(400).send({
          success: false,
          message: "Patient email is required.",
        });
      }

      const allowedStatuses = [
        "Taken",
        "Skipped",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).send({
          success: false,
          message: "Invalid dose status.",
        });
      }

      const updatedDose =
        await DoseRecordModel.findOneAndUpdate(
          {
            _id: doseId,
            userEmail,
          },
          {
            $set: {
              status,
              takenAt:
                status === "Taken"
                  ? new Date()
                  : null,
            },
          },
          {
            returnDocument: "after",
            runValidators: true,
          }
        );

      if (!updatedDose) {
        return res.status(404).send({
          success: false,
          message:
            "Dose record not found for this patient.",
        });
      }

      return res.send({
        success: true,
        message:
          status === "Taken"
            ? "Dose marked as taken."
            : "Dose marked as skipped.",
        dose: updatedDose,
      });
    } catch (error) {
      console.error(
        "Update dose status error:",
        error
      );

      return res.status(500).send({
        success: false,
        message:
          "Unable to update the dose: " +
          error.message,
      });
    }
  }
);


app.put("/patient/dose/:doseId/snooze", async (req, res) => {
  try {
    const { doseId } = req.params;
    const userEmail = req.body.userEmail?.trim().toLowerCase();

    if (!userEmail) {
      return res.status(400).send({
        success: false,
        message: "Patient email is required.",
      });
    }

    const dose = await DoseRecordModel.findOne({
      _id: doseId,
      userEmail,
      status: "Upcoming",
    });

    if (!dose) {
      return res.status(404).send({
        success: false,
        message: "Upcoming dose not found.",
      });
    }


    const MAX_SNOOZES = 2;
    const SNOOZE_MINUTES = 5;
    const MISSED_AFTER_MINUTES = 15;

    if ((dose.snoozeCount || 0) >= MAX_SNOOZES) {
      return res.status(400).send({
        success: false,
        message: "Maximum of 2 snoozes reached.",
      });
    }

    const now = new Date();

    const [year, month, day] = dose.scheduledDate
      .split("-")
      .map(Number);

    const [hours, minutes] = dose.scheduledTime
      .split(":")
      .map(Number);

    // Scheduled time in the patient's local timezone
    const scheduledAt = new Date(
  `${dose.scheduledDate}T${dose.scheduledTime}:00+04:00`
);

    const missedDeadline = new Date(
      scheduledAt.getTime() +
      MISSED_AFTER_MINUTES * 60 * 1000
    );

    const snoozedUntil = new Date(
      now.getTime() + SNOOZE_MINUTES * 60 * 1000
    );

    // Never allow Snooze beyond the 15-minute deadline
    if (snoozedUntil >= missedDeadline) {
      return res.status(400).send({
        success: false,
        message:
          "Cannot snooze beyond the medication reminder window.",
      });
    }

    dose.snoozeCount = (dose.snoozeCount || 0) + 1;
    dose.snoozedUntil = snoozedUntil;

    await dose.save();


    return res.send({
      success: true,
      message: "Alarm snoozed for 5 minutes.",
      snoozedUntil,
      dose,
    });
  } catch (error) {
    console.error("Snooze dose error:", error);

    return res.status(500).send({
      success: false,
      message: "Unable to snooze medication alarm.",
    });
  }
});


app.get(
  "/patient/dose-notifications/:userEmail",
  async (req, res) => {
    try {
      const userEmail = decodeURIComponent(
        req.params.userEmail
      )
        .trim()
        .toLowerCase();

      const { date, time } = req.query;

      if (!userEmail || !date || !time) {
        return res.status(400).send({
          success: false,
          notifications: [],
          message:
            "Patient email, current date, and current time are required.",
        });
      }

      const timeToMinutes = (timeString) => {
        const [hours, minutes] = timeString
          .split(":")
          .map(Number);

        return hours * 60 + minutes;
      };

      const currentMinutes =
        timeToMinutes(time);

      const upcomingDoses =
        await DoseRecordModel.find({
          userEmail,
          scheduledDate: { $lte: date },
          status: "Upcoming",
        });

      for (const dose of upcomingDoses) {
        const scheduledMinutes =
          timeToMinutes(
            dose.scheduledTime
          );

        const minutesLate =
          dose.scheduledDate < date
            ? 15
            : currentMinutes - scheduledMinutes;


        const now = new Date();

        const snoozeIsActive =
          dose.snoozedUntil &&
          new Date(dose.snoozedUntil).getTime() > now.getTime();

        if (minutesLate >= 15 && !snoozeIsActive) {
          dose.status = "Missed";
          dose.snoozedUntil = null;

          await dose.save();
        }

      }

      const todaysDoses =
        await DoseRecordModel.find({
          userEmail,
          scheduledDate: date,

          status: {
            $in: ["Upcoming", "Missed"],
          },

          notificationDismissed: {
            $ne: true,
          },
        }).sort({
          scheduledTime: 1,
        });


      const notifications =
        todaysDoses.filter((dose) => {
          // Missed doses still appear as notifications.
          if (dose.status === "Missed") {
            return true;
          }


          const scheduledMinutes =
            timeToMinutes(
              dose.scheduledTime
            );

          const minutesLate =
            currentMinutes -
            scheduledMinutes;

        return minutesLate >= 0 && minutesLate < 15;
        });

      return res.send({
        success: true,
        notifications,
      });
    } catch (error) {
      console.error(
        "Dose notification error:",
        error
      );

      return res.status(500).send({
        success: false,
        notifications: [],
        message:
          "Unable to load medication notifications.",
      });
    }
  }
);

app.put(
  "/patient/dose-notification/:doseId/dismiss",
  async (req, res) => {
    try {
      const { doseId } = req.params;

      const userEmail =
        req.body.userEmail
          ?.trim()
          .toLowerCase();

      if (!userEmail) {
        return res.status(400).send({
          success: false,
          message:
            "Patient email is required.",
        });
      }

      const dose =
        await DoseRecordModel.findOne({
          _id: doseId,
          userEmail,
        });

      if (!dose) {
        return res.status(404).send({
          success: false,
          message:
            "Dose notification not found.",
        });
      }

      dose.notificationDismissed = true;

      await dose.save();

      return res.send({
        success: true,
      });
    } catch (error) {
      console.error(
        "Dismiss dose notification error:",
        error
      );

      return res.status(500).send({
        success: false,
        message:
          "Unable to dismiss notification.",
      });
    }
  }
);

app.get(
  "/caregiver/patient-weekly-report/:caregiverEmail/:patientEmail",
  async (req, res) => {
    try {
      const {
        caregiverEmail,
        patientEmail,
      } = req.params;

      if (
        !caregiverEmail ||
        !patientEmail
      ) {
        return res.status(400).send({
          success: false,
          message:
            "Caregiver and patient emails are required.",
        });
      }

      const caregiver =
        await UserModel.findOne({
          email: caregiverEmail,
          role: "caregiver",
        });

      if (!caregiver) {
        return res.status(404).send({
          success: false,
          message:
            "Caregiver account not found.",
        });
      }

      const patient =
        await UserModel.findOne({
          email: patientEmail,
          role: "patient",
        });

      if (!patient) {
        return res.status(404).send({
          success: false,
          message:
            "Patient account not found.",
        });
      }

      const acceptedLink =
        await CaregiverLinkModel.findOne({
          caregiverEmail,
          patientEmail,
          status: "Accepted",
        });

      if (!acceptedLink) {
        return res.status(403).send({
          success: false,
          message:
            "You do not have permission to view this patient's analytics.",
        });
      }

      const endDate =
        new Date();

      const startDate =
        new Date();

      startDate.setDate(
        endDate.getDate() - 6
      );

      const formatDate = (date) =>
        date
          .toISOString()
          .split("T")[0];

      const startDateString =
        formatDate(startDate);

      const endDateString =
        formatDate(endDate);

      const doses =
        await DoseRecordModel.find({
          userEmail:
            patientEmail,

          scheduledDate: {
            $gte:
              startDateString,

            $lte:
              endDateString,
          },
        }).sort({
          scheduledDate: 1,
          scheduledTime: 1,
        });

      const total =
        doses.length;

      const taken =
        doses.filter(
          (dose) =>
            dose.status ===
            "Taken"
        ).length;

      const missed =
        doses.filter(
          (dose) =>
            dose.status ===
            "Missed"
        ).length;

      const skipped =
        doses.filter(
          (dose) =>
            dose.status ===
            "Skipped"
        ).length;

      const upcoming =
        doses.filter(
          (dose) =>
            dose.status ===
            "Upcoming"
        ).length;

      const completedDoses =
        taken +
        missed +
        skipped;

      const adherenceRate =
        completedDoses > 0
          ? Math.round(
            (taken /
              completedDoses) *
            100
          )
          : 0;

      const dailyBreakdown = [];

      for (
        let index = 0;
        index < 7;
        index++
      ) {
        const currentDate =
          new Date(startDate);

        currentDate.setDate(
          startDate.getDate() +
          index
        );

        const dateString =
          formatDate(
            currentDate
          );

        const dayDoses =
          doses.filter(
            (dose) =>
              dose.scheduledDate ===
              dateString
          );

        const dayTaken =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Taken"
          ).length;

        const dayMissed =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Missed"
          ).length;

        const daySkipped =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Skipped"
          ).length;

        const dayUpcoming =
          dayDoses.filter(
            (dose) =>
              dose.status ===
              "Upcoming"
          ).length;

        const dayCompleted =
          dayTaken +
          dayMissed +
          daySkipped;

        const dayAdherence =
          dayCompleted > 0
            ? Math.round(
              (dayTaken /
                dayCompleted) *
              100
            )
            : 0;

        dailyBreakdown.push({
          date:
            dateString,

          dayName:
            currentDate.toLocaleDateString(
              "en-US",
              {
                weekday:
                  "short",
              }
            ),

          taken:
            dayTaken,

          missed:
            dayMissed,

          skipped:
            daySkipped,

          upcoming:
            dayUpcoming,

          total:
            dayDoses.length,

          adherenceRate:
            dayAdherence,
        });
      }

      return res.send({
        success: true,

        patient: {
          name:
            patient.name,

          email:
            patient.email,

          profilePicture:
            patient.profilepic,
        },

        report: {
          startDate:
            startDateString,

          endDate:
            endDateString,

          total,
          taken,
          missed,
          skipped,
          upcoming,
          adherenceRate,
          dailyBreakdown,
          doses,
        },
      });
    } catch (error) {
      console.error(
        "Caregiver patient analytics error:",
        error
      );

      return res.status(500).send({
        success: false,
        message:
          "Unable to load patient analytics.",
      });
    }
  }
);

app.get(
  "/caregiver/dashboard-data/:caregiverEmail",
  async (req, res) => {
    try {
      const {
        caregiverEmail,
      } = req.params;

      const currentUser = await UserModel.findOne({
        email: caregiverEmail.trim().toLowerCase(),
        role: "caregiver",
      }).select("email role");

      if (
        !currentUser ||
        currentUser.role !== "caregiver" ||
        currentUser.email.toLowerCase() !== caregiverEmail.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized dashboard access.",
        });
      }

      const acceptedLinks =
        await CaregiverLinkModel.find({
          caregiverEmail: currentUser.email,
          status: "Accepted",
        });

      const patientEmails =
        acceptedLinks.map(
          (link) =>
            link.patientEmail
        );

      if (
        patientEmails.length === 0
      ) {
        return res.send({
          success: true,

          summary: {
            upcomingCount: 0,
            missedCount: 0,
            adherenceRate: 0,
          },

          doses: [],
        });
      }

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const doses =
        await DoseRecordModel.find({
          userEmail: {
            $in: patientEmails,
          },

          scheduledDate:
            today,
        }).sort({
          scheduledTime: 1,
        });

      const upcomingCount =
        doses.filter(
          (dose) =>
            dose.status ===
            "Upcoming"
        ).length;

      const missedCount =
        doses.filter(
          (dose) =>
            dose.status ===
            "Missed"
        ).length;

      const takenCount =
        doses.filter(
          (dose) =>
            dose.status ===
            "Taken"
        ).length;

      const skippedCount =
        doses.filter(
          (dose) =>
            dose.status ===
            "Skipped"
        ).length;

      const completedCount =
        takenCount +
        missedCount +
        skippedCount;

      const adherenceRate =
        completedCount > 0
          ? Math.round(
            (takenCount /
              completedCount) *
            100
          )
          : 0;

      return res.send({
        success: true,

        summary: {
          upcomingCount,
          missedCount,
          adherenceRate,
        },

        doses,
      });
    } catch (error) {
      console.error(
        "Caregiver dashboard data error:",
        error
      );

      return res.status(500).send({
        success: false,

        message:
          "Unable to load caregiver dashboard data.",
      });
    }
  }
);

// registration
app.post("/register", async (req, res) => {
  try {
    if (!["patient", "caregiver"].includes(req.body.role)) {
      return res.status(403).json({
        success: false,
        message: "Only patient and caregiver registration is allowed.",
      });
    }
    const {
      name,
      email,
      phoneNumber,
      password,
      role,
      medicalCondition,
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (user) {
      return res.send({
        message: "User Already Exists",
      });
    }

    const hpwd = await bcrypt.hash(password, 10);

    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    const verificationExpires =
      new Date(Date.now() + 24 * 60 * 60 * 1000);

    const userData = {
      name,
      email: normalizedEmail,
      phoneNumber,
      password: hpwd,
      role,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    };

    let patientLinkCode;

    if (role === "patient") {
      patientLinkCode =
        "MM-" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

      userData.medicalCondition =
        medicalCondition || [];

      userData.patientLinkCode =
        patientLinkCode;
    }

    const newuser = new UserModel(userData);

    await newuser.save();

    const verificationLink =
      `http://localhost:3002/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: "MediMind <MediMindproject@gmail.com>",
      to: normalizedEmail,
      subject: "Verify Your MediMind Email",
      text: `Hello ${name},

Welcome to MediMind!

Please verify your email address by clicking the link below:

${verificationLink}

This verification link will expire in 24 hours.

After verifying your email, you can log in to your MediMind account.

Thank you for choosing MediMind.`,
    });

    const responseData = {
      message:
        "Registration Successful. Please verify your email before logging in.",
    };

    if (role === "patient") {
      responseData.patientLinkCode =
        patientLinkCode;
    }

    res.send(responseData);
  } catch (error) {
    console.log("Registration Error:", error);

    res.send({
      message:
        "Registration Error: " + error.message,
    });
  }
});

app.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <h2>Invalid verification link.</h2>
        <p>The verification token is missing.</p>
      `);
    }

    const user = await UserModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).send(`
        <h2>Verification link is invalid or expired.</h2>
        <p>Please register again or request a new verification email.</p>
      `);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = "";
    user.emailVerificationExpires = undefined;

    await user.save();

    res.send(`
      <div style="
        font-family: Arial, sans-serif;
        text-align: center;
        margin-top: 80px;
      ">
        <h1 style="color: #2563eb;">
          Email Verified!
        </h1>

        <p>
          Your MediMind email has been successfully verified.
        </p>

        <p>
          You can now log in to your account.
        </p>

        <a
          href="http://localhost:5173/"
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 8px;
          "
        >
          Go to Login
        </a>
      </div>
    `);
  } catch (error) {
    console.log("Email Verification Error:", error);

    res.status(500).send(`
      <h2>Email verification failed.</h2>
      <p>Please try again later.</p>
    `);
  }
});

// logining
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.send({
        message: "Invalid Credentials",
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.send({
        message: "Invalid Credentials",
      });
    }

    if (
      user.role !== "admin" &&
      !user.isEmailVerified
    ) {
      return res.send({
        message:
          "Please verify your email before logging in.",
      });
    }



    const safeUser = user.toObject();

    delete safeUser.password;
    delete safeUser.emailVerificationToken;
    delete safeUser.emailVerificationExpires;

    res.send({
      user: safeUser,
      message: "success",
    });
  } catch (error) {
    console.log("Login Error:", error);

    res.send({
      message:
        "Login Error.." + error.message,
    });
  }
});
const certificateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueFilename =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueFilename);
  },
});

const certificateFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, JPG, JPEG, and PNG files are allowed"
      ),
      false
    );
  }
};

const certificateUpload = multer({
  storage: certificateStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: certificateFileFilter,
});

app.put(
  "/caregiver/certificates",
  certificateUpload.single("certificateFile"),
  async (req, res) => {
    try {
      const { email, certificateName } = req.body;

      if (!email) {
        return res.status(400).send({
          success: false,
          message: "Caregiver email is required",
        });
      }

      if (!certificateName?.trim()) {
        return res.status(400).send({
          success: false,
          message: "Certificate name is required",
        });
      }

      if (!req.file) {
        return res.status(400).send({
          success: false,
          message: "Please select a certificate file",
        });
      }

      const caregiver = await UserModel.findOne({
        email: email.trim().toLowerCase(),
        role: "caregiver",
      });

      if (!caregiver) {
        fs.unlink(req.file.path, () => { });

        return res.status(404).send({
          success: false,
          message: "Caregiver account not found",
        });
      }

      const newCertificate = {
        certificateName: certificateName.trim(),
        certificateFile: `/uploads/${req.file.filename}`,
      };

      caregiver.certificates.push(newCertificate);

      caregiver.professionalVerificationStatus =
        "Pending";

      caregiver.professionalVerifiedAt = null;

      await caregiver.save();

      res.send({
        success: true,
        message:
          "Certificate uploaded successfully and submitted for verification",
        certificates: caregiver.certificates,
        professionalVerificationStatus:
          caregiver.professionalVerificationStatus,
      });
    } catch (error) {
      console.log(
        "Certificate Upload Error:",
        error
      );

      if (req.file?.path) {
        fs.unlink(req.file.path, () => { });
      }

      res.status(500).send({
        success: false,
        message:
          "Unable to upload certificate",
      });
    }
  }
);
app.delete(
  "/caregiver/certificates/:certificateId",
  async (req, res) => {
    try {
      const { certificateId } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(400).send({
          success: false,
          message: "Caregiver email is required",
        });
      }

      const caregiver = await UserModel.findOne({
        email,
        role: "caregiver",
      });

      if (!caregiver) {
        return res.status(404).send({
          success: false,
          message: "Caregiver account not found",
        });
      }

      const certificate = caregiver.certificates.id(
        certificateId
      );

      if (!certificate) {
        return res.status(404).send({
          success: false,
          message: "Certificate not found",
        });
      }

      const certificateFile = certificate.certificateFile;

      caregiver.certificates.pull(certificateId);

      await caregiver.save();

      if (certificateFile) {
        const relativeFilePath = certificateFile.replace(
          /^\/+/,
          ""
        );

        const fullFilePath = path.join(
          __dirname,
          relativeFilePath
        );

        fs.unlink(fullFilePath, (error) => {
          if (
            error &&
            error.code !== "ENOENT"
          ) {
            console.log(
              "Certificate File Delete Error:",
              error
            );
          }
        });
      }

      res.send({
        success: true,
        message: "Certificate removed successfully",
        certificates: caregiver.certificates,
      });
    } catch (error) {
      console.log("Certificate Remove Error:", error);

      res.status(500).send({
        success: false,
        message: "Unable to remove certificate",
      });
    }
  }
);


app.delete("/caregiver-links/disconnect", async (req, res) => {
  try {
    const { caregiverEmail, patientEmail } = req.body;

    if (
      typeof caregiverEmail !== "string" ||
      typeof patientEmail !== "string" ||
      !caregiverEmail.trim() ||
      !patientEmail.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Both email addresses are required.",
      });
    }

    const caregiver = caregiverEmail.trim().toLowerCase();
    const patient = patientEmail.trim().toLowerCase();

    const caregiverAccount = await UserModel.findOne({
      email: caregiver,
      role: "caregiver",
    }).select("_id");

    const patientAccount = await UserModel.findOne({
      email: patient,
      role: "patient",
    }).select("_id");

    if (!caregiverAccount || !patientAccount) {
      return res.status(404).json({
        success: false,
        message: "Patient or caregiver account not found.",
      });
    }

    const deletedLink = await CaregiverLinkModel.findOneAndDelete({
      caregiverEmail: caregiver,
      patientEmail: patient,
      status: "Accepted",
    });

    if (!deletedLink) {
      return res.status(404).json({
        success: false,
        message: "No active connection found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Connection removed successfully.",
    });
  } catch (error) {
    console.error("Disconnect error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to disconnect accounts.",
    });
  }
});

app.put(
  "/user/profile-picture",
  upload.single("profilepic"),
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).send({
          success: false,
          message: "User email is required",
        });
      }

      if (!req.file) {
        return res.status(400).send({
          success: false,
          message: "Please select a profile picture",
        });
      }

      const profilepic = `/uploads/${req.file.filename}`;

      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        {
          $set: {
            profilepic,
          },
        },
        {
          returnDocument: "after",
        }
      );

      if (!updatedUser) {
        return res.status(404).send({
          success: false,
          message: "User account not found",
        });
      }

      res.send({
        success: true,
        message: "Profile picture updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.log("Profile Picture Upload Error:", error);

      res.status(500).send({
        success: false,
        message: "Unable to upload profile picture",
      });
    }
  }
);

app.post("/caregiver/request-link", async (req, res) => {
  try {
    const {
      caregiverEmail,
      patientLinkCode,
      relationship,
    } = req.body;

    if (
      !caregiverEmail ||
      !patientLinkCode ||
      !relationship
    ) {
      return res.send({
        message: "Please complete all fields",
      });
    }

    const caregiver = await UserModel.findOne({
      email: caregiverEmail,
      role: "caregiver",
    });

    if (!caregiver) {
      return res.send({
        message: "Caregiver account not found",
      });
    }

    const formattedCode = patientLinkCode
      .trim()
      .toUpperCase();

    const patient = await UserModel.findOne({
      patientLinkCode: formattedCode,
      role: "patient",
    });

    if (!patient) {
      return res.send({
        message: "Invalid patient link code",
      });
    }

    const existingLink =
      await CaregiverLinkModel.findOne({
        caregiverEmail: caregiver.email,
        patientEmail: patient.email,
      });

    if (existingLink) {
      if (existingLink.status === "Accepted") {
        return res.send({
          message:
            "You are already linked to this patient",
        });
      }

      if (existingLink.status === "Pending") {
        return res.send({
          message:
            "A link request has already been sent",
        });
      }

      if (existingLink.status === "Rejected") {
        existingLink.status = "Pending";
        existingLink.relationship = relationship;
        existingLink.requestedAt = new Date();

        await existingLink.save();

        return res.send({
          message: "Link request sent successfully",
        });
      }
    }

    const newLink = new CaregiverLinkModel({
      caregiverEmail: caregiver.email,
      patientEmail: patient.email,
      relationship,
      status: "Pending",
      patientLinkCode: patient.patientLinkCode,
    });

    await newLink.save();

    res.send({
      message: "Link request sent successfully",
    });
  } catch (error) {
    console.log("Request Link Error:", error);

    res.send({
      message: "Unable to send link request",
    });
  }
});

app.post("/patient/request-caregiver", async (req, res) => {
  try {
    const {
      patientEmail,
      caregiverEmail,
      relationship,
    } = req.body;

    if (!patientEmail || !caregiverEmail) {
      return res.status(400).json({
        success: false,
        message: "Patient and caregiver are required.",
      });
    }

    const patient = await UserModel.findOne({
      email: patientEmail.trim().toLowerCase(),
      role: "patient",
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient account not found.",
      });
    }

    const caregiver = await UserModel.findOne({
      email: caregiverEmail.trim().toLowerCase(),
      role: "caregiver",
    });

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: "Caregiver account not found.",
      });
    }

    const existingLink = await CaregiverLinkModel.findOne({
      patientEmail: patient.email,
      caregiverEmail: caregiver.email,
    });

    if (existingLink) {
      if (existingLink.status === "Accepted") {
        return res.json({
          success: false,
          message: "This caregiver is already connected to you.",
        });
      }

      if (existingLink.status === "Pending") {
        return res.json({
          success: false,
          message: "A request has already been sent to this caregiver.",
        });
      }

      if (existingLink.status === "Rejected") {
        existingLink.status = "Pending";
        existingLink.relationship =
          relationship || "Caregiver";
        existingLink.requestedBy = "patient";
        existingLink.requestedAt = new Date();

        await existingLink.save();

        return res.json({
          success: true,
          message: "Caregiver request sent successfully.",
        });
      }
    }

    const newLink = new CaregiverLinkModel({
      caregiverEmail: caregiver.email,
      patientEmail: patient.email,
      relationship: relationship || "Caregiver",
      status: "Pending",

      // Required by your CaregiverLink schema
      patientLinkCode: patient.patientLinkCode,

      requestedBy: "patient",
    });

    await newLink.save();

    return res.json({
      success: true,
      message: "Caregiver request sent successfully.",
    });
  } catch (error) {
    console.error(
      "Patient request caregiver error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to send caregiver request.",
    });
  }
});

app.get(
  "/patient/caregiver-requests/:patientEmail",
  async (req, res) => {
    try {
      const patientEmail = req.params.patientEmail;

      const requests =
        await CaregiverLinkModel.aggregate([
          {
            $match: {
              patientEmail,
              status: "Pending",
            },
          },
          {
            $lookup: {
              from: "UsersTbl",
              localField: "caregiverEmail",
              foreignField: "email",
              as: "caregiverDetails",
            },
          },
          {
            $unwind: {
              path: "$caregiverDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              caregiverEmail: 1,
              patientEmail: 1,
              relationship: 1,
              status: 1,
              patientLinkCode: 1,
              requestedAt: 1,

              caregiverName:
                "$caregiverDetails.name",

              caregiverPhoneNumber:
                "$caregiverDetails.phoneNumber",

              caregiverProfilePicture:
                "$caregiverDetails.profilepic",

              caregiverDegree:
                "$caregiverDetails.degree",

              caregiverExperience:
                "$caregiverDetails.experience",

              caregiverLocation:
                "$caregiverDetails.location",

              caregiverBio:
                "$caregiverDetails.bio",

              caregiverLanguages:
                "$caregiverDetails.languages",

              caregiverAvailability:
                "$caregiverDetails.availability",

              caregiverAvailableTimes:
                "$caregiverDetails.availableTimes",

              caregiverCertificates:
                "$caregiverDetails.certificates",


            },
          },
          {
            $sort: {
              requestedAt: -1,
            },
          },
        ]);

      res.json({
        success: true,
        requests,
      });
    } catch (error) {
      console.error(
        "Fetch caregiver requests error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch caregiver requests.",
      });
    }
  }
);


app.get(
  "/patient/connection-request-results/:patientEmail",
  async (req, res) => {
    try {
      const patientEmail = decodeURIComponent(
        req.params.patientEmail
      ).trim().toLowerCase();

      const requests = await CaregiverLinkModel.aggregate([
        {
          $match: {
            patientEmail,
            requestedBy: "patient",
            status: { $in: ["Accepted", "Rejected"] },
          },
        },
        {
          $lookup: {
            from: "UsersTbl",
            localField: "caregiverEmail",
            foreignField: "email",
            as: "caregiverDetails",
          },
        },
        {
          $unwind: {
            path: "$caregiverDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            caregiverEmail: 1,
            caregiverName: "$caregiverDetails.name",
            status: 1,
            requestedAt: 1,
          },
        },
        {
          $sort: { requestedAt: -1 },
        },
      ]);

      return res.json({
        success: true,
        requests,
      });
    } catch (error) {
      console.error(
        "Connection request results error:",
        error
      );

      return res.status(500).json({
        success: false,
        requests: [],
        message: "Unable to fetch request results.",
      });
    }
  }
);

app.put(
  "/caregiver/profile",
  async (req, res) => {
    try {
      const {
        email,
        gender,
        degree,
        experience,
        location,
        bio,
        languages,
        availability,
        availableTimes,
      } = req.body;

      if (!email) {
        return res.status(400).send({
          success: false,
          message:
            "Caregiver email is required",
        });
      }

      if (
        gender &&
        !["Male", "Female"].includes(
          gender
        )
      ) {
        return res.status(400).send({
          success: false,
          message:
            "Gender must be Male or Female",
        });
      }

      const updatedCaregiver =
        await UserModel.findOneAndUpdate(
          {
            email,
            role: "caregiver",
          },

          {
            $set: {
              gender:
                gender || undefined,

              degree:
                degree?.trim() || "",

              experience:
                experience === "" ||
                  experience === null ||
                  experience === undefined
                  ? undefined
                  : Number(
                    experience
                  ),

              location:
                location?.trim() || "",

              bio:
                bio?.trim() || "",

              languages:
                languages || [],

              availability:
                availability || [],

              availableTimes:
                availableTimes || [],
            },
          },

          {
            returnDocument: "after",
            runValidators: true,
          }
        );

      if (!updatedCaregiver) {
        return res.status(404).send({
          success: false,
          message:
            "Caregiver account not found",
        });
      }

      return res.send({
        success: true,

        message:
          "Caregiver profile updated successfully",

        user: updatedCaregiver,
      });
    } catch (error) {
      console.log(
        "Caregiver Profile Update Error:",
        error
      );

      return res.status(500).send({
        success: false,
        message:
          "Unable to update caregiver profile",
      });
    }
  }
);


app.put("/patient/caregiver-request/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, patientEmail } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status.",
      });
    }

    if (
      !mongoose.isValidObjectId(requestId) ||
      typeof patientEmail !== "string" ||
      !patientEmail.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request information.",
      });
    }

    const request = await CaregiverLinkModel.findOne({
      _id: requestId,
      patientEmail: patientEmail.trim().toLowerCase(),
      status: "Pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Caregiver request not found.",
      });
    }

    if (status === "Accepted") {
      const validation = await checkCaregiverPatientLimit(
        request.caregiverEmail,
        request.patientEmail
      );

      if (!validation.allowed) {
        return res.status(409).json({
          success: false,
          message: validation.message,
        });
      }
    }

    request.status = status;
    await request.save();

    return res.json({
      success: true,
      message:
        status === "Accepted"
          ? "Caregiver request accepted."
          : "Caregiver request rejected.",
      request,
    });
  } catch (error) {
    console.error("Update caregiver request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update caregiver request.",
    });
  }
});


app.get(
  "/caregiver/patient-preview/:patientLinkCode",
  async (req, res) => {
    try {
      const patientLinkCode = req.params.patientLinkCode
        .trim()
        .toUpperCase();

      const patient = await UserModel.findOne({
        patientLinkCode,
        role: "patient",
      });

      if (!patient) {
        return res.status(404).send({
          success: false,
          message: "Invalid patient link code",
        });
      }

      const medications = await MedicationModel.find({
        userEmail: patient.email,
      });

      const activeMedicationCount = medications.length;

      const prescriptionCount = medications.filter(
        (medication) => medication.prescriptionImage
      ).length;

      res.send({
        success: true,

        patient: {
          name: patient.name,
          profilePicture: patient.profilepic || "",
          medicalConditions:
            patient.medicalCondition || [],
          activeMedicationCount,
          prescriptionCount,
        },
      });
    } catch (error) {
      console.error(
        "Patient preview error:",
        error
      );

      res.status(500).send({
        success: false,
        message: "Unable to load patient preview",
      });
    }
  }
);

app.get("/patient/search-caregivers", async (req, res) => {
  try {
    const {
      search = "",
      language = "",
      gender = "",
      minExperience = "",
      availability = [],
      availableTime = [],
      patientLatitude = "",
      patientLongitude = "",
    } = req.query;

    const filter = {
      role: "caregiver",
    };

    if (search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          degree: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (language.trim()) {
      filter.languages = {
        $elemMatch: {
          $regex: language.trim(),
          $options: "i",
        },
      };
    }

    if (gender.trim()) {
      filter.gender = gender.trim();
    }

    if (
      minExperience !== "" &&
      !Number.isNaN(Number(minExperience))
    ) {
      filter.experience = {
        $gte: Number(minExperience),
      };
    }

    const selectedDays = Array.isArray(availability)
      ? availability
      : availability
        ? [availability]
        : [];

    if (selectedDays.length > 0) {
      filter.availability = {
        $in: selectedDays,
      };
    }

    const selectedTimes = Array.isArray(availableTime)
      ? availableTime
      : availableTime
        ? [availableTime]
        : [];

    if (selectedTimes.length > 0) {
      filter.availableTimes = {
        $in: selectedTimes,
      };
    }

    const caregivers = await UserModel.find(filter)
      .select(`
        name
        email
        phoneNumber
        profilepic
        gender
        degree
        experience
        location
        latitude
        longitude
        bio
        languages
        availability
        availableTimes
        certificates
        professionalVerificationStatus
        professionalVerifiedAt
      `);

    const hasPatientCoordinates =
      patientLatitude !== "" &&
      patientLongitude !== "" &&
      !Number.isNaN(Number(patientLatitude)) &&
      !Number.isNaN(Number(patientLongitude));

    const toRadians = (degrees) => {
      return degrees * (Math.PI / 180);
    };

    const calculateDistanceKm = (
      lat1,
      lon1,
      lat2,
      lon2
    ) => {
      const earthRadiusKm = 6371;

      const dLat =
        toRadians(lat2 - lat1);

      const dLon =
        toRadians(lon2 - lon1);

      const firstLatitude =
        toRadians(lat1);

      const secondLatitude =
        toRadians(lat2);

      const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(firstLatitude) *
        Math.cos(secondLatitude);

      const c =
        2 *
        Math.atan2(
          Math.sqrt(a),
          Math.sqrt(1 - a)
        );

      return earthRadiusKm * c;
    };

    const caregiversWithDistance =
      caregivers.map((caregiver) => {
        let distanceKm = null;

        const caregiverLatitude =
          caregiver.latitude;

        const caregiverLongitude =
          caregiver.longitude;

        if (
          hasPatientCoordinates &&
          caregiverLatitude !== undefined &&
          caregiverLatitude !== null &&
          caregiverLongitude !== undefined &&
          caregiverLongitude !== null
        ) {
          distanceKm =
            calculateDistanceKm(
              Number(patientLatitude),
              Number(patientLongitude),
              Number(caregiverLatitude),
              Number(caregiverLongitude)
            );
        }

        return {
          ...caregiver.toObject(),

          distanceKm:
            distanceKm === null
              ? null
              : Number(
                distanceKm.toFixed(1)
              ),
        };
      });

    caregiversWithDistance.sort(
      (firstCaregiver, secondCaregiver) => {
        if (
          firstCaregiver.distanceKm === null &&
          secondCaregiver.distanceKm === null
        ) {
          return firstCaregiver.name.localeCompare(
            secondCaregiver.name
          );
        }

        if (
          firstCaregiver.distanceKm === null
        ) {
          return 1;
        }

        if (
          secondCaregiver.distanceKm === null
        ) {
          return -1;
        }

        return (
          firstCaregiver.distanceKm -
          secondCaregiver.distanceKm
        );
      }
    );

    return res.send({
      success: true,
      caregivers:
        caregiversWithDistance,
    });
  } catch (error) {
    console.error(
      "Search caregivers error:",
      error
    );

    return res.status(500).send({
      success: false,
      caregivers: [],
      message:
        "Unable to search caregivers.",
    });
  }
});

app.get(
  "/patient/my-caregivers/:patientEmail",
  async (req, res) => {
    try {
      const patientEmail = decodeURIComponent(
        req.params.patientEmail
      )
        .trim()
        .toLowerCase();

      const caregivers =
        await CaregiverLinkModel.aggregate([
          {
            $match: {
              patientEmail,
              status: "Accepted",
            },
          },

          {
            $lookup: {
              from: "UsersTbl",
              localField: "caregiverEmail",
              foreignField: "email",
              as: "caregiverDetails",
            },
          },

          {
            $unwind: {
              path: "$caregiverDetails",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              _id: 1,

              caregiverEmail: 1,
              patientEmail: 1,
              relationship: 1,
              status: 1,
              requestedAt: 1,

              caregiverName:
                "$caregiverDetails.name",

              caregiverPhoneNumber:
                "$caregiverDetails.phoneNumber",

              caregiverProfilePicture:
                "$caregiverDetails.profilepic",

              caregiverDegree:
                "$caregiverDetails.degree",

              caregiverExperience:
                "$caregiverDetails.experience",

              caregiverLocation:
                "$caregiverDetails.location",

              caregiverBio:
                "$caregiverDetails.bio",

              caregiverLanguages:
                "$caregiverDetails.languages",

              caregiverAvailability:
                "$caregiverDetails.availability",

              caregiverAvailableTimes:
                "$caregiverDetails.availableTimes",

              caregiverCertificates:
                "$caregiverDetails.certificates",

              caregiverProfessionalVerificationStatus:
                "$caregiverDetails.professionalVerificationStatus",

              caregiverProfessionalVerifiedAt:
                "$caregiverDetails.professionalVerifiedAt",
            },
          },

          {
            $sort: {
              requestedAt: -1,
            },
          },
        ]);

      return res.send({
        success: true,
        caregivers,
      });
    } catch (error) {
      console.error(
        "Fetch patient caregivers error:",
        error
      );

      return res.status(500).send({
        success: false,
        caregivers: [],
        message:
          "Unable to load your caregivers.",
      });
    }
  }
);

app.put("/patient/remove-caregiver", async (req, res) => {
  try {
    const patientEmail = String(req.body.patientEmail || "")
      .trim()
      .toLowerCase();

    const caregiverEmail = String(req.body.caregiverEmail || "")
      .trim()
      .toLowerCase();

    if (!patientEmail || !caregiverEmail) {
      return res.status(400).send({
        success: false,
        message: "Patient and caregiver emails are required.",
      });
    }

    const link = await CaregiverLinkModel.findOneAndUpdate(
      {
        patientEmail,
        caregiverEmail,
        status: "Accepted",
      },
      {
        $set: {
          status: "Removed",
          medicationManagementPermission: false,
        },
      },
      { new: true }
    );

    if (!link) {
      return res.status(404).send({
        success: false,
        message: "Active caregiver connection not found.",
      });
    }

    return res.send({
      success: true,
      message: "Caregiver removed successfully.",
    });
  } catch (error) {
    console.error("Remove caregiver error:", error);

    return res.status(500).send({
      success: false,
      message: "Unable to remove caregiver.",
    });
  }
});


const MAX_PATIENTS_PER_CAREGIVER = 2;

const checkCaregiverPatientLimit = async (
  caregiverEmail,
  patientEmail
) => {
  const normalizedCaregiverEmail = caregiverEmail.trim().toLowerCase();
  const normalizedPatientEmail = patientEmail.trim().toLowerCase();

  const existingPatientCaregiver = await CaregiverLinkModel.findOne({
    patientEmail: normalizedPatientEmail,
    status: "Accepted",
  });

  if (existingPatientCaregiver) {
    return {
      allowed: false,
      message: "This patient already has an active caregiver.",
    };
  }

  const activePatientCount = await CaregiverLinkModel.countDocuments({
    caregiverEmail: normalizedCaregiverEmail,
    status: "Accepted",
  });

  if (activePatientCount >= MAX_PATIENTS_PER_CAREGIVER) {
    return {
      allowed: false,
      message: "This caregiver has reached the maximum of 2 patients.",
    };
  }

  return { allowed: true };
};

app.get(
  "/caregiver/patient-requests/:caregiverEmail",
  async (req, res) => {
    try {
      const caregiverEmail = decodeURIComponent(
        req.params.caregiverEmail
      )
        .trim()
        .toLowerCase();

      const requests =
        await CaregiverLinkModel.aggregate([
          {
            $match: {
              caregiverEmail,
              status: "Pending",
              requestedBy: "patient",
            },
          },

          {
            $lookup: {
              from: "UsersTbl",
              localField: "patientEmail",
              foreignField: "email",
              as: "patientDetails",
            },
          },

          {
            $unwind: {
              path: "$patientDetails",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              _id: 1,
              caregiverEmail: 1,
              patientEmail: 1,
              relationship: 1,
              status: 1,
              requestedBy: 1,
              requestedAt: 1,
              medicationManagementPermission: 1,

              patientName:
                "$patientDetails.name",

              patientPhoneNumber:
                "$patientDetails.phoneNumber",

              patientProfilePicture:
                "$patientDetails.profilepic",

              patientMedicalConditions:
                "$patientDetails.medicalCondition",
            },
          },

          {
            $sort: {
              requestedAt: -1,
            },
          },
        ]);

      return res.send({
        success: true,
        requests,
      });
    } catch (error) {
      console.error(
        "Fetch patient requests error:",
        error
      );

      return res.status(500).send({
        success: false,
        requests: [],
        message:
          "Unable to load patient requests.",
      });
    }
  }
);


app.put(
  "/caregiver/patient-request/:requestId",
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { caregiverEmail, status } = req.body;

      if (!["Accepted", "Rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request status.",
        });
      }

      if (
        !mongoose.isValidObjectId(requestId) ||
        typeof caregiverEmail !== "string" ||
        !caregiverEmail.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid request information.",
        });
      }

      const request = await CaregiverLinkModel.findOne({
        _id: requestId,
        caregiverEmail: caregiverEmail.trim().toLowerCase(),
        status: "Pending",
        requestedBy: "patient",
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Patient request not found.",
        });
      }

      if (status === "Accepted") {
        const validation = await checkCaregiverPatientLimit(
          request.caregiverEmail,
          request.patientEmail
        );

        if (!validation.allowed) {
          return res.status(409).json({
            success: false,
            message: validation.message,
          });
        }
      }

      request.status = status;
      await request.save();

      return res.json({
        success: true,
        message:
          status === "Accepted"
            ? "Patient request accepted."
            : "Patient request rejected.",
        request,
      });
    } catch (error) {
      console.error("Update patient request error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update patient request.",
      });
    }
  }
);



app.get(
  "/patient/my-caregiver/:patientEmail",
  async (req, res) => {
    try {
      const patientEmail =
        decodeURIComponent(
          req.params.patientEmail
        )
          .trim()
          .toLowerCase();

      const link =
        await CaregiverLinkModel.findOne({
          patientEmail,
          status: "Accepted",
        });

      if (!link) {
        return res.send({
          success: true,
          caregiver: null,
          message:
            "You do not have a caregiver yet.",
        });
      }

      const caregiver =
        await UserModel.findOne({
          email: link.caregiverEmail,
          role: "caregiver",
        }).select(`
          name
          email
          phoneNumber
          profilepic
          degree
          experience
          location
          bio
          languages
          availability
          availableTimes
          certificates
          professionalVerificationStatus
          professionalVerifiedAt
        `);

      if (!caregiver) {
        return res.status(404).send({
          success: false,
          message:
            "Caregiver account not found.",
        });
      }

      return res.send({
        success: true,

        caregiver: {
          _id: caregiver._id,
          name: caregiver.name,
          email: caregiver.email,
          phoneNumber:
            caregiver.phoneNumber,
          profilepic:
            caregiver.profilepic,
          degree:
            caregiver.degree,
          experience:
            caregiver.experience,
          location:
            caregiver.location,
          bio:
            caregiver.bio,
          languages:
            caregiver.languages || [],
          availability:
            caregiver.availability || [],
          availableTimes:
            caregiver.availableTimes || [],
          certificates:
            caregiver.certificates || [],

          professionalVerificationStatus:
            caregiver.professionalVerificationStatus ||
            "Not Submitted",

          professionalVerifiedAt:
            caregiver.professionalVerifiedAt ||
            null,

          relationship:
            link.relationship,

          medicationManagementPermission:
            link.medicationManagementPermission || false,

          linkedSince:
            link.requestedAt,

        },
      });
    } catch (error) {
      console.error(
        "My caregiver error:",
        error
      );

      return res.status(500).send({
        success: false,
        message:
          "Unable to load caregiver information.",
      });
    }
  }
);


app.get("/caregiver/patient-requests/:caregiverEmail", async (req, res) => {
  try {
    const caregiverEmail = decodeURIComponent(
      req.params.caregiverEmail
    );

    const requests = await CaregiverLinkModel.aggregate([
      {
        $match: {
          caregiverEmail,
          status: "Pending",
          requestedBy: "patient",
        },
      },
      {
        $lookup: {
          from: "UsersTbl",
          localField: "patientEmail",
          foreignField: "email",
          as: "patientDetails",
        },
      },
      {
        $unwind: {
          path: "$patientDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          caregiverEmail: 1,
          patientEmail: 1,
          relationship: 1,
          status: 1,
          requestedAt: 1,
          requestedBy: 1,
          patientName: "$patientDetails.name",
          patientProfilePicture: "$patientDetails.profilepic",
        },
      },
      {
        $sort: {
          requestedAt: -1,
        },
      },
    ]);

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Caregiver patient requests error:", error);

    return res.status(500).json({
      success: false,
      requests: [],
      message: "Unable to load patient requests.",
    });
  }
});


//forgot password 
let otpStore = {};

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.send({ message: "Email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    await transporter.sendMail({
      from: "MediMind <MediMindproject@gmail.com>",
      to: email,
      subject: "MediMind Password Reset OTP",
      text: `Your MediMind password reset OTP is: ${otp}`,
    });

    res.send({ message: "OTP sent to your email" });
  } catch (error) {
    res.send({ message: "Forgot password error: " + error });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (otpStore[email] !== otp) {
      return res.send({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    delete otpStore[email];

    res.send({ message: "Password reset successfully" });
  } catch (error) {
    res.send({ message: "Reset password error: " + error });
  }
});


const validateMedicationSchedule = (frequency, reminderTimes) => {
  const requiredCounts = {
    "Once daily": 1,
    "Twice daily": 2,
    "Three times daily": 3,
    "Every 6 hours": 4,
    "Every 8 hours": 3,
    "Every 12 hours": 2,
    "Weekly": 1,
    "As needed": 0,
  };

  const customMatch = /^Every ([1-9]\d*) (hour|hours|day|days|week|weeks)$/.exec(frequency);

  if (frequency === "Other") {
    return {
      valid: false,
      message: "Please specify a custom frequency interval.",
    };
  }

  if (customMatch) {
    const interval = Number(customMatch[1]);
    const unit = customMatch[2];

    if (
      !Number.isSafeInteger(interval) ||
      (interval === 1 && unit.endsWith("s")) ||
      (interval !== 1 && !unit.endsWith("s"))
    ) {
      return {
        valid: false,
        message: "Please enter a valid custom frequency.",
      };
    }

    if (unit === "hour" || unit === "hours") {
      if (interval > 24 || 24 % interval !== 0) {
        return {
          valid: false,
          message: "Hourly interval must divide evenly into 24 hours.",
        };
      }

      const requiredCount = 24 / interval;

      if (
        !Array.isArray(reminderTimes) ||
        reminderTimes.length !== requiredCount
      ) {
        return {
          valid: false,
          message: `This frequency requires ${requiredCount} reminder times.`,
        };
      }

      const minutes = reminderTimes.map((time) => {
        if (
          typeof time !== "string" ||
          !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
        ) {
          return NaN;
        }

        const [hours, mins] = time.split(":").map(Number);
        return hours * 60 + mins;
      });

      if (minutes.some((minute) => !Number.isFinite(minute))) {
        return {
          valid: false,
          message: "Please enter valid reminder times.",
        };
      }

      const sorted = [...minutes].sort((a, b) => a - b);
      const expected = interval * 60;

      for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i];
        const next = sorted[(i + 1) % sorted.length];

        if ((next - current + 1440) % 1440 !== expected) {
          return {
            valid: false,
            message: `Reminder times must be exactly ${interval} hours apart.`,
          };
        }
      }

      return { valid: true };
    }

    if (
      unit === "day" ||
      unit === "days" ||
      unit === "week" ||
      unit === "weeks"
    ) {
      if (
        !Array.isArray(reminderTimes) ||
        reminderTimes.length !== 1 ||
        typeof reminderTimes[0] !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTimes[0])
      ) {
        return {
          valid: false,
          message:
            "Custom daily and weekly frequencies require exactly one valid reminder time.",
        };
      }

      return { valid: true };
    }

    return {
      valid: false,
      message: "Invalid custom frequency.",
    };
  }

  if (!(frequency in requiredCounts)) {
    return {
      valid: false,
      message: "Please select a valid frequency.",
    };
  }

  const requiredCount = requiredCounts[frequency];

  if (!Array.isArray(reminderTimes) ||
    reminderTimes.length !== requiredCount) {
    return {
      valid: false,
      message: `This frequency requires ${requiredCount} reminder time(s).`,
    };
  }

  if (reminderTimes.some(time =>
    typeof time !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  )) {
    return {
      valid: false,
      message: "Please enter valid reminder times.",
    };
  }

  const minutes = reminderTimes.map(time => {
    const [hours, mins] = time.split(":").map(Number);
    return hours * 60 + mins;
  });

  if (new Set(minutes).size !== minutes.length) {
    return {
      valid: false,
      message: "Reminder times must be different.",
    };
  }

  const intervals = {
    "Every 6 hours": 360,
    "Every 8 hours": 480,
    "Every 12 hours": 720,
  };

  if (intervals[frequency]) {
    const sorted = [...minutes].sort((a, b) => a - b);
    const expected = intervals[frequency];

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const next = sorted[(i + 1) % sorted.length];
      const difference = (next - current + 1440) % 1440;

      if (difference !== expected) {
        return {
          valid: false,
          message: `Reminder times must be exactly ${expected / 60} hours apart.`,
        };
      }
    }
  }

  return { valid: true };
};

const normalizeMedicationNameForLookup = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");

// Add medication
app.post("/medications",
  upload.single("prescription"),
  async (req, res) => {
    try {
      const {
        userEmail,
        medicationName,
        medicationCatalogId,
        confirmSimilarMedication,
        medicationForm,
        topicalDosage,
        dosage,
        frequency,
        timing,
        timingOffsetMinutes,
        reminderTimes,
        startDate,
        weeklyDay,
        endDate,
        isActive,
        instructions,
      } = req.body;

      // Find the selected medication in the Oman catalog
      const catalogId = String(
        medicationCatalogId || ""
      ).trim();

      const catalogMedication = catalogId
        ? omanMedications.find(
          (medication) =>
            String(medication.id) === catalogId
        )
        : null;

      if (catalogId && !catalogMedication) {
        return res.status(400).send({
          success: false,
          message:
            "The selected medication was not found in the Oman medication database. Please select it again.",
        });
      }

      if (
        !userEmail ||
        !medicationName ||
        !medicationForm ||
        !dosage ||
        !frequency ||
        !timing ||
        !startDate ||
        !endDate
      ) {
        return res.status(400).send({
          message:
            "Please complete all required medication fields",
        });
      }



      const patientMedicationName = String(medicationName)
        .trim()
        .toLowerCase();

      const patientMatchingMedications = omanMedications.filter(
        (medication) =>
          String(medication.tradeName || "").trim().toLowerCase() ===
          patientMedicationName
      );

      const patientFormKeywords = {
        Tablet: ["tablet"],
        Capsule: ["capsule"],
        Injection: ["injection", "injectable"],
        "Cream/Ointment": ["cream", "ointment"],
        Inhaler: ["inhaler"],
        "Eye Drops": ["ophthalmic", "eye drop"],
        "Ear Drops": ["otic", "ear drop"],
        "Liquid/Syrup": ["syrup", "oral liquid", "oral solution"],
        Patch: ["patch"],
        Suppository: ["suppository"],
      };

      const patientRecognizedForms = new Set();

      for (const medication of patientMatchingMedications) {
        const rawForm = String(medication.dosageForm || "")
          .trim()
          .toLowerCase();

        for (const [form, keywords] of Object.entries(patientFormKeywords)) {
          if (keywords.some((keyword) => rawForm.includes(keyword))) {
            patientRecognizedForms.add(form);
          }
        }
      }

      if (
        patientRecognizedForms.size > 0 &&
        !patientRecognizedForms.has(medicationForm)
      ) {
        return res.status(400).send({
          success: false,
          message:
            "Invalid medication form. Please select a dosage form listed for this medication in the Oman medication database.",
        });
      }

      const validDosageUnits = [
  "mg", "g", "mcg", "ml", "IU",
  "tablet", "tablets",
  "capsule", "capsules",
  "drop", "drops",
  "units",
  "puff", "puffs",
  "patch", "patches",
  "application", "applications",
  "suppository", "suppositories",
];

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
        Other: validDosageUnits,
      };

      if (!Object.hasOwn(medicationDosageUnits, medicationForm)) {
        return res.status(400).send({
          success: false,
          message: "Please select a valid medication form.",
        });
      }

      const dosageMatch = String(dosage || "")
        .trim()
        .match(/^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)$/);

      if (!dosageMatch) {
        return res.status(400).send({
          success: false,
          message: "Please enter a valid dosage amount and unit.",
        });
      }

      const dosageAmount = Number(dosageMatch[1]);
      const dosageUnit = dosageMatch[2];

      if (!medicationDosageUnits[medicationForm].includes(dosageUnit)) {
        return res.status(400).send({
          success: false,
          message: "Dosage unit is not valid for the selected medication form.",
        });
      }

      if (
        !Number.isFinite(dosageAmount) ||
        dosageAmount <= 0 ||
        !validDosageUnits.includes(dosageUnit)
      ) {
        return res.status(400).send({
          success: false,
          message: "Dosage must be greater than zero and use a valid unit.",
        });
      }

      const isMealTiming = [
        "Before Meal",
        "With Meal",
        "After Meal",
      ].includes(timing);


      let parsedTimingOffsetMinutes =
        Number(timingOffsetMinutes || 0);

      if (
        Number.isNaN(parsedTimingOffsetMinutes) ||
        parsedTimingOffsetMinutes < 0
      ) {
        return res.status(400).send({
          message:
            "Please enter a valid timing offset",
        });
      }

      if (timing === "With Meal") {
        parsedTimingOffsetMinutes = 0;
      }

      let parsedReminderTimes = [];

      if (reminderTimes) {
        try {
          parsedReminderTimes =
            JSON.parse(reminderTimes);

          if (
            !Array.isArray(
              parsedReminderTimes
            )
          ) {
            parsedReminderTimes = [];
          }
        } catch (error) {
          return res.status(400).send({
            message:
              "Reminder times are not formatted correctly",
          });
        }
      }

      if (
        frequency !== "As needed" &&
        parsedReminderTimes.length === 0
      ) {
        return res.status(400).send({
          message:
            "Please provide at least one reminder time",
        });
      }

      const hasEmptyReminderTime =
        parsedReminderTimes.some(
          (reminderTime) =>
            !reminderTime ||
            !reminderTime.trim()
        );

      if (hasEmptyReminderTime) {
        return res.status(400).send({
          message:
            "Please complete all reminder times",
        });
      }

      const uniqueReminderTimes = [
        ...new Set(parsedReminderTimes),
      ];

      if (
        uniqueReminderTimes.length !==
        parsedReminderTimes.length
      ) {
        return res.status(400).send({
          message:
            "Please select a different time for each dose",
        });
      }


      const scheduleValidation = validateMedicationSchedule(
        frequency,
        parsedReminderTimes
      );

      if (!scheduleValidation.valid) {
        return res.status(400).send({
          success: false,
          message: scheduleValidation.message,
        });
      }

      const parsedStartDate =
        new Date(startDate);

      if (
        Number.isNaN(
          parsedStartDate.getTime()
        )
      ) {
        return res.status(400).send({
          message:
            "Please select a valid medication start date",
        });
      }

      const patientMedications = await MedicationModel.find({
        userEmail: {
          $regex: `^${String(userEmail).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i",
        },
      });

      const exactDuplicate = patientMedications.find(
        (existingMedication) =>
          String(existingMedication.medicationName || "")
            .trim()
            .toLowerCase() ===
          String(medicationName || "")
            .trim()
            .toLowerCase()
      );

      if (exactDuplicate) {
        return res.status(409).json({
          success: false,
          message:
            "This medication is already in your medication list. Please edit the existing medication instead of adding it again.",
        });
      }

      // Compare the selected catalog medication with existing medications.
      // Do not block or warn yet.
      const ingredientMatches = catalogMedication
        ? patientMedications
          .map((existingMedication) => ({
            medicationName: existingMedication.medicationName,
            sharedIngredients: findSharedIngredients(
              catalogMedication,
              existingMedication
            ),
          }))
          .filter(
            (result) => result.sharedIngredients.length > 0
          )
        : [];

      const similarNameMatches = patientMedications
        .filter((existingMedication) => {
          const existingName = normalizeMedicationName(
            existingMedication.medicationName
          );

          const newName = normalizeMedicationName(medicationName);

          if (existingName.length < 5 || newName.length < 5) {
            return false;
          }

          const distance = medicationNameDistance(
            existingName,
            newName
          );

          const maxDistance = Math.max(
            2,
            Math.floor(Math.max(existingName.length, newName.length) * 0.3)
          );

          return distance > 0 && distance <= maxDistance;
        })
        .map((existingMedication) => ({
          medicationName: existingMedication.medicationName,
          sharedIngredients: [],
        }));

      // Allow the patient to confirm and continue.


      const normalizedMedicationName = medicationName.trim();

      const existingMedications = await MedicationModel.find({
        userEmail: {
          $regex: `^${userEmail.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i",
        },
        medicationName: {
          $regex: `^${normalizedMedicationName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i",
        },
      });

      if (
        existingMedications.some(
          (med) =>
            med.dosage?.trim().toLowerCase() ===
            dosage?.trim().toLowerCase() &&
            med.medicationForm?.trim().toLowerCase() ===
            medicationForm?.trim().toLowerCase()
        )
      ) {
        return res.status(409).send({
          success: false,
          message:
            "This medication has already been added. Please edit the existing medication instead.",
        });
      }

      const hasIngredientWarning = ingredientMatches.length > 0;
      const hasSimilarNameWarning = similarNameMatches.length > 0;

      if (
        (hasIngredientWarning || hasSimilarNameWarning) &&
        String(confirmSimilarMedication) !== "true"
      ) {
        return res.status(409).json({
          success: false,
          requiresConfirmation: true,
          warningType:
            hasIngredientWarning && hasSimilarNameWarning
              ? "MULTIPLE_WARNINGS"
              : hasIngredientWarning
                ? "DUPLICATE_INGREDIENT"
                : "SIMILAR_NAME",
          message:
            hasIngredientWarning && hasSimilarNameWarning
              ? "This medication may share an active ingredient with an existing medication and has a similar name. Please review both warnings before continuing."
              : hasIngredientWarning
                ? "This medication may contain an active ingredient already present in your medication list. Please review before continuing."
                : "This medication has a name similar to an existing medication. Please verify that you selected the correct medication.",
          addingMedication: {
  medicationName: medicationName.trim(),
  strength: catalogMedication?.medicationStrength || "",
},


matches: [
  ...ingredientMatches,
  ...similarNameMatches,
].reduce((unique, match) => {
  const existing = unique.find(
    (item) => item.medicationName === match.medicationName
  );

  if (existing) {
    existing.sharedIngredients = [
      ...new Set([
        ...(existing.sharedIngredients || []),
        ...(match.sharedIngredients || []),
      ]),
    ];
  } else {
    unique.push({ ...match });
  }

  return unique;
}, []),
 });
      }


      const prescriptionImage = req.file
        ? `/uploads/${req.file.filename}`
        : "";



      const validWeekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      let parsedWeeklyDays = [];

      if (frequency === "Weekly") {
        try {
          parsedWeeklyDays =
            typeof weeklyDay === "string"
              ? JSON.parse(weeklyDay)
              : weeklyDay;
        } catch {
          return res.status(400).send({
            success: false,
            message: "Weekly days are not formatted correctly.",
          });
        }

        if (
          !Array.isArray(parsedWeeklyDays) ||
          parsedWeeklyDays.length === 0 ||
          parsedWeeklyDays.some(
            (day) => !validWeekdays.includes(day)
          ) ||
          new Set(parsedWeeklyDays).size !== parsedWeeklyDays.length
        ) {
          return res.status(400).send({
            success: false,
            message: "Please select valid, non-duplicate weekly days.",
          });
        }
      } else if (weeklyDay !== undefined && weeklyDay !== "") {
        return res.status(400).send({
          success: false,
          message: "Weekly days are only allowed for weekly medications.",
        });
      }


      const parsedEndDate = endDate ? new Date(endDate) : null;
      const parsedStartDateForValidation = new Date(startDate);

      if (
        Number.isNaN(parsedStartDateForValidation.getTime()) ||
        (parsedEndDate && Number.isNaN(parsedEndDate.getTime()))
      ) {
        return res.status(400).send({
          success: false,
          message: "Please enter valid medication dates.",
        });
      }

      // Today's date in Oman (YYYY-MM-DD)
      const omanDateParts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Muscat",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date());

      const getOmanPart = (type) =>
        omanDateParts.find((part) => part.type === type)?.value;

      const todayInOman = [
        getOmanPart("year"),
        getOmanPart("month"),
        getOmanPart("day"),
      ].join("-");

      if (startDate < todayInOman) {
        return res.status(400).send({
          success: false,
          message: "Medication start date cannot be in the past.",
        });
      }

      if (parsedEndDate && parsedEndDate < parsedStartDateForValidation) {
        return res.status(400).send({
          success: false,
          message: "End date cannot be earlier than start date.",
        });
      }


      const newMedication =
        new MedicationModel({
          userEmail: userEmail.trim(),

          medicationName:
            medicationName.trim(),

          medicationCatalogId: catalogMedication?.id || "",

          activeIngredient1: catalogMedication?.activeIngredient1 || "",

          activeIngredient2: catalogMedication?.activeIngredient2 || "",

          medicationForm: medicationForm,
          topicalDosage:
            medicationForm === "Cream/Ointment"
              ? String(topicalDosage || "").trim()
              : "",

          dosage: dosage.trim(),

          frequency:
            frequency.trim(),

          timing: timing.trim(),

          timingOffsetMinutes:
            parsedTimingOffsetMinutes,

          reminderTimes:
            uniqueReminderTimes,

          startDate:
            parsedStartDate,

          isActive:
            isActive === "false"
              ? false
              : true,

          weeklyDay: frequency === "Weekly" ? parsedWeeklyDays : [],
          endDate: parsedEndDate,

          instructions:
            instructions?.trim() || "",

          prescriptionImage,
        });

      await newMedication.save();

      res.send({
        success: true,
        message:
          "Medication saved successfully",
        medication:
          newMedication,
      });
    } catch (error) {
      console.error(
        "Medication Save Error:",
        error
      );

      res.status(500).send({
        success: false,
        message:
          "Medication save error: " +
          error.message,
      });
    }
  }
);
// Get medications for one user
app.get("/medications/:userEmail", async (req, res) => {
  try {
    const { userEmail } = req.params;

    const medications = await MedicationModel.find({
      userEmail,
    });

    res.send({
      medications,
      message: "Medications fetched successfully",
    });
  } catch (error) {
    console.log("Medication Fetch Error:", error);

    res.status(500).send({
      medications: [],
      message: "Medication fetch error: " + error.message,
    });
  }
});

// Delete medication
app.delete("/medications/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMedication =
      await MedicationModel.findByIdAndDelete(id);

    if (!deletedMedication) {
      return res.status(404).send({
        success: false,
        message: "Medication not found",
      });
    }

    await DoseRecordModel.deleteMany({
      medicationId: id,
    });

    res.send({
      success: true,
      message: "Medication deleted successfully",
    });
  } catch (error) {
    console.error(
      "Medication Delete Error:",
      error
    );

    res.status(500).send({
      success: false,
      message:
        "Medication delete error: " +
        error.message,
    });
  }
});


// Get one medication by ID
app.get("/medications/item/:id", async (req, res) => {
  try {
    const medication = await MedicationModel.findById(req.params.id);

    if (!medication) {
      return res.status(404).send({
        message: "Medication not found",
      });
    }

    res.send({
      medication,
      message: "Medication fetched successfully",
    });
  } catch (error) {
    console.log("Medication Fetch Error:", error);

    res.status(500).send({
      message: "Medication fetch error: " + error.message,
    });
  }
});

// Update medication

app.put("/medications/:id", async (req, res) => {
  try {
    const {
      medicationName,
      dosage,
      frequency,
      timing,
      timingOffsetMinutes,
      reminderTimes,
      startDate,
      weeklyDay,
      endDate,
      isActive,
      instructions,
      prescriptionImage,
    } = req.body;

    // 1. Check required fields
    if (
      typeof medicationName !== "string" ||
      !medicationName.trim() ||
      typeof dosage !== "string" ||
      !dosage.trim() ||
      typeof frequency !== "string" ||
      !frequency.trim() ||
      typeof timing !== "string" ||
      !timing.trim() ||
      !startDate
    ) {
      return res.status(400).send({
        success: false,
        message: "Please complete all required medication fields.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid medication ID.",
      });
    }

    // 2. Find existing medication
    const currentMedication = await MedicationModel.findById(
      req.params.id
    );

    if (!currentMedication) {
      return res.status(404).send({
        success: false,
        message: "Medication not found.",
      });
    }

    // Prevent changing medication identity during editing
if (
  medicationName.trim() !== currentMedication.medicationName ||
  req.body.medicationForm !== currentMedication.medicationForm
) {
  return res.status(400).json({
    success: false,
    message:
      "Medication name and form cannot be changed. Please add a new medication instead.",
  });
}

    const normalizedDatabaseMedicationName = medicationName.trim();
    const normalizedFrequency = frequency.trim();
    const normalizedTiming = timing.trim();

    // 3. Prevent duplicate medication names
    const escapedName = normalizedDatabaseMedicationName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const duplicateMedication = await MedicationModel.findOne({
      _id: { $ne: currentMedication._id },
      userEmail: currentMedication.userEmail,
      medicationName: {
        $regex: `^${escapedName}$`,
        $options: "i",
      },
    });

    if (duplicateMedication) {
      return res.status(409).send({
        success: false,
        message:
          "This medication has already been added. Please edit the existing medication instead.",
      });
    }
    const validMedicationForms = [
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
    ];

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

    if (!validMedicationForms.includes(req.body.medicationForm)) {
      return res.status(400).json({
        message: "Please select a valid medication form.",
      });
    }
    // 4. Validate dosage
    const validDosageUnits = [
      "mg", "g", "mcg", "ml",
      "tablet", "tablets",
      "capsule", "capsules",
      "drop", "drops",
      "unit", "units",
      "puff", "puffs",
      "patch", "patches",
      "suppository", "suppositories",
      "application", "applications",
    ];

    const dosageMatch = dosage.trim().match(
      /^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)$/
    );

    const dosageParts = dosage.trim().match(
      /^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)$/
    );
    const dosageAmount = dosageParts
      ? Number(dosageParts[1])
      : NaN;

    if (!Number.isFinite(dosageAmount) || dosageAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Dosage amount must be a valid positive number.",
      });
    }

    if (
      !dosageMatch ||
      Number(dosageMatch[1]) <= 0 ||
      !Number.isFinite(Number(dosageMatch[1])) ||
      !validDosageUnits.includes(dosageMatch[2].toLowerCase())
    ) {
      return res.status(400).send({
        success: false,
        message: "Please enter a valid dosage amount and unit.",
      });
    }



    if (
      !dosageParts ||
      Number(dosageParts[1]) <= 0 ||
      !medicationDosageUnits[req.body.medicationForm]?.includes(
        dosageParts[2]
      )
    ) {
      return res.status(400).json({
        message: "Dosage unit does not match the selected medication form.",
      });
    }

    // 5. Validate timing offset
    let parsedTimingOffsetMinutes = Number(
      timingOffsetMinutes ?? 0
    );

    if (
      !Number.isFinite(parsedTimingOffsetMinutes) ||
      parsedTimingOffsetMinutes < 0
    ) {
      return res.status(400).send({
        success: false,
        message: "Please enter a valid timing offset.",
      });
    }

    if (normalizedTiming === "With Meal") {
      parsedTimingOffsetMinutes = 0;
    }

    // 6. Parse reminder times
    let parsedReminderTimes = reminderTimes;

    if (typeof parsedReminderTimes === "string") {
      try {
        parsedReminderTimes = JSON.parse(parsedReminderTimes);
      } catch {
        return res.status(400).send({
          success: false,
          message: "Reminder times are not formatted correctly.",
        });
      }
    }

    if (!Array.isArray(parsedReminderTimes)) {
      return res.status(400).send({
        success: false,
        message: "Reminder times must be an array.",
      });
    }

    parsedReminderTimes = parsedReminderTimes.map((time) =>
      typeof time === "string" ? time.trim() : time
    );

    // 7. Validate frequency and reminder schedule
    // Reuses the function already added above POST /medications.
    const scheduleValidation = validateMedicationSchedule(
      normalizedFrequency,
      parsedReminderTimes
    );

    if (!scheduleValidation.valid) {
      return res.status(400).send({
        success: false,
        message: scheduleValidation.message,
      });
    }


    // 8. Validate weekly days
    const validWeekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    let normalizedWeeklyDay = [];

    if (normalizedFrequency === "Weekly") {
      try {
        normalizedWeeklyDay =
          typeof weeklyDay === "string"
            ? JSON.parse(weeklyDay)
            : weeklyDay;
      } catch {
        return res.status(400).send({
          success: false,
          message: "Weekly days are not formatted correctly.",
        });
      }

      if (
        !Array.isArray(normalizedWeeklyDay) ||
        normalizedWeeklyDay.length === 0 ||
        normalizedWeeklyDay.some(
          (day) => !validWeekdays.includes(day)
        ) ||
        new Set(normalizedWeeklyDay).size !== normalizedWeeklyDay.length
      ) {
        return res.status(400).send({
          success: false,
          message: "Please select valid, non-duplicate weekly days.",
        });
      }
    } else if (
      weeklyDay !== undefined &&
      weeklyDay !== null &&
      weeklyDay !== "" &&
      !(Array.isArray(weeklyDay) && weeklyDay.length === 0)
    ) {
      return res.status(400).send({
        success: false,
        message: "Weekly days are only allowed for weekly medications.",
      });
    }


    // 9. Validate start and end dates
    const isValidDateString = (value) =>
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value;

    if (!isValidDateString(startDate)) {
      return res.status(400).send({
        success: false,
        message: "Please select a valid medication start date.",
      });
    }

    if (
      endDate !== undefined &&
      endDate !== null &&
      endDate !== "" &&
      !isValidDateString(endDate)
    ) {
      return res.status(400).send({
        success: false,
        message: "Please select a valid medication end date.",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = endDate ? new Date(endDate) : null;

    if (parsedEndDate && parsedEndDate < parsedStartDate) {
      return res.status(400).send({
        success: false,
        message: "End date cannot be earlier than start date.",
      });
    }

    // 10. Detect schedule changes
    const newIsActive =
      typeof isActive === "boolean"
        ? isActive
        : isActive === "false"
          ? false
          : true;

    const scheduleChanged =
      currentMedication.frequency !== normalizedFrequency ||
      currentMedication.timing !== normalizedTiming ||
      Number(currentMedication.timingOffsetMinutes || 0) !==
      parsedTimingOffsetMinutes ||

      JSON.stringify(
        [...(Array.isArray(currentMedication.weeklyDay)
          ? currentMedication.weeklyDay
          : currentMedication.weeklyDay
            ? [currentMedication.weeklyDay]
            : [])].sort()
      ) !== JSON.stringify([...normalizedWeeklyDay].sort()) ||

      (currentMedication.startDate?.toISOString().slice(0, 10) || "") !==
      startDate ||
      (currentMedication.endDate?.toISOString().slice(0, 10) || null) !==
      (endDate || null) ||
      JSON.stringify(currentMedication.reminderTimes || []) !==
      JSON.stringify(parsedReminderTimes) ||
      currentMedication.isActive !== newIsActive;

    // 11. Update medication
    const updatedMedication =
      await MedicationModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            dosage: dosage.trim(),
            topicalDosage:
              req.body.medicationForm === "Cream/Ointment"
                ? (req.body.topicalDosage || "").trim()
                : "",
            frequency: normalizedFrequency,
            timing: normalizedTiming,
            timingOffsetMinutes: parsedTimingOffsetMinutes,
            reminderTimes: parsedReminderTimes,
            startDate: parsedStartDate,
            weeklyDay: normalizedWeeklyDay,
            endDate: parsedEndDate,
            isActive: newIsActive,
            instructions: instructions?.trim() || "",
            prescriptionImage:
              prescriptionImage ||
              currentMedication.prescriptionImage ||
              "",
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    // 12. Remove outdated upcoming dose records
    if (scheduleChanged) {
      await DoseRecordModel.deleteMany({
        medicationId: req.params.id,
        status: "Upcoming",
      });
    }

    return res.send({
      success: true,
      message: "Medication updated successfully.",
      medication: updatedMedication,
    });

  } catch (error) {
    console.error("Medication Update Error:", error);

    return res.status(500).send({
      success: false,
      message: "Medication update error: " + error.message,
    });
  }
});


// Request Account Deletion
app.post("/account/deletion-request", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await UserModel.findOne({
      email: email.trim().toLowerCase(),
      role: { $in: ["patient", "caregiver"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    if (user.accountDeletionStatus === "Pending") {
      return res.status(409).json({
        success: false,
        message: "Your deletion request is already pending.",
      });
    }

    user.accountDeletionStatus = "Pending";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your account deletion request has been submitted.",
      accountDeletionStatus: "Pending",
    });
  } catch (error) {
    console.error("Account deletion request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit account deletion request.",
    });
  }
});


// Update patient notification settings
app.put("/patient/notification-settings", async (req, res) => {
  try {
    const { patientEmail } = req.body;

    if (typeof patientEmail !== "string" || !patientEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient email is required.",
      });
    }

    const user = await UserModel.findOne({
      email: patientEmail.trim().toLowerCase(),
      role: "patient",
    });

    if (!user || user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can update notification settings.",
      });
    }

    const { notificationsEnabled } = req.body;

    if (typeof notificationsEnabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Notification preference must be true or false.",
      });
    }

    user.notificationsEnabled = notificationsEnabled;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Notification settings saved successfully.",
      notificationsEnabled: user.notificationsEnabled,
    });
  } catch (error) {
    console.error("Notification settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save notification settings.",
    });
  }
});





app.put("/patient/daily-routine", async (req, res) => {
  try {
    const { patientEmail } = req.body;

    if (typeof patientEmail !== "string" || !patientEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient email is required.",
      });
    }

    const user = await UserModel.findOne({
      email: patientEmail.trim().toLowerCase(),
      role: "patient",
    });

    // 1. Check patient role.
    if (!user || user.role !== "patient") {
      return res.status(403).json({
        success: false,
        errorCode: "PATIENT_ONLY",
        message: "Only patients can update their daily routine.",
      });
    }

    const { dailyRoutine } = req.body;

    const activities = [
      "breakfast",
      "lunch",
      "dinner",
      "wake",
      "sleep",
    ];

    // 2. Check that the routine exists.
    if (
      !dailyRoutine ||
      typeof dailyRoutine !== "object" ||
      Array.isArray(dailyRoutine)
    ) {
      return res.status(400).json({
        success: false,
        errorCode: "MISSING_ROUTINE",
        message: "Daily routine is required.",
      });
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    const validatedRoutine = {};
    const usedTimes = new Set();

    for (const activity of activities) {
      const time = dailyRoutine[activity];

      // 3. Check each time format.
      if (
        typeof time !== "string" ||
        !timePattern.test(time)
      ) {
        return res.status(400).json({
          success: false,
          errorCode: "INVALID_TIME",
          activity,
          message: `Please enter a valid time for ${activity}.`,
        });
      }

      // 4. Prevent duplicate times.
      if (usedTimes.has(time)) {
        return res.status(400).json({
          success: false,
          errorCode: "DUPLICATE_TIME",
          message: `${activity} has the same time as another activity.`,
        });
      }

      usedTimes.add(time);
      validatedRoutine[activity] = time;
    }


    // 5. Validate activity order, including overnight bedtime.
    const { wake, breakfast, lunch, dinner, sleep } =
      validatedRoutine;

    const daytimeOrderIsValid =
      wake < breakfast &&
      breakfast < lunch &&
      lunch < dinner;

    // Bedtime can be on the same day or after midnight.
    const bedtimeIsValid =
      sleep > dinner || sleep < wake;

    if (!daytimeOrderIsValid || !bedtimeIsValid) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_ROUTINE_ORDER",
        message:
          "Invalid daily routine. The correct order is: Wake Up → Breakfast → Lunch → Dinner → Sleep.",
      });
    }


    // 6. Save the routine to MongoDB.
    user.dailyRoutine = validatedRoutine;
    user.routineSetupCompleted = true;
    user.routineSetupDeferred = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Daily routine saved successfully.",
      dailyRoutine: user.dailyRoutine,
      routineSetupCompleted: true,
      routineSetupDeferred: false,
    });
  } catch (error) {
    console.error("Daily routine error:", error);

    return res.status(500).json({
      success: false,
      errorCode: "SAVE_FAILED",
      message: "Unable to save daily routine.",
    });
  }
});




app.put("/patient/daily-routine/skip", async (req, res) => {
  try {
    const { patientEmail } = req.body;

    if (typeof patientEmail !== "string" || !patientEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient email is required.",
      });
    }

    const user = await UserModel.findOne({
      email: patientEmail.trim().toLowerCase(),
      role: "patient",
    });

    if (!user || user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can skip daily routine setup.",
      });
    }

    if (user.routineSetupCompleted) {
      return res.status(400).json({
        success: false,
        message: "Daily routine setup is already completed.",
      });
    }

    user.routineSetupDeferred = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "You can complete your daily routine later in Settings.",
      routineSetupCompleted: false,
      routineSetupDeferred: true,
    });
  } catch (error) {
    console.error("Skip daily routine error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to skip daily routine setup.",
    });
  }
});


const conStr = "mongodb+srv://Sheikha:16S18247@cluster0.kru17mc.mongodb.net/MediMindDB"

mongoose
  .connect(conStr)
  .then(() => {
    console.log("Database Connected..");

    app.listen(3002, () => {
      console.log("Server Connected at port no 3002");
    });

  })
  .catch((error) => {
    console.log("Database Connection Error.." + error);
  });

