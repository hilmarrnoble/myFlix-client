// src/components/profile-view/profile-view.jsx
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { api } from "../../index.jsx";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert
} from "react-bootstrap";

export const ProfileView = ({ user, movies, onUserChange, onLogout }) => {
  const nav = useNavigate();

  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    birthday: user?.birthday ? new Date(user.birthday).toISOString().slice(0,10) : ""
  }));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const favorites = useMemo(() => {
    const ids = new Set(
      (user?.favoriteMovies || []).map(x => (typeof x === "string" ? x : x?._id || x))
    );
    return movies.filter(m => ids.has(m._id));
  }, [user, movies]);

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please provide a valid email.";
    if (form.password && form.password.length < 6) return "Password must be at least 6 characters.";
    if (!form.birthday) return "Birthday is required.";
    return "";
  };

  const save = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setErr(v);
    setErr(""); setOk(""); setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        birthday: form.birthday
      };
      if (form.password) payload.password = form.password;
      const { data } = await api.put("/users/me", payload);
      localStorage.setItem("user", JSON.stringify(data));
      onUserChange && onUserChange(data);
      setOk("Profile updated!");
      setForm(f => ({ ...f, password: "" }));
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (Array.isArray(e?.response?.data?.errors)
          ? e.response.data.errors.map(er => er.msg || er).join(", ")
          : null) ||
        e.message || "Update failed.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  const removeFavorite = async (movieId) => {
    try {
      await api.delete(`/users/me/favorites/${movieId}`);
      const { data } = await api.get("/users/me");
      localStorage.setItem("user", JSON.stringify(data));
      onUserChange && onUserChange(data);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Failed to remove favorite.";
      setErr(msg);
    }
  };

  const deregister = async () => {
    if (!window.confirm("Delete your account permanently? This cannot be undone.")) return;
    try {
      await api.delete("/users/me");
      onLogout && onLogout();
      nav("/signup");
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Failed to delete account.";
      setErr(msg);
    }
  };

  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="h3 mb-0">Your Profile</h1>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/" variant="outline-secondary">Back to Movies</Button>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Profile details</h5>
              <Form onSubmit={save}>
                <Form.Group className="mb-3" controlId="profile-name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="profile-email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="profile-password">
                  <Form.Label>Password (leave blank to keep)</Form.Label>
                  <Form.Control
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    minLength={6}
                    placeholder="Optional"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="profile-birthday">
                  <Form.Label>Birthday</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.birthday}
                    onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                    required
                  />
                </Form.Group>

                {ok && <Alert variant="success" className="py-2">{ok}</Alert>}
                {err && <Alert variant="danger" className="py-2">{err}</Alert>}

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-danger"
                    className="ms-auto"
                    onClick={deregister}
                  >
                    Delete my account
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <h5 className="mb-3">Favorite movies</h5>
              {favorites.length === 0 ? (
                <div className="text-muted">No favorites yet.</div>
              ) : (
                <Row className="g-3">
                  {favorites.map((m) => (
                    <Col sm={6} md={4} key={m._id}>
                      <Card className="h-100">
                        <Card.Img
                          variant="top"
                          src={m.imageURL || "https://via.placeholder.com/300x450?text=No+Image"}
                          alt={m.title}
                        />
                        <Card.Body className="d-flex flex-column">
                          <Card.Title as="h6" className="mb-2">{m.title}</Card.Title>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="mt-auto"
                            onClick={() => removeFavorite(m._id)}
                          >
                            Remove
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

ProfileView.propTypes = {
  user: PropTypes.object,
  movies: PropTypes.array.isRequired,
  onUserChange: PropTypes.func,
  onLogout: PropTypes.func
};
