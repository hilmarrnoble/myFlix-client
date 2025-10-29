// src/components/login-view/login-view.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner
} from "react-bootstrap";

export const LoginView = ({ AUTH_BASE, onLoggedIn }) => {
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
      // signal up to the App so it flips auth state and triggers data fetch
      onLoggedIn && onLoggedIn(token);
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
    <Row className="justify-content-center py-5">
      <Col sm={10} md={6} lg={4}>
        <h2 className="mb-3">Log in</h2>
        <Card className="shadow-sm">
          <Card.Body>
            <Form onSubmit={submit}>
              <Form.Group className="mb-3" controlId="login-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="login-password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </Form.Group>

              {err && <Alert variant="danger" className="py-2">{err}</Alert>}

              <Button variant="primary" type="submit" disabled={busy}>
                {busy ? (<><Spinner as="span" animation="border" size="sm" className="me-2" />Logging in…</>) : "Log in"}
              </Button>

              <p className="small mt-3 mb-0">
                New here?{" "}
                <Link to="/signup" className="link-light">
                  Create an account
                </Link>
              </p>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

LoginView.propTypes = {
  AUTH_BASE: PropTypes.string.isRequired,
  onLoggedIn: PropTypes.func
};
