import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import PropTypes from "prop-types";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.scss"; // keep your styling import (scss or css as in your project)

// Hotfix: if any accidental `sole.error(...)` slipped in, alias it to console so it won't crash
const sole = { error: () => {} };

/** =======================
 *  Config
 *  ======================= */
// Server base (includes /api because your server mounts routes under /api/*)
const API_BASE = "https://Hilmarrnoble-movie-api.herokuapp.com/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** =======================
 *  UI: NavBar
 *  ======================= */
const NavBar = ({ isAuthed, onLogout, username }) => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <div className="container">
      <Link className="navbar-brand" to="/">
        myFlix
      </Link>
      <div className="collapse navbar-collapse show">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {isAuthed && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Movies
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">
                  Profile
                </Link>
              </li>
            </>
          )}
        </ul>
        <ul className="navbar-nav ms-auto">
          {!isAuthed ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Log in
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/signup">
                  Sign up
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <span className="navbar-text me-3">Hi, {username}</span>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
                  Log out
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  </nav>
);
NavBar.propTypes = {
  isAuthed: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  username: PropTypes.string,
};

/** =======================
 *  Auth Views
 *  ======================= */
const LoginView = ({ onLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // 1) Login against /auth/login (base without /api)
      const { data } = await axios.post(
        API_BASE.replace(/\/api$/, "") + "/auth/login",
        { email, password }
      );
      const { token } = data;
      localStorage.setItem("token", token);

      // 2) Fetch current user
      const me = await api.get("/users/me");
      localStorage.setItem("user", JSON.stringify(me.data));
      onLoggedIn(me.data);
      nav("/");
    } catch (e) {
      const apiMsg =
        e.response?.data?.message ||
        (typeof e.response?.data === "string" ? e.response.data : null) ||
        e.message;
      setErr(apiMsg || "Invalid credentials or server error.");
      console.warn("Login error:", e.response?.status, e.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-6 col-lg-4">
          <h2 className="mb-3">Log in</h2>
          <form onSubmit={submit} className="card card-body">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {err && <div className="alert alert-danger">{err}</div>}
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
LoginView.propTypes = { onLoggedIn: PropTypes.func.isRequired };

const SignupView = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    birthday: "",
  });
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      // POST /auth/register (base without /api)
      await axios.post(
        API_BASE.replace(/\/api$/, "") + "/auth/register",
        form
      );
      setOk("Account created! You can now log in.");
    } catch (e) {
      const apiMsg =
        e.response?.data?.message ||
        (Array.isArray(e.response?.data?.errors)
          ? e.response.data.errors.map(er => er.msg || er).join(", ")
          : null) ||
        (typeof e.response?.data === "string" ? e.response.data : null) ||
        e.message;
      setErr(apiMsg || "Signup failed. Check your inputs.");
      console.warn("Signup error:", e.response?.status, e.response?.data || e);
    }
  };

  const inputs = [
    ["name", "Name", "text"],
    ["email", "Email", "email"],
    ["password", "Password", "password"],
    ["birthday", "Birthday", "date"],
  ];

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-6 col-lg-5">
          <h2 className="mb-3">Sign up</h2>
          <form onSubmit={submit} className="card card-body">
            {inputs.map(([key, label, type]) => (
              <div className="mb-3" key={key}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  className="form-control"
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={key !== "birthday"}
                />
              </div>
            ))}
            {ok && <div className="alert alert-success">{ok}</div>}
            {err && <div className="alert alert-danger">{err}</div>}
            <button className="btn btn-success">Create account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

/** =======================
 *  Movies
 *  ======================= */
const MovieCard = ({ movie }) => {
  const poster = movie.imageURL || "https://via.placeholder.com/300x450?text=No+Image";
  return (
    <div className="col-sm-6 col-md-4 col-lg-3 d-flex">
      <Link
        to={`/movies/${movie._id}`}
        className="card mb-4 text-decoration-none flex-fill shadow-sm"
      >
        <img src={poster} className="card-img-top" alt={movie.title} />
        <div className="card-body">
          <h5 className="card-title">{movie.title}</h5>
          <p className="card-text small text-muted mb-0">
            {movie.genre?.name}
          </p>
        </div>
      </Link>
    </div>
  );
};
MovieCard.propTypes = {
  movie: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageURL: PropTypes.string,
    genre: PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
    }),
    director: PropTypes.shape({
      name: PropTypes.string,
      bio: PropTypes.string,
      birthYear: PropTypes.number,
    }),
    releaseYear: PropTypes.number,
  }).isRequired,
};

const MovieView = ({ movies }) => {
  const { id } = useParams();
  const movie = movies.find((m) => m._id === id);

  if (!movie)
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Movie not found.</div>
        <Link to="/" className="btn btn-outline-secondary">
          Back
        </Link>
      </div>
    );

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-md-4">
          <img
            src={movie.imageURL || "https://via.placeholder.com/500x750?text=No+Image"}
            alt={movie.title}
            className="img-fluid rounded shadow-sm"
          />
        </div>
        <div className="col-md-8">
          <h2 className="mb-3">{movie.title}</h2>
          <p>{movie.description}</p>
          <div className="mb-2">
            <span className="badge text-bg-primary me-2">
              {movie.genre?.name || "Genre"}
            </span>
            <span className="badge text-bg-secondary">
              {movie.director?.name || "Director"}
            </span>
          </div>
          {/* Favorites hook can be re-enabled once API endpoints exist */}
          <Link to="/" className="btn btn-outline-secondary">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};
