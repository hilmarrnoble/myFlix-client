import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export const LoginView = ({ AUTH_BASE, onLoggedIn, onAfterLogin }) => {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const pwOK = form.password.trim().length >= 6;
    if (!emailOK) return "Please enter a valid email.";
    if (!pwOK) return "Password must be at least 6 characters.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const { data } = await axios.post(`${AUTH_BASE}/login`, form);
      const token = data?.token;
      if (!token) throw new Error("No token returned from server.");
      localStorage.setItem("token", token);
      // Optionally fetch /users/me in parent
      onLoggedIn && onLoggedIn(null);
      onAfterLogin && (await onAfterLogin());
      nav("/");
    } catch (e) {
      const apiMsg =
        e?.response?.data?.message ||
        (Array.isArray(e?.response?.data?.errors)
          ? e.response.data.errors.map((er) => er.msg || er).join(", ")
          : null) ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        e.message;
      setErr(apiMsg || "Login failed. Check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-6 col-lg-4">
          <h2 className="mb-3">Log in</h2>
          <form onSubmit={submit} className="card card-body">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>

            {err && <div className="alert alert-danger py-2">{err}</div>}

            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Logging in…" : "Log in"}
            </button>

            <p className="small mt-3 mb-0">
              New here?{" "}
              <Link to="/signup" className="link-light">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

LoginView.propTypes = {
  AUTH_BASE: PropTypes.string.isRequired,
  onLoggedIn: PropTypes.func,
  onAfterLogin: PropTypes.func
};
