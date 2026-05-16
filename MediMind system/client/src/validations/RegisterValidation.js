import * as yup from "yup";

export const RegisterValidation = yup.object().shape({
  name: yup
    .string()
    .min(3, "Full name must be at least 3 characters")
    .matches(/^[A-Za-z\s]+$/, "Full name should contain letters only")
    .required("Full name is required"),

  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  phoneNumber: yup
    .string()
    .matches(/^[79][0-9]{7}$/, "Phone number must be 8 digits and start with 7 or 9")
    .required("Phone number is required"),

  medicalCondition: yup.string(),

  otherCondition: yup.string(),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[!@#$%^&*]/, "Password must contain at least one special character")
    .required("Password is required"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});