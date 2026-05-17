import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UserModel from "./models/Users.js";
import MedicationModel from "./models/Medications.js";
import CaregiverLinkModel from "./models/CaregiverLinks.js";
import nodemailer from "nodemailer";
const app = express();

app.use(cors());
app.use(express.json());
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "MediMindproject@gmail.com",
    pass: "puvenkivfsahgwdc",
  },
});
app.listen(3002, () => {
  console.log("Server Connected at port no 3002");
});

const conStr ="mongodb+srv://Sheikha:16S18247@cluster0.kru17mc.mongodb.net/MediMindDB"

mongoose
  .connect(conStr)
  .then(() => {
    console.log("Database Connected..");
  })
  .catch((error) => {
    console.log("Database Connection Error.." + error);
  });


// registration
app.post("/register", async (req, res) => {
  try {
    const { name, email,phoneNumber, password, role, medicalCondition } = req.body;

    console.log("Register data:", req.body);

    const user = await UserModel.findOne({ email });

    if (user) {
      return res.send({ message: "User Already Exists" });
    }

    const hpwd = await bcrypt.hash(password, 10);

    const newuser = new UserModel({
      name,
      email,
      phoneNumber,
      password: hpwd,
      role,
      medicalCondition,
    });
    await newuser.save();
await transporter.sendMail({
  from: "MediMind <MediMindproject@gmail.com>",
  to: email,
  subject: "Welcome to MediMind",
  text: `Hello ${name},

Welcome to MediMind!

Your account has been successfully created.

You can now log in and manage your medications, reminders, and health reports.

Thank you for choosing MediMind `,
});
    res.send({ message: "Registration Successful" });
  } catch (error) {
    console.log("Registration Error:", error);
    res.send({ message: "Registration Error: " + error });
  }
});

// login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email });

    if (user) {
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        res.send({ user: user, message: "success" });
      } else {
        res.send({ message: "Invalid Credentials" });
      }
    } else {
      res.send({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.send({ message: "Login Error.." + error });
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
//reset password 
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


