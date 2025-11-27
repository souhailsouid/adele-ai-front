

import * as Yup from "yup";
import checkout from "/pagesComponents/authentication/signup/schemas/form";

const {
  formField: {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  },
} = checkout;

const validations = Yup.object().shape({
  [firstName.name]: Yup.string().required(firstName.errorMsg),
  [lastName.name]: Yup.string().required(lastName.errorMsg),
  [email.name]: Yup.string().required(email.errorMsg).email(email.invalidMsg),
  [password.name]: Yup.string()
    .required(password.errorMsg)
    .min(6, password.invalidMsg),
  [confirmPassword.name]: Yup.string()
    .required(confirmPassword.errorMsg)
    .oneOf([Yup.ref(password.name)], confirmPassword.invalidMsg),
});

export default validations;

