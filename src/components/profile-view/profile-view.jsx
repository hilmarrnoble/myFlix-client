// src/components/profile-view/profile-view.jsx
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { api } from "../../index.jsx";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h3 mb-0">Your Profile</h1>
        <Link to="/" className="btn btn-outline-secondary">Back to Movies</Link>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <form onSubmit={save} className="card card-body">
            <h5 className="mb-3">Profile details</h5>

            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" value={form.name}
                     onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={form.email}
                     onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Password (leave blank to keep)</label>
              <input type="password" className="form-control" value={form.password}
                     onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6} />
            </div>

            <div className="mb-3">
              <label className="form-label">Birthday</label>
              <input type="date" className="form-control" value={form.birthday}
                     onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} required />
            </div>

            {ok && <div className="alert alert-success py-2">{ok}</div>}
            {err && <div className="alert alert-danger py-2">{err}</div>}

            <div className="d-flex gap-2">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button type="button" className="btn btn-outline-danger ms-auto" onClick={deregister}>
                Delete my account
              </button>
            </div>
          </form>
        </div>

        <div className="col-lg-6">
          <div className="card card-body h-100">
            <h5 className="mb-3">Favorite movies</h5>
            {favorites.length === 0 ? (
              <div className="text-muted">No favorites yet.</div>
            ) : (
              <div className="row">
                {favorites.map((m) => (
                  <div className="col-sm-6 col-md-4" key={m._id}>
                    <div className="card mb-3 h-100">
                      <img
                        src={m.imageURL || "https://via.placeholder.com/300x450?text=No+Image"}
                        className="card-img-top"
                        alt={m.title}
                      />
                      <div className="card-body d-flex flex-column">
                        <h6 className="card-title">{m.title}</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger mt-auto"
                          onClick={() => removeFavorite(m._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProfileView.propTypes = {
  user: PropTypes.object,
  movies: PropTypes.array.isRequired,
  onUserChange: PropTypes.func,
  onLogout: PropTypes.func
};
