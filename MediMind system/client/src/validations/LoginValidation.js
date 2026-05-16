import * as yup from "yup";

export const LoginValidation=yup.object().shape({
    email:yup.string().required("Email is required").email("Enter valid email"),
    password:yup.string().required("Password is required").min(6,"Password must be min 6 characters")
});