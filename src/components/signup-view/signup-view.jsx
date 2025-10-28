import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner
} from "react-bootstrap";

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

  return (
    <Row className="justify-content-center py-5">
      <Col sm={10} md={7} lg={5}>
        <h2 className="mb-3">Create your account</h2>
        <Card className="shadow-sm">
          <Card.Body>
            <Form onSubmit={submit}>
              <Form.Group className="mb-3" controlId="signup-name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="signup-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="signup-password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Min 6 characters"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="signup-birthday">
                <Form.Label>Birthday</Form.Label>
                <Form.Control
                  type="date"
                  value={form.birthday}
                  onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))}
                  required
                />
              </Form.Group>

              {ok && <Alert variant="success" className="py-2">{ok}</Alert>}
              {err && <Alert variant="danger" className="py-2">{err}</Alert>}

              <Button variant="success" type="submit" disabled={busy}>
                {busy ? (<><Spinner as="span" animation="border" size="sm" className="me-2" />Creating…</>) : "Sign up"}
              </Button>

              <p className="small mt-3 mb-0">
                Already have an account?{" "}
                <Link to="/login" className="link-light">Log in</Link>
              </p>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

SignupView.propTypes = {
  AUTH_BASE: PropTypes.string.isRequired
};
