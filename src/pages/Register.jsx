import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useLocation } from "wouter";
import axios from "axios";
import { useFlash } from "../FlashStore";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9+ ]{7,15}$/, "Enter a valid phone number")
    .required("Phone is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirm: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

const initialValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
};

export default function Register() {
  const [, navigate] = useLocation();
  const { showMessage } = useFlash();

  async function handleSubmit(values) {
    try {
      await axios.post("/api/users/register", {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      showMessage("Account created. Please log in.", "success");
      navigate("/login");
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Could not create the account.",
        "error"
      );
    }
  }

  return (
    <section className="page">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className="auth-form">
            <h2>Create account</h2>

            <label htmlFor="name">Full name</label>
            <Field id="name" name="name" />
            <ErrorMessage name="name" component="p" className="form-error" />

            <label htmlFor="email">Email</label>
            <Field type="email" id="email" name="email" />
            <ErrorMessage name="email" component="p" className="form-error" />

            <label htmlFor="phone">Phone</label>
            <Field type="tel" id="phone" name="phone" />
            <ErrorMessage name="phone" component="p" className="form-error" />

            <label htmlFor="password">Password</label>
            <Field type="password" id="password" name="password" />
            <ErrorMessage name="password" component="p" className="form-error" />

            <label htmlFor="confirm">Confirm password</label>
            <Field type="password" id="confirm" name="confirm" />
            <ErrorMessage name="confirm" component="p" className="form-error" />

            <button className="btn" type="submit" disabled={formik.isSubmitting}>
              Create account
            </button>

            <p className="form-note">
              Already have an account? <Link href="/login">Log in</Link>
            </p>
          </Form>
        )}
      </Formik>
    </section>
  );
}