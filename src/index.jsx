// src/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link
} from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.scss";

/** =======================
 *  API config
 *  ======================= */
const API_BASE =
  window._API_BASE ||
  "http://localhost:5000/api";
const AUTH_BASE = API_BASE.replace(/\/api$/, "") + "/auth";

export const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** =======================
 *  UI: NavBar
 *  ======================= */
const NavBar = ({ isAuthed, onLogout, username }) => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
    <div className="container">
      <Link className="navbar-brand fw-bold" to="/">myFlix</Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div id="nav" className="collapse navbar-collapse show">
        <ul className="navbar-nav me-auto">
          {isAuthed && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/">Movies</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">Profile</Link>
              </li>
            </>
          )}
        </ul>
        <ul className="navbar-nav ms-auto align-items-center">
          {!isAuthed ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Log in</Link>
              </li>
              <li className="nav-item ms-1">
                <Link className="btn btn-primary btn-sm" to="/signup">Sign up</Link>
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
 *  Components
 *  ======================= */
import { LoginView } from "./components/login-view/login-view.jsx";
import { SignupView } from "./components/signup-view/signup-view.jsx";
import { MainView } from "./components/main-view/main-view.jsx";
import { MovieView } from "./components/movie-view/movie-view.jsx";
import { ProfileView } from "./components/profile-view/profile-view.jsx";

/** =======================
 *  App
 *  ======================= */
const App = () => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const isAuthed = !!localStorage.getItem("token");

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/users/me");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (e) {
      console.warn("fetchMe failed:", e?.response?.status, e?.message);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/movies");
      setMovies(data || []);
    } catch (e) {
      console.error("Error fetching movies:", e?.response?.status, e?.message);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMovies([]);
  };

  useEffect(() => {
    if (isAuthed) {
      fetchMe();
      fetchMovies();
    }
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

  // === Favorites toggle (MovieView + ProfileView use this) ===
  const toggleFavorite = async (movieId, want) => {
    try {
      if (want) {
        await api.post(`/users/me/favorites/${movieId}`);
      } else {
        await api.delete(`/users/me/favorites/${movieId}`);
      }
      const { data } = await api.get("/users/me");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (e) {
      alert(
        e?.response?.data?.message ||
        e.message ||
        "Could not update favorites."
      );
    }
  };

  return (
    <BrowserRouter>
      <NavBar
        isAuthed={isAuthed}
        onLogout={handleLogout}
        username={user?.username || user?.email || user?.name || ""}
      />

      {!isAuthed ? (
        <Routes>
          <Route path="/login" element={
            <LoginView
              AUTH_BASE={AUTH_BASE}
              onLoggedIn={setUser}
              onAfterLogin={() => {
                fetchMe().then(fetchMovies);
              }}
            />
          }/>
          <Route path="/signup" element={<SignupView AUTH_BASE={AUTH_BASE} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <MainView
                movies={loading ? [] : filtered}
                isLoading={loading}
                query={query}
                onQuery={setQuery}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/movies/:id"
            element={
              <MovieView
                movies={movies}
                user={user}
                onToggleFavorite={toggleFavorite}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfileView
                user={user}
                movies={movies}
                onUserChange={setUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}

      <footer className="text-center text-muted small py-4">myFlix • MERN</footer>
    </BrowserRouter>
  );
};

// Root
const root = createRoot(document.getElementById("root"));
root.render(<App />);