MovieView.propTypes = {
  movies: PropTypes.arrayOf(MovieCard.propTypes.movie).isRequired,
};

const MoviesMain = ({ movies, onQuery, query }) => {
  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h3 mb-0">Movies</h1>
        <input
          className="form-control w-auto"
          style={{ minWidth: 260 }}
          placeholder="Search by title or genre…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>
      {movies.length === 0 ? (
        <div className="text-muted">Loading movies…</div>
      ) : (
        <div className="row">
          {movies.map((m) => (
            <MovieCard key={m._id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
};
MoviesMain.propTypes = {
  movies: PropTypes.arrayOf(MovieCard.propTypes.movie).isRequired,
  onQuery: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
};

/** =======================
 *  Profile
 *  ======================= */
const ProfileView = ({
  user,
  movies,
  refreshUser = () => {},
  onRemoveFavorite = () => {},
  onUpdateUser = () => {},
  onDeleteUser = () => {},
}) => {
  const favIds = new Set(user?.favoriteMovies || []);
  const favorites = movies.filter((m) => favIds.has(m._id));

  const [form, setForm] = useState({
    Username: user?.username || "",
    Email: user?.email || "",
    Birthday: user?.birthday?.slice?.(0, 10) || "",
    Password: "",
  });
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setOk("");
    setErr("");
    try {
      await onUpdateUser(form);
      setOk("Profile updated.");
      await refreshUser();
    } catch (e) {
      const apiMsg =
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        e.message;
      setErr(apiMsg || "Update failed.");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Profile</h2>
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card">
            <div className="card-body">
              <h5>Details</h5>
              <form onSubmit={save}>
                <div className="mb-2">
                  <label className="form-label">Username</label>
                  <input
                    className="form-control"
                    value={form.Username}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, Username: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.Email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, Email: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Birthday</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.Birthday}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, Birthday: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">New Password (optional)</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.Password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, Password: e.target.value }))
                    }
                  />
                </div>
                {ok && <div className="alert alert-success py-1 my-2">{ok}</div>}
                {err && <div className="alert alert-danger py-1 my-2">{err}</div>}
                <button className="btn btn-primary me-2" type="submit">Save</button>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={onDeleteUser}
                >
                  Delete account
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <h5 className="mb-3">Favorite Movies</h5>
          <div className="row">
            {favorites.length === 0 ? (
              <div className="text-muted">No favorites yet.</div>
            ) : (
              favorites.map((m) => (
                <div className="col-sm-6 col-md-4 d-flex" key={m._id}>
                  <div className="card mb-3 flex-fill">
                    <img
                      src={m.imageURL || "https://via.placeholder.com/300x450?text=No+Image"}
                      className="card-img-top"
                      alt={m.title}
                    />
                    <div className="card-body">
                      <h6 className="card-title">{m.title}</h6>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onRemoveFavorite(m._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
ProfileView.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    birthday: PropTypes.string,
    favoriteMovies: PropTypes.arrayOf(PropTypes.string),
  }),
  movies: PropTypes.arrayOf(MovieCard.propTypes.movie).isRequired,
  refreshUser: PropTypes.func,
  onRemoveFavorite: PropTypes.func,
  onUpdateUser: PropTypes.func,
  onDeleteUser: PropTypes.func,
};

/** =======================
 *  App (routes + fetching)
 *  ======================= */
const App = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [movies, setMovies] = useState([]); // initial empty array per brief
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const isAuthed = !!localStorage.getItem("token");

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/movies");
      setMovies(data);
    } catch (e) {
      console.error("Error fetching movies:", e);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get("/users/me");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (e) {
      // not fatal for browsing
      console.warn("refreshUser failed:", e?.response?.status, e?.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMovies([]);
  };

  useEffect(() => {
    if (isAuthed) fetchMovies();
  }, [isAuthed]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return movies;
    return movies.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.genre?.name?.toLowerCase().includes(q)
    );
  }, [movies, query]);

  return (
    <BrowserRouter>
      <NavBar
        isAuthed={isAuthed}
        onLogout={handleLogout}
        username={user?.username || user?.email || user?.name || ""}
      />
      {!isAuthed ? (
        <Routes>
          <Route path="/login" element={<LoginView onLoggedIn={setUser} />} />
          <Route path="/signup" element={<SignupView />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <MoviesMain
                movies={loading ? [] : filtered}
                onQuery={setQuery}
                query={query}
              />
            }
          />
          <Route
            path="/movies/:id"
            element={<MovieView movies={movies} />}
          />
          <Route
            path="/profile"
            element={
              <ProfileView
                user={user}
                movies={movies}
                refreshUser={refreshUser}
                // onRemoveFavorite / onUpdateUser / onDeleteUser
                // can be passed once you expose those API endpoints
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      <footer className="text-center text-muted small py-4">
        myFlix • MERN
      </footer>
    </BrowserRouter>
  );
};

/** Root */
const container = document.querySelector("#root");
const root = createRoot(container);
root.render(<App />);
