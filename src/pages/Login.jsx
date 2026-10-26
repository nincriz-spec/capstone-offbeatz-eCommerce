import { useState } from "react";
import { Link } from "wouter";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    console.log("Login attempt for:", email);
  }

  return (
    <section className="page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Log in</h2>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="form-error">{error}</p>}

        <button className="btn" type="submit">Log in</button>

        <p className="form-note">
          New here? <Link href="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
}