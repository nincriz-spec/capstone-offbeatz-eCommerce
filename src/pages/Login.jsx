import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useLocation } from "wouter";
import axios from "axios";
import { useFlash } from "../FlashStore";

const validationSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const initialValues = { email: "", password: "" };

export default function Login() {
  const [, navigate] = useLocation();
  const { showMessage } = useFlash();

  async function handleSubmit(values) {
    try {
      const res = await axios.post("/api/users/login", values);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      showMessage("Logged in", "success");
      navigate("/");
    } catch (err) {
      showMessage("Invalid email or password", "error");
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
            <h2>Log in</h2>

            <label htmlFor="email">Email</label>
            <Field type="email" id="email" name="email" />
            <ErrorMessage name="email" component="p" className="form-error" />

            <label htmlFor="password">Password</label>
            <Field type="password" id="password" name="password" />
            <ErrorMessage name="password" component="p" className="form-error" />

            <button className="btn" type="submit" disabled={formik.isSubmitting}>
              Log in
            </button>

            <p className="form-note">
              New here? <Link href="/register">Create an account</Link>
            </p>
          </Form>
        )}
      </Formik>
    </section>
  );
}