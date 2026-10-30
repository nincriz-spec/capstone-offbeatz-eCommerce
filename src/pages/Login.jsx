import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "wouter";

const validationSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const initialValues = { email: "", password: "" };

export default function Login() {
  async function handleSubmit(values) {
    console.log("Login attempt for:", values.email);
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