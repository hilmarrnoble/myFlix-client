import React from "react";
import PropTypes from "prop-types";
import { MovieCard } from "../movie-card/movie-card.jsx";

export const MainView = ({ movies, isLoading, query, onQuery, onLogout }) => {
  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h1 className="h3 mb-0">Movies</h1>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            style={{ minWidth: 260 }}
            placeholder="Search by title or genre…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
          <button className="btn btn-outline-light" onClick={onLogout}>Log out</button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted">Loading movies…</div>
      ) : movies.length === 0 ? (
        <div className="alert alert-warning">No movies found.</div>
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

MainView.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  query: PropTypes.string.isRequired,
  onQuery: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired
};
