import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Link } from "react-router-dom";

export const SignupView = ({ AUTH_BASE }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    birthday: ""
  });
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (!form.birthday) return "Birthday is required.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      setOk("");
      return;
    }
    setErr("");
    setOk("");
    setBusy(true);
    try {
      // Create account; API also returns a token, but we keep UX to log in explicitly
      await axios.post(`${AUTH_BASE}/register`, form);
      setOk("Account created! You can now log in.");
    } catch (e) {
      const apiMsg =
        e?.response?.data?.message ||
        (Array.isArray(e?.response?.data?.errors)
          ? e.response.data.errors.map((er) => er.msg || er).join(", ")
          : null) ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        e.message;
      setErr(apiMsg || "Signup failed. Please check your inputs.");
    } finally {
      setBusy(false);
    }
  };

  const input = (key, label, type = "text", props = {}) => (
    <div className="mb-3" key={key}>
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-control"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required
        {...props}
      />
    </div>
  );

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-7 col-lg-5">
          <h2 className="mb-3">Create your account</h2>
          <form onSubmit={submit} className="card card-body">
            {input("name", "Name")}
            {input("email", "Email", "email")}
            {input("password", "Password", "password", { minLength: 6, placeholder: "Min 6 characters" })}
            {input("birthday", "Birthday", "date", { required: true })}

            {ok && <div className="alert alert-success py-2">{ok}</div>}
            {err && <div className="alert alert-danger py-2">{err}</div>}

            <button className="btn btn-success" disabled={busy}>
              {busy ? "Creating…" : "Sign up"}
            </button>

            <p className="small mt-3 mb-0">
              Already have an account?{" "}
              <Link to="/login" className="link-light">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

SignupView.propTypes = {
  AUTH_BASE: PropTypes.string.isRequired
};
