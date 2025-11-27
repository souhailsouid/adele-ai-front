
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

const initialValues = {
  [firstName.name]: "",
  [lastName.name]: "",
  [email.name]: "",
  [password.name]: "",
  [confirmPassword.name]: "",
};

export default initialValues;

