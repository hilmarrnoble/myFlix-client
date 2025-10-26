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

// Import Bootstrap theming + overrides
import "./index.scss";

// React-Bootstrap components
import {
  Container,
  Navbar,
  Nav,
  Button
} from "react-bootstrap";

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
const AppNavBar = ({ isAuthed, onLogout, username }) => (
  <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
    <Container>
      <Navbar.Brand as={Link} to="/" className="fw-bold">myFlix</Navbar.Brand>
      <Navbar.Toggle aria-controls="main-nav" />
      <Navbar.Collapse id="main-nav">
        <Nav className="me-auto">
          {isAuthed && (
            <>
              <Nav.Link as={Link} to="/">Movies</Nav.Link>
              <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
            </>
          )}
        </Nav>
        <Nav className="ms-auto align-items-center">
          {!isAuthed ? (
            <>
              <Nav.Link as={Link} to="/login">Log in</Nav.Link>
              <Button as={Link} to="/signup" size="sm" className="ms-1">Sign up</Button>
            </>
          ) : (
            <>
              <Navbar.Text className="me-3">Hi, {username}</Navbar.Text>
              <Button variant="outline-light" size="sm" onClick={onLogout}>
                Log out
              </Button>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);
AppNavBar.propTypes = {
  isAuthed: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  username: PropTypes.string
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
      <AppNavBar
        isAuthed={isAuthed}
        onLogout={handleLogout}
        username={user?.username || user?.email || user?.name || ""}
      />

      {/* App-wide Container per brief */}
      <Container className="py-4">
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
      </Container>
    </BrowserRouter>
  );
};

// Root
const root = createRoot(document.getElementById("root"));
root.render(<App />);
